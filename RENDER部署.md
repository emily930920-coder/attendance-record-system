# 🚀 Render 部署方案

## 📋 关于 Render

Render 是一个现代化的云平台，提供：
- ✅ **免费套餐**（每月750小时免费）
- ✅ 自动从 Git 部署
- ✅ 自动 HTTPS
- ✅ 持续部署
- ✅ 无需信用卡（免费版）

**官网**: https://render.com

## 🎯 部署准备

### 1. 注册 Render 账号

访问 https://render.com 并注册账号（支持 GitHub 登录）

### 2. 准备 Git 仓库

将项目推送到 GitHub、GitLab 或 Bitbucket。

```bash
cd /Users/yangyang100/Desktop/AutoTest/attendance-record-system

# 初始化 Git（如果还没有）
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: 工时记录系统"

# 添加远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/attendance-system.git

# 推送到 GitHub
git push -u origin main
```

## 📝 部署步骤

### 方式一：通过 Render Dashboard 部署（推荐）

#### 步骤 1: 创建 Web Service

1. 登录 Render Dashboard
2. 点击 **"New +"** → **"Web Service"**
3. 连接你的 Git 仓库
4. 选择 `attendance-record-system` 仓库

#### 步骤 2: 配置服务

填写以下信息：

| 配置项 | 值 |
|--------|-----|
| **Name** | `attendance-system`（或自定义名称） |
| **Environment** | `Node` |
| **Region** | `Oregon (US West)` 或 `Singapore`（选择离你近的） |
| **Branch** | `main`（或你的主分支名） |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free`（免费） |

#### 步骤 3: 环境变量（可选）

点击 **"Advanced"** → **"Add Environment Variable"**

```
PORT=3000
NODE_ENV=production
```

#### 步骤 4: 部署

1. 点击 **"Create Web Service"**
2. Render 会自动开始构建和部署
3. 等待 3-5 分钟，首次部署完成

#### 步骤 5: 访问应用

部署成功后，Render 会提供一个公网地址：
```
https://attendance-system.onrender.com
```

### 方式二：使用 render.yaml 配置文件（高级）

在项目根目录创建 `render.yaml`：

```yaml
services:
  - type: web
    name: attendance-system
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3000
```

然后在 Render Dashboard 中选择 **"Blueprint"** 方式部署。

## 💾 数据持久化

### ⚠️ 重要提示

Render 的免费版**不提供持久化存储**，这意味着：
- 每次重新部署，数据会丢失
- 服务休眠后重启，数据会丢失

### 解决方案

#### 方案 1: 使用 Render PostgreSQL（推荐，但需付费）

升级到付费版本并使用 Render 的 PostgreSQL 数据库。

#### 方案 2: 使用外部数据库

连接到免费的外部数据库服务：
- **MongoDB Atlas**（免费500MB）
- **Supabase**（免费500MB PostgreSQL）
- **PlanetScale**（免费5GB MySQL）

#### 方案 3: 定期备份到云存储

修改代码，定期将数据备份到：
- Google Drive API
- Dropbox API
- AWS S3（免费套餐）

#### 方案 4: 仅用于演示

如果只是演示用途，接受数据会丢失的事实。

## 🔧 针对 Render 的代码调整

### 1. 创建启动检测脚本

创建 `server/check-storage.js`：

```javascript
const fs = require('fs').promises;
const path = require('path');

async function checkStorage() {
    const dataDir = path.join(__dirname, 'data');
    
    try {
        await fs.access(dataDir);
        console.log('✅ 数据目录存在');
        
        // 列出所有数据文件
        const files = await fs.readdir(dataDir);
        console.log(`📁 现有数据文件: ${files.length}个`);
        
    } catch (error) {
        console.log('⚠️  数据目录不存在，正在创建...');
        await fs.mkdir(dataDir, { recursive: true });
        console.log('✅ 数据目录已创建');
    }
}

