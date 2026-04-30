# 🎉 GitHub自动备份+恢复完整方案

## ✅ 已实现功能

### 1. 自动备份到GitHub
- 每次打卡自动备份到 `server/data/backup/用户名.json`
- 自动提交并推送到GitHub仓库
- 每个用户独立文件，Git记录完整版本历史

### 2. 自动数据恢复  
- 服务器启动时自动检测 `backup/` 目录
- 智能恢复：只恢复更新或缺失的数据
- 完美解决Render重启数据丢失问题

## 🚀 完整工作流程

```
┌─────────────────┐
│  用户打卡操作   │
└────────┬────────┘
         ↓
┌─────────────────────┐
│ 保存到本地文件      │
│ server/data/user.json│
└────────┬────────────┘
         ↓
   ┌─────┴─────┐
   │  3秒防抖   │
   └─────┬─────┘
         ↓
┌──────────────────────┐
│    实时备份系统      │
├──────────────────────┤
│ 1. Discord备份      │
│    - 发送摘要        │
│    - 发送完整JSON    │
│                      │
│ 2. GitHub备份       │
│    - 复制到backup/   │
│    - git add         │
│    - git commit      │
│    - git push        │
└──────────────────────┘
         ↓
┌──────────────────────┐
│   GitHub仓库存储    │
│ server/data/backup/  │
│   └─ user.json       │
└──────────────────────┘

═══════════════════════════
    Render服务重启
═══════════════════════════
         ↓
┌──────────────────────┐
│  清空运行时数据      │
│ server/data/*.json   │
└────────┬─────────────┘
         ↓
┌──────────────────────┐
│  服务器启动          │
│  检测backup/目录     │
└────────┬─────────────┘
         ↓
┌──────────────────────┐
│ 自动恢复数据         │
│ backup/ → data/      │
└────────┬─────────────┘
         ↓
┌──────────────────────┐
│  用户访问系统        │
│  数据完整恢复 ✅     │
└──────────────────────┘
```

## 📝 启用步骤

### Step 1: 配置环境变量

创建 `.env` 文件：

```bash
# Discord备份（可选）
DISCORD_WEBHOOK_URL=你的Discord Webhook URL

# GitHub自动备份（必须）
ENABLE_GIT_BACKUP=true
```

### Step 2: 配置Git认证

**选择方式A：SSH密钥（推荐）**

```bash
# 1. 测试SSH
ssh -T git@github.com

# 如果显示 "successfully authenticated"，跳过下面步骤
# 如果失败，执行：

# 2. 生成密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 3. 复制公钥
cat ~/.ssh/id_ed25519.pub

# 4. 添加到GitHub
# 访问 https://github.com/settings/keys
# 点击 "New SSH key"，粘贴公钥

# 5. 配置仓库使用SSH
cd /path/to/attendance-record-system
git remote set-url origin git@github.com:emily930920-coder/attendance-record-system.git
```

**选择方式B：Personal Access Token**

```bash
# 1. 创建Token（https://github.com/settings/tokens）
# 2. 勾选 repo 权限
# 3. 配置Git
git config --global credential.helper store
git push  # 输入用户名和Token
```

### Step 3: 重启服务器

```bash
npm start
```

你会看到：

```
🔄 检查数据备份...
  📦 找到 2 个备份文件
  ✅ 恢复数据: yangyang100.json (5 条记录)
  ✅ 恢复数据: default.json (3 条记录)

🎉 数据恢复完成！恢复了 2 个用户的数据

============================================================
📋 工时记录系统服务器已启动
============================================================
🔄 实时备份配置:
  ✅ Discord备份已配置
  ✅ GitHub自动备份已配置
  💾 每次数据变更将自动备份
```

### Step 4: 测试完整流程

**1. 测试备份**

```bash
# 打开浏览器
open http://localhost:3000

# 点击"上班打卡"
# 等待5秒
```

**2. 验证Discord**
- 打开Discord频道
- 应该看到2条新消息：摘要 + JSON

