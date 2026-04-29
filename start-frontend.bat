@echo off
chcp 65001 >nul
echo ========================================
echo  需求管理系统 - 前端启动脚本 (Windows)
echo ========================================
echo.

cd /d "%~dp0"

echo [1/2] 安装前端依赖...
call pnpm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 依赖安装失败
    pause
    exit /b 1
)
echo [OK] 依赖安装完成

echo [2/2] 启动前端开发服务器...
echo 地址: http://localhost:3000
echo.
call pnpm dev
