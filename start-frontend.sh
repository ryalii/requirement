#!/bin/bash
echo "========================================"
echo " 前端启动脚本 (Linux/Mac)"
echo "========================================"
echo ""

cd "$(dirname "$0")"

# 端口检查
if lsof -ti:3000 &> /dev/null; then
    echo "[WARN] 端口 3000 已被占用，正在释放..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

echo "[1/2] 安装依赖..."
pnpm install &> /dev/null
echo "[OK] 依赖就绪"

echo "[2/2] 启动前端..."
echo "地址: http://localhost:3000"
echo ""
pnpm dev
