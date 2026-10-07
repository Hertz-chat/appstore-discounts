import React, { H1, Link, Image, render, H2, Table } from 'jsx-to-md'
import { linkObj, imageObj } from '../constants'
import { getRegionNameMap } from 'appinfo.config'
import { getCountryOrRegionText } from '../utils'

// 友情提示
function FriendlyTips() {
  if (global.docLocale !== 'zh') return null
  console.log({ locale: global.docLocale })

  return (
    <>
      {`
> ${t('友情提示')}:${`  `}
> ${t(
        '通过{0}和{1}订阅需要科学上网才能有好的体验，{2}',
        ' `RSS` ',
        ' `Telegram` ',
        render(
          <Link href="https://github.com/eyelly-wu/vpn">
            {t('了解如何科学上网')}
          </Link>,
        ),
      )}
    `}
    </>
  )
}

export default function Subscription() {
  return (
    <>
      <H1>{t('如何订阅')}</H1>
      <FriendlyTips />
      <H2>RSS</H2>
      <Table
        columns={[
          {
            fieldName: 'region',
            title: t('编码'),
          },
          {
            fieldName: 'name',
            title: getCountryOrRegionText(true),
          },
          {
            fieldName: 'rss',
            title: t('{0}源', 'RSS '),
          },
        ]}
        data={Object.entries(getRegionNameMap()).reduce(
          (res, [region, name]) => {
            res.push({
              region,
              name,
              rss: `https://raw.githubusercontent.com/appstore-discounts/appstore-discounts/main/rss/${region}.xml`,
            })
            return res
          },
          [],
        )}
      />
      <H2>Telegram</H2>
      {t(
        '点击{0}订阅',
        ` ${render(
          <Link {...linkObj['telegram-channel']}>
            <Image {...imageObj['telegram']} />
          </Link>,
        )} `,
      )}
      <H2>{t('钉钉')}</H2>
      {t(
        '点击{0}订阅',
        ` ${render(
          <Link {...linkObj['dingtalk']}>
            <Image {...imageObj['dingtalk']} />
          </Link>,
        )} `,
      )}
      <H2>{t('飞书 Bot')}</H2>
      {t(
        '在自己的飞书群中创建自定义机器人，并在 fork 仓库的 Repository secrets 中配置 {0}；开启签名校验时同时配置 {1}。',
        '`FEISHU_WEBHOOK_URL`',
        '`FEISHU_SIGN_SECRET`',
      )}
      {'\n\n'}
      {t('飞书仅推送中国大陆（CN）和美国（US）的应用降价、限免及内购优惠。')}
      {'\n\n'}
      <Link href="./docs/FEISHU_BOT.md">{t('查看飞书 Bot 配置说明')}</Link>
    </>
  )
}
