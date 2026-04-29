# 需求管理系统 - 技术栈 & 后端架构 (Spring Boot + MySQL)

---

## 1. 技术选型

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | Spring Boot | 3.2.5 | Jakarta EE, Java 17+ |
| ORM | MyBatis-Plus | 3.5.9 | 增强MyBatis，自带分页/逻辑删除/代码生成 |
| 数据库 | MySQL | 8.0+ | utf8mb4 字符集 |
| 连接池 | HikariCP | (内置) | |
| 认证 | JJWT | 0.12.5 | JWT |
| 校验 | Jakarta Validation | (内置) | @Valid + 注解 |
| API文档 | Knife4j | 4.5.0 | OpenAPI 3.0 / Swagger UI, 中文支持 |
| 工具库 | Hutool | 5.8.28 | CSV(BOM)、日期、ID生成 |
| 对象转换 | MapStruct | 1.5.5.Final | Entity ↔ VO 编译期转换 |
| 代码简化 | Lombok | latest | @Data, @Builder 等 |
| 构建 | Maven | 3.9+ | 或 Gradle 8.x |

---

## 2. 项目结构

```
requirement-server/
├── pom.xml
└── src/main/
    ├── java/com/company/requirement/
    │   ├── RequirementApplication.java                # @SpringBootApplication
    │   ├── common/                                     # 通用层
    │   │   ├── Result.java                             # { code, message, data }
    │   │   ├── PageResult.java                         # { page, pageSize, total, list }
    │   │   ├── BusinessException.java                  # 自定义异常
    │   │   ├── GlobalExceptionHandler.java             # @RestControllerAdvice
    │   │   └── CodeGenerator.java                      # 编号生成
    │   ├── config/                                     # 配置
    │   │   ├── CorsConfig.java
    │   │   ├── MyBatisPlusConfig.java
    │   │   ├── JacksonConfig.java
    │   │   └── WebMvcConfig.java
    │   ├── security/                                   # 认证
    │   │   ├── AuthController.java
    │   │   ├── JwtUtil.java
    │   │   └── LoginInterceptor.java
    │   ├── entity/                                     # 实体 (10个)
    │   │   ├── Requirement.java
    │   │   ├── TestCase.java
    │   │   ├── Task.java
    │   │   ├── TaskHistory.java
    │   │   ├── Project.java
    │   │   ├── Version.java
    │   │   ├── Iteration.java
    │   │   ├── ProjectMember.java
    │   │   ├── OperationLog.java
    │   │   └── User.java
    │   ├── dto/request/                                # 入参
    │   │   ├── RequirementCreateRequest.java
    │   │   ├── RequirementQueryRequest.java
    │   │   ├── ConvertToIRRequest.java
    │   │   ├── DecomposeRequest.java
    │   │   ├── TaskCreateRequest.java
    │   │   ├── TaskQueryRequest.java
    │   │   ├── TaskAssignRequest.java
    │   │   ├── TaskStatusRequest.java
    │   │   └── ...
    │   ├── dto/response/                               # 出参 (VO)
    │   │   ├── RequirementVO.java
    │   │   ├── RequirementDetailVO.java
    │   │   ├── RequirementTreeNodeVO.java
    │   │   ├── TaskVO.java
    │   │   ├── TaskStatsVO.java
    │   │   ├── ProjectVO.java
    │   │   ├── ProjectTreeVO.java
    │   │   ├── VersionVO.java
    │   │   ├── IterationVO.java
    │   │   ├── ARDetailVO.java
    │   │   ├── TestCaseVO.java
    │   │   ├── TestCaseStatsVO.java
    │   │   └── ...
    │   ├── controller/                                 # 控制器 (8个)
    │   │   ├── AuthController.java
    │   │   ├── RequirementController.java
    │   │   ├── TestCaseController.java
    │   │   ├── TaskController.java
    │   │   ├── ProjectController.java
    │   │   ├── VersionController.java
    │   │   ├── IterationController.java
    │   │   └── WorkspaceController.java
    │   ├── service/                                    # 接口 (10个)
    │   │   ├── RequirementService.java
    │   │   ├── TestCaseService.java
    │   │   ├── TaskService.java
    │   │   ├── TaskHistoryService.java
    │   │   ├── ProjectService.java
    │   │   ├── VersionService.java
    │   │   ├── IterationService.java
    │   │   ├── ProjectMemberService.java
    │   │   ├── OperationLogService.java
    │   │   └── WorkspaceService.java
    │   ├── service/impl/                               # 实现 (10个)
    │   └── mapper/                                     # Mapper (10个)
    │       ├── RequirementMapper.java
    │       ├── TestCaseMapper.java
    │       ├── TaskMapper.java
    │       ├── TaskHistoryMapper.java
    │       ├── ProjectMapper.java
    │       ├── VersionMapper.java
    │       ├── IterationMapper.java
    │       ├── ProjectMemberMapper.java
    │       ├── OperationLogMapper.java
    │       └── UserMapper.java
    └── resources/
        ├── application.yml
        ├── application-dev.yml
        └── db/schema.sql
```

