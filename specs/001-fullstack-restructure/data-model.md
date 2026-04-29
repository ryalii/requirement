# Data Model: 需求管理系统全栈重构

**Created**: 2026-04-29
**Spec**: [spec.md](./spec.md)

## Entity Relationship Diagram

```
t_user ──────────────────────────────────────────────
  │
  ▼
t_project ─── t_project_member
  │
  ├── t_version
  │     │
  │     └── t_iteration
  │           │
  │           └── t_requirement (AR)
  │                 │
  │                 └── t_test_case
  │
  └── t_requirement (LMT/IR/SR, via project field)
        │
        ├── parent_id FK → t_requirement (SR→IR, AR→SR)
        ├── ir_id FK → t_requirement (LMT→IR)
        └── iteration_id FK → t_iteration (AR→Iteration)

t_task ─── t_task_history
  │
  └── related_requirement_id FK → t_requirement

t_operation_log (target: project/version/iteration)
```

## Entities

### 1. t_user (用户)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK AUTO_INCREMENT | |
| username | VARCHAR(50) | UNIQUE NOT NULL | |
| email | VARCHAR(100) | UNIQUE NOT NULL | |
| password | VARCHAR(255) | NOT NULL | BCrypt hash |
| real_name | VARCHAR(50) | NULL | |
| enabled | TINYINT(1) | DEFAULT 1 | |
| created_at | DATETIME | DEFAULT NOW() | |

**Validation**: email 格式校验, password 长度 ≥ 6

---

### 2. t_project (项目)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK AUTO_INCREMENT | |
| name | VARCHAR(100) | NOT NULL | |
| code | VARCHAR(50) | UNIQUE NOT NULL | |
| finance_code | VARCHAR(50) | NULL | 财务编号 |
| owner | VARCHAR(50) | NULL | |
| manager | VARCHAR(50) | NULL | |
| start_date | DATE | NULL | |
| end_date | DATE | NULL | |
| status | VARCHAR(10) | DEFAULT '未开始' | 未开始/进行中/已完成/已暂停 |
| description | TEXT | NULL | |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |
| deleted | TINYINT(1) | DEFAULT 0 | 逻辑删除 |

**Validation**: name 必填, code 必填唯一, end_date ≥ start_date

---

### 3. t_version (版本)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK AUTO_INCREMENT | |
| product_name | VARCHAR(100) | NULL | |
| project_id | BIGINT | FK→t_project.id ON DELETE CASCADE | |
| version_number | VARCHAR(50) | NOT NULL | |
| start_date | DATE | NULL | |
| end_date | DATE | NULL | |
| status | VARCHAR(10) | DEFAULT '规划中' | 规划中/进行中/已发布 |
| description | TEXT | NULL | |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |
| deleted | TINYINT(1) | DEFAULT 0 | |

**Indexes**: idx_project_id

---

### 4. t_iteration (迭代)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK AUTO_INCREMENT | |
| name | VARCHAR(100) | NOT NULL | |
| project_id | BIGINT | FK→t_project.id | |
| product_name | VARCHAR(100) | NULL | |
| version_id | BIGINT | FK→t_version.id | |
| start_date | DATE | NULL | |
| end_date | DATE | NULL | |
| status | VARCHAR(10) | DEFAULT '规划中' | 规划中/进行中/已完成 |
| description | TEXT | NULL | |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |
| deleted | TINYINT(1) | DEFAULT 0 | |

**Indexes**: idx_project_id, idx_version_id

---

### 5. t_requirement (需求) — 核心表

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK AUTO_INCREMENT | |
| code | VARCHAR(32) | UNIQUE NOT NULL | LMT/IR/SR/AR-YYYY-NNN |
| name | VARCHAR(200) | NOT NULL | |
| type | VARCHAR(10) | NOT NULL | LMT / IR / SR / AR |
| customer | VARCHAR(100) | NOT NULL | |
| project | VARCHAR(100) | NULL | |
| expected_date | DATE | NOT NULL | |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |
| status | VARCHAR(10) | DEFAULT '待分析' | 待分析/进行中/已完成/已关闭 |
| priority | VARCHAR(5) | DEFAULT '中' | 高/中/低 |
| description | TEXT | NULL | |
| parent_id | BIGINT | FK→t_requirement.id | SR→IR, AR→SR |
| ir_id | BIGINT | FK→t_requirement.id | LMT 关联的 IR |
| iteration_id | BIGINT | FK→t_iteration.id | AR 所属迭代 |
| frontend | VARCHAR(50) | NULL | AR 前端负责人 |
| backend | VARCHAR(50) | NULL | AR 后端负责人 |
| tester | VARCHAR(50) | NULL | AR 测试负责人 |
| test_case_count | INT | DEFAULT 0 | 冗余字段 |
| deleted | TINYINT(1) | DEFAULT 0 | |

**Indexes**: uk_code, idx_type, idx_status, idx_priority, idx_parent_id, idx_ir_id, idx_iteration_id, idx_expected_date, idx_type_status, idx_created_at

**Type 约束**:
- LMT: parent_id=NULL, ir_id=NULL
- IR: parent_id=NULL, ir_id 可能有关联 LMT
- SR: parent_id→IR, type=SR
- AR: parent_id→SR (或直接 IR), type=AR

