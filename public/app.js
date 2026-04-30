// 配置
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : window.location.origin;

// 全局状态
let currentUser = localStorage.getItem('currentUser') || 'default';
let records = [];
let syncTimer = null;

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupEventListeners();
    startClock();
    loadData();
    startAutoSync();
});

// 初始化应用
function initApp() {
    updateDateTime();
    document.getElementById('userName').textContent = currentUser;
    
    // 检测是否为Render部署环境
    const isRenderEnv = window.location.hostname.includes('onrender.com') || 
                        window.location.hostname.includes('render.com');
    
    if (isRenderEnv) {
        // 显示演示环境提示
        const demoNotice = document.getElementById('demoNotice');
        if (demoNotice) {
            demoNotice.style.display = 'block';
        }
        
        // 在标题后添加演示标识
        const title = document.querySelector('.header h1');
        if (title && !title.textContent.includes('演示')) {
            title.textContent = '📋 工时记录系统 (演示版)';
        }
    }
}

// 设置事件监听器
function setupEventListeners() {
    // 打卡按钮
    document.getElementById('clockInBtn').addEventListener('click', () => clockIn());
    document.getElementById('clockOutBtn').addEventListener('click', () => clockOut());
    
    // 用户切换
    document.getElementById('userBtn').addEventListener('click', () => openModal('userModal'));
    document.getElementById('confirmUser').addEventListener('click', switchUser);
    document.getElementById('cancelUser').addEventListener('click', () => closeModal('userModal'));
    document.getElementById('closeUserModal').addEventListener('click', () => closeModal('userModal'));
    
    // 手动添加记录
    document.getElementById('addBtn').addEventListener('click', () => openAddModal());
    document.getElementById('confirmAdd').addEventListener('click', addRecord);
    document.getElementById('cancelAdd').addEventListener('click', () => closeModal('addModal'));
    document.getElementById('closeModal').addEventListener('click', () => closeModal('addModal'));
    
    // 编辑记录
    document.getElementById('confirmEdit').addEventListener('click', saveEdit);
    document.getElementById('cancelEdit').addEventListener('click', () => closeModal('editModal'));
    document.getElementById('closeEditModal').addEventListener('click', () => closeModal('editModal'));
    
    // 导出和同步
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('syncBtn').addEventListener('click', () => loadData(true));
}

// 更新时钟
function startClock() {
    updateClock();
    setInterval(updateClock, 1000);
}

function updateClock() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('zh-CN', { hour12: false });
    document.getElementById('currentTime').textContent = timeString;
}

// 更新日期显示
function updateDateTime() {
    const now = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
    const dateString = now.toLocaleDateString('zh-CN', options);
    document.getElementById('dateDisplay').textContent = dateString;
}

// 上班打卡
async function clockIn() {
    const today = getToday();
    const existingRecord = records.find(r => r.date === today);
    
    if (existingRecord && existingRecord.clockIn) {
        alert('今天已经打过上班卡了！');
        return;
    }
    
    const now = new Date();
    const time = formatTime(now);
    
    const record = existingRecord || {
        id: generateId(),
        date: today,
        clockIn: null,
        clockOut: null
    };
    
    record.clockIn = time;
    
    await saveRecord(record);
    alert('✅ 上班打卡成功！');
}

// 下班打卡
async function clockOut() {
    const today = getToday();
    const existingRecord = records.find(r => r.date === today);
    
    if (!existingRecord || !existingRecord.clockIn) {
        alert('请先打上班卡！');
        return;
    }
    
    if (existingRecord.clockOut) {
        alert('今天已经打过下班卡了！');
        return;
    }
    
    const now = new Date();
    const time = formatTime(now);
    
    existingRecord.clockOut = time;
    
    await saveRecord(existingRecord);
    alert('✅ 下班打卡成功！');
}

// 保存记录
async function saveRecord(record) {
    try {
        const response = await fetch(`${API_URL}/api/records`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                user: currentUser,
                record: record
            })
        });
        
        if (response.ok) {
            await loadData();
        } else {
            // 离线模式：保存到本地
            saveToLocal(record);
            loadData();
        }
    } catch (error) {
        console.error('保存失败，使用离线模式:', error);
        saveToLocal(record);
        loadData();
    }
}

// 保存到本地存储
function saveToLocal(record) {
    const localKey = `records_${currentUser}`;
    let localRecords = JSON.parse(localStorage.getItem(localKey) || '[]');
    
    const index = localRecords.findIndex(r => r.id === record.id);
    if (index >= 0) {
        localRecords[index] = record;
    } else {
        localRecords.push(record);
    }
    
    localStorage.setItem(localKey, JSON.stringify(localRecords));
    
    // 标记为需要同步
    const syncKey = `needSync_${currentUser}`;
    localStorage.setItem(syncKey, 'true');
    updateSyncStatus('待同步');
}

