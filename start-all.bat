@echo off
chcp 65001 >nul
echo ========================================
echo  需求管理系统 - 一键启动 (Windows)
echo ========================================
echo.

cd /d "%~dp0"

echo 启动后端服务...
start "Backend" cmd /c "cd /d backend && mvn spring-boot:run"

echo 等待 15 秒后启动前端...
echo 后端地址: http://localhost:8080
echo.

timeout /t 15 /nobreak >nul

echo 启动前端服务...
start "Frontend" cmd /c "pnpm dev"

echo.
echo ========================================
echo  启动完成！
echo  前端地址: http://localhost:3000
echo  后端地址: http://localhost:8080
echo  API文档: http://localhost:8080/doc.html
echo ========================================
echo.
pause
