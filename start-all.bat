@echo off
chcp 65001 >nul
title 需求管理系统 - 启动器
echo ========================================
echo  需求管理系统 - 一键启动 (Windows)
echo ========================================
echo.

cd /d "%~dp0"

:: 检查后端端口
netstat -ano | findstr ":8080 " | findstr LISTENING >nul
if %ERRORLEVEL% EQU 0 (
    echo [WARN] 后端端口 8080 已被占用，正在释放...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 " ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

:: 检查前端端口
netstat -ano | findstr ":3000 " | findstr LISTENING >nul
if %ERRORLEVEL% EQU 0 (
    echo [WARN] 前端端口 3000 已被占用，正在释放...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000 " ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo [1/2] 启动后端...
start "Backend" cmd /c "title Backend && cd /d backend && mvn spring-boot:run"

echo [2/2] 等待后端就绪后启动前端...
echo.
setlocal enabledelayedexpansion
set WAIT_COUNT=0
:WAIT_LOOP
timeout /t 3 /nobreak >nul
set /a WAIT_COUNT+=1
curl -s http://localhost:8080/api/v1/auth/login -X POST -H "Content-Type: application/json" -d "{\"email\":\"admin@example.com\",\"password\":\"admin123\"}" | findstr "token" >nul
if !ERRORLEVEL! NEQ 0 (
    if !WAIT_COUNT! LEQ 10 goto WAIT_LOOP
)
endlocal

start "Frontend" cmd /c "title Frontend && cd /d %~dp0 && pnpm dev"

echo.
echo ========================================
echo  启动完成！
echo.
echo  前端地址: http://localhost:3000
echo  后端地址: http://localhost:8080
echo  API文档: http://localhost:8080/doc.html
echo  登录账号: admin@example.com / admin123
echo ========================================
echo.
pause
