# API Contracts: 需求管理系统

**Base URL**: `/api/v1`
**Content-Type**: `application/json;charset=UTF-8`
**Auth**: `Authorization: Bearer <JWT_TOKEN>`
**Date format**: Date: `yyyy-MM-dd`, DateTime: `yyyy-MM-dd HH:mm:ss`

## 通用响应格式

```json
// 成功 - 单对象
{ "code": 200, "message": "success", "data": { ... } }

// 成功 - 分页列表
{ "code": 200, "message": "success", "data": { "page": 1, "pageSize": 10, "total": 150, "list": [...] } }

// 错误
{ "code": 400, "message": "参数校验失败：需求名称不能为空", "data": null }
{ "code": 401, "message": "请先登录", "data": null }
{ "code": 404, "message": "需求不存在", "data": null }
{ "code": 500, "message": "系统内部错误", "data": null }
```

---

## 1. Auth (无需 Token)

### `POST /auth/login`
- **Request**: `{ "email": "string", "password": "string" }`
- **Response**: `{ "code": 200, "data": { "token": "eyJhbG...", "user": { "id": 1, "email": "admin@example.com", "realName": "管理员" } } }`
- **Errors**: 400 (账号或密码错误), 500

### `GET /auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ "code": 200, "data": { "id": 1, "email": "admin@example.com", "realName": "管理员" } }`
- **Errors**: 401

---

## 2. Requirements `/requirements`

### `GET /requirements`
- **Query Params**: `type?` (LMT/IR/SR/AR), `status?`, `keyword?`, `page?` (default 1), `pageSize?` (default 10, max 100)
- **Response (PageResult)**:
```json
{
  "code": 200,
  "data": {
    "page": 1, "pageSize": 10, "total": 18,
    "list": [{
      "id": 1, "code": "LMT-2026-001", "name": "用户登录功能优化",
      "type": "LMT", "customer": "客户A", "project": "Terra",
      "expectedDate": "2026-12-31", "createdAt": "2026-04-29 10:30:00",
      "status": "进行中", "priority": "高", "description": "...",
      "parentId": null, "parentCode": null, "parentType": null
    }]
  }
}
```

### `GET /requirements/{id}`
- **Response**: 完整需求字段。type=AR 含 `testCases`, type=IR/SR 含 `childrenCount`
- **Errors**: 404

### `POST /requirements`
- **Request**:
```json
{
  "name": "新需求", "type": "LMT", "customer": "客户B",
  "project": "Terra", "expectedDate": "2026-06-30",
  "status": "待分析", "priority": "中", "description": "...",
  "parentId": null, "iterationId": null,
  "frontend": null, "backend": null, "tester": null
}
```
- **Response**: `{ "code": 200, "data": { ...created requirement } }`
- **Errors**: 400 (name/type/customer/expectedDate 必填校验)
- **Side effect**: 自动生成 code, createdAt

### `PUT /requirements/{id}`
- **Request**: 同 POST body (type 不可变更)
- **Response**: `{ "code": 200, "data": { ...updated requirement } }`
- **Errors**: 404, 400 (type 变更被拒绝)

### `DELETE /requirements/{id}`
- **Response**: `{ "code": 200, "data": null }`
- **Side effect**: 逻辑删除 (deleted=1)
- **Errors**: 404

### `POST /requirements/{id}/convert-to-ir`
- **Request**: `{ "name": "...-IR", "description": "...", "priority": "高", "expectedDate": "2026-12-31" }`
- **Response**: `{ "code": 200, "data": { ...新 IR } }`
- **Side effect**: 创建 IR, 更新 LMT.irId, 记录日志
- **Errors**: 400 (非 LMT 类型), 404

### `POST /requirements/{id}/decompose`
- **Request**:
```json
{
  "items": [
    { "name": "功能模块设计", "description": "...", "priority": "高" }
  ]
}
```
- **Response**: `{ "code": 200, "data": [ ...子需求列表 ] }`
- **Side effect**: 批量创建子需求 (IR→SR 或 SR→AR)
- **Errors**: 400 (非 IR/SR 类型, items 为空), 404

