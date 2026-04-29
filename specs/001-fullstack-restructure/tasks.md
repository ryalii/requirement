---
description: "Task list for 001-fullstack-restructure - Full-stack restructure of Requirement Management System"
---

# Tasks: 需求管理系统全栈重构

**Input**: Design documents from `/specs/001-fullstack-restructure/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/api-contracts.md, quickstart.md

**Tests**: No test tasks included (not requested in spec).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/main/java/com/company/requirement/`, `backend/src/main/resources/`
- **Frontend**: project root — `lib/`, `components/`, `app/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create `backend/` directory structure (`mkdir -p backend/src/main/java/com/company/requirement/{common,config,security,entity,dto/request,dto/response,controller,service,service/impl,mapper} backend/src/main/resources/db/`)
- [x] T002 Create `backend/pom.xml` with Spring Boot 3.2.5 parent, dependencies (MyBatis-Plus 3.5.9, JJWT 0.12.5, Hutool 5.8.28, MapStruct 1.5.5, Knife4j 4.5.0, MySQL connector), and Maven compiler plugin for Java 17
- [x] T003 Create `backend/src/main/resources/application.yml` (server.port=8080, datasource, mybatis-plus config) and `backend/src/main/resources/application-dev.yml` with dev profile overrides

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T004 Create `backend/src/main/resources/db/schema.sql` with CREATE TABLE for all 10 tables (t_user, t_project, t_version, t_iteration, t_requirement, t_test_case, t_task, t_task_history, t_project_member, t_operation_log) per data-model.md, plus indexes and initial admin user INSERT
- [ ] T005 [P] Create `backend/src/main/java/com/company/requirement/common/Result.java` (unified response `{code, message, data}`) and `PageResult.java` (`{page, pageSize, total, list}` wrapper extending Result)
- [ ] T006 [P] Create `backend/src/main/java/com/company/requirement/common/BusinessException.java` (with code field) and `GlobalExceptionHandler.java` (@RestControllerAdvice handling BusinessException→400, IllegalArgumentException→400, Exception→500)
- [ ] T007 [P] Create config classes in `backend/src/main/java/com/company/requirement/config/`: `CorsConfig.java` (allow localhost:3000), `MyBatisPlusConfig.java` (pagination, logic delete, table prefix `t_`), `JacksonConfig.java` (date format `yyyy-MM-dd HH:mm:ss`, timezone Asia/Shanghai), `WebMvcConfig.java`
- [ ] T008 Create `JwtUtil.java` (generate/validate/parse token, 24h expiry, HMAC-SHA256) and `LoginInterceptor.java` (extract token from Authorization header, skip `/auth/login`, set user info to request attribute) in `backend/src/main/java/com/company/requirement/security/`
- [ ] T009 Create `RequirementApplication.java` (@SpringBootApplication main class) in `backend/src/main/java/com/company/requirement/`
- [ ] T010 [P] Create all 10 entity classes in `backend/src/main/java/com/company/requirement/entity/`: `User.java`, `Requirement.java`, `TestCase.java`, `Task.java`, `TaskHistory.java`, `Project.java`, `Version.java`, `Iteration.java`, `ProjectMember.java`, `OperationLog.java` — all with @TableName, @TableId, @TableLogic annotations per MyBatis-Plus conventions
- [ ] T011 [P] Create all Mapper interfaces in `backend/src/main/java/com/company/requirement/mapper/`: `UserMapper.java`, `RequirementMapper.java`, `TestCaseMapper.java`, `TaskMapper.java`, `TaskHistoryMapper.java`, `ProjectMapper.java`, `VersionMapper.java`, `IterationMapper.java`, `ProjectMemberMapper.java`, `OperationLogMapper.java` — all extending BaseMapper
- [ ] T012 Create `CodeGenerator.java` in `backend/src/main/java/com/company/requirement/common/CodeGenerator.java` — generates unique codes (LMT/IR/SR/AR-YYYY-NNN, TASK-YYYY-NNN, TC-YYYY-NNN) using `SELECT MAX(code)` query pattern with retry on UNIQUE KEY conflict
- [ ] T013 Create `AuthController.java` in `backend/src/main/java/com/company/requirement/security/AuthController.java` with `POST /auth/login` (validate email+password, return JWT token + user info) and `GET /auth/me` (return current user from token)
- [ ] T014 Create `backend/src/main/java/com/company/requirement/config/RequestLoggingFilter.java` — implement jakarta.servlet.Filter that logs HTTP method, request URI, response status, and processing duration for every API request (FR-027). Register in WebMvcConfig.
- [ ] T015 Create `lib/api/client.ts` — unified HTTP client with auto-attach JWT token from localStorage, 401 → clear token + redirect to /login, 409 conflict error propagation, unified error handling, base URL from `NEXT_PUBLIC_API_BASE` env var (default `http://localhost:8080/api/v1`)

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel. All JWT auth, DB schema, CORS, unified response format, entity mapping, and request logging are in place.

