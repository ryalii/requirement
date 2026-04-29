#!/bin/bash
echo "========================================"
echo " 需求管理系统 - 前端启动脚本 (Linux/Mac)"
echo "========================================"
echo ""

cd "$(dirname "$0")"

echo "[1/2] 安装前端依赖..."
pnpm install
if [ $? -ne 0 ]; then
    echo "[ERROR] 依赖安装失败"
    exit 1
fi
echo "[OK] 依赖安装完成"

echo "[2/2] 启动前端开发服务器..."
echo "地址: http://localhost:3000"
echo ""
pnpm dev
