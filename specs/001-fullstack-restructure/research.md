# Research: 需求管理系统全栈重构

**Created**: 2026-04-29
**Spec**: [spec.md](./spec.md)

## 概述

本项目的技术选型在参考文档（FRONTEND_REDESIGN_SPEC.md, REST_API_SPEC.md, TECH_STACK.md）中已有详细规定。研究阶段主要确认各技术方案在目标环境下的可行性，无 NEEDS CLARIFICATION 项。

## 1. 后端技术栈确认

### Decision: Spring Boot 3.2.5 + MyBatis-Plus 3.5.9

**Rationale**: TECH_STACK.md 已明确技术选型。Spring Boot 3.2.5 要求 Java 17+，提供成熟的企业级开发框架。MyBatis-Plus 3.5.9 在 MyBatis 基础上增强，自带分页插件、逻辑删除、代码生成器，与 MySQL 配合紧密，是国内 Java 团队的主流 ORM 选择。

**Alternatives considered**:
- Spring Data JPA/Hibernate: 自动建表方便，但复杂查询（如需求树递归、编号生成 MAX 查询）不如 MyBatis 灵活
- jOOQ: 类型安全强，但学习成本高，团队不熟悉
- 纯 JDBC: 过于底层，代码量大

### Decision: JJWT 0.12.5

**Rationale**: JWT 是 REST API 无状态认证的标准方案。JJWT 0.12.5 是主流 Java JWT 库，API 简洁，支持 HMAC 和 RSA 签名。过期时间 24h 符合企业内网应用惯例。

**Alternatives considered**:
- Spring Security + OAuth2: 过于重量级，单团队内网应用不需要
- Session-based auth: 不符合 REST 无状态原则，扩展性差

### Decision: MySQL 8.0 utf8mb4

**Rationale**: 用户已提供 MySQL 数据库（mysql6.sqlpub.com:3311）。utf8mb4 字符集支持中文和 emoji。InnoDB 引擎支持事务，MyBatis-Plus 逻辑删除和分页依赖 MySQL 特性。

**Alternatives considered**:
- PostgreSQL: 功能更丰富但用户已指定 MySQL
- H2 内嵌数据库: 仅开发测试可用，无法持久化

## 2. 前端技术栈确认

### Decision: 保留现有 Next.js 16 + React 19 + Tailwind CSS 4 + shadcn/ui 技术栈

**Rationale**: 项目已基于此技术栈构建，改造范围限定在 API 对接和 UI 重设计，不更换底层框架。Tailwind CSS 4 配合 shadcn/ui (Radix UI) 提供无障碍支持的组件体系。

### Decision: framer-motion 用于动画

**Rationale**: FRONTEND_REDESIGN_SPEC.md 明确要求 framer-motion 实现页面过渡、卡片悬浮、侧边栏展开、看板拖拽等动画。它是 React 生态最主流的声明式动画库，支持 layout animation 和 gesture。

### Decision: cmdk 用于全局搜索

**Rationale**: FRONTEND_REDESIGN_SPEC.md 要求 ⌘K 命令面板。cmdk 是 Vercel 出品的无样式命令面板原语，与 shadcn/ui 配合良好。

## 3. 数据库架构确认

### Decision: 10 张表，逻辑删除，表前缀 t_

**Rationale**: TECH_STACK.md 已完整定义 10 张表结构和建表顺序。逻辑删除（deleted 字段）保留数据可恢复性，是企业管理系统的通用实践。t_ 前缀通过 MyBatis-Plus table-prefix 配置自动映射。

**表依赖顺序**:
```
t_user → t_project → t_version → t_iteration → t_requirement
→ t_test_case → t_task → t_task_history → t_project_member → t_operation_log
```

## 4. API 设计确认

### Decision: 统一响应格式 + JWT 认证 + RESTful 风格

**Rationale**: REST_API_SPEC.md 已完整定义所有端点、请求参数、响应格式和状态码。统一 `{ code, message, data }` 格式简化前端处理。Base URL `/api/v1` 预留版本空间。

**关键设计点**:
- 分页: query params `page`/`pageSize`，响应含 `total`
- 认证: `Authorization: Bearer <token>`，401 触发前端跳转登录
- 编号: 后端自动生成 `{TYPE}-{YEAR}-{序号3位}`，通过 `SELECT MAX(code)` + 唯一索引防并发
- CSV 导出: UTF-8 BOM 确保 Excel 正确打开中文

## 5. UI 设计系统确认

### Decision: 企业级 SaaS CRM 风格，蓝色主色调

**Rationale**: FRONTEND_REDESIGN_SPEC.md 完整定义了设计系统（色彩、间距、圆角、阴影、字体、动画、响应式断点）。所有规格已量化（如主色 #3B82F6、8px 间距体系、4 级阴影），可直接落地。

## 6. 环境依赖

| 依赖 | 版本 | 状态 |
|------|------|------|
| JDK | 17+ | 需确认本地已安装 |
| Maven | 3.9+ | 需确认本地已安装 |
| Node.js | 18+ | 已有（Next.js 16 要求）|
| pnpm | latest | 已有 |
| MySQL | 8.0 | 已提供 (mysql6.sqlpub.com:3311) |

## 7. 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 远端数据库网络延迟 | API 响应变慢 | MyBatis-Plus 分页 + 数据库索引优化 |
| 并发编号重复 | 数据完整性 | UNIQUE KEY 约束 + 重试机制 |
| 前端看板 100 卡片渲染性能 | 卡顿 | framer-motion `layout` 优化 + 虚拟化（如需要） |
| 401 跳转登录死循环 | UX 中断 | 登录页不检查 Token，避免循环重定向 |