---

## Phase 3: User Story 1 - 后端数据持久化与REST API (Priority: P1) 🎯 MVP

**Goal**: Complete Spring Boot backend with all REST APIs — requirements, tasks, projects, versions, iterations, test cases, workspace. All data persisted to MySQL, accessed via standard REST endpoints with JWT auth.

**Independent Test**: Start backend (`mvn spring-boot:run` from backend/), call `POST /api/v1/auth/login` to get token, then verify CRUD on each resource via curl/Postman. Check MySQL database for persisted records.

### Implementation for User Story 1

**Requirement module**:

- [ ] T016 [P] [US1] Create Requirement DTOs: `dto/request/RequirementCreateRequest.java`, `RequirementUpdateRequest.java`, `ConvertToIrRequest.java`, `DecomposeRequest.java`; `dto/response/RequirementVO.java`, `RequirementTreeVO.java`, `RequirementAncestorVO.java`
- [ ] T017 [US1] Create `RequirementService` interface in `service/RequirementService.java` and `RequirementServiceImpl` in `service/impl/RequirementServiceImpl.java` — implement CRUD, list with filters (type/status/keyword searching name+code+description via LIKE) & pagination, convert-to-ir (transactional INSERT + UPDATE), decompose (batch INSERT sub-requirements), tree (recursive children query), children list, ancestors chain, CSV export with BOM
- [ ] T018 [US1] Create `RequirementController.java` in `controller/RequirementController.java` with endpoints: GET /requirements (paginated list), GET /requirements/{id} (detail), POST /requirements (create), PUT /requirements/{id} (update), DELETE /requirements/{id} (logic), POST /requirements/{id}/convert-to-ir, POST /requirements/{id}/decompose, GET /requirements/{id}/tree, GET /requirements/{id}/children, GET /requirements/{id}/ancestors, GET /requirements/export (CSV)

**Task module**:

- [ ] T019 [P] [US1] Create Task DTOs: `dto/request/TaskCreateRequest.java`, `TaskUpdateRequest.java`, `TaskAssignRequest.java`, `TaskStatusRequest.java`; `dto/response/TaskVO.java`, `TaskStatsVO.java`, `TaskHistoryVO.java`
- [ ] T020 [US1] Create `TaskService` in `service/TaskService.java` / `service/impl/TaskServiceImpl.java` and `TaskController.java` in `controller/` — implement CRUD, list with filters (type/status/keyword searching name+code+description/assignee) & sorting & pagination, stats (total/pending/inProgress/completed/overdue), assign (待分配→进行中 + TaskHistory), status change (state machine validation + TaskHistory), histories, CSV export

**Project module**:

- [ ] T021 [P] [US1] Create Project DTOs: `dto/request/ProjectCreateRequest.java`, `ProjectUpdateRequest.java`, `AddMemberRequest.java`; `dto/response/ProjectVO.java`, `ProjectDetailVO.java`, `ProjectTreeVO.java`, `ProjectMemberVO.java`, `OperationLogVO.java`
- [ ] T022 [US1] Create `ProjectService` in `service/ProjectService.java` / `service/impl/ProjectServiceImpl.java` and `ProjectController.java` in `controller/` — implement CRUD, list with aggregate counts (versionCount/iterationCount/memberCount/requirementCount), detail with members+logs, tree (Version→Iteration→AR), member management (add/remove with OperationLog), logs query, CSV export

**TestCase module**:

- [ ] T023 [P] [US1] Create TestCase DTOs: `dto/request/TestCaseCreateRequest.java`, `TestCaseUpdateRequest.java`, `TestCaseStatusRequest.java`, `BatchStatusRequest.java`, `BatchDeleteRequest.java`; `dto/response/TestCaseVO.java`, `TestCaseStatsVO.java`
- [ ] T024 [US1] Create `TestCaseService` in `service/TestCaseService.java` / `service/impl/TestCaseServiceImpl.java` and `TestCaseController.java` in `controller/` — implement CRUD under AR, list, stats (total/passed/failed/pending, passRate, executionRate), single/batch status update, batch delete, update t_requirement.test_case_count on create/delete

