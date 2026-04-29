@echo off
chcp 65001 >nul
echo ========================================
echo  前端启动脚本 (Windows)
echo ========================================
echo.

cd /d "%~dp0"

:: 端口检查
netstat -ano | findstr ":3000 " | findstr LISTENING >nul
if %ERRORLEVEL% EQU 0 (
    echo [WARN] 端口 3000 已被占用，正在释放...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo [1/2] 安装依赖...
call pnpm install >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [WARN] 依赖更新...
    pnpm install >nul 2>&1
)
echo [OK] 依赖就绪

echo [2/2] 启动前端...
echo 地址: http://localhost:3000
echo.
call pnpm dev
