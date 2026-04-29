# 需求管理系统 - REST API 规格说明

> **Base URL**: `/api/v1`
> **Content-Type**: `application/json;charset=UTF-8`
> **认证方式**: JWT Bearer Token (`Authorization: Bearer <token>`)
> **Mock 账号**: `admin@example.com` / `admin123`

---

## 通用约定

### 统一响应格式 `Result<T>`

```json
// 成功
{ "code": 200, "message": "success", "data": { ... } }

// 分页
{ "code": 200, "message": "success", "data": { "page": 1, "pageSize": 10, "total": 150, "list": [...] } }

// 错误
{ "code": 400, "message": "需求名称不能为空", "data": null }
{ "code": 401, "message": "请先登录", "data": null }
{ "code": 404, "message": "需求不存在", "data": null }
{ "code": 500, "message": "系统内部错误", "data": null }
```

### 日期格式
- 日期: `yyyy-MM-dd` (e.g. `"2024-12-31"`)
- 时间: `yyyy-MM-dd HH:mm:ss` (e.g. `"2024-09-15 10:30:00"`)

### 通用查询参数（所有列表接口）

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `page` | int | 否 | 默认 1 |
| `pageSize` | int | 否 | 默认 10（可选 10/20/50/100） |
| `keyword` | String | 否 | 模糊搜索 code 和 name |
| `status` | String | 否 | 状态筛选 |

---

## 1. 认证模块

### POST `/auth/login`
```json
// Request
{ "email": "admin@example.com", "password": "admin123" }

// Response data
{ "token": "eyJhbGciOi...", "user": { "id": 1, "email": "admin@example.com", "realName": "管理员" } }
```

### GET `/auth/me`
需 Bearer Token。返回当前用户信息。

---

## 2. 需求管理

### 2.1 需求列表 `GET /requirements`

| 参数 | 说明 |
|------|------|
| `type` | LMT / IR / SR / AR，不传=全部 |
| `status` | 待分析 / 进行中 / 已完成 / 已关闭 |
| `keyword` | 模糊搜索 code 和 name |
| `page` / `pageSize` | 分页 |

**Response data (PageResult):**
```json
{
  "page": 1, "pageSize": 10, "total": 18,
  "list": [{
    "id": 1, "code": "LMT-2024-001", "name": "用户登录功能优化",
    "type": "LMT", "customer": "客户A", "project": "Terra",
    "expectedDate": "2024-12-31", "createdAt": "2024-09-15 10:30:00",
    "status": "进行中", "priority": "高", "description": "...",
    "parentId": null, "parentCode": null, "parentType": null
  }]
}
```

### 2.2 需求详情 `GET /requirements/{id}`
返回完整需求字段。type=AR 时附带 testCases 列表；type=IR/SR 时附带 childrenCount。

### 2.3 创建 `POST /requirements`
```json
{
  "name": "新需求", "type": "LMT", "customer": "客户B",
  "project": "Terra", "expectedDate": "2025-06-30",
  "status": "待分析", "priority": "中", "description": "...",
  "parentId": null, "iterationId": null,
  "frontend": null, "backend": null, "tester": null
}
```
后端自动生成 `code`（格式 `{TYPE}-{YEAR}-{序号3位}`）、`createdAt`、`id`。

### 2.4 编辑 `PUT /requirements/{id}`
Body 同创建，type 不可变更。

### 2.5 删除 `DELETE /requirements/{id}`
逻辑删除。

### 2.6 LMT转IR `POST /requirements/{id}/convert-to-ir`
```json
{ "name": "...-IR", "description": "...", "priority": "高", "expectedDate": "2024-12-31" }
```
创建新IR → 更新LMT.irId → 返回新IR。

### 2.7 需求拆解 `POST /requirements/{id}/decompose`
IR→SR 或 SR→AR（自动判断目标类型）。
```json
{
  "items": [
    { "name": "功能模块设计", "description": "...", "priority": "高" }
  ]
}
```
批量创建子需求，parentId指向当前需求。

### 2.8 IR需求树 `GET /requirements/{id}/tree`
递归返回 IR → SR → AR 嵌套结构：
```json
{
  "requirement": { "id": 5, "code": "IR-2024-001", "type": "IR", ... },
  "children": [{
    "requirement": { "id": 8, "code": "SR-2024-001", "type": "SR", ... },
    "children": [{
      "requirement": { "id": 12, "code": "AR-2024-001", "type": "AR", ... },
      "children": []
    }]
  }]
}
```

### 2.9 子需求列表 `GET /requirements/{id}/children`
直接子需求平铺（不分页）。

### 2.10 链路追溯 `GET /requirements/{id}/ancestors`
从AR→SR→IR 或 SR→IR 的链路数组。

### 2.11 CSV导出 `GET /requirements/export`
参数同列表（不含 page/pageSize），返回 CSV 流（UTF-8 BOM）。

---

