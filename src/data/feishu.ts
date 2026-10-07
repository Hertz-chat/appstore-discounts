import fetch from 'node-fetch'
import { createHmac } from 'node:crypto'
import { setTimeout as delay } from 'node:timers/promises'
import { getTranslate } from './i18n'
import { getAppUrl } from './utils'
import { start, end } from './timer'

// Leave room for the JSON envelope and optional signature within the bot limit.
const maxTextBytes = 16000

function getMessage(region: Region, apps: DiscountInfo[]) {
  const t = getTranslate(region)
  const title = t(
    '{0}有{p1款应用}正在打折',
    `App Store（${region.toUpperCase()}）`,
    apps.length,
  )
  const entries = apps.map(({ trackId, trackName, discounts }) => {
    const lines = discounts.map(({ type, name, from, to, range }) => {
      const label =
        type === 'inAppPurchase' ? `${t('App 内购买项目')} · ${name}` : name
      return `${label}: ${from} → ${to}${range ? ` ${range}` : ''}`
    })
    return [trackName, ...lines, getAppUrl(region, trackId)].join('\n')
  })
  return [title, ...entries].join('\n\n')
}

function splitMessage(text: string) {
  const chunks: string[] = []
  let chunk = ''
  let bytes = 0
  for (const character of text) {
    const size = Buffer.byteLength(JSON.stringify(character), 'utf8') - 2
    if (bytes + size > maxTextBytes) {
      chunks.push(chunk)
      chunk = ''
      bytes = 0
    }
    chunk += character
    bytes += size
  }
  if (chunk) chunks.push(chunk)
  return chunks
}

async function sendMessage(webhook: string, text: string, secret?: string) {
  const timestamp = String(Math.floor(Date.now() / 1000))
  const signature = secret
    ? {
        timestamp,
        sign: createHmac('sha256', `${timestamp}\n${secret}`)
          .update('')
          .digest('base64'),
      }
    : {}
  try {
    const response = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...signature,
        msg_type: 'text',
        content: { text },
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) {
      console.error(`Feishu sendMessage failed: HTTP ${response.status}`)
      return false
    }
    const result = (await response.json()) as {
      code?: number
      StatusCode?: number
    }
    const code = result.code ?? result.StatusCode
    if (code !== 0) {
      console.error(`Feishu sendMessage failed: bot error ${code ?? 'unknown'}`)
      return false
    }
    return true
  } catch (error) {
    // Fetch errors can contain the private webhook URL; do not print them.
    console.error(
      error instanceof Error && error.name === 'AbortError'
        ? 'Feishu sendMessage failed: request timed out'
        : 'Feishu sendMessage failed: network or response error',
    )
    return false
  }
}

export default async function pushFeishuNotification(
  regionDiscountInfos: RegionDiscountInfo,
) {
  const webhook = process.env.FEISHU_WEBHOOK_URL
  if (!webhook) return false
  const secret = process.env.FEISHU_SIGN_SECRET
  start('pushFeishuNotification')
  try {
    let sent = false
    let allSucceeded = true
    for (const [region, apps] of Object.entries(regionDiscountInfos)) {
      if (region !== 'cn' && region !== 'us') continue
      if (!apps.length) continue
      const chunks = splitMessage(getMessage(region as Region, apps))
      for (const [index, text] of chunks.entries()) {
        // Keep consecutive requests below the custom bot's rate limit.
        if (sent) await delay(1000)
        const succeeded = await sendMessage(
          webhook,
          index === 0
            ? text
            : `App Store（${region.toUpperCase()}）\n\n${text}`,
          secret,
        )
        allSucceeded = succeeded && allSucceeded
        sent = true
      }
    }
    return allSucceeded
  } finally {
    end('pushFeishuNotification')
  }
}
