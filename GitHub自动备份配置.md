# 📦 GitHub自动备份配置指南

## 🎯 功能说明

每次打卡、添加或编辑记录后，系统会自动：
1. 将数据备份到 `server/data/backup/` 目录
2. 自动提交到Git仓库
3. 自动推送到GitHub远程仓库

## 📁 备份文件结构

```
server/data/
├── backup/           # GitHub自动备份目录（会提交到Git）
│   ├── .gitkeep
│   ├── yangyang100_2026-04-30.json
│   └── default_2026-04-30.json
├── default.json      # 运行时数据（不提交到Git）
└── yangyang100.json  # 运行时数据（不提交到Git）
```

## ⚙️ 配置步骤

### 1️⃣ 在 `.env` 文件中添加配置

```bash
# GitHub自动备份
ENABLE_GIT_BACKUP=true
```

### 2️⃣ 配置Git凭据（首次需要）

**方案A：使用SSH密钥（推荐）**

```bash
# 生成SSH密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 将公钥添加到GitHub
cat ~/.ssh/id_ed25519.pub
# 复制并添加到 GitHub -> Settings -> SSH and GPG keys

# 配置Git使用SSH
cd /path/to/attendance-record-system
git remote set-url origin git@github.com:emily930920-coder/attendance-record-system.git
```

**方案B：使用Personal Access Token**

```bash
# 在GitHub创建Token
# GitHub -> Settings -> Developer settings -> Personal access tokens -> Generate new token
# 选择权限：repo (全部)

# 配置Git使用Token
git config credential.helper store
git push  # 会提示输入用户名和Token
```

### 3️⃣ 测试配置

重启服务器，你会看到：

```
🔄 实时备份配置:
  ✅ Discord备份已配置
  ✅ GitHub自动备份已配置
  💾 每次数据变更将自动备份
```

### 4️⃣ 测试备份

1. 打开浏览器访问系统
2. 点击"上班打卡"
3. 等待3-5秒
4. 查看GitHub仓库的 `server/data/backup/` 目录

## 📊 备份数据格式

每个备份文件包含：

```json
{
  "user": "yangyang100",
  "backupTime": "2026-04-30T08:30:00.000Z",
  "backupTimeLocal": "2026-04-30 16:30:00",
  "recordCount": 5,
  "data": {
    "user": "yangyang100",
    "records": [...]
  }
}
```

## 🔍 查看备份

### 方法1：GitHub网页

```
https://github.com/emily930920-coder/attendance-record-system/tree/main/server/data/backup
```

### 方法2：Git命令

```bash
# 查看备份历史
git log --oneline -- server/data/backup/

# 查看某个备份文件的变更历史
git log -p -- server/data/backup/yangyang100_2026-04-30.json

# 恢复到某个版本
git checkout <commit-hash> -- server/data/backup/yangyang100_2026-04-30.json
```

## ⚠️ 注意事项

### 1. Git配置要求

- 必须配置Git用户名和邮箱
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 2. 推送权限

- 确保有仓库的推送权限
- SSH密钥或Token必须正确配置

### 3. 备份频率

- 每次数据变更都会备份
- 使用3秒防抖机制，避免过于频繁

### 4. 文件命名

- 格式：`用户名_日期.json`
- 同一天的备份会覆盖之前的文件
- 不同天的备份会保留历史

## 🚀 启用/禁用

### 临时禁用

修改 `.env`：

```bash
ENABLE_GIT_BACKUP=false
```

### 永久禁用

删除 `.env` 中的配置，系统会自动跳过GitHub备份。

## 🔧 故障排查

### 问题1：推送失败

**错误信息**：`Permission denied (publickey)`

**解决方案**：
```bash
# 检查SSH密钥
ssh -T git@github.com

# 应该看到：Hi username! You've successfully authenticated...
```

### 问题2：commit失败

**错误信息**：`Author identity unknown`

**解决方案**：
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 问题3：backup目录未提交

**原因**：`.gitignore` 配置错误

**解决方案**：
确保 `.gitignore` 包含：
```
server/data/*.json
!server/data/backup/*.json
```

## 📱 多重备份策略

推荐同时启用多种备份方式：

```bash
# .env 配置
DISCORD_WEBHOOK_URL=你的Discord Webhook
ENABLE_GIT_BACKUP=true
```

这样你可以：
- ✅ Discord：即时查看（移动端友好）
- ✅ GitHub：永久存储（版本历史）

## 🎉 完成

配置完成后，每次打卡系统都会：
1. ✅ 保存数据到本地 `server/data/`
2. ✅ 发送到Discord（实时查看）
3. ✅ 提交到GitHub（永久备份）

所有备份都是自动的，无需手动操作！
