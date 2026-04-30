/**
 * GitHub自动备份模块
 * 将数据自动提交到GitHub
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// 备份配置
const BACKUP_CONFIG = {
    enabled: process.env.ENABLE_GIT_BACKUP === 'true',
    dataDir: path.join(__dirname, '../server/data'),
    backupDir: path.join(__dirname, '../server/data/backup'),
    gitRepo: path.join(__dirname, '..')
};

/**
 * 执行shell命令
 */
function execCommand(command, cwd) {
    return new Promise((resolve, reject) => {
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

/**
 * 备份数据到Git
 */
async function backupToGit(userData) {
    if (!BACKUP_CONFIG.enabled) {
        return { success: false, message: 'Git自动备份未启用' };
    }

    try {
        // 1. 确保backup目录存在
        try {
            await fs.access(BACKUP_CONFIG.backupDir);
        } catch {
            await fs.mkdir(BACKUP_CONFIG.backupDir, { recursive: true });
        }

        // 2. 生成备份文件名
        const date = new Date();
        const timestamp = date.toISOString().replace(/[:.]/g, '-').split('T')[0];
        const backupFileName = `${userData.user}_${timestamp}.json`;
        const backupFilePath = path.join(BACKUP_CONFIG.backupDir, backupFileName);

        // 3. 写入备份数据
        const backupData = {
            user: userData.user,
            backupTime: date.toISOString(),
            backupTimeLocal: date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
            recordCount: userData.records ? userData.records.length : 0,
            data: userData
        };
        
        await fs.writeFile(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');

        // 4. Git操作
        const gitCommands = [
            // 添加backup目录到Git
            `git add server/data/backup/${backupFileName}`,
            // 提交
            `git commit -m "📋 自动备份 - ${userData.user} - ${date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}"`,
            // 推送到远程
            `git push origin main`
        ];

        for (const command of gitCommands) {
            try {
                await execCommand(command, BACKUP_CONFIG.gitRepo);
            } catch (error) {
                // 如果是"nothing to commit"错误，忽略
                if (!error.message.includes('nothing to commit')) {
                    throw error;
                }
            }
        }

        return {
            success: true,
            message: 'Git备份成功',
            file: backupFileName,
            path: `server/data/backup/${backupFileName}`
        };

    } catch (error) {
        return {
            success: false,
            message: 'Git备份失败',
            error: error.message
        };
    }
}

/**
 * 获取Git备份状态
 */
function getGitBackupStatus() {
    return {
        enabled: BACKUP_CONFIG.enabled,
        backupDir: 'server/data/backup',
        message: BACKUP_CONFIG.enabled ? 'Git自动备份已启用' : 'Git自动备份已禁用'
    };
}

module.exports = {
    backupToGit,
    getGitBackupStatus
};
