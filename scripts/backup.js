const fs = require('fs').promises;
const path = require('path');

/**
 * 数据备份脚本
 * 定期将数据备份到外部服务
 */

const DATA_DIR = path.join(__dirname, '../server/data');

// 配置备份方式（从环境变量读取）
const BACKUP_CONFIG = {
    // Webhook方式（推荐）
    webhookUrl: process.env.BACKUP_WEBHOOK_URL || '',
    
    // 邮件方式
    emailWebhook: process.env.EMAIL_WEBHOOK_URL || '',
    
    // 其他webhook服务
    discordWebhook: process.env.DISCORD_WEBHOOK_URL || '',
    slackWebhook: process.env.SLACK_WEBHOOK_URL || ''
};

/**
 * 读取所有数据文件
 */
async function getAllData() {
    try {
        const files = await fs.readdir(DATA_DIR);
        const jsonFiles = files.filter(f => f.endsWith('.json'));
        
        const allData = {};
        for (const file of jsonFiles) {
            const filePath = path.join(DATA_DIR, file);
            const content = await fs.readFile(filePath, 'utf8');
            allData[file] = JSON.parse(content);
        }
        
        return allData;
    } catch (error) {
        console.error('读取数据失败:', error);
        return null;
    }
}

/**
 * 发送备份到Webhook
 */
async function sendToWebhook(url, data) {
    if (!url) return false;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                timestamp: new Date().toISOString(),
                data: data,
                source: 'attendance-system-backup'
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('发送到Webhook失败:', error);
        return false;
    }
}

/**
 * 发送到Discord
 */
async function sendToDiscord(data) {
    if (!BACKUP_CONFIG.discordWebhook) return false;
    
    const dataStr = JSON.stringify(data, null, 2);
    const truncated = dataStr.length > 1900 
        ? dataStr.substring(0, 1900) + '...(已截断)' 
        : dataStr;
    
    try {
        const response = await fetch(BACKUP_CONFIG.discordWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: '📋 工时记录系统 - 数据备份',
                embeds: [{
                    title: '数据备份',
                    description: '```json\n' + truncated + '\n```',
                    color: 0x5865F2,
                    timestamp: new Date().toISOString()
                }]
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('发送到Discord失败:', error);
        return false;
    }
}

/**
 * 发送到邮件（通过邮件webhook服务）
 */
async function sendToEmail(data) {
    if (!BACKUP_CONFIG.emailWebhook) return false;
    
    try {
        const response = await fetch(BACKUP_CONFIG.emailWebhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                subject: `工时记录系统备份 - ${new Date().toISOString()}`,
                body: JSON.stringify(data, null, 2),
                timestamp: new Date().toISOString()
            })
        });
        
        return response.ok;
    } catch (error) {
        console.error('发送邮件失败:', error);
        return false;
    }
}

/**
 * 执行备份
 */
async function performBackup() {
    console.log('🔄 开始备份...');
    console.log('时间:', new Date().toISOString());
    
    // 读取所有数据
    const allData = await getAllData();
    
    if (!allData || Object.keys(allData).length === 0) {
        console.log('⚠️  没有数据需要备份');
        return;
    }
    
    console.log(`📊 找到 ${Object.keys(allData).length} 个数据文件`);
    
    // 统计信息
    let totalRecords = 0;
    for (const [filename, data] of Object.entries(allData)) {
        const recordCount = data.records ? data.records.length : 0;
        totalRecords += recordCount;
        console.log(`  - ${filename}: ${recordCount} 条记录`);
    }
    
    console.log(`📝 总计: ${totalRecords} 条记录`);
    
    // 尝试各种备份方式
    let backupSuccess = false;
    
    // 1. 主Webhook
    if (BACKUP_CONFIG.webhookUrl) {
        console.log('📤 发送到主Webhook...');
        const success = await sendToWebhook(BACKUP_CONFIG.webhookUrl, allData);
        if (success) {
            console.log('✅ 主Webhook备份成功');
            backupSuccess = true;
        } else {
            console.log('❌ 主Webhook备份失败');
        }
    }
    
    // 2. Discord
    if (BACKUP_CONFIG.discordWebhook) {
        console.log('📤 发送到Discord...');
        const success = await sendToDiscord(allData);
        if (success) {
            console.log('✅ Discord备份成功');
            backupSuccess = true;
        } else {
            console.log('❌ Discord备份失败');
        }
    }
    
    // 3. 邮件
    if (BACKUP_CONFIG.emailWebhook) {
        console.log('📤 发送邮件...');
        const success = await sendToEmail(allData);
        if (success) {
            console.log('✅ 邮件备份成功');
            backupSuccess = true;
        } else {
            console.log('❌ 邮件备份失败');
        }
    }
    
    // 4. 输出到日志（作为最后的备份）
    if (!backupSuccess) {
        console.log('⚠️  所有外部备份都失败，输出到日志:');
        console.log('='.repeat(60));
        console.log('BACKUP_DATA_START');
        console.log(JSON.stringify(allData, null, 2));
        console.log('BACKUP_DATA_END');
        console.log('='.repeat(60));
        console.log('💡 提示: 可以从Render日志中复制这段数据进行恢复');
    }
    
    console.log('✅ 备份完成');
}

// 主函数
async function main() {
    console.log('==========================================');
    console.log('📋 工时记录系统 - 数据备份服务');
    console.log('==========================================');
    console.log('');
    
    // 检查配置
    const hasConfig = Object.values(BACKUP_CONFIG).some(v => v);
    
    if (!hasConfig) {
        console.log('⚠️  警告: 未配置任何备份目标');
        console.log('');
        console.log('请在Render环境变量中配置以下之一:');
        console.log('  - BACKUP_WEBHOOK_URL: 主备份Webhook');
        console.log('  - DISCORD_WEBHOOK_URL: Discord Webhook');
        console.log('  - EMAIL_WEBHOOK_URL: 邮件Webhook');
        console.log('');
        console.log('数据将仅输出到日志（可从Render Dashboard查看）');
        console.log('');
    } else {
        console.log('📋 备份配置:');
        if (BACKUP_CONFIG.webhookUrl) console.log('  ✅ 主Webhook已配置');
        if (BACKUP_CONFIG.discordWebhook) console.log('  ✅ Discord Webhook已配置');
        if (BACKUP_CONFIG.emailWebhook) console.log('  ✅ 邮件Webhook已配置');
        console.log('');
    }
    
    // 执行备份
    await performBackup();
    
    console.log('');
    console.log('==========================================');
}

// 运行
main().catch(error => {
    console.error('❌ 备份失败:', error);
    process.exit(1);
});