---

## 3. 数据库设计 (10张表)

### 建表顺序
```
t_user → t_project → t_version → t_iteration → t_requirement
→ t_test_case → t_task → t_task_history → t_project_member → t_operation_log
```

### 3.1 t_requirement (核心表)

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK AUTO_INCREMENT | |
| code | VARCHAR(32) UNIQUE NOT NULL | LMT/IR/SR/AR-YYYY-NNN |
| name | VARCHAR(200) NOT NULL | |
| type | VARCHAR(10) NOT NULL | LMT/IR/SR/AR |
| customer | VARCHAR(100) NOT NULL | |
| project | VARCHAR(100) NULL | |
| expected_date | DATE NOT NULL | |
| created_at | DATETIME DEFAULT NOW() | |
| updated_at | DATETIME ON UPDATE NOW() | |
| status | VARCHAR(10) DEFAULT '待分析' | 待分析/进行中/已完成/已关闭 |
| priority | VARCHAR(5) DEFAULT '中' | 高/中/低 |
| description | TEXT NULL | |
| parent_id | BIGINT NULL FK→t_requirement.id | SR→IR, AR→SR |
| ir_id | BIGINT NULL FK→t_requirement.id | LMT关联的IR |
| iteration_id | BIGINT NULL FK→t_iteration.id | AR所属迭代 |
| frontend | VARCHAR(50) NULL | AR前端负责人 |
| backend | VARCHAR(50) NULL | AR后端负责人 |
| tester | VARCHAR(50) NULL | AR测试负责人 |
| test_case_count | INT DEFAULT 0 | AR测试用例数(冗余) |
| deleted | TINYINT(1) DEFAULT 0 | 逻辑删除 |

**索引:** uk_code, idx_type, idx_status, idx_priority, idx_parent_id, idx_ir_id, idx_iteration_id, idx_expected_date, idx_type_status, idx_created_at

### 3.2 t_test_case

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | |
| code | VARCHAR(32) UNIQUE | TC-YYYY-NNN |
| name | VARCHAR(200) NOT NULL | |
| status | VARCHAR(10) DEFAULT '未执行' | 通过/失败/未执行 |
| priority | VARCHAR(5) DEFAULT '中' | |
| executed_at | DATE NULL | |
| ar_id | BIGINT FK→t_requirement.id CASCADE | |
| created_at / updated_at | DATETIME | |
| deleted | TINYINT(1) DEFAULT 0 | |

### 3.3 t_task

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | |
| code | VARCHAR(32) UNIQUE | TASK-YYYY-NNN |
| name | VARCHAR(200) NOT NULL | |
| type | VARCHAR(10) | 需求/测试/临时/调研/支持 |
| assignee | VARCHAR(50) NULL | |
| creator | VARCHAR(50) NOT NULL | |
| deadline | DATE NOT NULL | |
| created_at / updated_at | DATETIME | |
| status | VARCHAR(10) DEFAULT '待分配' | 待分配/进行中/已完成/已关闭 |
| description | TEXT NULL | |
| related_requirement_id | BIGINT FK→t_requirement.id | |
| deleted | TINYINT(1) DEFAULT 0 | |

