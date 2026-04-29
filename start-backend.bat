@echo off
chcp 65001 >nul
echo ========================================
echo  需求管理系统 - 后端启动脚本 (Windows)
echo ========================================
echo.

cd /d "%~dp0backend"

echo [1/2] 编译后端...
call mvn compile -q
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] 编译失败，请检查错误信息
    pause
    exit /b 1
)
echo [OK] 编译成功

echo [2/2] 启动后端服务...
echo 地址: http://localhost:8080
echo Swagger: http://localhost:8080/doc.html
echo.
call mvn spring-boot:run
