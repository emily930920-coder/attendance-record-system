require('dotenv').config();
const fetch = require('node-fetch');

// 测试Discord备份
async function testDiscordBackup() {
    const url = process.env.DISCORD_WEBHOOK_URL;
    
    console.log('🧪 测试Discord备份功能');
    console.log('URL:', url ? '已配置 (' + url.substring(0, 50) + '...)' : '未配置');
    
    if (!url) {
        console.log('❌ DISCORD_WEBHOOK_URL未配置');
        return;
    }
    
    const testData = {
        user: 'test_user',
        records: [
            {
                id: 'test123',
                date: '2026-04-30',
                clockIn: '09:00',
                clockOut: '18:00'
            }
        ]
    };
    
    try {
        console.log('\n📤 发送测试数据...');
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                content: `📋 数据更新 - 用户: ${testData.user}`,
                embeds: [{
                    title: '实时备份测试',
                    description: `记录数: ${testData.records.length}`,
                    color: 0x5865F2,
                    timestamp: new Date().toISOString(),
                    footer: {
                        text: '工时记录系统'
                    }
                }]
            })
        });
        
        console.log('状态码:', response.status);
        console.log('状态文本:', response.statusText);
        
        if (response.ok) {
            console.log('✅ Discord备份成功！');
            console.log('去Discord频道查看是否收到消息');
        } else {
            const text = await response.text();
            console.log('❌ Discord备份失败');
            console.log('响应:', text);
        }
        
    } catch (error) {
        console.log('❌ 发送失败:', error.message);
        console.log('详细错误:', error);
    }
}

testDiscordBackup();