## 3. 测试用例

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/requirements/{arId}/test-cases` | 用例列表 |
| GET | `/requirements/{arId}/test-cases/stats` | 统计（total/passed/failed/pending/passRate/executionRate） |
| POST | `/requirements/{arId}/test-cases` | 创建（自动生成code: TC-YYYY-NNN） |
| PUT | `/test-cases/{id}` | 编辑 |
| DELETE | `/test-cases/{id}` | 删除单个 |
| DELETE | `/test-cases/batch` | 批量删除 `{ ids: [...] }` |
| PATCH | `/test-cases/{id}/status` | 更新状态 `{ status, executedAt }` |
| PATCH | `/test-cases/batch-status` | 批量执行 `{ ids, status }` |

创建用例后自动更新 `t_requirement.test_case_count`。

---

## 4. 任务管理

### 4.1 任务列表 `GET /tasks`

| 参数 | 说明 |
|------|------|
| `type` | 需求/测试/临时/调研/支持 |
| `status` | 待分配/进行中/已完成/已关闭 |
| `keyword` | 搜索 code 和 name |
| `assignee` | 按分配人筛选 |
| `sortBy` | 默认 "deadline" |
| `sortOrder` | 默认 "asc" |
| `page` / `pageSize` | 分页（10/20/50） |

Response 含计算字段 `daysRemaining` / `isOverdue`。

### 4.2 任务统计 `GET /tasks/stats`
```json
{ "total": 8, "pending": 2, "inProgress": 3, "completed": 2, "overdue": 1 }
```

### 4.3 任务详情 `GET /tasks/{id}`
含操作历史列表。

### 4.4 创建 `POST /tasks`
```json
{ "name": "...", "type": "需求", "assignee": null, "creator": "admin01",
  "deadline": "2025-01-15", "description": "...", "relatedRequirementId": null }
```
自动生成 code（TASK-YYYY-NNN），写入 TaskHistory。

### 4.5 编辑 `PUT /tasks/{id}`
### 4.6 删除 `DELETE /tasks/{id}`
### 4.7 任务历史 `GET /tasks/{id}/histories`

### 4.8 分配 `PATCH /tasks/{id}/assign`
```json
{ "assignee": "张三" }
```
待分配→进行中（若有assignee），写入TaskHistory。

### 4.9 状态变更 `PATCH /tasks/{id}/status`
```json
{ "status": "已完成" }
```

**状态机规则:**
- 待分配 → 进行中（需 assignee 不为空）
- 进行中 → 已完成
- 任意 → 已关闭（终态）
- 已关闭/已完成 → 不可变更（400）

### 4.10 CSV导出 `GET /tasks/export`

---

## 5. 项目管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/projects` | 列表 (status, keyword, page, pageSize)，含 versionCount/iterationCount/memberCount/requirementCount |
| GET | `/projects/{id}` | 详情 (含stats+members+logs) |
| POST | `/projects` | 创建 |
| PUT | `/projects/{id}` | 编辑 |
| DELETE | `/projects/{id}` | 逻辑删除 |
| GET | `/projects/{id}/tree` | Version→Iteration→AR 三层树 |
| GET | `/projects/{id}/members` | 成员列表 |
| POST | `/projects/{id}/members` | 添加成员 `{ name, role, email, phone }` |
| DELETE | `/projects/{id}/members/{memberId}` | 移除成员 |
| GET | `/projects/{id}/logs` | 操作日志 |
| GET | `/projects/export` | CSV导出 |

---

## 6. 版本管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/versions` | 列表 (projectId, status, keyword, page, pageSize)，含统计字段 |
| GET | `/versions/{id}` | 详情 (含stats+iterations+logs) |
| POST | `/versions` | 创建 |
| PUT | `/versions/{id}` | 编辑 |
| DELETE | `/versions/{id}` | 逻辑删除 |
| GET | `/versions/{id}/iterations` | 版本下迭代(含AR摘要) |
| GET | `/versions/{id}/stats` | 统计 `{ total, completed, inProgress, blocked }` |
| GET | `/versions/{id}/logs` | 操作日志 |
| GET | `/versions/export` | CSV导出 |

---

## 7. 迭代管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/iterations` | 列表 (projectId, versionId, status, keyword, page, pageSize) |
| GET | `/iterations/{id}` | 详情 (含AR列表+stats+logs) |
| POST | `/iterations` | 创建 |
| PUT | `/iterations/{id}` | 编辑 |
| DELETE | `/iterations/{id}` | 逻辑删除 |
| GET | `/iterations/{id}/ars` | 迭代下AR平铺列表 |
| GET | `/iterations/{id}/stats` | 统计 |
| GET | `/iterations/{id}/logs` | 操作日志 |
| GET | `/iterations/export` | CSV导出 |

---

## 8. 工作台

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/workspace/urgent-requirements?limit=8` | 紧急需求（排除已完成/已关闭，按优先级+expectedDate排序） |
| GET | `/workspace/overdue-tasks` | 逾期任务（deadline < 今天 且状态非已完成/已关闭） |

---

## 错误码

| code | 说明 |
|------|------|
| 200 | 成功 |
| 400 | 参数校验失败 / 业务规则不满足 |
| 401 | 未登录或 Token 过期 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |
