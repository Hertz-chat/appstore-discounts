# 飞书 Bot 推送

在飞书群中添加「自定义机器人」，复制完整的 Webhook 地址。
此接入使用群机器人的 Webhook，不需要企业自建应用的 App ID 或 App Secret。

在自己的 GitHub 仓库中打开 **Settings → Secrets and variables → Actions**，添加：

| Secret | 内容 |
| --- | --- |
| `FEISHU_WEBHOOK_URL` | 完整地址，例如 `https://open.feishu.cn/open-apis/bot/v2/hook/…` |
| `FEISHU_SIGN_SECRET` | 可选；机器人开启「签名校验」时填写对应签名密钥 |

如果机器人使用关键词校验，建议将关键词设为 `App Store`。
如果启用 IP 白名单，需要允许实际运行环境的出口 IP。

改动合并到自己的 `main` 后，现有自动更新 Action 会同时向飞书推送优惠。
通知沿用现有地区和优惠计算结果，包括应用本体降价、限免和内购降价，
消息包含地区、应用名称、前后价格、历史价格范围和应用详情链接。

未配置 `FEISHU_WEBHOOK_URL` 时，程序跳过飞书推送。飞书发送失败会记录错误，
不会中断后续数据更新。不要将 Webhook 地址或签名密钥写入代码或提交到仓库。

接口与签名算法参考：[飞书自定义机器人指南](https://open.feishu.cn/document/client-docs/bot-v3/add-custom-bot)。