checkStorage().catch(console.error);
```

### 2. 修改 package.json

```json
{
  "scripts": {
    "start": "node server/check-storage.js && node server/server.js",
    "dev": "nodemon server/server.js"
  }
}
```

### 3. 添加健康检查端点

确保 `server/server.js` 中有健康检查：

```javascript
app.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});
```

## 🌐 自定义域名（可选）

### 使用 Render 提供的域名
```
https://你的服务名.onrender.com
```

### 绑定自定义域名

1. 在 Render Dashboard 中选择你的服务
2. 点击 **"Settings"** → **"Custom Domain"**
3. 添加你的域名（需要在域名提供商处配置 DNS）
4. Render 会自动配置免费的 HTTPS 证书

## 📊 监控和日志

### 查看部署日志

1. 进入你的服务页面
2. 点击 **"Logs"** 标签
3. 实时查看应用日志

### 查看服务状态

1. 在 Dashboard 首页查看服务状态
2. 绿色 = 运行中
3. 红色 = 部署失败或已停止

### 设置健康检查

Render 会自动检测你的应用：
- 每隔几分钟发送 HTTP 请求
- 如果失败，会自动重启服务

## ⚡ 性能优化

### 1. 防止服务休眠

免费版服务在 15 分钟无访问后会休眠。解决方案：

#### 使用 UptimeRobot 监控

1. 注册 https://uptimerobot.com（免费）
2. 添加监控：
   - 类型：HTTP(s)
   - URL：https://你的服务名.onrender.com/api/health
   - 间隔：5分钟
3. UptimeRobot 会定期访问，保持服务活跃

#### 使用 Cron Job

在 Render 中添加 Cron Job：
```bash
*/5 * * * * curl https://你的服务名.onrender.com/api/health
```

### 2. 优化启动时间

在 `package.json` 中：

```json
{
  "engines": {
    "node": ">=16.0.0"
  },
  "scripts": {
    "start": "node server/server.js",
    "build": "echo 'No build needed'"
  }
}
```

## 🐛 常见问题

### Q1: 部署失败怎么办？

**检查日志**：
1. 在 Render Dashboard 查看 Logs
2. 查找错误信息

**常见错误**：
- 端口问题：确保使用 `process.env.PORT || 3000`
- 依赖问题：确保 `package.json` 中所有依赖都列出
- Node 版本：确保使用兼容的 Node 版本

### Q2: 为什么访问很慢？

- 免费版服务器在休眠后首次访问需要 30-60 秒启动
- 使用 UptimeRobot 可以保持服务活跃

### Q3: 数据丢失了怎么办？

- 免费版不支持持久化存储
- 建议使用外部数据库或定期导出备份

### Q4: 如何查看实时日志？

```bash
# 使用 Render CLI（需要先安装）
render logs -f
```

### Q5: 可以运行多个实例吗？

免费版只能运行 1 个实例，付费版可以扩展。

## 📋 完整部署清单

- [ ] 注册 Render 账号
- [ ] 将代码推送到 Git 仓库
- [ ] 在 Render 创建 Web Service
- [ ] 配置环境变量
- [ ] 等待部署完成
- [ ] 访问测试应用
- [ ] 设置 UptimeRobot（防止休眠）
- [ ] （可选）配置自定义域名
- [ ] （可选）配置外部数据库

## 🚀 快速部署命令

```bash
# 1. 提交代码
git add .
git commit -m "Prepare for Render deployment"
git push origin main

# 2. 在 Render Dashboard 中点击部署

# 3. 等待部署完成

# 4. 访问你的应用
open https://你的服务名.onrender.com
```

## 📱 部署后的访问

部署成功后：

1. **Web 访问**：https://attendance-system.onrender.com
2. **API 健康检查**：https://attendance-system.onrender.com/api/health
3. **移动端访问**：直接用手机浏览器访问上述地址

## 💰 费用说明

### 免费版限制
- ✅ 750 小时/月免费运行时间（足够一个月使用）
- ✅ 无限带宽
- ✅ 自动 HTTPS
- ❌ 15分钟无访问会休眠
- ❌ 无持久化存储
- ❌ 每月重新部署会重置数据

### 升级到付费版（$7/月起）
- ✅ 持久化存储
- ✅ 不会休眠
- ✅ 更快的启动速度
- ✅ 可以绑定多个域名

## 🎯 推荐方案

### 个人使用（免费）
- 使用 Render 免费版
- 配合 UptimeRobot 防止休眠
- 定期导出数据备份

### 团队使用（付费）
- 升级 Render 付费版（$7/月）
- 使用持久化存储
- 配置自定义域名

### 企业使用
- 使用 Render Professional 计划
- 配置数据库服务
- 设置自动备份

## 📚 相关资源

- [Render 官方文档](https://render.com/docs)
- [Render Node.js 指南](https://render.com/docs/deploy-node-express-app)
- [Render 免费版限制](https://render.com/docs/free)

## 🆘 获取帮助

- Render 支持：https://render.com/support
- Render 社区：https://community.render.com

---

**部署愉快！** 🎉

如有问题，欢迎查看相关文档或联系支持。
