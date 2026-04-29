#!/bin/bash
echo "========================================"
echo " 需求管理系统 - 一键启动 (Linux/Mac)"
echo "========================================"
echo ""

cd "$(dirname "$0")"

# 启动后端（后台运行）
echo "启动后端服务 (后台)..."
(cd backend && mvn spring-boot:run > ../backend.log 2>&1) &
BACKEND_PID=$!
echo "后端 PID: $BACKEND_PID"

echo "等待 15 秒后启动前端..."
sleep 15

# 启动前端（前台运行）
echo "启动前端服务..."
echo ""
echo "========================================"
echo "  启动完成！"
echo "  前端地址: http://localhost:3000"
echo "  后端地址: http://localhost:8080"
echo "  API文档: http://localhost:8080/doc.html"
echo "========================================"
echo ""

pnpm dev

# 退出时关闭后端
echo "关闭后端服务..."
kill $BACKEND_PID 2>/dev/null
