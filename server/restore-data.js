/**
 * 数据恢复模块
 * 从备份目录恢复数据
 */

const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../server/data');
const BACKUP_DIR = path.join(__dirname, '../server/data/backup');

/**
 * 从备份恢复数据
 */
async function restoreFromBackup() {
    console.log('\n🔄 检查数据备份...');
    
    try {
        // 检查backup目录是否存在
        try {
            await fs.access(BACKUP_DIR);
        } catch {
            console.log('  ⚠️  备份目录不存在，跳过恢复');
            return { restored: 0, skipped: 0 };
        }
        
        // 读取backup目录中的所有文件
        const backupFiles = await fs.readdir(BACKUP_DIR);
        const jsonFiles = backupFiles.filter(f => f.endsWith('.json') && f !== '.gitkeep');
        
        if (jsonFiles.length === 0) {
            console.log('  ℹ️  没有找到备份文件');
            return { restored: 0, skipped: 0 };
        }
        
        console.log(`  📦 找到 ${jsonFiles.length} 个备份文件`);
        
        let restored = 0;
        let skipped = 0;
        
        // 遍历每个备份文件
        for (const backupFile of jsonFiles) {
            const backupPath = path.join(BACKUP_DIR, backupFile);
            const targetPath = path.join(DATA_DIR, backupFile);
            
            // 检查目标文件是否已存在
            let shouldRestore = false;
            try {
                const targetStat = await fs.stat(targetPath);
                const backupStat = await fs.stat(backupPath);
                
                // 如果备份文件更新，则恢复
                if (backupStat.mtime > targetStat.mtime) {
                    shouldRestore = true;
                }
            } catch {
                // 目标文件不存在，需要恢复
                shouldRestore = true;
            }
            
            if (shouldRestore) {
                // 读取备份数据
                const backupContent = await fs.readFile(backupPath, 'utf8');
                const backupData = JSON.parse(backupContent);
                
                // 提取实际数据（去掉备份元数据）
                let userData;
                if (backupData.data) {
                    // 新格式：包含备份元数据
                    userData = backupData.data;
                } else {
                    // 旧格式：直接是用户数据
                    userData = backupData;
                }
                
                // 写入到运行时数据文件
                await fs.writeFile(targetPath, JSON.stringify(userData, null, 2), 'utf8');
                
                const recordCount = userData.records ? userData.records.length : 0;
                console.log(`  ✅ 恢复数据: ${backupFile} (${recordCount} 条记录)`);
                restored++;
            } else {
                console.log(`  ⏭️  跳过: ${backupFile} (已是最新)`);
                skipped++;
            }
        }
        
        if (restored > 0) {
            console.log(`\n🎉 数据恢复完成！恢复了 ${restored} 个用户的数据`);
        } else if (skipped > 0) {
            console.log(`\n✅ 数据已是最新，无需恢复`);
        }
        
        return { restored, skipped };
        
    } catch (error) {
        console.error('❌ 数据恢复失败:', error.message);
        return { restored: 0, skipped: 0, error: error.message };
    }
}

/**
 * 获取备份状态
 */
async function getBackupInfo() {
    try {
        const backupFiles = await fs.readdir(BACKUP_DIR);
        const jsonFiles = backupFiles.filter(f => f.endsWith('.json'));
        
        const backupInfo = [];
        for (const file of jsonFiles) {
            const filePath = path.join(BACKUP_DIR, file);
            const content = await fs.readFile(filePath, 'utf8');
            const data = JSON.parse(content);
            
            backupInfo.push({
                file: file,
                user: data.user || data.data?.user,
                backupTime: data.backupTime || data.data?.backupTime,
                recordCount: data.recordCount || data.data?.records?.length || 0
            });
        }
        
        return backupInfo;
    } catch (error) {
        return [];
    }
}

module.exports = {
    restoreFromBackup,
    getBackupInfo
};
