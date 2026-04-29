@echo off
chcp 65001 >nul
echo ========================================
echo  后端启动脚本 (Windows)
echo ========================================
echo.

cd /d "%~dp0backend"

:: 端口检查
netstat -ano | findstr ":8080 " | findstr LISTENING >nul
if %ERRORLEVEL% EQU 0 (
    echo [WARN] 端口 8080 已被占用，正在释放...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":8080 " ^| findstr LISTENING') do (
        taskkill /F /PID %%a >nul 2>&1
    )
    timeout /t 2 /nobreak >nul
)

echo [1/2] 编译后端...
call mvn clean compile -q
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 编译失败
    pause
    exit /b 1
)
echo [OK] 编译成功

echo [2/2] 启动后端...
echo 地址: http://localhost:8080
echo API文档: http://localhost:8080/doc.html
echo.
call mvn spring-boot:run