**3. 验证GitHub**
```bash
# 查看备份文件
ls -la server/data/backup/

# 查看Git提交历史
git log --oneline -- server/data/backup/

# 访问GitHub
open https://github.com/emily930920-coder/attendance-record-system/tree/main/server/data/backup
```

**4. 测试恢复（本地测试）**

```bash
# 1. 删除运行时数据（模拟Render重启）
rm server/data/*.json
# 保留 .gitkeep 和 backup/

# 2. 重启服务器
npm start

# 3. 打开浏览器，数据应该已恢复
open http://localhost:3000
```

## 🌐 Render部署配置

### 1. 推送代码到GitHub

```bash
git push origin main
```

### 2. 在Render配置环境变量

Render Dashboard → Environment：

```
ENABLE_GIT_BACKUP=true
DISCORD_WEBHOOK_URL=你的Discord Webhook（可选）
```

### 3. 工作原理

**首次部署**：
1. Render拉取代码（包含backup/目录）
2. 服务器启动，从backup/恢复数据
3. 用户访问，数据完整

**每次打卡**：
1. 数据保存到 `server/data/`
2. 备份到 `backup/`
3. 提交到GitHub（但Render不会自动拉取）

**Render重启后**：
1. Render重新部署，拉取最新代码
2. 拉取包含最新backup/的代码
3. 服务器启动，自动恢复
4. 数据完整恢复 ✅

## 📊 数据流向图

```
┌────────────────────────────────────────────┐
│              用户本地浏览器                  │
│  localStorage (离线数据) ←→ 自动同步        │
└──────────────┬─────────────────────────────┘
               │ API请求
               ↓
┌────────────────────────────────────────────┐
│          服务器（本地/Render）              │
├────────────────────────────────────────────┤
│  启动时：                                   │
│  backup/*.json → data/*.json (恢复)        │
│                                            │
│  运行时：                                   │
│  data/*.json (运行时数据)                  │
│                                            │
│  变更时：                                   │
│  data/*.json → backup/*.json → GitHub     │
└────────────────────────────────────────────┘
               │
       ┌───────┴────────┐
       │                │
       ↓                ↓
┌─────────────┐  ┌─────────────┐
│   Discord    │  │   GitHub     │
│   频道       │  │   仓库       │
│  (即时查看)  │  │ (永久存储)   │
└─────────────┘  └─────────────┘
```

## 🔧 常见问题

### Q: Render重启后数据还是丢失？

**A: 检查GitHub备份是否启用**

```bash
# 查看环境变量
echo $ENABLE_GIT_BACKUP  # 应该是 true

# 查看backup目录
ls -la server/data/backup/

# 查看Git状态
git status
git log -- server/data/backup/
```

### Q: 本地测试恢复不工作？

**A: 确保backup目录有数据**

```bash
# 1. 检查backup目录
ls -la server/data/backup/

# 2. 手动创建测试数据
echo '{"user":"test","records":[]}' > server/data/backup/test.json

# 3. 重启服务器
npm start
```

### Q: Git推送失败？

**A: 检查认证配置**

```bash
# SSH方式
ssh -T git@github.com

# Token方式
git push -v  # 查看详细错误信息
```

## 📚 相关文档

- [GitHub备份快速开始.md](GitHub备份快速开始.md) - 3步配置指南
- [GitHub自动备份配置.md](GitHub自动备份配置.md) - 完整说明
- [备份故障排查.md](备份故障排查.md) - 问题诊断
- [Discord配置教程.md](Discord配置教程.md) - Discord配置

## 🎊 完成

现在你拥有：
1. ✅ **自动备份** - 每次打卡自动保存到GitHub
2. ✅ **自动恢复** - 服务器启动自动从GitHub恢复
3. ✅ **Discord查看** - 移动端随时查看
4. ✅ **版本历史** - Git记录所有变更
5. ✅ **零数据丢失** - Render重启数据完整恢复

**完美的数据安全方案！🎉**
