# 🚀 Render 快速部署

## 3步完成部署

### 1️⃣ 推送代码到 GitHub

```bash
cd /Users/yangyang100/Desktop/AutoTest/attendance-record-system

# 创建 GitHub 仓库后执行
git init
git add .
git commit -m "部署工时记录系统到Render"
git branch -M main
git remote add origin https://github.com/你的用户名/attendance-system.git
git push -u origin main
```

### 2️⃣ 在 Render 创建服务

1. 访问 https://render.com 并登录
2. 点击 **"New +"** → **"Web Service"**
3. 连接你的 GitHub 仓库
4. 填写配置：

```
Name: attendance-system
Environment: Node
Build Command: npm install
Start Command: npm start
Instance Type: Free
```

5. 点击 **"Create Web Service"**

### 3️⃣ 等待部署完成

- 首次部署需要 3-5 分钟
- 完成后获得访问地址：`https://attendance-system.onrender.com`

## ⚠️ 重要提示

**免费版限制**：
- 15分钟无访问会休眠（首次唤醒需30秒）
- 无持久化存储（重启会丢失数据）

**解决方案**：
1. 使用 [UptimeRobot](https://uptimerobot.com) 保持服务活跃
2. 定期导出数据备份
3. 或升级到付费版（$7/月）获得持久化存储

## 🎯 访问应用

部署成功后：
```
https://你的服务名.onrender.com
```

## 📚 详细说明

查看 [RENDER部署.md](RENDER部署.md) 了解完整部署方案。

---

**5分钟内即可上线！** 🎉