// 加载数据
async function loadData(forceSync = false) {
    try {
        // 尝试从服务器加载
        const response = await fetch(`${API_URL}/api/records/${currentUser}`);
        
        if (response.ok) {
            const data = await response.json();
            records = data.records || [];
            
            // 如果有本地数据需要同步
            if (forceSync) {
                await syncLocalData();
            }
            
            updateSyncStatus('已同步');
        } else {
            throw new Error('服务器不可用');
        }
    } catch (error) {
        console.error('从服务器加载失败，使用本地数据:', error);
        // 使用本地数据
        const localKey = `records_${currentUser}`;
        records = JSON.parse(localStorage.getItem(localKey) || '[]');
        updateSyncStatus('离线模式');
    }
    
    updateUI();
}

// 同步本地数据到服务器
async function syncLocalData() {
    const localKey = `records_${currentUser}`;
    const syncKey = `needSync_${currentUser}`;
    const needSync = localStorage.getItem(syncKey);
    
    if (!needSync) return;
    
    const localRecords = JSON.parse(localStorage.getItem(localKey) || '[]');
    
    if (localRecords.length === 0) return;
    
    try {
        for (const record of localRecords) {
            await fetch(`${API_URL}/api/records`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: currentUser,
                    record: record
                })
            });
        }
        
        // 清除同步标记
        localStorage.removeItem(syncKey);
        alert('✅ 数据同步成功！');
    } catch (error) {
        console.error('同步失败:', error);
        alert('❌ 数据同步失败，请稍后重试');
    }
}

// 自动同步
function startAutoSync() {
    syncTimer = setInterval(() => {
        syncLocalData();
    }, 60000); // 每分钟尝试同步一次
}

// 更新UI
function updateUI() {
    updateTodayRecord();
    updateMonthStats();
    updateHistoryTable();
}

// 更新今日记录
function updateTodayRecord() {
    const today = getToday();
    const todayRecord = records.find(r => r.date === today);
    
    if (todayRecord) {
        document.getElementById('todayClockIn').textContent = todayRecord.clockIn || '未打卡';
        document.getElementById('todayClockOut').textContent = todayRecord.clockOut || '未打卡';
        
        if (todayRecord.clockIn && todayRecord.clockOut) {
            const hours = calculateWorkHours(todayRecord.clockIn, todayRecord.clockOut);
            document.getElementById('todayWorkHours').textContent = `${hours.toFixed(2)} 小时`;
        } else {
            document.getElementById('todayWorkHours').textContent = '0.00 小时';
        }
    } else {
        document.getElementById('todayClockIn').textContent = '未打卡';
        document.getElementById('todayClockOut').textContent = '未打卡';
        document.getElementById('todayWorkHours').textContent = '0.00 小时';
    }
}

// 更新本月统计
function updateMonthStats() {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthRecords = records.filter(r => {
        const [year, month] = r.date.split('-').map(Number);
        return year === currentYear && month - 1 === currentMonth;
    });
    
    let totalHours = 0;
    let workDays = 0;
    
    monthRecords.forEach(record => {
        if (record.clockIn && record.clockOut) {
            totalHours += calculateWorkHours(record.clockIn, record.clockOut);
            workDays++;
        }
    });
    
    const avgHours = workDays > 0 ? totalHours / workDays : 0;
    
    document.getElementById('workDays').textContent = workDays;
    document.getElementById('totalHours').textContent = totalHours.toFixed(2);
    document.getElementById('avgHours').textContent = avgHours.toFixed(2);
}

// 更新历史记录表格
function updateHistoryTable() {
    const tbody = document.getElementById('historyBody');
    tbody.innerHTML = '';
    
    // 获取当前月份的记录并按日期降序排序
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthRecords = records
        .filter(r => {
            const [year, month] = r.date.split('-').map(Number);
            return year === currentYear && month - 1 === currentMonth;
        })
        .sort((a, b) => b.date.localeCompare(a.date));
    
    monthRecords.forEach(record => {
        const row = document.createElement('div');
        row.className = 'table-row';
        
        const workHours = record.clockIn && record.clockOut 
            ? calculateWorkHours(record.clockIn, record.clockOut).toFixed(2) + ' 小时'
            : '-';
        
        row.innerHTML = `
            <div class="td">${record.date}</div>
            <div class="td">${record.clockIn || '-'}</div>
            <div class="td">${record.clockOut || '-'}</div>
            <div class="td">${workHours}</div>
            <div class="td">
                <div class="row-actions">
                    <button class="icon-btn edit-btn" onclick="editRecord('${record.id}')">编辑</button>
                    <button class="icon-btn delete-btn" onclick="deleteRecord('${record.id}')">删除</button>
                </div>
            </div>
        `;
        
        tbody.appendChild(row);
    });
}