**State transitions (status)**:
```
待分析 → 进行中 → 已完成
  ↓        ↓        ↓
已关闭 ← ─ ┴ ─────── ┘
```

---

### 6. t_test_case (测试用例)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK AUTO_INCREMENT | |
| code | VARCHAR(32) | UNIQUE NOT NULL | TC-YYYY-NNN |
| name | VARCHAR(200) | NOT NULL | |
| status | VARCHAR(10) | DEFAULT '未执行' | 通过/失败/未执行 |
| priority | VARCHAR(5) | DEFAULT '中' | |
| executed_at | DATE | NULL | |
| ar_id | BIGINT | FK→t_requirement.id CASCADE | |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |
| deleted | TINYINT(1) | DEFAULT 0 | |

**Indexes**: idx_ar_id

**State transitions**: 未执行 → 通过 / 失败 (单向，不可回退)

---

### 7. t_task (任务)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK AUTO_INCREMENT | |
| code | VARCHAR(32) | UNIQUE NOT NULL | TASK-YYYY-NNN |
| name | VARCHAR(200) | NOT NULL | |
| type | VARCHAR(10) | NOT NULL | 需求/测试/临时/调研/支持 |
| assignee | VARCHAR(50) | NULL | |
| creator | VARCHAR(50) | NOT NULL | |
| deadline | DATE | NOT NULL | |
| created_at | DATETIME | DEFAULT NOW() | |
| updated_at | DATETIME | ON UPDATE NOW() | |
| status | VARCHAR(10) | DEFAULT '待分配' | 待分配/进行中/已完成/已关闭 |
| description | TEXT | NULL | |
| related_requirement_id | BIGINT | FK→t_requirement.id | |
| deleted | TINYINT(1) | DEFAULT 0 | |

**Indexes**: idx_type, idx_status, idx_assignee, idx_deadline, idx_creator

**State machine**:
```
待分配 ──(分配)──▶ 进行中 ──(完成)──▶ 已完成
   │                  │                  │
   └──(关闭)──────────┴──(关闭)──────────┘
                   已关闭 (终态)
```
- 待分配 → 进行中: 需要 assignee 不为空
- 已完成/已关闭: 不可再变更 (返回 400)

---

### 8. t_task_history (任务历史)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK AUTO_INCREMENT | |
| task_id | BIGINT | FK→t_task.id CASCADE | |
| action | VARCHAR(50) | NOT NULL | 创建/分配/状态变更/修改 |
| operator | VARCHAR(50) | NOT NULL | |
| timestamp | DATETIME | DEFAULT NOW() | |
| old_value | VARCHAR(500) | NULL | |
| new_value | VARCHAR(500) | NULL | |
| description | VARCHAR(500) | NULL | |

---

### 9. t_project_member (项目成员)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK AUTO_INCREMENT | |
| project_id | BIGINT | FK→t_project.id CASCADE | |
| name | VARCHAR(50) | NOT NULL | |
| role | VARCHAR(20) | NOT NULL | 负责人/项目经理/前端开发/后端开发/测试工程师/产品经理/架构师/UI设计师 |
| email | VARCHAR(100) | NULL | |
| phone | VARCHAR(20) | NULL | |
| created_at | DATETIME | DEFAULT NOW() | |

---

### 10. t_operation_log (操作日志)

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGINT | PK AUTO_INCREMENT | |
| target_type | VARCHAR(20) | NOT NULL | project/version/iteration |
| target_id | BIGINT | NOT NULL | |
| action | VARCHAR(50) | NOT NULL | 创建/编辑/删除/状态变更 |
| operator | VARCHAR(50) | NOT NULL | |
| timestamp | DATETIME | DEFAULT NOW() | |
| old_value | VARCHAR(500) | NULL | |
| new_value | VARCHAR(500) | NULL | |
| description | VARCHAR(500) | NULL | |

**Indexes**: idx_target (target_type, target_id)

## 编号生成规则

| Entity | Format | Example |
|--------|--------|---------|
| Requirement | `{TYPE}-{YEAR}-{NNN}` | LMT-2026-001 |
| TestCase | `TC-{YEAR}-{NNN}` | TC-2026-015 |
| Task | `TASK-{YEAR}-{NNN}` | TASK-2026-008 |

实现: `SELECT MAX(code) FROM t_xxx WHERE code LIKE 'PREFIX-YEAR-%'` → 序号+1 → 补零 3 位 → UNIQUE KEY 防并发冲突。并发场景下重试一次。

## 事务边界

| 方法 | 操作 |
|------|------|
| `convertLmtToIr()` | INSERT t_requirement (IR) + UPDATE t_requirement (LMT.ir_id) |
| `decompose()` | INSERT t_requirement × N (子需求) |
| `createTask()` | INSERT t_task + INSERT t_task_history |
| `assignTask()` | UPDATE t_task + INSERT t_task_history |
| `changeTaskStatus()` | UPDATE t_task + INSERT t_task_history |
| `createTestCase()` | INSERT t_test_case + UPDATE t_requirement.test_case_count |
| `deleteTestCase()` | DELETE t_test_case + UPDATE t_requirement.test_case_count |
| `addProjectMember()` | INSERT t_project_member + INSERT t_operation_log |
| `removeProjectMember()` | DELETE t_project_member + INSERT t_operation_log |
