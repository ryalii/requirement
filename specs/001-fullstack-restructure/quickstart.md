# Quickstart: 需求管理系统全栈重构

**Created**: 2026-04-29

## 前置依赖

| 工具 | 版本 | 验证命令 |
|------|------|----------|
| JDK | 17+ | `java -version` |
| Maven | 3.9+ | `mvn -v` |
| Node.js | 18+ | `node -v` |
| pnpm | latest | `pnpm -v` |

## 项目启动

### 1. 初始化数据库

数据库已创建在 `mysql6.sqlpub.com:3311`，需执行建表脚本和初始数据：

```bash
mysql -h mysql6.sqlpub.com -P 3311 -u lisong01 -p requirement < backend/src/main/resources/db/schema.sql
# 输入密码: H31pLQBkR6Hi4ucj
```

`schema.sql` 包含 10 张表的 CREATE TABLE 语句和初始 t_user 数据 (admin@example.com / admin123)。

### 2. 启动后端 (Spring Boot)

```bash
cd backend
mvn spring-boot:run
```

后端启动在 `http://localhost:8080`。

**验证**: `curl http://localhost:8080/api/v1/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"admin123"}'`

Swagger UI (Knife4j): `http://localhost:8080/doc.html`

### 3. 配置后端环境变量 (可选)

默认配置在 `application.yml`。敏感信息可通过环境变量覆盖：

```bash
# Windows PowerShell
$env:DB_PASSWORD="H31pLQBkR6Hi4ucj"
$env:JWT_SECRET="your-secret-key"

# Linux/Mac
export DB_PASSWORD=H31pLQBkR6Hi4ucj
export JWT_SECRET=your-secret-key
```

### 4. 启动前端 (Next.js)

```bash
# 在项目根目录
pnpm install
pnpm dev
```

前端启动在 `http://localhost:3000`。

### 5. 环境变量配置

前端通过环境变量配置 API 地址。创建 `.env.local`：

```env
NEXT_PUBLIC_API_BASE=http://localhost:8080/api/v1
```

默认值即为 `http://localhost:8080/api/v1`，不配置亦可。

## 默认账号

| 邮箱 | 密码 |
|------|------|
| admin@example.com | admin123 |

## 关键文件速查

| 文件 | 用途 |
|------|------|
| `backend/src/main/resources/db/schema.sql` | 建表脚本 |
| `backend/src/main/resources/application.yml` | 后端主配置 |
| `backend/src/main/java/.../security/JwtUtil.java` | JWT 工具 |
| `backend/src/main/java/.../common/CodeGenerator.java` | 编号生成 |
| `lib/api/client.ts` | 前端 HTTP 客户端 |
| `lib/api/auth.ts` | 登录接口 |
| `lib/api/requirements.ts` | 需求接口 |
| `lib/api/tasks.ts` | 任务接口 |
| `lib/api/projects.ts` | 项目接口 |

## 项目结构速览

```
requirement/
├── backend/              # Spring Boot 后端 (新建)
│   ├── pom.xml
│   └── src/main/
│       ├── java/com/company/requirement/
│       │   ├── controller/   # REST 控制器
│       │   ├── service/      # 业务逻辑
│       │   ├── mapper/       # MyBatis-Plus Mapper
│       │   ├── entity/       # 实体类
│       │   ├── dto/          # 请求/响应 DTO
│       │   ├── common/       # 通用类 (Result, Exception)
│       │   ├── config/       # 配置 (CORS, MyBatis)
│       │   └── security/     # JWT 认证
│       └── resources/
│           ├── application.yml
│           └── db/schema.sql
├── lib/api/              # 前端 API 模块 (新建)
│   ├── client.ts
│   ├── auth.ts
│   ├── requirements.ts
│   ├── tasks.ts
│   ├── projects.ts
│   ├── versions.ts
│   ├── iterations.ts
│   └── workspace.ts
├── components/           # 前端组件 (部分新建, 部分重写)
├── app/                  # Next.js 页面 (重写)
└── specs/001-fullstack-restructure/  # 本文档
```

## 常见问题

**Q: 前端请求后端报 CORS 错误？**
A: 确认后端 `CorsConfig.java` 中 `allowedOrigins` 包含 `http://localhost:3000`。默认已配置。

**Q: 登录后马上跳回登录页？**
A: 检查浏览器 DevTools → Application → Local Storage 是否有 `token` 键。确认后端 `/auth/login` 正常返回 token。

**Q: 数据库连接失败？**
A: 检查网络是否可达 `mysql6.sqlpub.com:3311`，确认用户名密码正确。`application.yml` 中 `spring.datasource.url` 包含 `useSSL=false&allowPublicKeyRetrieval=true`。

**Q: 打开 Swagger UI 白页？**
A: Knife4j 需要端口匹配。访问 `http://localhost:8080/doc.html`（非 8080 的其他端口可能被拦截）。
