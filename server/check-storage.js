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
        
        if (files.length > 0) {
            console.log('📄 文件列表:', files.join(', '));
        }
        
    } catch (error) {
        console.log('⚠️  数据目录不存在，正在创建...');
        await fs.mkdir(dataDir, { recursive: true });
        console.log('✅ 数据目录已创建');
    }
    
    // 检查环境
    console.log('\n环境信息:');
    console.log('- Node版本:', process.version);
    console.log('- 平台:', process.platform);
    console.log('- 环境:', process.env.NODE_ENV || 'development');
    console.log('- 端口:', process.env.PORT || 3000);
    console.log('- 工作目录:', process.cwd());
    console.log('- 数据目录:', dataDir);
    console.log('');
}

checkStorage().catch(error => {
    console.error('❌ 存储检查失败:', error);
    process.exit(1);
});