**Version module**:

- [ ] T025 [US1] Create Version DTOs, `VersionService`, and `VersionController.java` — implement CRUD, list with projectId/status/keyword (searching name+description) filters & pagination, detail with stats+iterations+logs, iterations list with AR summary, stats endpoint, logs query, CSV export

**Iteration module**:

- [ ] T026 [US1] Create Iteration DTOs, `IterationService`, and `IterationController.java` — implement CRUD, list with projectId/versionId/status/keyword (searching name+description) filters & pagination, detail with AR list+stats+logs, ARs list, stats endpoint, logs query, CSV export

**Workspace module**:

- [ ] T027 [US1] Create `WorkspaceController.java` in `controller/WorkspaceController.java` — implement GET /workspace/urgent-requirements (exclude 已完成/已关闭, sort by priority DESC + expectedDate ASC, limit param default 8) and GET /workspace/overdue-tasks (deadline < today, exclude 已完成/已关闭)

**Checkpoint**: All backend REST APIs complete — User Story 1 should be fully functional and independently testable via curl/Postman

---

## Phase 4: User Story 2 - 前端 API 对接 (Priority: P2)

**Goal**: Frontend migrates from `lib/mock-data.ts` to calling backend REST APIs. All pages fetch real data, CRUD operations persist to MySQL via API. Login uses JWT authentication.

**Independent Test**: Start backend + frontend, log in, create/edit/delete requirements, tasks, projects in browser. Refresh page — data persists. Inspect network tab — all requests go to `localhost:8080/api/v1`.

### Implementation for User Story 2

**API client modules**:

- [x] T028 [P] [US2] Create `lib/api/auth.ts` — `login(email, password)` returns token+user, `getMe()` returns current user, store token in localStorage, expose `isAuthenticated()` and `getToken()` helpers
- [x] T029 [P] [US2] Create `lib/api/requirements.ts` — `listRequirements(params)`, `getRequirement(id)`, `createRequirement(data)`, `updateRequirement(id, data)`, `deleteRequirement(id)`, `convertToIr(id, data)`, `decompose(id, items)`, `getRequirementTree(id)`, `getChildren(id)`, `getAncestors(id)`, `exportRequirements(params)` — all returning typed Promise with error handling
- [x] T030 [P] [US2] Create `lib/api/tasks.ts` — `listTasks(params)`, `getTaskStats()`, `getTask(id)`, `createTask(data)`, `updateTask(id, data)`, `deleteTask(id)`, `assignTask(id, assignee)`, `changeTaskStatus(id, status)`, `getTaskHistories(id)`, `exportTasks(params)`
- [x] T031 [P] [US2] Create `lib/api/projects.ts` — `listProjects(params)`, `getProject(id)`, `createProject(data)`, `updateProject(id, data)`, `deleteProject(id)`, `getProjectTree(id)`, `getProjectMembers(id)`, `addProjectMember(id, data)`, `removeProjectMember(id, memberId)`, `getProjectLogs(id)`, `exportProjects(params)`
- [x] T032 [P] [US2] Create `lib/api/versions.ts` — `listVersions(params)`, `getVersion(id)`, `createVersion(data)`, `updateVersion(id, data)`, `deleteVersion(id)`, `getVersionIterations(id)`, `getVersionStats(id)`, `getVersionLogs(id)`, `exportVersions(params)`
- [x] T033 [P] [US2] Create `lib/api/iterations.ts` — `listIterations(params)`, `getIteration(id)`, `createIteration(data)`, `updateIteration(id, data)`, `deleteIteration(id)`, `getIterationArs(id)`, `getIterationStats(id)`, `getIterationLogs(id)`, `exportIterations(params)`
- [x] T034 [P] [US2] Create `lib/api/workspace.ts` — `getUrgentRequirements(limit?)`, `getOverdueTasks()`

**Page migrations**:

