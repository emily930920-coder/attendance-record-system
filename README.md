# 📋 工时记录系统

一个功能完善的工时记录系统，支持多用户、离线模式、数据同步等特性。

![状态](https://img.shields.io/badge/状态-运行中-brightgreen)
![版本](https://img.shields.io/badge/版本-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen)

## 🎯 当前状态

✅ **服务器运行中** - http://localhost:3000

系统已完成开发并通过测试，可以立即使用！

## ✨ 功能特点

- ✅ 上下班打卡记录
- ✅ 自动计算工时
- ✅ 本月统计报表（工作天数、总工时、平均工时）
- ✅ 历史记录查看和管理
- ✅ 服务端数据存储（不需要数据库）
- ✅ **多重实时备份**（Discord + GitHub自动备份）
- ✅ WiFi/5G 局域网访问
- ✅ 离线模式支持（PWA）
- ✅ 智能数据同步
- ✅ 数据导出功能（JSON格式）
- ✅ 多用户支持，数据隔离
- ✅ 本地数据自动同步到服务器
- ✅ 响应式设计，支持手机和PC端
- ✅ 美观的渐变色UI设计

## 🚀 快速开始

### 环境要求

- Node.js >= 14.0.0
- npm 或 yarn

### 三步启动

1. **安装依赖**

```bash
npm install
```

2. **启动服务器**

```bash
npm start
```

或使用快速启动脚本：
- Mac/Linux: `./start.sh`
- Windows: 双击 `start.bat`

3. **访问应用**

- 本地访问：http://localhost:3000
- 局域网访问：http://[您的IP地址]:3000

服务器启动后会显示具体的访问地址。

> 💡 更多帮助请查看 [快速开始.md](快速开始.md)

## 📱 使用说明

### 打卡操作

1. **上班打卡**：点击"上班打卡"按钮，系统会记录当前时间
2. **下班打卡**：点击"下班打卡"按钮，系统会记录当前时间并自动计算工作时长

### 查看统计

- **今日记录**：显示今天的上班时间、下班时间和工作时长
- **本月统计**：显示本月的工作天数、总工时和平均工时

### 记录管理

- **查看历史**：在"本月记录"区域查看本月的所有打卡记录
- **手动添加**：点击"手动添加"按钮可以补录历史记录
- **编辑记录**：点击记录右侧的"编辑"按钮可以修改记录
- **删除记录**：点击记录右侧的"删除"按钮可以删除记录

### 多用户使用

1. 点击页面顶部的"切换用户"按钮
2. 输入用户名（可以是姓名、工号等）
3. 确认后切换到该用户，数据完全隔离

### 数据导出

点击"导出数据"按钮，可以将当前用户的所有记录导出为 JSON 文件。

### 离线模式

应用支持 PWA 离线模式：

1. 首次访问后，应用会自动缓存
2. 在离线状态下也可以正常使用
3. 离线时的数据会保存在本地
4. 恢复网络后点击"同步数据"按钮，或等待自动同步（每分钟一次）

### 数据备份 🔒

系统支持多重自动备份，确保数据安全：

#### 1. Discord实时备份（推荐）

每次打卡后自动发送到Discord：
- ✅ 即时查看（移动端友好）
- ✅ 完整JSON数据格式
- ✅ 永久保存在Discord频道

**配置方法**：查看 [Discord配置教程.md](Discord配置教程.md)

#### 2. GitHub自动备份（推荐）

每次数据变更自动提交到GitHub：
- ✅ 版本历史记录
- ✅ 可随时恢复任意版本
- ✅ 永久免费存储

**配置方法**：查看 [GitHub自动备份配置.md](GitHub自动备份配置.md)

#### 3. 定时备份（可选）

使用Render Cron Jobs每天自动备份：
- 📅 每日定时执行
- 📤 发送到配置的Webhook

**测试备份**：

```bash
# 测试Discord备份
node test-discord.js

# 测试GitHub备份
node test-github-backup.js
```

**备份文件位置**：
- 本地运行时数据：`server/data/*.json`
- GitHub备份数据：`server/data/backup/*.json`

## 🏗️ 项目结构

```
attendance-record-system/
├── public/                      # 前端文件
│   ├── index.html              # 主页面
│   ├── style.css               # 样式文件
│   ├── app.js                  # 应用逻辑
│   ├── sw.js                   # Service Worker
│   └── manifest.json           # PWA 配置
├── server/                     # 后端文件
│   ├── server.js               # Express 服务器
│   ├── backup-realtime.js      # 实时备份模块
│   ├── backup-github.js        # GitHub自动备份
│   └── data/                   # 数据存储目录
│       ├── backup/             # GitHub备份目录
│       └── .gitkeep
├── scripts/                    # 脚本工具
│   └── backup.js               # 定时备份脚本
├── test-discord.js             # Discord备份测试
├── test-github-backup.js       # GitHub备份测试
├── package.json                # 项目配置
├── .env                        # 环境变量（需自己创建）
├── .gitignore                  # Git 忽略配置
└── README.md                   # 说明文档
```

## 💾 数据存储

- **运行时数据**：存储在 `server/data/*.json`（本地运行）
- **备份数据**：自动保存到 `server/data/backup/*.json`（提交到GitHub）
- **每个用户**：独立的 JSON 文件（如 `张三.json`）
- **离线备份**：支持本地浏览器存储（localStorage）
- **云端备份**：Discord + GitHub双重保障
- **无需数据库**：开箱即用

### 备份策略

| 备份方式 | 触发时机 | 存储位置 | 数据格式 |
|----------|----------|----------|----------|
| 本地文件 | 每次变更 | `server/data/` | JSON |
| Discord | 每次变更（3秒防抖） | Discord频道 | JSON |
| GitHub | 每次变更（3秒防抖） | GitHub仓库 | JSON |
| 离线缓存 | 自动同步 | LocalStorage | JSON |

## 🌐 部署方案

### 方案一：本地部署（推荐用于个人或小团队）

直接运行 `npm start` 即可，局域网内所有设备都可访问。

查看详情：[本地部署.md](本地部署.md)

### 方案二：Render 云部署（免费，推荐）

Render 提供免费套餐，支持自动 HTTPS 和持续部署。

**快速步骤**：
1. 推送代码到 GitHub
2. 在 Render 创建 Web Service
3. 3分钟自动部署完成

查看详情：[RENDER部署.md](RENDER部署.md) 或 [Render快速部署.md](Render快速部署.md)

#### 使用 Render 部署

1. 注册 [Render](https://render.com/) 账号（免费）
2. 连接 GitHub 仓库或直接部署
3. Render 会自动识别 Node.js 项目并部署
4. 获得公网访问地址

**配置**：
- Build Command: `npm install`
- Start Command: `npm start`
- 使用 `render.yaml` 配置文件（已包含）

### 方案三：Railway 云部署（免费）

1. 注册 [Render](https://render.com/) 账号（免费）
2. 创建新的 Web Service
3. 连接 GitHub 仓库
4. 构建命令：`npm install`
5. 启动命令：`npm start`
6. 获得公网访问地址

### 方案三：使用 Docker 部署

创建 `Dockerfile`：

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

构建和运行：

```bash
docker build -t attendance-system .
docker run -p 3000:3000 -v $(pwd)/server/data:/app/server/data attendance-system
```

### 方案四：VPS 部署

1. 购买 VPS（如阿里云、腾讯云等）
2. 安装 Node.js
3. 上传代码并安装依赖
4. 使用 PM2 进行进程管理：

```bash
npm install -g pm2
pm2 start server/server.js --name attendance
pm2 save
pm2 startup
```

## 🔧 开发模式

如果需要修改代码并实时预览：

```bash
npm run dev
```

这会使用 nodemon 监听文件变化并自动重启服务器。

## 📝 环境变量

可以通过环境变量配置端口：

```bash
PORT=8080 npm start
```

## 🛠️ 技术栈

- **前端**：原生 HTML + CSS + JavaScript
- **后端**：Node.js + Express
- **数据存储**：JSON 文件
- **离线支持**：Service Worker + PWA
- **响应式设计**：纯 CSS 实现

## 📊 数据格式

用户数据文件示例（`张三.json`）：

```json
{
  "user": "张三",
  "records": [
    {
      "id": "abc123",
      "date": "2026-04-23",
      "clockIn": "09:00",
      "clockOut": "18:00"
    }
  ]
}
```

## 🔒 安全建议

1. 如果部署到公网，建议添加身份验证
2. 使用 HTTPS 保护数据传输
3. 定期备份 `server/data` 目录
4. 考虑添加访问日志和监控

## 🐛 故障排除

### 无法访问服务器

- 检查防火墙设置，确保端口 3000 开放
- 检查服务器是否正常启动
- 确认设备在同一局域网内

### 数据未同步

- 检查网络连接
- 手动点击"同步数据"按钮
- 查看浏览器控制台是否有错误信息

### 离线模式不工作

- 确保浏览器支持 Service Worker
- 检查 HTTPS 连接（localhost 除外）
- 清除浏览器缓存后重新访问

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，欢迎反馈。

---

Made with ❤️ for efficient time tracking
