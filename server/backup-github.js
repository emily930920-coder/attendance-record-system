/**
 * GitHub API备份模块
 * 使用GitHub API直接推送，适用于Render等云平台
 */

require('dotenv').config();
const fs = require('fs').promises;
const path = require('path');

// GitHub配置
const GITHUB_CONFIG = {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER,
    repo: process.env.GITHUB_REPO,
    branch: process.env.GITHUB_BRANCH || 'main',
    enabled: process.env.ENABLE_GIT_BACKUP === 'true'
};

// 备份配置
const BACKUP_CONFIG = {
    backupDir: path.join(__dirname, 'data/backup')
};

/**
 * 使用GitHub API备份数据
 */
async function backupToGitHub(userData) {
    // 检查是否启用
    if (!GITHUB_CONFIG.enabled) {
        return { success: false, message: 'GitHub备份未启用' };
    }
    
    // 检查必需配置
    if (!GITHUB_CONFIG.token || !GITHUB_CONFIG.owner || !GITHUB_CONFIG.repo) {
        return { 
            success: false, 
            message: 'GitHub配置不完整，需要: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO' 
        };
    }

    try {
        const fetch = require('node-fetch');
        
        // 1. 准备备份数据
        const date = new Date();
        const backupFileName = `${userData.user}.json`;
        const filePath = `server/data/backup/${backupFileName}`;
        
        const backupData = {
            user: userData.user,
            backupTime: date.toISOString(),
            backupTimeLocal: date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
            recordCount: userData.records ? userData.records.length : 0,
            data: userData
        };
        
        const content = JSON.stringify(backupData, null, 2);
        const contentBase64 = Buffer.from(content).toString('base64');
        
        // 2. 获取文件当前SHA（如果文件存在）
        const getUrl = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${filePath}`;
        
        let fileSha = null;
        try {
            const getResponse = await fetch(getUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'Attendance-System'
                }
            });
            
            if (getResponse.ok) {
                const fileData = await getResponse.json();
                fileSha = fileData.sha;
            }
        } catch (error) {
            // 文件不存在，这是正常的（首次备份）
        }
        
        // 3. 创建或更新文件
        const commitMessage = `📋 自动备份 - ${userData.user} - ${date.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;
        
        const updateData = {
            message: commitMessage,
            content: contentBase64,
            branch: GITHUB_CONFIG.branch
        };
        
        if (fileSha) {
            updateData.sha = fileSha; // 更新现有文件需要SHA
        }
        
        const updateResponse = await fetch(getUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'User-Agent': 'Attendance-System'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            return {
                success: false,
                message: `GitHub API错误: ${updateResponse.status}`,
                error: errorText
            };
        }
        
        const result = await updateResponse.json();
        
        // 4. 同时保存到本地backup目录（用于恢复）
        try {
            await fs.access(BACKUP_CONFIG.backupDir);
        } catch {
            await fs.mkdir(BACKUP_CONFIG.backupDir, { recursive: true });
        }
        
        const localBackupPath = path.join(BACKUP_CONFIG.backupDir, backupFileName);
        await fs.writeFile(localBackupPath, content, 'utf8');
        
        return {
            success: true,
            message: 'GitHub备份成功',
            file: backupFileName,
            path: filePath,
            url: result.content.html_url,
            method: fileSha ? 'updated' : 'created'
        };
        
    } catch (error) {
        return {
            success: false,
            message: 'GitHub备份失败',
            error: error.message
        };
    }
}

/**
 * 获取GitHub备份状态
 */
function getGitHubBackupStatus() {
    const hasConfig = !!(GITHUB_CONFIG.token && GITHUB_CONFIG.owner && GITHUB_CONFIG.repo);
    
    return {
        enabled: GITHUB_CONFIG.enabled && hasConfig,
        configured: hasConfig,
        repo: hasConfig ? `${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}` : null,
        branch: GITHUB_CONFIG.branch,
        method: 'GitHub API',
        message: GITHUB_CONFIG.enabled 
            ? (hasConfig ? 'GitHub API备份已启用' : 'GitHub配置不完整') 
            : 'GitHub备份已禁用'
    };
}

/**
 * 兼容旧接口
 */
async function backupToGit(userData) {
    return await backupToGitHub(userData);
}

function getGitBackupStatus() {
    return getGitHubBackupStatus();
}

module.exports = {
    backupToGit,
    backupToGitHub,
    getGitBackupStatus,
    getGitHubBackupStatus
};