### `GET /requirements/{id}/tree`
- **Response**: 递归嵌套结构
```json
{
  "code": 200,
  "data": {
    "requirement": { "id": 5, "code": "IR-2026-001", "type": "IR", "name": "...", ... },
    "children": [{
      "requirement": { "id": 8, "code": "SR-2026-001", "type": "SR", "name": "...", ... },
      "children": [{
        "requirement": { "id": 12, "code": "AR-2026-001", "type": "AR", "name": "...", ... },
        "children": []
      }]
    }]
  }
}
```

### `GET /requirements/{id}/children`
- **Response**: 平铺子需求列表 (不分页)

### `GET /requirements/{id}/ancestors`
- **Response**: 从 AR→SR→IR 或 SR→IR 的链路数组
```json
{ "code": 200, "data": [ { "id": 5, "code": "IR-2026-001" }, { "id": 8, "code": "SR-2026-001" } ] }
```

### `GET /requirements/export`
- **Query Params**: 同列表筛选参数 (不含 page/pageSize)
- **Response**: `Content-Type: text/csv;charset=UTF-8` 含 BOM
- **Headers**: `Content-Disposition: attachment; filename=requirements.csv`

---

## 3. Test Cases

| Method | Path | Params/Body | Errors |
|--------|------|------------|--------|
| `GET` | `/requirements/{arId}/test-cases` | - | 404 |
| `GET` | `/requirements/{arId}/test-cases/stats` | - | 404 |
| `POST` | `/requirements/{arId}/test-cases` | `{ name, priority?, status? }` | 400, 404 |
| `PUT` | `/test-cases/{id}` | `{ name?, priority?, status? }` | 400, 404 |
| `DELETE` | `/test-cases/{id}` | - | 404 |
| `DELETE` | `/test-cases/batch` | `{ ids: [...] }` | 400 |
| `PATCH` | `/test-cases/{id}/status` | `{ status, executedAt? }` | 400, 404 |
| `PATCH` | `/test-cases/batch-status` | `{ ids: [...], status }` | 400 |

**TestCase 对象**:
```json
{ "id": 1, "code": "TC-2026-001", "name": "登录成功测试",
  "status": "未执行", "priority": "高", "executedAt": null,
  "createdAt": "2026-04-29 10:30:00" }
```

**Stats 对象**:
```json
{ "total": 5, "passed": 3, "failed": 1, "pending": 1,
  "passRate": 60.0, "executionRate": 80.0 }
```

---

## 4. Tasks `/tasks`

### `GET /tasks`
- **Query Params**: `type?`, `status?`, `keyword?`, `assignee?`, `sortBy?` (default "deadline"), `sortOrder?` (asc/desc), `page?`, `pageSize?`
- **Response (PageResult)**: 含 `daysRemaining` / `isOverdue` 计算字段

### `GET /tasks/stats`
```json
{ "code": 200, "data": { "total": 8, "pending": 2, "inProgress": 3, "completed": 2, "overdue": 1 } }
```

### `GET /tasks/{id}`
含 `histories` 历史列表

### `POST /tasks`
```json
{ "name": "...", "type": "需求", "assignee": null, "creator": "admin01",
  "deadline": "2026-06-15", "description": "...", "relatedRequirementId": null }
```
**Side effect**: 自动生成 code TASK-YYYY-NNN, 写入 TaskHistory

### `PUT /tasks/{id}`
同创建 body

### `DELETE /tasks/{id}`
逻辑删除

### `GET /tasks/{id}/histories`
```json
{ "code": 200, "data": [ { "id": 1, "action": "创建", "operator": "admin01", "timestamp": "...", "description": "..." } ] }
```

### `PATCH /tasks/{id}/assign`
- **Request**: `{ "assignee": "张三" }`
- **Side effect**: 状态 待分配→进行中, 写入 TaskHistory
- **Errors**: 400 (已关闭/已完成不可分配)