**索引:** idx_type, idx_status, idx_assignee, idx_deadline, idx_creator

### 3.4 t_task_history

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | |
| task_id | BIGINT FK→t_task.id CASCADE | |
| action | VARCHAR(50) | 创建/分配/状态变更/修改 |
| operator | VARCHAR(50) | |
| timestamp | DATETIME DEFAULT NOW() | |
| old_value | VARCHAR(500) NULL | |
| new_value | VARCHAR(500) NULL | |
| description | VARCHAR(500) NULL | |

### 3.5 t_project

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | |
| name | VARCHAR(100) NOT NULL | |
| code | VARCHAR(50) UNIQUE | |
| finance_code | VARCHAR(50) | |
| owner | VARCHAR(50) | |
| manager | VARCHAR(50) | |
| start_date / end_date | DATE | |
| status | VARCHAR(10) DEFAULT '未开始' | 进行中/已完成/已暂停/未开始 |
| description | TEXT NULL | |
| created_at / updated_at | DATETIME | |
| deleted | TINYINT(1) DEFAULT 0 | |

### 3.6 t_version

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | |
| product_name | VARCHAR(100) | |
| project_id | BIGINT FK→t_project.id CASCADE | |
| version_number | VARCHAR(50) | |
| start_date / end_date | DATE | |
| status | VARCHAR(10) DEFAULT '规划中' | 进行中/已发布/规划中 |
| description | TEXT NULL | |
| created_at / updated_at | DATETIME | |
| deleted | TINYINT(1) DEFAULT 0 | |

### 3.7 t_iteration

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | |
| name | VARCHAR(100) | |
| project_id | BIGINT FK→t_project.id | |
| product_name | VARCHAR(100) | |
| version_id | BIGINT FK→t_version.id | |
| start_date / end_date | DATE | |
| status | VARCHAR(10) DEFAULT '规划中' | 进行中/已完成/规划中 |
| description | TEXT NULL | |
| created_at / updated_at | DATETIME | |
| deleted | TINYINT(1) DEFAULT 0 | |

### 3.8 t_project_member

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | |
| project_id | BIGINT FK→t_project.id CASCADE | |
| name | VARCHAR(50) | |
| role | VARCHAR(20) | 负责人/项目经理/前端开发/后端开发/测试工程师/产品经理/架构师/UI设计师 |
| email | VARCHAR(100) NULL | |
| phone | VARCHAR(20) NULL | |
| created_at | DATETIME DEFAULT NOW() | |

### 3.9 t_operation_log

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | |
| target_type | VARCHAR(20) | project/version/iteration |
| target_id | BIGINT | |
| action | VARCHAR(50) | |
| operator | VARCHAR(50) | |
| timestamp | DATETIME DEFAULT NOW() | |
| old_value | VARCHAR(500) NULL | |
| new_value | VARCHAR(500) NULL | |
| description | VARCHAR(500) | |

**索引:** idx_target (target_type, target_id)

### 3.10 t_user

| 列名 | 类型 | 说明 |
|------|------|------|
| id | BIGINT PK | |
| username | VARCHAR(50) UNIQUE | |
| email | VARCHAR(100) UNIQUE | |
| password | VARCHAR(255) | BCrypt |
| real_name | VARCHAR(50) NULL | |
| enabled | TINYINT(1) DEFAULT 1 | |
| created_at | DATETIME DEFAULT NOW() | |

初始数据: `INSERT INTO t_user (username, email, password, real_name) VALUES ('admin', 'admin@example.com', '{bcrypt_hash}', '管理员');`

---

## 4. 关键配置

### application.yml

