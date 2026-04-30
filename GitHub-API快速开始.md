# 🚀 GitHub API备份快速开始

## 3步完成Render部署+自动备份

### Step 1: 创建GitHub Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token (classic)"
3. 勾选 `repo` 权限
4. 生成并复制Token: `ghp_xxxx...`

### Step 2: 配置Render环境变量

在Render Dashboard添加：

```
DISCORD_WEBHOOK_URL = https://discord.com/api/webhooks/你的Webhook
ENABLE_GIT_BACKUP = true
GITHUB_TOKEN = ghp_你的Token
GITHUB_OWNER = emily930920-coder
GITHUB_REPO = attendance-record-system
GITHUB_BRANCH = main
```

### Step 3: 部署

点击 "Save Changes" → 自动重新部署 → 完成！

## ✅ 验证

访问你的应用 → 打卡 → 等待5秒 → 检查：
- Discord频道：应该收到备份消息
- GitHub仓库：`server/data/backup/` 应该有新文件

## 🔄 Render重启测试

Manual Deploy → Clear build cache & deploy → 数据自动恢复！

---

详细指南：[Render-GitHub-API备份配置.md](Render-GitHub-API备份配置.md)
