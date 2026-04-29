#!/bin/bash
echo "========================================"
echo " 后端启动脚本 (Linux/Mac)"
echo "========================================"
echo ""

cd "$(dirname "$0")/backend"

# 端口检查
if lsof -ti:8080 &> /dev/null; then
    echo "[WARN] 端口 8080 已被占用，正在释放..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    sleep 2
fi

echo "[1/2] 编译后端..."
mvn clean compile -q
if [ $? -ne 0 ]; then
    echo "[ERROR] 编译失败"
    exit 1
fi
echo "[OK] 编译成功"

echo "[2/2] 启动后端..."
echo "地址: http://localhost:8080"
echo "API文档: http://localhost:8080/doc.html"
echo ""
mvn spring-boot:run
