#!/bin/bash
echo "========================================"
echo " 需求管理系统 - 后端启动脚本 (Linux/Mac)"
echo "========================================"
echo ""

cd "$(dirname "$0")/backend"

echo "[1/2] 编译后端..."
mvn compile -q
if [ $? -ne 0 ]; then
    echo "[ERROR] 编译失败，请检查错误信息"
    exit 1
fi
echo "[OK] 编译成功"

echo "[2/2] 启动后端服务..."
echo "地址: http://localhost:8080"
echo "Swagger: http://localhost:8080/doc.html"
echo ""
mvn spring-boot:run