- [x] T035 [US2] Rewrite `app/login/page.tsx` — replace hardcoded validation with real `auth.login()` call, store token in localStorage on success, redirect to /workspace, display API error messages on failure
- [x] T036 [US2] Rewrite `app/requirements/page.tsx` and `components/requirements-table.tsx` — replace mock-data imports with API calls (listRequirements with server-side filtering/pagination), add loading/error/empty states, wire create/edit/delete to API, update `components/requirement-form-dialog.tsx` and `components/requirement-history-dialog.tsx`
- [x] T037 [US2] Rewrite `app/requirements/[id]/page.tsx`, `components/requirement-tree.tsx`, `components/test-cases-table.tsx`, `components/convert-to-ir-dialog.tsx`, `components/decompose-dialog.tsx` — replace mock-data with API calls, wire decomposition and conversion flows
- [x] T038 [US2] Rewrite `app/tasks/page.tsx` and related components — replace mock-data with API calls using server-side filtering/sorting/pagination, wire CRUD + assign + status change to API
- [x] T039 [US2] Rewrite `app/projects/page.tsx`, `app/projects/[id]/page.tsx`, `app/projects/versions/[id]/page.tsx`, `app/projects/iterations/[id]/page.tsx` and related components — replace mock-data with API calls, wire project CRUD + member management + tree rendering

**Checkpoint**: At this point, User Stories 1 AND 2 should both work — all data is real and persisted

---

## Phase 5: User Story 3 - 前端 UI 企业级重设计 (Priority: P3)

**Goal**: Upgrade all frontend UI to enterprise SaaS CRM style — new layout shell, KPI cards, kanban boards, charts, animations, responsive design.

**Independent Test**: Browse all pages in browser at 1920px, 1366px, and 375px widths. Verify navbar, sidebar, KPI cards, kanban, charts render correctly. Test sidebar collapse, responsive hamburger menu, card hover effects.

### Implementation for User Story 3

**UI components**:

- [x] T040 [P] [US3] Create `components/ui/kpi-card.tsx`, `components/ui/stat-card.tsx`, `components/ui/page-header.tsx`, `components/ui/empty-state.tsx`, `components/ui/loading-skeleton.tsx`, `components/ui/error-state.tsx`
- [x] T041 [P] [US3] Create chart components in `components/charts/`: `line-chart.tsx` (recharts LineChart with gradient fill), `donut-chart.tsx` (recharts PieChart with center label), `sparkline.tsx` (mini trend line)
- [x] T042 [P] [US3] Create `components/ui/kanban-board.tsx` (column layout with drag-and-drop via framer-motion) and `components/ui/kanban-card.tsx` (card with code, name, priority badge, due date)
- [x] T043 [P] [US3] Create `components/ui/timeline.tsx` (vertical timeline for workspace/activity) and `components/ui/bento-grid.tsx` (magazine-style grid layout for dashboard)
- [x] T044 [P] [US3] Install `framer-motion` and `cmdk` frontend dependencies via pnpm

**Layout shell**:

- [x] T045 [US3] Refactor `components/admin-layout.tsx` — extract `components/navbar.tsx` (fixed top bar with Logo, nav links, ⌘K search trigger searching page routes + requirement/task/project names and codes, notification icon [click shows "暂无通知" empty state only, no backend], user-dropdown), `components/sidebar.tsx` (collapsible left sidebar with context-sensitive menu, narrow/wide states with animation), `components/user-dropdown.tsx` (avatar + dropdown with profile/logout), `components/search-command.tsx` (⌘K global command palette using cmdk searching routes + entity names/codes)

**Page rewrites**:

- [x] T046 [US3] Rewrite `app/workspace/page.tsx` — bento-grid layout with KPI cards row (4 stat cards: total requirements, in-progress count, completion rate, overdue tasks), charts section (line chart for requirement trends, donut chart for type distribution), urgent requirements list, activity timeline
- [x] T047 [US3] Rewrite `app/requirements/page.tsx` — add table/kanban view toggle via tabs, kanban view with columns by status (待分析/进行中/已完成/已关闭), drag-and-drop cards to change status, card hover animations via framer-motion
- [ ] T048 [US3] Rewrite `app/requirements/[id]/page.tsx` — add breadcrumb navigation (ancestors chain from API), requirement info card, recursive tree with expand/collapse animation, test case stats progress bar
- [ ] T049 [US3] Rewrite `app/tasks/page.tsx` — add kanban/table toggle, kanban view with columns by status (待分配/进行中/已完成/已关闭), task stats overview cards, drag-and-drop status change
- [ ] T050 [US3] Rewrite `app/projects/page.tsx` — card grid layout for project list, each card shows name, financeCode, versionCount/iterationCount/memberCount/requirementCount badges, status label
- [ ] T051 [US3] Rewrite `app/projects/[id]/page.tsx` — tabbed layout (Overview/Versions/Iterations/Members/Logs), versions and iterations as collapsible tree
- [x] T052 [US3] Implement responsive layout across all pages — sidebar auto-collapse at <1024px, hamburger menu at <768px, KPI cards full-width stacked on mobile, tables→card list on mobile, add framer-motion page transitions