// 计算工作小时数
function calculateWorkHours(clockIn, clockOut) {
    const [inH, inM] = clockIn.split(':').map(Number);
    const [outH, outM] = clockOut.split(':').map(Number);
    
    const inMinutes = inH * 60 + inM;
    const outMinutes = outH * 60 + outM;
    
    const diffMinutes = outMinutes - inMinutes;
    return diffMinutes / 60;
}

// 打开添加记录弹窗
function openAddModal() {
    document.getElementById('addDate').value = getToday();
    document.getElementById('addClockIn').value = '';
    document.getElementById('addClockOut').value = '';
    openModal('addModal');
}

// 添加记录
async function addRecord() {
    const date = document.getElementById('addDate').value;
    const clockIn = document.getElementById('addClockIn').value;
    const clockOut = document.getElementById('addClockOut').value;
    
    if (!date || !clockIn) {
        alert('请填写日期和上班时间！');
        return;
    }
    
    const record = {
        id: generateId(),
        date: date,
        clockIn: clockIn,
        clockOut: clockOut || null
    };
    
    await saveRecord(record);
    closeModal('addModal');
    alert('✅ 记录添加成功！');
}

// 编辑记录
function editRecord(id) {
    const record = records.find(r => r.id === id);
    if (!record) return;
    
    document.getElementById('editId').value = record.id;
    document.getElementById('editDate').value = record.date;
    document.getElementById('editClockIn').value = record.clockIn || '';
    document.getElementById('editClockOut').value = record.clockOut || '';
    
    openModal('editModal');
}

// 保存编辑
async function saveEdit() {
    const id = document.getElementById('editId').value;
    const date = document.getElementById('editDate').value;
    const clockIn = document.getElementById('editClockIn').value;
    const clockOut = document.getElementById('editClockOut').value;
    
    if (!date || !clockIn) {
        alert('请填写日期和上班时间！');
        return;
    }
    
    const record = {
        id: id,
        date: date,
        clockIn: clockIn,
        clockOut: clockOut || null
    };
    
    await saveRecord(record);
    closeModal('editModal');
    alert('✅ 记录更新成功！');
}

// 删除记录
async function deleteRecord(id) {
    if (!confirm('确定要删除这条记录吗？')) return;
    
    try {
        const response = await fetch(`${API_URL}/api/records/${currentUser}/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadData();
            alert('✅ 记录删除成功！');
        } else {
            throw new Error('删除失败');
        }
    } catch (error) {
        console.error('删除失败，使用本地模式:', error);
        // 本地删除
        const localKey = `records_${currentUser}`;
        let localRecords = JSON.parse(localStorage.getItem(localKey) || '[]');
        localRecords = localRecords.filter(r => r.id !== id);
        localStorage.setItem(localKey, JSON.stringify(localRecords));
        loadData();
        alert('✅ 记录删除成功（本地）！');
    }
}

// 切换用户
async function switchUser() {
    const newUser = document.getElementById('userInput').value.trim();
    
    if (!newUser) {
        alert('请输入用户名！');
        return;
    }
    
    currentUser = newUser;
    localStorage.setItem('currentUser', currentUser);
    document.getElementById('userName').textContent = currentUser;
    
    await loadData();
    closeModal('userModal');
    alert(`✅ 已切换到用户：${currentUser}`);
}

// 导出数据
async function exportData() {
    try {
        const response = await fetch(`${API_URL}/api/export/${currentUser}`);
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `工时记录_${currentUser}_${getToday()}.json`;
            a.click();
            window.URL.revokeObjectURL(url);
            alert('✅ 数据导出成功！');
        } else {
            throw new Error('导出失败');
        }
    } catch (error) {
        console.error('导出失败，使用本地数据:', error);
        // 导出本地数据
        const dataStr = JSON.stringify(records, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `工时记录_${currentUser}_${getToday()}.json`;
        a.click();
        window.URL.revokeObjectURL(url);
        alert('✅ 数据导出成功（本地）！');
    }
}

// 更新同步状态
function updateSyncStatus(status) {
    const statusEl = document.getElementById('syncStatus');
    statusEl.textContent = status;
    
    if (status === '已同步') {
        statusEl.style.color = '#11998e';
    } else if (status === '待同步') {
        statusEl.style.color = '#f5576c';
    } else {
        statusEl.style.color = '#fdcb6e';
    }
}

// 打开弹窗
function openModal(modalId) {
    document.getElementById(modalId).classList.add('active');
}

// 关闭弹窗
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('active');
}

// 工具函数
function getToday() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function formatTime(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Service Worker 注册
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('Service Worker 注册成功:', registration.scope);
            })
            .catch(error => {
                console.log('Service Worker 注册失败:', error);
            });
    });
}
