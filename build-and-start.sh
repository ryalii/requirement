#!/bin/bash
set -e

# ============================================
# 需求管理系统 - 一键打包启动 (Linux/Mac)
# ============================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================"
echo " 需求管理系统 - 一键打包启动 (Linux/Mac)"
echo "========================================"
echo ""

# ========================
# Step 1: 环境检查
# ========================
info "[1/6] 检查运行环境..."
ENV_OK=true

# Java 17+
if command -v java &> /dev/null; then
    JAVA_VER=$(java -version 2>&1 | head -1)
    ok "Java: $JAVA_VER"
else
    error "Java 未安装！请安装 JDK 17+"
    error "下载: https://adoptium.net/temurin/releases/?version=17"
    echo "  或使用包管理器: sudo apt install openjdk-17-jdk (Debian/Ubuntu)"
    echo "                     brew install openjdk@17 (Mac)"
    ENV_OK=false
fi

# Maven
if command -v mvn &> /dev/null; then
    MVN_VER=$(mvn -v 2>&1 | head -1)
    ok "Maven: $MVN_VER"
else
    error "Maven 未安装！请安装 Maven 3.9+"
    error "下载: https://maven.apache.org/download.cgi"
    echo "  或使用包管理器: sudo apt install maven (Debian/Ubuntu)"
    echo "                     brew install maven (Mac)"
    ENV_OK=false
fi

# Node.js
if command -v node &> /dev/null; then
    NODE_VER=$(node -v)
    ok "Node: $NODE_VER"
else
    error "Node.js 未安装！请安装 Node.js 18+"
    error "下载: https://nodejs.org/"
    ENV_OK=false
fi

# pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VER=$(pnpm -v)
    ok "pnpm: $PNPM_VER"
else
    warn "pnpm 未安装，正在安装..."
    npm install -g pnpm &> /dev/null && ok "pnpm 已安装" || {
        error "pnpm 安装失败，请手动执行: npm install -g pnpm"
        ENV_OK=false
    }
fi

if [ "$ENV_OK" = false ]; then
    echo ""
    error "环境检查未通过，请安装缺失工具后重试"
    exit 1
fi
echo ""

# ========================
# Step 2: 端口检查
# ========================
info "[2/6] 检查端口占用..."

# 检查 8080
if lsof -ti:8080 &> /dev/null; then
    warn "端口 8080 已被占用，正在释放..."
    lsof -ti:8080 | xargs kill -9 &> /dev/null
    sleep 2
fi
ok "端口 8080 可用"

# 检查 3000
if lsof -ti:3000 &> /dev/null; then
    warn "端口 3000 已被占用，正在释放..."
    lsof -ti:3000 | xargs kill -9 &> /dev/null
    sleep 2
fi
ok "端口 3000 可用"
echo ""

# ========================
# Step 3: 编译后端
# ========================
info "[3/6] 编译后端..."
cd "$SCRIPT_DIR/backend"
mvn clean compile -q && ok "后端编译成功" || {
    error "后端编译失败！"
    exit 1
}
echo ""

# ========================
# Step 4: 安装前端依赖
# ========================
info "[4/6] 安装前端依赖..."
cd "$SCRIPT_DIR"
pnpm install --frozen-lockfile &> /dev/null || pnpm install &> /dev/null
ok "前端依赖就绪"
echo ""

# ========================
# Step 5: 启动后端
# ========================
info "[5/6] 启动后端服务 (后台)"
cd "$SCRIPT_DIR/backend"
nohup mvn spring-boot:run > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!
echo "  后端 PID: $BACKEND_PID"
echo "  日志: backend.log"

# 等待后端就绪
WAIT_COUNT=0
while true; do
    sleep 3
    WAIT_COUNT=$((WAIT_COUNT + 1))
    if curl -s http://localhost:8080/api/v1/auth/login -X POST \
        -H "Content-Type: application/json" \
        -d '{"email":"admin@example.com","password":"admin123"}' | grep -q "token"; then
        ok "后端已就绪 http://localhost:8080"
        break
    fi
    if [ $WAIT_COUNT -ge 15 ]; then
        warn "后端启动较慢，请稍后检查 http://localhost:8080"
        break
    fi
done
echo ""

# ========================
# Step 6: 启动前端
# ========================
info "[6/6] 启动前端服务..."
cd "$SCRIPT_DIR"
pnpm dev &
FRONTEND_PID=$!
echo "  前端 PID: $FRONTEND_PID"
sleep 3

echo ""
echo "========================================"
echo "  启动完成！"
echo ""
echo "  前端地址: http://localhost:3000"
echo "  后端地址: http://localhost:8080"
echo "  API文档: http://localhost:8080/doc.html"
echo "  登录账号: admin@example.com / admin123"
echo ""
echo "  停止服务: kill $BACKEND_PID $FRONTEND_PID"
echo "========================================"
echo ""

# 等待子进程
wait
