@echo off
chcp 65001 >nul
echo ==================================
echo   工时记录系统 - 快速启动脚本
echo ==================================
echo.

REM 检查 Node.js 是否安装
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    echo    访问: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VERSION=%%i
echo ✅ Node.js 版本: %NODE_VERSION%
echo.

REM 检查依赖是否安装
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    call npm install
    echo.
)

REM 启动服务器
echo 🚀 正在启动服务器...
echo.
call npm start
