#!/bin/bash
echo "========================================"
echo " 需求管理系统 - 一键启动 (Linux/Mac)"
echo "========================================"
echo ""

cd "$(dirname "$0")"

# 检查后端端口
if lsof -ti:8080 &> /dev/null; then
    echo "[WARN] 后端端口 8080 已被占用，正在释放..."
    lsof -ti:8080 | xargs kill -9 2>/dev/null
    sleep 2
fi

# 检查前端端口
if lsof -ti:3000 &> /dev/null; then
    echo "[WARN] 前端端口 3000 已被占用，正在释放..."
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    sleep 2
fi

# 后端
echo "[1/2] 启动后端 (后台)..."
(cd backend && mvn spring-boot:run > ../backend.log 2>&1) &
BACKEND_PID=$!
echo "  后端 PID: $BACKEND_PID | 日志: backend.log"

# 等待后端
echo "  等待后端就绪..."
for i in $(seq 1 15); do
    sleep 2
    if curl -s http://localhost:8080/api/v1/auth/login -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@example.com","password":"admin123"}' | grep -q "token"; then
        echo "  后端已就绪"
        break
    fi
    [ $i -eq 15 ] && echo "  [WARN] 后端启动较慢，请稍后检查 http://localhost:8080"
done

# 前端
echo "[2/2] 启动前端..."
pnpm dev &
FRONTEND_PID=$!
echo "  前端 PID: $FRONTEND_PID"

echo ""
echo "========================================"
echo "  启动完成！"
echo ""
echo "  前端地址: http://localhost:3000"
echo "  后端地址: http://localhost:8080"
echo "  API文档: http://localhost:8080/doc.html"
echo "  登录账号: admin@example.com / admin123"
echo ""
echo "  停止后端: kill $BACKEND_PID"
echo "========================================"
echo ""

wait