```yaml
server:
  port: 8080

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/requirement_db?useUnicode=true&characterEncoding=utf8mb4&serverTimezone=Asia/Shanghai&useSSL=false&allowPublicKeyRetrieval=true
    username: root
    password: ${DB_PASSWORD}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jackson:
    date-format: yyyy-MM-dd
    time-zone: Asia/Shanghai
    serialization:
      write-dates-as-timestamps: false

mybatis-plus:
  global-config:
    db-config:
      logic-delete-field: deleted
      logic-delete-value: 1
      logic-not-delete-value: 0
      table-prefix: t_
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

knife4j:
  enable: true
  setting:
    language: zh-CN

jwt:
  secret: ${JWT_SECRET:requirement-system-secret-key-2024}
  expiration: 86400000
```

### CORS
```
允许 origin: localhost:3000 (Next.js 前端)
允许 methods: GET,POST,PUT,DELETE,PATCH,OPTIONS
允许 headers: *
allowCredentials: true
```

### MyBatis-Plus 要点
- `table-prefix: t_` → 实体类 `Requirement` 自动映射 `t_requirement`
- `logic-delete-field: deleted` → 查询自动加 `deleted=0`，删除变 UPDATE
- `map-underscore-to-camel-case: true` → `parent_id` ↔ `parentId`

---

## 5. 编号生成规则

| 实体 | 格式 | 示例 |
|------|------|------|
| Requirement | `{TYPE}-{YEAR}-{序号3位}` | LMT-2024-001 |
| TestCase | `TC-{YEAR}-{序号3位}` | TC-2024-015 |
| Task | `TASK-{YEAR}-{序号3位}` | TASK-2024-008 |

实现: `SELECT MAX(code) FROM t_xxx WHERE code LIKE 'PREFIX-YEAR-%'` → 序号+1 → 补零至3位 → UNIQUE KEY 防并发。

---

## 6. 事务边界

需 `@Transactional(rollbackFor = Exception.class)` 的方法:

| 方法 | 涉及操作 |
|------|----------|
| RequirementService.convertLmtToIr() | 插IR + 更LMT.ir_id |
| RequirementService.decompose() | 批量插子需求 |
| TaskService.createTask() | 插Task + 插TaskHistory |
| TaskService.assignTask() | 更Task + 插TaskHistory |
| TaskService.changeTaskStatus() | 更Task + 插TaskHistory |
| TestCaseService.createTestCase() | 插TestCase + 更test_case_count |
| TestCaseService.deleteTestCase() | 删TestCase + 更test_case_count |
| ProjectMemberService.addMember/removeMember() | 成员变更 + 插OperationLog |

---

## 7. 任务状态机

```
待分配 ──(分配)──▶ 进行中 ──(完成)──▶ 已完成
   │                  │                  │
   └──(关闭)──────────┴──(关闭)──────────┘
                   已关闭 (终态)
```
已关闭/已完成不可再变更，返回 400。

---

## 8. 实现阶段

| 阶段 | 内容 |
|------|------|
| 一 | 建表、项目骨架、通用类、配置、Mock JWT认证、需求CRUD、任务CRUD、测试用例CRUD |
| 二 | LMT转IR、需求拆解、IR需求树、链路追溯、任务分配/状态变更、任务历史、CSV导出 |
| 三 | 项目/版本/迭代CRUD(含统计)、成员管理、操作日志、项目树 |
| 四 | 工作台接口、性能优化、前端对接 |

---

## 9. 前端对接要点

1. 创建 `lib/api/client.ts` 统一HTTP客户端（自动带Token、401跳转登录）
2. 创建模块化API文件替代 `lib/mock-data.ts` 导入：
   - `lib/api/requirements.ts` 替代 `getAllRequirements()`, `getRequirementById()`, `buildIRTree()` 等
   - `lib/api/tasks.ts` 替代 `getAllTasks()`, `getTaskHistories()` 等
   - `lib/api/projects.ts` 替代 `getAllProjects()`, `getProjectMembers()` 等
   - `lib/api/versions.ts` / `lib/api/iterations.ts` 替代对应mock函数
3. 分页/筛选/排序从客户端移到服务端（传查询参数而非客户端slice/filter）
4. 登录成功后 JWT Token 存 localStorage，所有请求带 `Authorization: Bearer <token>`
