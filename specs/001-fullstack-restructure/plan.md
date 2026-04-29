# Implementation Plan: 需求管理系统全栈重构

**Branch**: `001-fullstack-restructure` | **Date**: 2026-04-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fullstack-restructure/spec.md`

## Summary

将现有纯前端 mock 数据系统重构为完整的前后端分离架构。后端使用 Spring Boot 3 + MyBatis-Plus 提供 REST API，前端从 mock 数据迁移到异步 API 调用并升级 UI 为企业级 SaaS 风格。数据库使用 MySQL 8.0，包含 10 张业务表，通过 JWT 进行认证。

## Technical Context

**Language/Version**: Backend: Java 17 + Spring Boot 3.2.5; Frontend: TypeScript + Next.js 16 + React 19
**Primary Dependencies**: Backend: MyBatis-Plus 3.5.9, JJWT 0.12.5, Hutool 5.8.28, MapStruct 1.5.5, Knife4j 4.5.0; Frontend: Tailwind CSS 4, shadcn/ui (new-york), recharts, react-hook-form, zod, framer-motion, cmdk
**Storage**: MySQL 8.0 @ mysql6.sqlpub.com:3311 / requirement / lisong01 — utf8mb4, Asia/Shanghai
**Testing**: Backend: JUnit 5 + Spring Boot Test + MockMvc; Frontend: 暂无测试套件
**Target Platform**: Web application — 后端部署在 localhost:8080, 前端 localhost:3000
**Project Type**: Web application (frontend + backend)
**Performance Goals**: 100 并发请求 95% < 1s, 10000 条需求列表查询 < 500ms, 前端 60fps 看板渲染
**Constraints**: CORS 限制 localhost:3000, JWT 24h 过期, 统一响应格式 `{ code, message, data }`, 逻辑删除, updated_at 冲突检测返回 409
**Scale/Scope**: 10 张数据库表, 8 个 Controller, ~50 个 API 端点, 10 个前端页面, 20+ 个新 UI 组件

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

**Constitution Status**: 项目 constitution 为模板占位符，未定义具体原则。无违规项需要说明。所有设计决策基于参考文档（FRONTEND_REDESIGN_SPEC.md, REST_API_SPEC.md, TECH_STACK.md）中已明确的技术选型。

## Project Structure

### Documentation (this feature)

```text
specs/001-fullstack-restructure/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── pom.xml
├── src/main/
│   ├── java/com/company/requirement/
│   │   ├── RequirementApplication.java
│   │   ├── common/
│   │   │   ├── Result.java
│   │   │   ├── PageResult.java
│   │   │   ├── BusinessException.java
│   │   │   ├── GlobalExceptionHandler.java
│   │   │   └── CodeGenerator.java
│   │   ├── config/
│   │   │   ├── CorsConfig.java
│   │   │   ├── MyBatisPlusConfig.java
│   │   │   ├── JacksonConfig.java
│   │   │   └── WebMvcConfig.java
│   │   ├── security/
│   │   │   ├── AuthController.java
│   │   │   ├── JwtUtil.java
│   │   │   └── LoginInterceptor.java
│   │   ├── entity/
│   │   │   ├── Requirement.java
│   │   │   ├── TestCase.java
│   │   │   ├── Task.java
│   │   │   ├── TaskHistory.java
│   │   │   ├── Project.java
│   │   │   ├── Version.java
│   │   │   ├── Iteration.java
│   │   │   ├── ProjectMember.java
│   │   │   ├── OperationLog.java
│   │   │   └── User.java
│   │   ├── dto/request/
│   │   │   └── ... (各种 Request DTO)
│   │   ├── dto/response/
│   │   │   └── ... (各种 VO)
│   │   ├── controller/
│   │   │   ├── AuthController.java
│   │   │   ├── RequirementController.java
│   │   │   ├── TestCaseController.java
│   │   │   ├── TaskController.java
│   │   │   ├── ProjectController.java
│   │   │   ├── VersionController.java
│   │   │   ├── IterationController.java
│   │   │   └── WorkspaceController.java
│   │   ├── service/
│   │   │   └── ... (Service 接口)
│   │   ├── service/impl/
│   │   │   └── ... (Service 实现)
│   │   └── mapper/
│   │       └── ... (MyBatis-Plus Mapper)
│   └── resources/
│       ├── application.yml
│       ├── application-dev.yml
│       └── db/schema.sql

frontend/ (现有 Next.js 项目根目录)
├── lib/
│   ├── api/
│   │   ├── client.ts          # 统一 HTTP 客户端
│   │   ├── auth.ts            # 认证 API
│   │   ├── requirements.ts    # 需求 API
│   │   ├── tasks.ts           # 任务 API
│   │   ├── projects.ts        # 项目 API
│   │   ├── versions.ts        # 版本 API
│   │   ├── iterations.ts      # 迭代 API
│   │   └── workspace.ts       # 工作台 API
│   ├── mock-data.ts           # 保留不删
│   └── types.ts               # 保留并补充新类型
├── components/
│   ├── admin-layout.tsx       # 重写 → Navbar + Sidebar + Footer
│   ├── navbar.tsx             # 新建
│   ├── sidebar.tsx            # 新建
│   ├── user-dropdown.tsx      # 新建
│   ├── search-command.tsx     # 新建
│   ├── ui/
│   │   ├── kpi-card.tsx       # 新建
│   │   ├── kanban-board.tsx   # 新建
│   │   ├── kanban-card.tsx    # 新建
│   │   ├── stat-card.tsx      # 新建
│   │   ├── timeline.tsx       # 新建
│   │   ├── bento-grid.tsx     # 新建
│   │   ├── page-header.tsx    # 新建
│   │   ├── filter-bar.tsx     # 新建
│   │   ├── empty-state.tsx    # 新建
│   │   ├── loading-skeleton.tsx # 新建
│   │   └── error-state.tsx    # 新建
│   └── charts/
│       ├── line-chart.tsx     # 新建
│       ├── donut-chart.tsx    # 新建
│       └── sparkline.tsx      # 新建
└── app/
    ├── login/page.tsx         # 重写
    ├── workspace/page.tsx     # 重写
    ├── requirements/          # 重写
    ├── tasks/                 # 重写
    └── projects/              # 重写
```

**Structure Decision**: 采用 Web application 结构。`backend/` 为新建的 Spring Boot 工程，`frontend/` 即现有 Next.js 项目根目录。前后端物理分离，通过 HTTP REST API 通信。

## Complexity Tracking

> 无宪法违规项。所有复杂度（10 张表、50+ API 端点、20+ 新组件）均来自参考文档中已明确的需求规格，无过度设计。
