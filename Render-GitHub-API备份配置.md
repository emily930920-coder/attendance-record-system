# 🚀 Render部署GitHub API备份配置指南

## ✨ 功能说明

使用GitHub API直接推送备份，无需git命令和SSH配置，完美适配Render等云平台。

**优势**：
- ✅ 无需SSH密钥配置
- ✅ 无需git命令
- ✅ 适用于Render/Vercel/Heroku等所有云平台
- ✅ 每次打卡自动推送到GitHub
- ✅ Render重启自动从GitHub恢复数据

## 📋 Step 1: 创建GitHub Personal Access Token

### 1.1 访问GitHub Token页面

打开浏览器，访问：
```
https://github.com/settings/tokens
```

或者：
```
GitHub右上角头像 → Settings → Developer settings → Personal access tokens → Tokens (classic)
```

### 1.2 生成新Token

1. 点击 **"Generate new token"** → **"Generate new token (classic)"**

2. **填写Token信息**：
   - **Note（备注）**: `Attendance System Backup`
   - **Expiration（过期时间）**: 选择 `No expiration`（不过期）或 `1 year`（1年）

3. **选择权限**（重要）：
   勾选以下权限：
   ```
   ✅ repo
      ✅ repo:status
      ✅ repo_deployment
      ✅ public_repo
      ✅ repo:invite
      ✅ security_events
   ```
   
   **只需要勾选最顶层的 `repo`，所有子权限会自动勾选**

4. 滚动到页面底部，点击 **"Generate token"**

5. **复制Token**：
   ```
   ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
   ⚠️ **重要**：Token只显示一次，请立即复制保存！

### 1.3 保存Token

将Token保存到安全的地方：
- 密码管理器
- 本地加密文件
- ⚠️ 不要分享给他人
- ⚠️ 不要提交到Git仓库

## 📋 Step 2: 配置本地环境（测试用）

### 2.1 编辑 `.env` 文件

```bash
# Discord备份配置
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/1499315453930115192/aAoeWmwSdWf9r3uyg7ndrhdlybvU28-aOQRI5drwdK6wuY0KhzFvIIlwDn0JZnT8yk7Q

# GitHub API自动备份配置
ENABLE_GIT_BACKUP=true
GITHUB_TOKEN=ghp_你的Token粘贴在这里
GITHUB_OWNER=emily930920-coder
GITHUB_REPO=attendance-record-system
GITHUB_BRANCH=main
```

### 2.2 本地测试

```bash
# 测试GitHub API备份
node test-github-backup.js
```

看到 `✅ GitHub备份功能正常!` 表示配置成功！

### 2.3 启动服务器测试

```bash
npm start
```

你会看到：
```
🔄 实时备份配置:
  ✅ Discord备份已配置
  ✅ GitHub自动备份已配置 (GitHub API)
  💾 每次数据变更将自动备份
```

### 2.4 打卡测试

1. 打开 `http://localhost:3000`
2. 点击"上班打卡"
3. 等待5秒
4. 检查GitHub仓库：
   ```
   https://github.com/emily930920-coder/attendance-record-system/tree/main/server/data/backup
   ```
   
   应该能看到新的备份文件！

## 📋 Step 3: 配置Render环境变量

### 3.1 进入Render Dashboard

1. 访问 https://dashboard.render.com
2. 选择你的服务（attendance-record-system）
3. 点击左侧 **"Environment"** 选项卡

### 3.2 添加环境变量

点击 **"Add Environment Variable"**，逐个添加：

| Key | Value | 说明 |
|-----|-------|------|
| `DISCORD_WEBHOOK_URL` | `https://discord.com/api/webhooks/...` | Discord备份 |
| `ENABLE_GIT_BACKUP` | `true` | 启用GitHub备份 |
| `GITHUB_TOKEN` | `ghp_xxxxx...` | 你的Token |
| `GITHUB_OWNER` | `emily930920-coder` | GitHub用户名 |
| `GITHUB_REPO` | `attendance-record-system` | 仓库名 |
| `GITHUB_BRANCH` | `main` | 分支名 |

### 3.3 保存并重新部署

1. 点击页面顶部的 **"Save Changes"**
2. 等待自动重新部署（约2-3分钟）
3. 查看部署日志

### 3.4 验证部署

部署完成后，查看日志应该显示：

```
🔄 实时备份配置:
  ✅ Discord备份已配置
  ✅ GitHub自动备份已配置
  💾 每次数据变更将自动备份
```

## 🧪 Step 4: 测试Render备份

### 4.1 访问Render应用

```
https://你的应用名.onrender.com
```

### 4.2 执行打卡

1. 点击"上班打卡"
2. 等待5-10秒

### 4.3 验证Discord

打开Discord频道，应该收到2条消息：
- 数据摘要
- 完整JSON

### 4.4 验证GitHub

访问仓库：
```
https://github.com/emily930920-coder/attendance-record-system/commits/main
```

应该能看到新的提交：
```
📋 自动备份 - 用户名 - 2026-04-30 16:54:32
```

点击进入 `server/data/backup/` 目录，查看备份文件。

## 🔄 Step 5: 测试数据恢复

### 5.1 手动触发Render重启

Render Dashboard → 你的服务 → **"Manual Deploy"** → **"Clear build cache & deploy"**

### 5.2 等待重新部署

约2-3分钟

### 5.3 查看恢复日志

