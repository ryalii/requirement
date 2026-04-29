@echo off
chcp 65001 >nul
title 需求管理系统 - 打包启动
setlocal enabledelayedexpansion

echo ========================================
echo  需求管理系统 - 一键打包启动 (Windows)
echo ========================================
echo.

cd /d "%~dp0"

:: ========================
:: Step 1: 环境检查
:: ========================
echo [1/6] 检查运行环境...
set ENV_OK=1

:: 检查 Java 17+
java -version 2>&1 | findstr "version" >nul
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] Java 未安装！请安装 JDK 17+
    echo   下载: https://adoptium.net/temurin/releases/?version=17
    set ENV_OK=0
) else (
    for /f "tokens=3" %%g in ('java -version 2^>^&1 ^| findstr "version"') do (
        set JVER=%%g
    )
    echo   [OK] Java: %JVER%
)

:: 检查 Maven
mvn -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] Maven 未安装！请安装 Maven 3.9+
    echo   下载: https://maven.apache.org/download.cgi
    set ENV_OK=0
) else (
    for /f "tokens=2" %%g in ('mvn -v 2^>^&1 ^| findstr "Maven home"') do set MVN_VER=%%g
    echo   [OK] Maven: %MVN_VER%
)

:: 检查 Node.js
node -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] Node.js 未安装！请安装 Node.js 18+
    echo   下载: https://nodejs.org/
    set ENV_OK=0
) else (
    for /f %%g in ('node -v') do echo   [OK] Node: %%g
)

:: 检查 pnpm
pnpm -v >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [WARN] pnpm 未安装，正在安装...
    npm install -g pnpm >nul 2>&1
    if !ERRORLEVEL! NEQ 0 (
        echo   [ERROR] pnpm 安装失败，请手动执行: npm install -g pnpm
        set ENV_OK=0
    ) else (
        echo   [OK] pnpm 已安装
    )
) else (
    for /f %%g in ('pnpm -v') do echo   [OK] pnpm: %%g
)

if %ENV_OK% EQU 0 (
    echo.
    echo [FAIL] 环境检查未通过，请安装缺失工具后重试
    pause
    exit /b 1
)
echo.

:: ========================
:: Step 2: 端口检查
:: ========================
echo [2/6] 检查端口占用...

:: 检查 8080 (后端)
netstat -ano | findstr ":8080 " | findstr LISTENING >nul
if %ERRORLEVEL% EQU 0 (
    echo   [WARN] 端口 8080 已被占用，正在释放...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 " ^| findstr LISTENING') do (
        set PID=%%a
        echo   终止进程 PID=!PID!
        taskkill /F /PID !PID! >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)
echo   [OK] 端口 8080 可用

:: 检查 3000 (前端)
netstat -ano | findstr ":3000 " | findstr LISTENING >nul
if %ERRORLEVEL% EQU 0 (
    echo   [WARN] 端口 3000 已被占用，正在释放...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr LISTENING') do (
        set PID=%%a
        echo   终止进程 PID=!PID!
        taskkill /F /PID !PID! >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)
echo   [OK] 端口 3000 可用
echo.

:: ========================
:: Step 3: 编译后端
:: ========================
echo [3/6] 编译后端...
cd /d "%~dp0backend"
call mvn clean compile -q
if %ERRORLEVEL% NEQ 0 (
    echo   [ERROR] 后端编译失败！
    pause
    exit /b 1
)
echo   [OK] 后端编译成功
echo.

:: ========================
:: Step 4: 安装前端依赖
:: ========================
echo [4/6] 安装前端依赖...
cd /d "%~dp0"
call pnpm install --frozen-lockfile >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo   [INFO] 尝试更新依赖...
    pnpm install >nul 2>&1
)
echo   [OK] 前端依赖就绪
echo.

:: ========================
:: Step 5: 启动后端
:: ========================
echo [5/6] 启动后端服务...
cd /d "%~dp0backend"
start "Backend" cmd /c "title Backend && mvn spring-boot:run"
echo   等待后端启动（约 15 秒）...
echo.

:: 等待后端就绪
set WAIT_COUNT=0
:WAIT_BACKEND
timeout /t 3 /nobreak >nul
set /a WAIT_COUNT+=1
curl -s http://localhost:8080/api/v1/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}" | findstr "token" >nul
if %ERRORLEVEL% NEQ 0 (
    if !WAIT_COUNT! LEQ 10 (
        goto WAIT_BACKEND
    ) else (
        echo   [WARN] 后端启动较慢，请稍后检查 http://localhost:8080
    )
) else (
    echo   [OK] 后端已就绪 http://localhost:8080
)

:: ========================
:: Step 6: 启动前端
:: ========================
echo.
echo [6/6] 启动前端服务...
cd /d "%~dp0"
start "Frontend" cmd /c "title Frontend && pnpm dev"
echo   前端启动中...

echo.
echo ========================================
echo  启动完成！
echo.
echo  前端地址: http://localhost:3000
echo  后端地址: http://localhost:8080
echo  API文档: http://localhost:8080/doc.html
echo  登录账号: admin@example.com / admin123
echo.
echo  按任意键关闭此窗口...
echo  服务将在后台继续运行。
echo ========================================
echo.
pause
