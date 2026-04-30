# 🚀 GitHub自动备份快速配置

## 一键启用GitHub自动备份

只需3步，让你的打卡数据自动备份到GitHub！

### Step 1: 创建 `.env` 文件

在项目根目录创建 `.env` 文件：

```bash
# Discord备份配置（可选）
DISCORD_WEBHOOK_URL=你的Discord Webhook URL

# GitHub自动备份配置
ENABLE_GIT_BACKUP=true
```

### Step 2: 配置Git认证

**选择一种方式：**

#### 方式A：SSH密钥（推荐，一劳永逸）

```bash
# 1. 生成SSH密钥（如果还没有）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 复制公钥
cat ~/.ssh/id_ed25519.pub

# 3. 添加到GitHub
# 打开 https://github.com/settings/keys
# 点击 "New SSH key"，粘贴公钥

# 4. 测试连接
ssh -T git@github.com
# 看到 "Hi username! You've successfully authenticated" 即成功

# 5. 配置Git使用SSH
cd /path/to/attendance-record-system
git remote set-url origin git@github.com:emily930920-coder/attendance-record-system.git
```

#### 方式B：Personal Access Token（简单快速）

```bash
# 1. 创建Token
# 打开 https://github.com/settings/tokens
# 点击 "Generate new token (classic)"
# 勾选 repo 权限
# 生成并复制Token

# 2. 配置Git保存凭据
git config --global credential.helper store

# 3. 首次推送时输入凭据
cd /path/to/attendance-record-system
git push
# Username: 你的GitHub用户名
# Password: 你的Personal Access Token（不是密码！）
```

### Step 3: 测试备份

```bash
# 测试GitHub备份
node test-github-backup.js
```

看到 `✅ GitHub备份功能正常!` 即成功！

## 🎉 完成！

现在每次打卡，系统都会自动：
1. ✅ 保存到本地 `server/data/`
2. ✅ 备份到 `server/data/backup/`
3. ✅ 自动提交到GitHub
4. ✅ 自动推送到远程仓库

### 查看备份

GitHub仓库地址：
```
https://github.com/emily930920-coder/attendance-record-system/tree/main/server/data/backup
```

## ⚠️ 常见问题

### Q: 推送失败，提示"Permission denied"

**A: SSH密钥配置不正确**
```bash
# 重新测试SSH连接
ssh -T git@github.com

# 如果失败，检查SSH密钥是否添加到GitHub
cat ~/.ssh/id_ed25519.pub
```

### Q: 提示"Author identity unknown"

**A: Git用户信息未配置**
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Q: 备份文件没有出现在GitHub

**A: 检查.gitignore配置**

确保 `.gitignore` 包含：
```
server/data/*.json
!server/data/backup/*.json
```

### Q: 想要禁用GitHub备份

**A: 修改 `.env`**
```bash
ENABLE_GIT_BACKUP=false
```

## 💡 额外提示

### 同时启用Discord和GitHub备份

在 `.env` 中同时配置：

```bash
# Discord实时查看
DISCORD_WEBHOOK_URL=你的Discord Webhook

# GitHub永久存储
ENABLE_GIT_BACKUP=true
```

这样你可以：
- 📱 Discord：移动端随时查看
- 💾 GitHub：永久存储，版本控制

### 查看备份历史

```bash
# 查看所有备份提交记录
git log --oneline -- server/data/backup/

# 查看某个文件的历史
git log -p -- server/data/backup/yangyang100_2026-04-30.json

# 恢复到某个版本
git checkout <commit-hash> -- server/data/backup/yangyang100_2026-04-30.json
```

## 📚 详细文档

- [GitHub自动备份配置.md](GitHub自动备份配置.md) - 完整配置指南
- [Discord配置教程.md](Discord配置教程.md) - Discord备份配置
- [备份故障排查.md](备份故障排查.md) - 问题诊断指南
