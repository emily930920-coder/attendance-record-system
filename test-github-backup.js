/**
 * 测试GitHub备份功能
 */

require('dotenv').config();
const { backupToGit, getGitBackupStatus } = require('./server/backup-github');

async function testGitBackup() {
    console.log('🧪 测试GitHub自动备份功能\n');
    
    // 1. 检查配置
    console.log('1️⃣ 检查配置状态...');
    const status = getGitBackupStatus();
    console.log('  - GitHub备份状态:', status.enabled ? '✅ 已启用' : '❌ 未启用');
    console.log('  - 备份目录:', status.backupDir);
    
    if (!status.enabled) {
        console.log('\n❌ GitHub备份未启用');
        console.log('请在 .env 文件中添加: ENABLE_GIT_BACKUP=true');
        return;
    }
    
    console.log('\n2️⃣ 创建测试数据...');
    const testData = {
        user: 'test-user',
        records: [
            {
                id: Date.now().toString(),
                type: '上班',
                time: new Date().toISOString(),
                note: '测试打卡'
            }
        ]
    };
    console.log('  - 测试用户:', testData.user);
    console.log('  - 记录数:', testData.records.length);
    
    console.log('\n3️⃣ 执行备份...');
    const result = await backupToGit(testData);
    
    if (result.success) {
        console.log('  ✅ 备份成功!');
        console.log('  - 备份文件:', result.file);
        console.log('  - 文件路径:', result.path);
        console.log('\n🎉 GitHub备份功能正常!');
        console.log('\n📱 查看备份:');
        console.log('  https://github.com/emily930920-coder/attendance-record-system/tree/main/server/data/backup');
    } else {
        console.log('  ❌ 备份失败:', result.message);
        if (result.error) {
            console.log('  - 错误详情:', result.error);
        }
        console.log('\n💡 故障排查提示:');
        console.log('  1. 检查Git配置: git config user.name 和 user.email');
        console.log('  2. 检查推送权限: ssh -T git@github.com');
        console.log('  3. 查看详细文档: GitHub自动备份配置.md');
    }
}

// 运行测试
testGitBackup().catch(error => {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
});
