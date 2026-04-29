# 需求管理系统 - 部署文档

## 系统架构

```
┌─────────────────┐       ┌─────────────────┐       ┌──────────────┐
│   Frontend      │──────▶│   Backend       │──────▶│   MySQL      │
│  Next.js 16     │ REST  │  Spring Boot 3  │ JDBC  │  8.0         │
│  localhost:3000 │       │  localhost:8080 │       │  Remote DB   │
└─────────────────┘       └─────────────────┘       └──────────────┘
     React 19                  Java 17
     Tailwind CSS 4            MyBatis-Plus 3.5.7
     shadcn/ui                 JWT Auth
```

## 环境要求

### 必需工具

| 工具 | 版本要求 | 验证命令 | 备注 |
|------|----------|----------|------|
| JDK | 17+ | `java -version` | 后端运行环境 |
| Maven | 3.9+ | `mvn -v` | Java 构建工具 |
| Node.js | 18+ | `node -v` | 前端运行环境 |
| pnpm | latest | `pnpm -v` | 前端包管理器 (npm install -g pnpm) |

### 可选工具

| 工具 | 用途 |
|------|------|
| MySQL CLI | 手动管理数据库（非必须，应用自动初始化表结构） |
| curl | 验证 API 接口 |

### 安装指引

#### Windows

```powershell
# 1. JDK 17 - 下载安装包
# 下载地址: https://adoptium.net/temurin/releases/?version=17
# 安装后设置 JAVA_HOME 环境变量

# 2. Maven - 下载解压
# 下载地址: https://maven.apache.org/download.cgi
# 解压后设置 MAVEN_HOME 并添加到 PATH

# 3. Node.js - 下载安装包
# 下载地址: https://nodejs.org/

# 4. pnpm - npm 安装
npm install -g pnpm
```

#### Linux (Ubuntu/Debian)

```bash
# 1. JDK 17
sudo apt update
sudo apt install openjdk-17-jdk maven -y

# 2. Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# 3. pnpm
npm install -g pnpm
```

#### MacOS

```bash
# 1. 安装 Homebrew (如已安装则跳过)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 2. 安装依赖
brew install openjdk@17 maven node
npm install -g pnpm
```

## 快速启动

### 方式一：一键脚本（推荐）

```bash
# Windows
build-and-start.bat

# Linux/Mac
chmod +x build-and-start.sh
./build-and-start.sh
```

脚本会自动完成：
1. ✅ 检查 Java、Maven、Node.js、pnpm 是否安装
2. ✅ 检查端口 3000/8080 占用并自动释放
3. ✅ 编译后端代码
4. ✅ 安装前端依赖
5. ⏳ 启动后端并等待就绪（约 15-20 秒）
6. ✅ 启动前端

### 方式二：分别启动

#### 启动后端

```bash
# Windows
cd backend
mvn spring-boot:run

# Linux/Mac
cd backend
mvn spring-boot:run
```

#### 启动前端

```bash
# 新开一个终端
pnpm dev
```

#### 验证启动

```bash
# 测试后端 API
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# 应该返回带有 token 的 JSON 响应
```

## 访问地址

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端 | http://localhost:3000 | 浏览器访问 |
| 后端 API | http://localhost:8080 | RESTful 接口 |
| API 文档 | http://localhost:8080/doc.html | Knife4j Swagger UI |

## 默认账号

| 邮箱 | 密码 |
|------|------|
| admin@example.com | admin123 |

## 端口冲突处理

### 端口 3000 被占用（前端）

```bash
# Windows (查找占用 3000 端口的进程)
netstat -ano | findstr ":3000 "
# 输出示例: TCP 0.0.0.0:3000 0.0.0.0:0 LISTENING 12345
# 终止进程
taskkill /F /PID 12345

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### 端口 8080 被占用（后端）

```bash
# Windows
netstat -ano | findstr ":8080 "
taskkill /F /PID 12345