### `PATCH /tasks/{id}/status`
- **Request**: `{ "status": "已完成" }`
- **State machine rules**: 待分配→进行中 (需 assignee); 进行中→已完成; 任意→已关闭 (终态); 已关闭/已完成→不可变更 (400)

### `GET /tasks/export`
CSV 导出，参数同列表

---

## 5. Projects `/projects`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/projects` | 列表 (含 versionCount/iterationCount/memberCount/requirementCount) |
| `GET` | `/projects/{id}` | 详情 (含 stats + members + logs) |
| `POST` | `/projects` | 创建 |
| `PUT` | `/projects/{id}` | 编辑 |
| `DELETE` | `/projects/{id}` | 逻辑删除 |
| `GET` | `/projects/{id}/tree` | Version→Iteration→AR 三层树 |
| `GET` | `/projects/{id}/members` | 成员列表 |
| `POST` | `/projects/{id}/members` | 添加成员 `{ name, role, email, phone }` |
| `DELETE` | `/projects/{id}/members/{memberId}` | 移除成员 |
| `GET` | `/projects/{id}/logs` | 操作日志 |
| `GET` | `/projects/export` | CSV 导出 |

**Project 列表对象**:
```json
{ "id": 1, "name": "Terra平台", "code": "Terra", "financeCode": "82525",
  "owner": "王五", "manager": "赵六", "startDate": "2026-01-01", "endDate": "2026-12-31",
  "status": "进行中", "description": "...",
  "versionCount": 2, "iterationCount": 4, "memberCount": 6, "requirementCount": 8 }
```

**Project Tree 响应**:
```json
{ "code": 200, "data": {
  "project": { "id": 1, "name": "Terra平台" },
  "versions": [{
    "version": { "id": 1, "versionNumber": "V1.0" },
    "iterations": [{
      "iteration": { "id": 1, "name": "Sprint 1" },
      "ars": [ { "id": 12, "code": "AR-2026-001", "name": "..." } ]
    }]
  }]
}}
```

---

## 6. Versions `/versions`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/versions` | 列表 (projectId, status, keyword, page, pageSize) |
| `GET` | `/versions/{id}` | 详情 (含 stats + iterations + logs) |
| `POST` | `/versions` | 创建 |
| `PUT` | `/versions/{id}` | 编辑 |
| `DELETE` | `/versions/{id}` | 逻辑删除 |
| `GET` | `/versions/{id}/iterations` | 迭代列表 (含 AR 摘要) |
| `GET` | `/versions/{id}/stats` | `{ total, completed, inProgress, blocked }` |
| `GET` | `/versions/{id}/logs` | 操作日志 |
| `GET` | `/versions/export` | CSV 导出 |

---

## 7. Iterations `/iterations`

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/iterations` | 列表 (projectId, versionId, status, keyword, page, pageSize) |
| `GET` | `/iterations/{id}` | 详情 (含 AR 列表 + stats + logs) |
| `POST` | `/iterations` | 创建 |
| `PUT` | `/iterations/{id}` | 编辑 |
| `DELETE` | `/iterations/{id}` | 逻辑删除 |
| `GET` | `/iterations/{id}/ars` | AR 平铺列表 |
| `GET` | `/iterations/{id}/stats` | 统计 |
| `GET` | `/iterations/{id}/logs` | 操作日志 |
| `GET` | `/iterations/export` | CSV 导出 |

---

## 8. Workspace `/workspace`

### `GET /workspace/urgent-requirements`
- **Query Params**: `limit?` (default 8)
- **Logic**: 排除状态为"已完成"/"已关闭"的需求，按 priority DESC (高>中>低) + expectedDate ASC 排序

### `GET /workspace/overdue-tasks`
- **Logic**: deadline < today 且状态非"已完成"/"已关闭"

---

## 错误码汇总

| Code | HTTP Status | Meaning |
|------|------------|---------|
| 200 | 200 | 成功 |
| 400 | 400 | 参数校验失败 / 业务规则不满足 |
| 401 | 401 | 未登录或 Token 过期 |
| 404 | 404 | 资源不存在 |
| 500 | 500 | 服务器内部错误 |
