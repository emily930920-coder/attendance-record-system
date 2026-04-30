/**
 * 测试GitHub备份功能
 */

require('dotenv').config();
const { backupToGit, getGitBackupStatus } = require('./server/backup-github');

async function testGitBackup() {
    console.log('🧪 测试GitHub API自动备份功能\n');
    
    // 1. 检查配置
    console.log('1️⃣ 检查配置状态...');
    const status = getGitBackupStatus();
    console.log('  - 备份方式:', status.method || 'Git命令');
    console.log('  - GitHub备份状态:', status.enabled ? '✅ 已启用' : '❌ 未启用');
    console.log('  - 仓库:', status.repo || '未配置');
    console.log('  - 分支:', status.branch || 'main');
    
    if (!status.enabled) {
        console.log('\n❌ GitHub备份未启用');
        console.log('请在 .env 文件中添加:');
        console.log('  ENABLE_GIT_BACKUP=true');
        console.log('  GITHUB_TOKEN=你的Token');
        console.log('  GITHUB_OWNER=emily930920-coder');
        console.log('  GITHUB_REPO=attendance-record-system');
        return;
    }
    
    if (!status.configured) {
        console.log('\n❌ GitHub配置不完整');
        console.log('请确保 .env 包含以下变量:');
        console.log('  GITHUB_TOKEN=ghp_xxxx...');
        console.log('  GITHUB_OWNER=emily930920-coder');
        console.log('  GITHUB_REPO=attendance-record-system');
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
                note: '测试打卡 - GitHub API'
            }
        ]
    };
    console.log('  - 测试用户:', testData.user);
    console.log('  - 记录数:', testData.records.length);
    
    console.log('\n3️⃣ 执行GitHub API备份...');
    const result = await backupToGit(testData);
    
    if (result.success) {
        console.log('  ✅ 备份成功!');
        console.log('  - 备份文件:', result.file);
        console.log('  - 文件路径:', result.path);
        console.log('  - 操作类型:', result.method === 'updated' ? '更新' : '创建');
        if (result.url) {
            console.log('  - GitHub URL:', result.url);
        }
        console.log('\n🎉 GitHub API备份功能正常!');
        console.log('\n📱 查看备份:');
        console.log(`  https://github.com/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/tree/main/server/data/backup`);
    } else {
        console.log('  ❌ 备份失败:', result.message);
        if (result.error) {
            console.log('  - 错误详情:', result.error);
        }
        console.log('\n💡 故障排查提示:');
        console.log('  1. 检查GITHUB_TOKEN是否有效');
        console.log('  2. 检查Token是否有repo权限');
        console.log('  3. 检查GITHUB_OWNER和GITHUB_REPO是否正确');
        console.log('  4. 查看详细文档: Render-GitHub-API备份配置.md');
    }
}

// 运行测试
testGitBackup().catch(error => {
    console.error('\n❌ 测试失败:', error.message);
    process.exit(1);
});
