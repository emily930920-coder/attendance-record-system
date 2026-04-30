const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// 确保数据目录存在
async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

// 获取用户数据文件路径
function getUserDataPath(user) {
    return path.join(DATA_DIR, `${user}.json`);
}

// 读取用户数据
async function readUserData(user) {
    try {
        const filePath = getUserDataPath(user);
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return { user, records: [] };
    }
}

// 写入用户数据
async function writeUserData(user, data) {
    const filePath = getUserDataPath(user);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// API 路由

// 获取用户的所有记录
app.get('/api/records/:user', async (req, res) => {
    try {
        const { user } = req.params;
        const data = await readUserData(user);
        res.json(data);
    } catch (error) {
        console.error('读取数据失败:', error);
        res.status(500).json({ error: '读取数据失败' });
    }
});

// 保存或更新记录
app.post('/api/records', async (req, res) => {
    try {
        const { user, record } = req.body;
        
        if (!user || !record) {
            return res.status(400).json({ error: '缺少必要参数' });
        }
        
        const data = await readUserData(user);
        
        // 查找是否存在该记录
        const index = data.records.findIndex(r => r.id === record.id);
        
        if (index >= 0) {
            // 更新现有记录
            data.records[index] = record;
        } else {
            // 添加新记录
            data.records.push(record);
        }
        
        // 按日期降序排序
        data.records.sort((a, b) => b.date.localeCompare(a.date));
        
        await writeUserData(user, data);
        
        res.json({ success: true, message: '保存成功' });
    } catch (error) {
        console.error('保存数据失败:', error);
        res.status(500).json({ error: '保存数据失败' });
    }
});

// 删除记录
app.delete('/api/records/:user/:id', async (req, res) => {
    try {
        const { user, id } = req.params;
        
        const data = await readUserData(user);
        data.records = data.records.filter(r => r.id !== id);
        
        await writeUserData(user, data);
        
        res.json({ success: true, message: '删除成功' });
    } catch (error) {
        console.error('删除数据失败:', error);
        res.status(500).json({ error: '删除数据失败' });
    }
});

// 导出用户数据
app.get('/api/export/:user', async (req, res) => {
    try {
        const { user } = req.params;
        const data = await readUserData(user);
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename=工时记录_${user}_${new Date().toISOString().split('T')[0]}.json`);
        res.send(JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('导出数据失败:', error);
        res.status(500).json({ error: '导出数据失败' });
    }
});

// 获取所有用户列表
app.get('/api/users', async (req, res) => {
    try {
        const files = await fs.readdir(DATA_DIR);
        const users = files
            .filter(f => f.endsWith('.json'))
            .map(f => f.replace('.json', ''));
        res.json({ users });
    } catch (error) {
        console.error('读取用户列表失败:', error);
        res.json({ users: [] });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 所有其他路由返回 index.html (SPA)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 启动服务器
async function startServer() {
    await ensureDataDir();
    
    app.listen(PORT, () => {
        console.log('='.repeat(60));
        console.log('📋 工时记录系统服务器已启动');
        console.log('='.repeat(60));
        console.log(`🌐 本地访问: http://localhost:${PORT}`);
        console.log(`📱 局域网访问: http://${getLocalIP()}:${PORT}`);
        console.log(`📁 数据目录: ${DATA_DIR}`);
        console.log('='.repeat(60));
        console.log('💡 提示：');
        console.log('  - 支持多用户数据隔离');
        console.log('  - 支持离线模式和自动同步');
        console.log('  - 数据保存在 server/data 目录');
        console.log('  - 按 Ctrl+C 停止服务器');
        console.log('='.repeat(60));
    });
}

// 获取本地IP地址
function getLocalIP() {
    try {
        const os = require('os');
        const interfaces = os.networkInterfaces();
        
        for (const name of Object.keys(interfaces)) {
            for (const iface of interfaces[name]) {
                if (iface.family === 'IPv4' && !iface.internal) {
                    return iface.address;
                }
            }
        }
    } catch (error) {
        console.log('无法获取本地IP地址:', error.message);
    }
    
    return 'localhost';
}

// 错误处理
process.on('unhandledRejection', (error) => {
    console.error('未处理的 Promise 拒绝:', error);
});

process.on('SIGTERM', () => {
    console.log('收到 SIGTERM 信号，正在关闭服务器...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n收到 SIGINT 信号，正在关闭服务器...');
    process.exit(0);
});

// 启动
startServer().catch(error => {
    console.error('启动服务器失败:', error);
    process.exit(1);
});