# Linux/Mac
lsof -ti:8080 | xargs kill -9
```

> 一键启动脚本 (`build-and-start.bat` / `build-and-start.sh`) 会自动检测并释放端口。

## 数据库说明

### 连接信息

| 参数 | 值 |
|------|-----|
| 主机 | mysql6.sqlpub.com |
| 端口 | 3311 |
| 数据库名 | requirement |
| 用户名 | lisong01 |
| 密码 | (配置在 `backend/src/main/resources/application.yml`) |

### 数据库初始化

应用启动时会自动执行 `backend/src/main/resources/db/schema.sql` 创建表结构，包含：
- 10 张业务表 (`t_user`, `t_project`, `t_version`, `t_iteration`, `t_requirement`, `t_test_case`, `t_task`, `t_task_history`, `t_project_member`, `t_operation_log`)
- 索引和外键约束
- 初始管理员账号

### 填充测试数据

```bash
# 确保后端已启动
node scripts/seed-data.mjs
```

将插入：4 个项目、4 个版本、8 个迭代、16 条需求、8 个任务、5 个测试用例。

## 项目结构

```
requirement/
├── backend/                          # Spring Boot 后端
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/company/requirement/
│       │   ├── common/               # 通用类 (Result, Exception)
│       │   ├── config/               # 配置 (CORS, MyBatis, Jackson)
│       │   ├── security/             # JWT 认证
│       │   ├── entity/               # 实体类 (10个)
│       │   ├── dto/                  # 请求/响应 DTO
│       │   ├── controller/           # REST 控制器 (8个)
│       │   ├── service/              # 业务逻辑
│       │   └── mapper/              # MyBatis-Plus Mapper
│       └── resources/
│           ├── application.yml
│           └── db/schema.sql
├── app/                              # Next.js 页面
├── components/                       # React 组件
│   ├── ui/                           # UI 基础组件
│   ├── charts/                       # 图表组件
│   ├── admin-layout.tsx              # 布局外壳
│   ├── navbar.tsx                    # 导航栏
│   └── sidebar.tsx                   # 侧边栏
├── lib/api/                          # 前端 API 模块 (8个)
├── scripts/                          # 工具脚本
│   └── seed-data.mjs                 # 种子数据
├── build-and-start.bat               # Windows 一键启动
├── build-and-start.sh                # Linux/Mac 一键启动
└── DEPLOY.md                         # 本文档
```

## API 概览

### 认证 (无需 Token)

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /api/v1/auth/login | 登录获取 JWT Token |
| GET | /api/v1/auth/me | 获取当前用户信息 |

### 业务接口 (需 Bearer Token)

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST/PUT/DELETE | /api/v1/requirements | 需求 CRUD |
| POST | /api/v1/requirements/{id}/convert-to-ir | LMT 转 IR |
| POST | /api/v1/requirements/{id}/decompose | 需求拆解 |
| GET | /api/v1/requirements/{id}/tree | 需求树 |
| GET/POST/PUT/DELETE | /api/v1/tasks | 任务 CRUD |
| PATCH | /api/v1/tasks/{id}/assign | 任务分配 |
| PATCH | /api/v1/tasks/{id}/status | 状态变更 |
| GET | /api/v1/tasks/stats | 任务统计 |
| GET/POST/PUT/DELETE | /api/v1/projects | 项目 CRUD |
| GET/POST/DELETE | /api/v1/projects/{id}/members | 项目成员管理 |
| GET/POST/PUT/DELETE | /api/v1/versions | 版本 CRUD |
| GET/POST/PUT/DELETE | /api/v1/iterations | 迭代 CRUD |
| GET | /api/v1/workspace/urgent-requirements | 紧急需求 |
| GET | /api/v1/workspace/overdue-tasks | 逾期任务 |
| GET | /api/v1/requirements/{arId}/test-cases | 测试用例 |

## 常见问题

### Q: 后端启动失败："Address already in use"
端口 8080 被占用，一键脚本会自动处理。手动操作见上方"端口冲突处理"。

### Q: 前端请求后端报 CORS 错误
确认前端地址在 `localhost:3000`，后端 `CorsConfig.java` 已配置允许所有来源。

### Q: 启动后端时 Maven 下载依赖慢
Maven 已配置阿里云镜像加速。如仍慢，可检查网络或手动设置代理。

### Q: 数据库连接失败
- 确认网络可访问 `mysql6.sqlpub.com:3311`
- 防火墙可能阻止了出站连接到非标准端口 3311

### Q: `pnpm install` 报错
```bash
# 尝试清除缓存重装
rm -rf node_modules
pnpm install
```

### Q: 登录后白屏/跳回登录页
- 浏览器 DevTools → Application → Local Storage 检查是否有 `token`
- 确认后端 `/auth/login` 正常返回 token
- 如 token 过期，清除 localStorage 重新登录