部署完成后，查看日志：

```
🔄 检查数据备份...
  📦 找到 2 个备份文件
  ✅ 恢复数据: yangyang100.json (5 条记录)
  ✅ 恢复数据: default.json (3 条记录)

🎉 数据恢复完成！恢复了 2 个用户的数据
```

### 5.4 访问应用验证

访问你的Render应用，数据应该完整恢复！

## 📊 完整工作流程

```
┌─────────────────────┐
│   用户打卡操作      │
└──────────┬──────────┘
           ↓
┌─────────────────────┐
│ 保存到本地文件      │
│ server/data/user.json│
└──────────┬──────────┘
           ↓
     ┌─────┴─────┐
     │  3秒防抖   │
     └─────┬─────┘
           ↓
┌─────────────────────────┐
│    实时备份系统         │
├─────────────────────────┤
│ 1. Discord备份         │
│    - 即时通知           │
│                         │
│ 2. GitHub API备份      │
│    - 调用GitHub API    │
│    - 创建/更新文件     │
│    - 自动提交          │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│   GitHub仓库存储        │
│ server/data/backup/     │
│   └─ user.json          │
└─────────────────────────┘

═══════════════════════════
    Render服务重启
═══════════════════════════
           ↓
┌─────────────────────────┐
│  Render重新部署         │
│  从GitHub拉取最新代码   │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  服务器启动             │
│  检测backup/目录        │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│ 自动恢复数据            │
│ backup/ → data/         │
└──────────┬──────────────┘
           ↓
┌─────────────────────────┐
│  用户访问应用           │
│  数据完整恢复 ✅        │
└─────────────────────────┘
```

## ⚙️ 环境变量说明

| 变量名 | 必需 | 示例 | 说明 |
|--------|------|------|------|
| `DISCORD_WEBHOOK_URL` | 可选 | `https://discord.com/api/webhooks/...` | Discord实时通知 |
| `ENABLE_GIT_BACKUP` | 必需 | `true` | 启用GitHub备份 |
| `GITHUB_TOKEN` | 必需 | `ghp_xxxxx...` | GitHub访问令牌 |
| `GITHUB_OWNER` | 必需 | `emily930920-coder` | GitHub用户名 |
| `GITHUB_REPO` | 必需 | `attendance-record-system` | 仓库名称 |
| `GITHUB_BRANCH` | 可选 | `main`（默认） | 目标分支 |

## 🔧 故障排查

### 问题1: Token无效

**错误信息**: `GitHub API错误: 401`

**解决方案**:
```bash
# 检查Token是否正确
echo $GITHUB_TOKEN

# 测试Token
curl -H "Authorization: Bearer $GITHUB_TOKEN" https://api.github.com/user
```

如果返回 401，需要重新创建Token。

### 问题2: 权限不足

**错误信息**: `GitHub API错误: 403`

**解决方案**:
- Token没有 `repo` 权限
- 重新创建Token，确保勾选 `repo`

### 问题3: 仓库不存在

**错误信息**: `GitHub API错误: 404`

**解决方案**:
检查环境变量：
```bash
GITHUB_OWNER=emily930920-coder  # 确保正确
GITHUB_REPO=attendance-record-system  # 确保正确
```

### 问题4: 本地测试成功，Render失败

**可能原因**:
- Render环境变量未配置
- Token没有复制完整

**解决方案**:
1. 检查Render Environment变量
2. 重新复制粘贴Token
3. 点击 "Save Changes"
4. 触发重新部署

### 问题5: 备份成功，但恢复失败

**可能原因**:
- backup目录未提交到Git
- .gitignore配置错误

**解决方案**:
```bash
# 检查.gitignore
cat .gitignore

# 应该包含：
# server/data/*.json
# !server/data/backup/*.json

# 确保backup目录被跟踪
git add server/data/backup/
git commit -m "Add backup files"
git push
```

## 🔒 安全最佳实践

### 1. Token管理

- ✅ 定期更换Token（建议每6个月）
- ✅ 使用最小权限原则（只给repo权限）
- ✅ 为不同项目创建不同Token
- ❌ 不要分享Token
- ❌ 不要提交到公开仓库

### 2. 仓库访问

- ✅ 保持仓库为私有（Private）
- ✅ 定期检查仓库访问权限
- ✅ 启用两步验证（2FA）

### 3. 备份数据

- ✅ 定期检查备份完整性
- ✅ 保留Discord备份作为双重保障
- ✅ 定期手动导出数据

## 📚 相关命令

```bash
# 查看GitHub API配置
echo $GITHUB_TOKEN | cut -c1-10  # 只显示前10个字符

# 测试GitHub API连接
curl -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/$GITHUB_OWNER/$GITHUB_REPO

# 测试备份功能
node test-github-backup.js

# 查看备份文件
ls -la server/data/backup/

# 查看Git提交历史
git log --oneline -- server/data/backup/
```

## 🎉 完成

现在你拥有：
- ✅ **GitHub API自动备份** - 每次打卡自动推送
- ✅ **适用于所有云平台** - Render/Vercel/Heroku
- ✅ **自动数据恢复** - 服务重启无缝恢复
- ✅ **Discord实时通知** - 移动端随时查看
- ✅ **版本历史** - GitHub记录所有变更
- ✅ **零数据丢失** - 多重备份保障

**完美的企业级备份方案！🚀**
