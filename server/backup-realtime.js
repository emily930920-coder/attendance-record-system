/**
 * 实时备份模块
 * 每次数据变更时自动备份
 */

// 导入GitHub备份模块
const { backupToGit, getGitBackupStatus } = require('./backup-github');

// 备份配置
const BACKUP_CONFIG = {
    webhookUrl: process.env.BACKUP_WEBHOOK_URL || '',
    discordWebhook: process.env.DISCORD_WEBHOOK_URL || '',
    emailWebhook: process.env.EMAIL_WEBHOOK_URL || '',
    enabled: true // 默认启用
};

// 备份队列（防止频繁备份）
let backupQueue = [];
let backupTimer = null;
const BACKUP_DELAY = 3000; // 3秒延迟合并备份

/**
 * 发送备份到Webhook
 */
async function sendToWebhook(url, data) {
    if (!url) return false;
    
    try {
        const fetch = require('node-fetch');
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                type: 'realtime_backup',
                data: data,
                source: 'attendance-system'
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('Webhook备份失败:', error.message);
        return false;
    }
}

/**
 * 发送到Discord
 */
async function sendToDiscord(data) {
    if (!BACKUP_CONFIG.discordWebhook) return false;
    
    try {
        const fetch = require('node-fetch');
        
        // 准备JSON数据
        const jsonData = JSON.stringify(data, null, 2);
        const recordCount = data.records ? data.records.length : 0;
        
        // 如果JSON数据太长，截断并提示
        const maxLength = 1900; // Discord限制约2000字符，留一些余地
        let jsonContent = jsonData;
        let isTruncated = false;
        
        if (jsonData.length > maxLength) {
            jsonContent = jsonData.substring(0, maxLength) + '\n... (数据已截断)';
            isTruncated = true;
        }
        
        // 发送第一条消息：摘要信息
        const summaryResponse = await fetch(BACKUP_CONFIG.discordWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: `📋 **工时记录备份** - 用户: \`${data.user}\``,
                embeds: [{
                    title: '📊 数据摘要',
                    description: `- 记录总数: **${recordCount}**\n- 备份时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}${isTruncated ? '\n- ⚠️ 数据较大，已分条发送' : ''}`,
                    color: 0x5865F2,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: '工时记录系统 - 实时备份'
                    }
                }]
            })
        });
        
        // 稍微延迟，避免消息顺序混乱
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 发送第二条消息：完整JSON数据
        const jsonResponse = await fetch(BACKUP_CONFIG.discordWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: '```json\n' + jsonContent + '\n```'
            })
        });
        
        return summaryResponse.ok && jsonResponse.ok;
    } catch (error) {
        console.error('Discord备份失败:', error.message);
        return false;
    }
}

/**
 * 执行备份
 */
async function performBackup(userData) {
    if (!BACKUP_CONFIG.enabled) {
        console.log('⚠️  实时备份已禁用');
        return;
    }
    
    console.log(`🔄 实时备份 - 用户: ${userData.user}`);
    
    let success = false;
    
    // 尝试主Webhook
    if (BACKUP_CONFIG.webhookUrl) {
        console.log('📤 尝试发送到主Webhook...');
        const result = await sendToWebhook(BACKUP_CONFIG.webhookUrl, userData);
        if (result) {
            console.log('✅ Webhook备份成功');
            success = true;
        } else {
            console.log('❌ Webhook备份失败');
        }
    }
    
    // 尝试Discord
    if (BACKUP_CONFIG.discordWebhook) {
        console.log('📤 尝试发送到Discord...');
        console.log('Discord URL:', BACKUP_CONFIG.discordWebhook.substring(0, 50) + '...');
        const result = await sendToDiscord(userData);
        if (result) {
            console.log('✅ Discord备份成功');
            success = true;
        } else {
            console.log('❌ Discord备份失败');
        }
    }
    
    // 尝试GitHub备份
    const gitStatus = getGitBackupStatus();
    if (gitStatus.enabled) {
        console.log('📤 尝试备份到GitHub...');
        const gitResult = await backupToGit(userData);
        if (gitResult.success) {
            console.log('✅ GitHub备份成功:', gitResult.path);
            success = true;
        } else {
            console.log('❌ GitHub备份失败:', gitResult.message);
        }
    }
    
    if (!success && !BACKUP_CONFIG.webhookUrl && !BACKUP_CONFIG.discordWebhook && !gitStatus.enabled) {
        // 如果没有配置webhook，输出到日志
        console.log('💾 数据快照:', JSON.stringify(userData, null, 2));
    } else if (!success) {
        console.log('⚠️  所有备份方式都失败，输出数据快照:');
        console.log('💾 数据快照:', JSON.stringify(userData, null, 2));
    }
    
    return success;
}

/**
 * 添加到备份队列（防抖）
 */
function queueBackup(userData) {
    // 添加到队列
    backupQueue.push({
        user: userData.user,
        data: userData,
        timestamp: Date.now()
    });
    
    // 清除旧的定时器
    if (backupTimer) {
        clearTimeout(backupTimer);
    }
    
    // 设置新的定时器（3秒后执行）
    backupTimer = setTimeout(async () => {
        // 获取队列中的所有用户
        const users = [...new Set(backupQueue.map(item => item.user))];
        
        console.log(`📦 处理备份队列: ${users.length} 个用户`);
        
        // 为每个用户执行备份（使用最新的数据）
        for (const user of users) {
            const latestItem = backupQueue
                .filter(item => item.user === user)
                .sort((a, b) => b.timestamp - a.timestamp)[0];
            
            await performBackup(latestItem.data);
        }
        
        // 清空队列
        backupQueue = [];
        backupTimer = null;
    }, BACKUP_DELAY);
}

/**
 * 公开接口：备份用户数据
 */
function backupUserData(userData) {
    if (!userData || !userData.user) {
        console.error('❌ 备份数据无效');
        return;
    }
    
    // 添加到队列
    queueBackup(userData);
}

/**
 * 启用/禁用备份
 */
function setBackupEnabled(enabled) {
    BACKUP_CONFIG.enabled = enabled;
    console.log(`🔄 实时备份已${enabled ? '启用' : '禁用'}`);
}

/**
 * 获取备份状态
 */
function getBackupStatus() {
    const gitStatus = getGitBackupStatus();
    return {
        enabled: BACKUP_CONFIG.enabled,
        hasWebhook: !!BACKUP_CONFIG.webhookUrl,
        hasDiscord: !!BACKUP_CONFIG.discordWebhook,
        hasGitHub: gitStatus.enabled,
        queueLength: backupQueue.length
    };
}

module.exports = {
    backupUserData,
    setBackupEnabled,
    getBackupStatus
};
