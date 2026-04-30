# 📱 Discord Webhook 配置详细教程

## 步骤1: 安装Discord（如果还没有）

### 下载Discord
- **桌面版**: https://discord.com/download
- **移动端**: 
  - iOS: App Store搜索"Discord"
  - Android: Google Play搜索"Discord"
- **网页版**: https://discord.com/app

## 步骤2: 创建Discord服务器

### 如果你已有服务器，跳到步骤3

1. 打开Discord
2. 点击左侧的 **"+"** 按钮（添加服务器）
3. 选择 **"亲自创建"**
4. 选择 **"仅供我和我的朋友使用"**
5. 输入服务器名称：`工作记录` 或任意名称
6. 点击 **"创建"**

## 步骤3: 创建专用频道

1. 在服务器中，点击频道列表旁的 **"+"**
2. 选择 **"文字频道"**
3. 频道名称：`工时备份` 或 `attendance-backup`
4. 设置为私密频道（可选）
5. 点击 **"创建频道"**

## 步骤4: 获取Webhook URL ⭐重要

### 方式A: 桌面版/网页版

1. **右键点击**你创建的频道（工时备份）
2. 选择 **"编辑频道"**
3. 点击左侧的 **"整合"** 标签
4. 点击 **"Webhooks"**
5. 点击 **"新建Webhook"**
6. 自定义Webhook：
   - **名称**: `工时记录系统`
   - **图标**: 可选（上传一个图标）
7. 点击 **"复制Webhook URL"** 按钮
8. **保存更改**

### 方式B: 移动端

1. 长按你创建的频道
2. 选择 **"设置"**
3. 滚动到 **"整合"**
4. 点击 **"Webhooks"**
5. 点击 **"创建Webhook"**
6. 设置名称并 **复制URL**

## 步骤5: Webhook URL示例

你复制的URL应该类似：
```
https://discord.com/api/webhooks/1234567890123456789/abcdefghijklmnopqrstuvwxyz-ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890
```

**重要**：这个URL包含密钥，不要公开分享！

## 步骤6: 配置到本地环境

### 方式1: 使用环境变量

```bash
# 打开终端，执行：
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/你的webhook完整URL"

# 验证
echo $DISCORD_WEBHOOK_URL
```

### 方式2: 创建.env文件（推荐）

```bash
# 在项目根目录创建.env文件
cat > /Users/yangyang100/Desktop/AutoTest/attendance-record-system/.env << 'EOF'
# Discord备份配置
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/你的完整URL
EOF
```

然后安装dotenv：
```bash
cd /Users/yangyang100/Desktop/AutoTest/attendance-record-system
npm install dotenv
```

## 步骤7: 修改服务器代码加载.env

在 `server/server.js` 第一行添加：
```javascript
require('dotenv').config();
```

## 步骤8: 重启服务器测试

```bash
cd /Users/yangyang100/Desktop/AutoTest/attendance-record-system
npm start
```

启动后应该看到：
```
🔄 实时备份配置:
  ✅ Discord Webhook已配置
  💾 每次数据变更将自动备份
```

## 步骤9: 测试备份

1. 访问 http://localhost:3000
2. 进行打卡操作（上班打卡）
3. 等待3秒
4. 查看Discord频道，应该收到消息：

```
📋 数据更新 - 用户: yangyang100

【实时备份】
记录数: 3
时间: 2026-04-30 15:34:00
工时记录系统
```

## 步骤10: 移动端查看

1. 在手机上打开Discord App
2. 进入你的服务器
3. 打开"工时备份"频道
4. 可以看到所有备份消息
5. 支持推送通知！

## 🎨 自定义Webhook外观

### 修改Webhook名称和头像

1. 返回Discord频道设置 → 整合 → Webhooks
2. 点击你的Webhook
3. 可以修改：
   - **名称**
   - **头像图标**
4. 保存更改

建议设置一个醒目的图标，方便识别！

## 📊 Discord备份的优势

✅ **永久保存** - 消息不会过期
✅ **移动端友好** - 随时随地查看
✅ **推送通知** - 数据更新立即知道
✅ **免费** - 完全免费使用
✅ **搜索功能** - 可搜索历史备份
✅ **团队协作** - 可以邀请团队成员查看

## 🔒 安全建议

1. **私密频道** - 设置频道为私密
2. **不要分享URL** - Webhook URL包含密钥
3. **定期更换** - 可以删除旧的Webhook创建新的
4. **权限控制** - 只给必要的人访问权限

## 🆚 Discord vs Webhook.site

| 特性 | Discord | Webhook.site |
|------|---------|--------------|
| 数据保留 | 永久 | 30天 |
| 移动端 | ✅ App | ✅ 浏览器 |
| 通知 | ✅ 推送 | ❌ 无 |
| 费用 | 免费 | 免费 |
| 团队分享 | ✅ 容易 | ❌ 需要分享URL |
| 数据格式 | 精简 | 完整JSON |

## 💡 高级配置

### 同时配置Discord和Webhook.site

```bash
# 两个都配置，双重保障！
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/xxx"
export BACKUP_WEBHOOK_URL="https://webhook.site/xxx"
```

两个都会收到备份：
- Discord: 精简通知，移动端查看
- Webhook.site: 完整JSON，下载备份

## 🎯 部署到Render

在Render Environment配置：

```
Key: DISCORD_WEBHOOK_URL
Value: https://discord.com/api/webhooks/你的完整URL
```

保存后会自动重新部署，然后就能在Discord收到备份了！

## ❓ 故障排查

### Discord频道没收到消息？

1. **检查URL是否正确**
   ```bash
   echo $DISCORD_WEBHOOK_URL
   ```

2. **测试Webhook**
   ```bash
   curl -X POST "你的Discord-Webhook-URL" \
     -H "Content-Type: application/json" \
     -d '{"content": "测试消息"}'
   ```

3. **查看服务器日志**
   - 应该显示"Discord备份成功"

4. **检查Webhook是否被删除**
   - Discord频道设置 → 整合 → Webhooks
   - 确认Webhook还存在

### 收到错误消息？

- **401 Unauthorized**: Webhook URL错误或已删除
- **404 Not Found**: Webhook不存在
- **Rate Limited**: 发送太频繁（3秒防抖会避免）

## 📱 移动端最佳实践

1. **开启通知**
   - Discord设置 → 通知
   - 允许推送通知

2. **添加到收藏**
   - 长按频道 → 添加到收藏夹
   - 快速访问

3. **设置提醒音**
   - 可以为这个频道设置独特的提醒音

## 🎊 完成！

配置完成后：
- ✅ 每次打卡自动备份到Discord
- ✅ 手机随时查看备份
- ✅ 数据永久保存
- ✅ 团队可以共同查看

---

**现在就去创建你的Discord Webhook吧！** 🚀

有问题随时问我！
