import React, { H1, List } from 'jsx-to-md'
import { getCountryOrRegionText } from '../utils'

export default function Vision() {
  return (
    <>
      <H1>{t('特性')}</H1>
      <List
        items={[
          'U',
          t(
            '支持任意{0}的{1}（理论上🤔）',
            getCountryOrRegionText(),
            ' `App Store` ',
          ),
          t(
            '可追踪{0}及{1}价格',
            ` \`${t('应用本体')}\` `,
            ` \`${t('App 内购买项目')}\` `,
          ),
          [
            t('多种订阅方式'),
            ['U', 'RSS', 'Telegram', t('钉钉'), t('飞书 Bot（CN/US）')],
          ],
          t('自动根据付费排行榜更新跟踪应用'),
          t('自动根据优惠频次禁用追踪应用的推送'),
          t('开源免费，欢迎贡献'),
        ]}
      />
    </>
  )
}