**Checkpoint**: All user stories should now be independently functional with full enterprise UI

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T053 [P] Handle edge cases: network error → error-state with retry; delete last item on page → auto-return to previous page; concurrent edit conflicts → catch 409 from API and display "数据已被其他用户修改，请刷新后重试"; CSV export >10000 rows → streaming download with progress feedback; token expiry → auto-redirect to /login (not infinite loop)
- [x] T054 Run `quickstart.md` validation — start backend + frontend, verify login, CRUD on all entities, CSV export, responsive layout at 1920/1366/375px
- [x] T055 Code cleanup — remove any leftover dead code, verify all `console.log` debug statements removed, confirm `mock-data.ts` is preserved but deprecated

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational — No dependencies on other stories
- **User Story 2 (Phase 4)**: Depends on Foundational + US1 — cannot start until backend APIs exist
- **User Story 3 (Phase 5)**: Depends on Foundational — Can start in parallel with US1/US2 (different files), but logically after API integration for full visual effect
- **Polish (Phase 6)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — No dependencies on other stories
- **User Story 2 (P2)**: Depends on US1 — backend APIs must exist before frontend can consume them
- **User Story 3 (P3)**: Can start after Foundational — independently implementable, new components are drop-in replacements for existing ones

### Within Each User Story

- DTOs before services
- Services before controllers
- API client modules before page rewrites
- UI components before page integration
- Core implementation before polish

### Parallel Opportunities

- All Phase 2 Foundational tasks marked [P] can run in parallel (entities, mappers, config, common classes)
- Within US1: all DTO creation tasks can run in parallel; all controller+service pairs for different entities can run in parallel (Requirement, Task, Project, TestCase, Version, Iteration, Workspace)
- Within US2: all API client modules can run in parallel; page rewrites for different routes can run in parallel
- Within US3: all UI components can run in parallel; page rewrites can run in parallel once components are available

---

## Parallel Example: User Story 1

```bash
# Launch all DTO creation tasks together:
Task: "Create Requirement DTOs" (T016)
Task: "Create Task DTOs" (T019)
Task: "Create Project DTOs" (T021)
Task: "Create TestCase DTOs" (T023)

# Launch all Service+Controller pairs together:
Task: "Requirement Service + Controller" (T017, T018)
Task: "Task Service + Controller" (T020)
Task: "Project Service + Controller" (T022)
Task: "TestCase Service + Controller" (T024)
Task: "Version Service + Controller" (T025)
Task: "Iteration Service + Controller" (T026)
Task: "Workspace Controller" (T027)
```

## Parallel Example: User Story 2

```bash
# Launch all API client modules together:
Task: "auth.ts" (T028)
Task: "requirements.ts" (T029)
Task: "tasks.ts" (T030)
Task: "projects.ts" (T031)
Task: "versions.ts" (T032)
Task: "iterations.ts" (T033)
Task: "workspace.ts" (T034)

# Launch page rewrites together:
Task: "Login page" (T035)
Task: "Requirements pages" (T036, T037)
Task: "Tasks page" (T038)
Task: "Projects pages" (T039)
```

## Parallel Example: User Story 3

```bash
# Launch all UI primitive components together:
Task: "kpi-card, stat-card, page-header, etc." (T040)
Task: "Chart components" (T041)
Task: "kanban-board, kanban-card" (T042)
Task: "timeline, bento-grid" (T043)
Task: "Install framer-motion, cmdk" (T044)

# Launch layout rewrite + page rewrites together:
Task: "Layout shell (navbar, sidebar, etc.)" (T045)
Task: "Workspace page" (T046)
Task: "Requirements page + detail" (T047, T048)
Task: "Tasks page" (T049)
Task: "Projects page + detail" (T050, T051)
Task: "Responsive layout" (T052)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1 (all backend APIs)
4. **STOP and VALIDATE**: Test backend APIs independently via curl/Postman
5. Verify MySQL has persisted data

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Backend APIs) → Test independently (MVP!)
3. Add User Story 2 (Frontend API integration) → Test independently
4. Add User Story 3 (UI redesign) → Test independently
5. Polish → Final validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: Phase 3 (US1 — Backend) — all controllers/services
   - Developer B: Phase 5 (US3 — UI Components) — all new components
3. After US1 completes:
   - Developer A: Phase 4 (US2 — API integration)
   - Developer B: Phase 5 (US3 — Page rewrites with new UI)
4. Final integration and polish together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
