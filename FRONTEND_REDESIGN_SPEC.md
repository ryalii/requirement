# 前端改造规格说明 — API对接 + UI重设计

> 本文档描述将当前 Next.js 前端从内存 mock 数据迁移到标准 REST API，并升级 UI 为企业级 SaaS 风格的全部改造要点。
> 配合 `REST_API_SPEC.md` 和 `TECH_STACK.md` 使用。

---

# 第一部分：API 对接改造

## 1. 总览

### 改造范围
当前所有数据来自 `lib/mock-data.ts`（同步函数调用，纯内存），需全部替换为对 `http://localhost:8080/api/v1` 的异步 HTTP 请求。

### 改造原则
- 每个 `lib/mock-data.ts` 中的导出函数 → `lib/api/<module>.ts` 中的对应异步函数
- 所有 `useEffect(() => { setXxx(getAllXxx()) }, [])` → `useEffect(() => { fetchXxx().then(setXxx) }, [依赖])`
- 客户端分页/筛选/排序 → 服务端查询参数
- 组件内直接 `console.log` 的 CRUD → API POST/PUT/DELETE + 成功后 refresh
- 登录从 localStorage 硬编码 → JWT Token 管理

---

## 2. 新建文件清单

### 2.1 `lib/api/client.ts` — HTTP 客户端

```
导出的职责：
- API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8080/api/v1'
- 统一的 request<T>(method, path, options?): Promise<T> 函数
- 自动从 localStorage 读取 token 并附加 Authorization: Bearer <token>
- 响应拦截：若 res.data.code !== 200 抛出错误（携带 message）
- 若收到 401 状态码 → 清除 token → 跳转 /login
- 若收到 404 → 抛出 "资源不存在"
- GET 请求将 params 对象转为 URL query string
- POST/PUT/PATCH 自动设置 Content-Type: application/json
```

### 2.2 模块化 API 文件

#### `lib/api/auth.ts`
```typescript
login(email: string, password: string): Promise<{ token: string; user: UserVO }>
getMe(): Promise<UserVO>
logout(): void  // 清除 localStorage token
```

#### `lib/api/requirements.ts`
```typescript
// 列表 → 替代 getAllRequirements()
fetchRequirements(params: {
  type?: string; status?: string; keyword?: string;
  page?: number; pageSize?: number;
}): Promise<PageResult<RequirementVO>>

// 详情 → 替代 getRequirementById()
fetchRequirement(id: string | number): Promise<RequirementDetailVO>

// 创建
createRequirement(data: RequirementCreateRequest): Promise<RequirementVO>

// 编辑
updateRequirement(id: string | number, data: RequirementUpdateRequest): Promise<RequirementVO>

// 删除
deleteRequirement(id: string | number): Promise<void>

// LMT转IR → 替代 ConvertToIRDialog 中的 console.log
convertToIR(id: string | number, data: ConvertToIRRequest): Promise<RequirementVO>

// 拆解 → 替代 DecomposeDialog 中的 console.log
decompose(id: string | number, data: DecomposeRequest): Promise<RequirementVO[]>

// 需求树 → 替代 buildIRTree()
fetchRequirementTree(irId: string | number): Promise<RequirementTreeNodeVO>

// 子需求 → 替代 getSRsByIRId() / getARsBySRId()
fetchRequirementChildren(id: string | number): Promise<RequirementVO[]>

// 链路追溯 → 替代 getIRBySRId() + getSRByARId()
fetchAncestors(id: string | number): Promise<RequirementVO[]>

// CSV导出 → 替代各页面的 handleExport
exportRequirementsCSV(params): Promise<Blob>
```

#### `lib/api/tasks.ts`
```typescript
fetchTasks(params: {
  type?: string; status?: string; keyword?: string; assignee?: string;
  sortBy?: string; sortOrder?: string; page?: number; pageSize?: number;
}): Promise<PageResult<TaskVO>>

fetchTaskStats(): Promise<TaskStatsVO>
fetchTask(id: string | number): Promise<TaskVO>
createTask(data: TaskCreateRequest): Promise<TaskVO>
updateTask(id: string | number, data): Promise<TaskVO>
deleteTask(id: string | number): Promise<void>
assignTask(id: string | number, assignee: string): Promise<TaskVO>
changeTaskStatus(id: string | number, status: string): Promise<TaskVO>
fetchTaskHistories(taskId: string | number): Promise<TaskHistory[]>
exportTasksCSV(params): Promise<Blob>
```

#### `lib/api/projects.ts`
```typescript
fetchProjects(params: { status?: string; keyword?: string; page?: number; pageSize?: number }): Promise<PageResult<ProjectVO>>
fetchProject(id: string | number): Promise<ProjectDetailVO>
createProject / updateProject / deleteProject
fetchProjectTree(id: string | number): Promise<ProjectTreeVO>
fetchProjectMembers / addProjectMember / removeProjectMember
fetchProjectLogs(id: string | number): Promise<OperationLog[]>
exportProjectsCSV
```

#### `lib/api/versions.ts`
```typescript
fetchVersions(params: { projectId?, status?, keyword?, page?, pageSize? }): Promise<PageResult<VersionVO>>
fetchVersion / createVersion / updateVersion / deleteVersion
fetchVersionIterations / fetchVersionStats / fetchVersionLogs
exportVersionsCSV
```

#### `lib/api/iterations.ts`
```typescript
fetchIterations(params: { projectId?, versionId?, status?, keyword?, page?, pageSize? }): Promise<PageResult<IterationVO>>
fetchIteration / createIteration / updateIteration / deleteIteration
fetchIterationARs / fetchIterationStats / fetchIterationLogs
exportIterationsCSV
```

#### `lib/api/workspace.ts`
```typescript
fetchUrgentRequirements(limit?: number): Promise<RequirementVO[]>
fetchOverdueTasks(): Promise<TaskVO[]>
```

---

## 3. 需修改的文件

### 3.1 页面文件

| 文件 | 当前行为 | 改造要点 |
|------|----------|----------|
| `app/login/page.tsx` | 硬编码 admin@example.com/admin123 验证 | 调用 `authApi.login()` → 存储 token → 跳转 `/workspace` |
| `app/workspace/page.tsx` | `useMemo` 处理 `mockRequirements` | 调用 `fetchUrgentRequirements()` + `fetchOverdueTasks()`，加 loading/error 状态 |
| `app/requirements/page.tsx` | `getAllRequirements()` + 客户端 filter/slice | 调用 `fetchRequirements(params)` 传 type/status/keyword/page/pageSize；删除/创建后 refresh |
| `app/requirements/[id]/page.tsx` | `getRequirementById()` / `buildIRTree()` 同步调用 | 调用 `fetchRequirement(id)` / `fetchRequirementTree(irId)` 异步获取，加 loading |
| `app/tasks/page.tsx` | `getAllTasks()` + 客户端 filter/sort/slice | 调用 `fetchTasks(params)`，所有筛选传参；创建/分配/状态变更调 API |
| `app/projects/page.tsx` | `getAllProjects()` + 派生统计 | 调用 `fetchProjects(params)`（统计字段已在后端 VO 中） |
| `app/projects/[id]/page.tsx` | 多个 mock 函数组合 | 调用 `fetchProject(id)` (含 stats+members) + `fetchProjectTree(id)` + `fetchProjectLogs(id)` |
| `app/projects/versions/[id]/page.tsx` | 多个 mock 函数 | 调用 `fetchVersion(id)` + `fetchVersionIterations(id)` |
| `app/projects/versions/page.tsx` | mock 函数 | 调用 `fetchVersions(params)` |
| `app/projects/iterations/[id]/page.tsx` | 多个 mock 函数 | 调用 `fetchIteration(id)` + `fetchIterationARs(id)` |
| `app/projects/iterations/page.tsx` | mock 函数 | 调用 `fetchIterations(params)` |

### 3.2 组件文件

| 文件 | 当前行为 | 改造要点 |
|------|----------|----------|
| `components/requirements-table.tsx` | 调用 `getRequirementById()` 查父需求 | 父需求信息已在列表 VO 中（parentCode/parentType），移除直接调用 |
| `components/requirement-form-dialog.tsx` | 调用 `getAllRequirements()` 获取父需求下拉 | 调用 `fetchRequirements({ type: 'IR', pageSize: 999 })` 或专门的 parent-options 接口 |
| `components/requirement-tree.tsx` | 纯展示（无 mock 依赖） | 无改动 |
| `components/requirement-history-dialog.tsx` | 自生成 mock 历史 | 调用 `fetchRequirementHistories(id)` 或需求详情中的历史字段 |
| `components/convert-to-ir-dialog.tsx` | `onSave` 仅 console.log | `onSave` 调 `requirementsApi.convertToIR()`，成功后回调 |
| `components/decompose-dialog.tsx` | `onSave` 仅 console.log | `onSave` 调 `requirementsApi.decompose()`，成功后回调 |
| `components/test-cases-table.tsx` | 纯展示（无 mock 依赖） | 新增 CRUD 按钮对接 `testCasesApi` |

### 3.3 统一改动模式

所有页面添加以下状态：
```typescript
const [data, setData] = useState<Xxx[]>([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState<string | null>(null)
const [total, setTotal] = useState(0)       // 用于分页
const [page, setPage] = useState(1)         // 当前页
const [pageSize, setPageSize] = useState(10)
```

`useEffect` 改为：
```typescript
useEffect(() => {
  setLoading(true)
  setError(null)
  fetchRequirements({ type, status, keyword, page, pageSize })
    .then(res => { setData(res.list); setTotal(res.total) })
    .catch(e => setError(e.message))
    .finally(() => setLoading(false))
}, [type, status, keyword, page, pageSize])
```

CRUD 操作改为：
```typescript
const handleDelete = async (id: string) => {
  await deleteRequirement(id)
  // 当前页数据减少时可能需要回退页码
  if (data.length === 1 && page > 1) setPage(page - 1)
  else refresh()  // 重新 fetch 当前页
}
```

CSV 导出改为：
```typescript
const handleExport = async () => {
  const blob = await exportRequirementsCSV({ type, status, keyword })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = 'requirements.csv'; a.click()
  URL.revokeObjectURL(url)
}
```

---

## 4. Auth 流程改造

### 登录流程
```
LoginForm → authApi.login(email, password)
  → 成功: localStorage.setItem('token', token); router.push('/workspace')
  → 失败: 显示错误 toast
```

### Token 管理
- `lib/api/client.ts` 初始化时从 localStorage 读取 token
- 每次请求自动附加 `Authorization: Bearer <token>`
- 401 响应 → 清除 token → router.push('/login')

### 路由守卫
- 可以在 `AdminLayout` 或 middleware 中检查 token 存在性
- 无 token 时跳转 `/login`

---

# 第二部分：UI 重设计 (Enterprise SaaS CRM Style)

## 1. 设计系统 (Design Tokens)

### 色彩
```
Primary:       #3B82F6 (蓝色)
Primary Light: #EFF6FF
Primary Dark:  #1D4ED8
Background:    #FFFFFF / #F8FAFC
Surface:       #FFFFFF
Border:        #E5E7EB
Text Primary:  #111827
Text Secondary:#6B7280
Text Muted:    #9CA3AF
Success:       #10B981 (绿色)
Warning:       #F59E0B (橙色)
Danger:        #EF4444 (红色)
Info:          #3B82F6 (蓝色)
```

### 字体
```
Font Family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Headings:    font-bold, tracking-tight
Body:        font-normal, leading-relaxed
Mono:        JetBrains Mono (for codes, IDs)
```

### 间距 (8pt System)
```
xs:  4px
sm:  8px
md:  16px
lg:  24px
xl:  32px
2xl: 48px
3xl: 64px
```

### 圆角
```
sm:    6px  (badge, tag)
md:    8px  (button, input)
lg:    12px (card)
xl:    16px (modal, large card)
full:  9999px (avatar, pill)
```

### 阴影
```
sm:   0 1px 2px rgba(0,0,0,0.05)
md:   0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -2px rgba(0,0,0,0.05)
lg:   0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -4px rgba(0,0,0,0.04)
xl:   0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.04)
```

---

## 2. 布局重设计 (Layout Shell)

### 外层结构
```
┌──────────────────────────────────────────────────────┐
│  Sticky Navbar (h-16, backdrop-blur, z-50)           │
│  Logo | Nav Links | Search | Notifications | Avatar  │
├────────┬─────────────────────────────────────────────┤
│Sidebar │  Main Content Area                          │
│ 72px   │  (max-w-[1440px] mx-auto px-6 py-6)         │
│/240px  │                                             │
│ icons  │  [Page-specific content]                    │
│ +      │                                             │
│ labels │                                             │
│        │                                             │
├────────┴─────────────────────────────────────────────┤
│  Footer (h-12, border-t, text-muted, centered)       │
└──────────────────────────────────────────────────────┘
```

### 导航栏 (AdminLayout → 完全重写)

```
<nav className="sticky top-0 z-50 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
  <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-6">
    // 左侧: Logo + 主导航
    <div className="flex items-center gap-8">
      <Logo />  // 系统名称 + SVG icon
      <NavLinks>
        {[
          { href: '/workspace', label: '工作台', icon: LayoutDashboard },
          { href: '/requirements', label: '需求管理', icon: FileText },
          { href: '/tasks', label: '任务管理', icon: CheckSquare },
          { href: '/projects', label: '项目管理', icon: FolderKanban },
        ]}
      </NavLinks>
    </div>
    // 右侧: Search + 通知 + 用户 + CTA
    <div className="flex items-center gap-4">
      <SearchInput />      // 全局搜索框，带 ⌘K 快捷键提示
      <NotificationBell /> // 带未读红点
      <UserDropdown />     // 头像 + 下拉(个人设置/退出)
    </div>
  </div>
</nav>
```

### 侧边栏

```
// 折叠状态 (72px)
<aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-[72px] bg-white border-r border-slate-200 flex flex-col items-center py-4 gap-1 z-40">
  {navItems.map(item => (
    <SidebarIcon icon={item.icon} label={item.label} active={isActive} />
  ))}
</aside>

// 展开状态 (240px) — 悬浮或点击触发
<aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-[240px] bg-white border-r border-slate-200 flex flex-col py-4 gap-1 z-40 shadow-lg">
  {navItems.map(item => (
    <SidebarItem icon={item.icon} label={item.label} active={isActive} badge={item.badge} />
  ))}
</aside>

// 动画：width transition + label fade-in
// motion.div with animate={{ width: collapsed ? 72 : 240 }}
```

侧边栏导航项（根据当前路由 section 动态切换）：

**工作台区域:**
- 工作台概览 (LayoutDashboard)
- 日历视图 (Calendar)

**需求管理区域:**
- 全部需求 (FileText)
- 市场需求 LMT
- 原始需求 IR
- 系统需求 SR
- 应用需求 AR

**任务管理区域:**
- 全部任务 (CheckSquare)
- 待分配
- 进行中
- 已完成

**项目管理区域:**
- 全部项目 (FolderKanban)
- 版本管理
- 迭代管理

---

## 3. 页面重设计

### 3.1 工作台 `/workspace`

```
┌─────────────────────────────────────────────────────────┐
│  Header: "工作台概览" | 右侧: 日期范围选择器 + 刷新按钮   │
├─────────────────────────────────────────────────────────┤
│  KPI Bento Grid (4 cards)                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │
│  │ 需求总数  │ │ 进行中   │ │ 完成率   │ │ 逾期任务  │   │
│  │  128     │ │   45     │ │  72.5%   │ │   12     │   │
│  │  ↑12%    │ │ sparkline│ │ donut    │ │  ⚠红色   │   │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │
├─────────────────────────────────────────────────────────┤
│  Charts Row (2 columns)                                 │
│  ┌──────────────────────┐ ┌──────────────────┐         │
│  │ 需求趋势折线图        │ │ 需求类型分布      │         │
│  │ (recharts Line)      │ │ (recharts Donut)  │         │
│  │ 渐变填充 + 平滑曲线   │ │ 图例 + 标签       │         │
│  └──────────────────────┘ └──────────────────┘         │
├─────────────────────────────────────────────────────────┤
│  紧急需求列表 + 动态时间线 (2 columns)                    │
│  ┌──────────────────────┐ ┌──────────────────┐         │
│  │ 紧急需求 (Card List)  │ │ 最近动态 (Timeline)│        │
│  │ priority badge       │ │ • 张三 创建了需求  │        │
│  │ deadline countdown   │ │ • 李四 完成了任务  │        │
│  │ click→详情           │ │ • 王五 分配了任务  │        │
│  └──────────────────────┘ └──────────────────┘         │
└─────────────────────────────────────────────────────────┘
```

### 3.2 需求管理 `/requirements`

```
Header: "需求管理" | 右侧: + 新建需求 (Primary CTA)

Filter Bar (Card, rounded-xl, p-4, mb-6):
┌─────────────────────────────────────────────────────────┐
│ [类型下拉▼] [状态下拉▼] [搜索框 🔍]  [导出CSV]  [刷新]  │
└─────────────────────────────────────────────────────────┘

Kanban View (toggle between Table / Kanban):
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ 待分析 3  │ │ 进行中 5  │ │ 已完成 8  │ │ 已关闭 2  │
│          │ │          │ │          │ │          │
│ ┌──────┐ │ │ ┌──────┐ │ │ ┌──────┐ │ │ ┌──────┐ │
│ │Card  │ │ │ │Card  │ │ │ │Card  │ │ │ │Card  │ │
│ │LMT.. │ │ │ │IR... │ │ │ │SR... │ │ │ │AR... │ │
│ │高优先 │ │ │ │中优先 │ │ │ │低优先 │ │ │ │已完成 │ │
│ └──────┘ │ │ └──────┘ │ │ └──────┘ │ │ └──────┘ │
│ ┌──────┐ │ │ ┌──────┐ │ │          │ │          │
│ │Card  │ │ │ │Card  │ │ │          │ │          │
│ └──────┘ │ │ └──────┘ │ │          │ │          │
└──────────┘ └──────────┘ └──────────┘ └──────────┘

Table View (原表格，但升级样式):
- columns: Code, Name, Type(Badge), Customer, Status(Badge), Priority(Badge), Date, Actions
- hover: bg-slate-50, 整行高亮
- 排序箭头 on column headers
- Actions: 详情 / 编辑 / 删除 (DropdownMenu)
- 分页: 底部居中，圆角按钮，当前页高亮

Card Hover Effect: transform + shadow lift (Framer Motion)
```

### 3.3 需求详情 `/requirements/[id]`

```
Header: Breadcrumb (需求管理 > LMT-2024-001) + Action buttons

Top Section (Card):
┌─────────────────────────────────────────────────────────┐
│ 需求编号: LMT-2024-001    状态: [进行中 Badge]          │
│ 需求名称: 用户登录功能优化  优先级: [高 Badge]            │
│ 客户: 客户A              期望日期: 2024-12-31            │
│ 描述: ...                                                │
│ [编辑] [转换为IR] [删除]                                  │
└─────────────────────────────────────────────────────────┘

// LMT: 简洁信息卡 + 操作按钮
// IR: 需求树 (折叠面板 Accordion 风格)
//   ┌─ IR-2024-001 ─────────────────────────────┐
//   │  ├─ SR-2024-001  (进行中) [展开▼]          │
//   │  │  ├─ AR-2024-001 (待分析)                │
//   │  │  └─ AR-2024-002 (进行中)                │
//   │  └─ SR-2024-002  (待分析) [折叠▶]          │
//   └────────────────────────────────────────────┘
// SR: 父IR链接 + 子AR列表 (Card Grid)
// AR: 追溯链 (IR → SR → AR) + 测试用例表格

Test Cases Section (for AR):
┌─────────────────────────────────────────────────────────┐
│ 测试用例 (5)    通过:3 失败:1 未执行:1    通过率: 60%    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Progress Bar: ████████░░░░░░░░░░ 60%               │ │
│ └─────────────────────────────────────────────────────┘ │
│ [TC Table with enhanced styling]                        │
└─────────────────────────────────────────────────────────┘
```

### 3.4 任务管理 `/tasks`

```
Header: "任务管理" | 右侧: + 新建任务

Stats Row (4 mini cards):
  全部任务 32  |  待分配 5  |  进行中 12  |  逾期 3 ⚠

Filter Bar + View Toggle (Kanban / Table / Calendar)

Kanban (按状态分列): 待分配 | 进行中 | 已完成 | 已关闭
  - 每列 Column Header 显示数量
  - Task Card 含: code, name, type badge, assignee avatar, deadline, priority
  - deadline 已过的卡片红色左边框
  - Drag & Drop 切换状态 (调用 PATCH /tasks/{id}/status)
  - hover: lift + shadow transition

Table View: columns with sorting, hover highlight, batch select
```

### 3.5 项目管理 `/projects`

```
Header: "项目管理" | 右侧: + 新建项目

Stats Summary Row:
  项目总数 6  |  进行中 3  |  版本总数 12  |  迭代总数 24

Project Cards Grid (替代原表格):
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Terra平台     │ │ Atlas项目    │ │ Nova系统     │
│ code: Terra  │ │ code: Atlas  │ │ code: Nova   │
│ 财务: 82525  │ │ 财务: 82526  │ │ 财务: 82527  │
│ ─────────── │ │ ─────────── │ │ ─────────── │
│ 📦 2版本     │ │ 📦 3版本     │ │ 📦 1版本     │
│ 🔄 4迭代     │ │ 🔄 6迭代     │ │ 🔄 2迭代     │
│ 👥 6人       │ │ 👥 4人       │ │ 👥 3人       │
│ 📋 8需求     │ │ 📋 12需求    │ │ 📋 5需求     │
│ [进行中]     │ │ [已完成]     │ │ [进行中]     │
│ 01/01-12/31  │ │ 02/01-08/31  │ │ 03/01-09/30  │
└──────────────┘ └──────────────┘ └──────────────┘
```

### 3.6 项目详情 `/projects/[id]`

```
Header: Breadcrumb + Project Title + [编辑] [删除]

Tabs: 概览 | 版本 | 迭代 | 成员 | 日志

// 概览 Tab
KPI Row (4 cards) + 进度时间线 + 最近动态

// 版本 Tab
Table + [新建版本] 按钮

// 迭代 Tab
Tree: Version → Iteration → AR List (expandable rows)

// 成员 Tab
Member Cards Grid (头像 + 姓名 + 角色 Badge + 邮箱 + 删除按钮)

// 日志 Tab
Timeline Feed (垂直时间线 + 图标 + 时间 + 描述)
```

### 3.7 登录页 `/login`

```
┌────────────────────────────────────────────────────────────┐
│                      Centered Card                        │
│  ┌──────────────────────────────────────────────┐         │
│  │  Logo / 系统名称                               │         │
│  │  需求管理系统                                  │         │
│  │                                              │         │
│  │  [Email Input]                               │         │
│  │  [Password Input]                            │         │
│  │  [记住我] [忘记密码?]                          │         │
│  │  [登 录] (full width, primary blue)           │         │
│  │                                              │         │
│  │  ───────── 或 ─────────                       │         │
│  │  [SSO登录] [扫码登录] (未来扩展)               │         │
│  └──────────────────────────────────────────────┘         │
│                                                           │
│  Background: gradient mesh / abstract data visualization   │
└────────────────────────────────────────────────────────────┘

- 右侧或背景为抽象 SaaS 数据可视化图案 (SVG gradient charts, vector graphics)
- 无照片、无3D、无赛博朋克
- Light mode, subtle animation on card mount
```

---

## 4. 动画规范 (Framer Motion)

| 元素 | 动画 | 参数 |
|------|------|------|
| 页面进入 | fade + slideUp | `initial={{ opacity: 0, y: 20 }}` `animate={{ opacity: 1, y: 0 }}` duration 0.3 |
| KPI 卡片 | stagger children | `staggerChildren: 0.1` |
| 卡片悬浮 | scale + shadow | `whileHover={{ scale: 1.02, boxShadow: "..." }}` duration 0.2 |
| 侧边栏展开 | width transition | `animate={{ width: collapsed ? 72 : 240 }}` type: "spring", stiffness 300 |
| 看板拖拽 | layout + scale | `layout` prop, `whileDrag={{ scale: 1.05 }}` |
| 图表 | fade-in on scroll | `whileInView={{ opacity: 1 }}` `viewport={{ once: true }}` |
| 按钮 | hover scale | `whileHover={{ scale: 1.05 }}` duration 0.15 |
| 下拉菜单 | scale + fade | `animate={{ opacity: 1, scale: 1 }}` from `{ opacity: 0, scale: 0.95 }` |
| 数值变化 | count-up | 数字从0递增到目标值，duration 1.5s |
| Modal/Dialog | scale + fade | backdrop fade + modal scale from 0.95 |

---

## 5. 响应式规范

| 断点 | 宽度 | 布局 |
|------|------|------|
| Desktop XL | ≥ 1440px | 完整布局：侧边栏 + 内容区 max-w-[1440px] |
| Desktop | 1024–1439px | 侧边栏折叠(72px) + 内容自适应 |
| Tablet | 768–1023px | 侧边栏隐藏(hamburger menu) + 内容区全宽 |
| Mobile | < 768px | 导航变汉堡菜单，卡片全宽堆叠，看板变纵向列表，表格变卡片列表，隐藏非核心列 |

响应式要点:
- KPI Grid: `grid-cols-4` → `grid-cols-2` → `grid-cols-1`
- Kanban: 水平4列 → 垂直堆叠列表
- 图表: 双列 → 单列
- 表格: 保持水平滚动（关键列固定），或转为卡片列表

---

## 6. 组件改造对照

### 需重构的现有组件

| 现组件 | 改造方向 |
|--------|----------|
| `admin-layout.tsx` | 完全重写：Sticky Navbar(backdrop-blur) + Sidebar(72/240) + 底部 Footer |
| `requirements-table.tsx` | 保留 Table 模式 + 新增 Kanban 模式，升级表格样式 |
| `requirement-tree.tsx` | 从连接线风格 → Accordion/Collapse 折叠面板风格，保留颜色编码 |
| `requirement-form-dialog.tsx` | Dialog 升级圆角/阴影/动画，表单布局优化 |
| `requirement-history-dialog.tsx` | Timeline 垂直时间线风格 |
| `convert-to-ir-dialog.tsx` | 同上 Dialog 升级 |
| `decompose-dialog.tsx` | 同上 + 拆解项卡片布局 |
| `test-cases-table.tsx` | 表格升级 + 进度条 + 统计卡片 |
| `theme-provider.tsx` | 简化为仅支持 Light mode |

### 需新建的组件

| 新组件 | 用途 |
|--------|------|
| `components/ui/kpi-card.tsx` | KPI 统计卡片（图标 + 数值 + 趋势 + 迷你图） |
| `components/ui/kanban-board.tsx` | 看板列容器 |
| `components/ui/kanban-card.tsx` | 看板卡片（拖拽支持） |
| `components/ui/stat-card.tsx` | 小型统计卡片 |
| `components/ui/timeline.tsx` | 垂直时间线 |
| `components/ui/bento-grid.tsx` | Bento 网格布局容器 |
| `components/ui/page-header.tsx` | 页面标题 + 操作区 |
| `components/ui/filter-bar.tsx` | 筛选栏容器 |
| `components/ui/empty-state.tsx` | 空状态插图 + 文案 |
| `components/ui/loading-skeleton.tsx` | Skeleton 加载占位 |
| `components/ui/error-state.tsx` | 错误状态 + 重试按钮 |
| `components/charts/line-chart.tsx` | 折线图（渐变填充 + 平滑曲线） |
| `components/charts/donut-chart.tsx` | 环形图（图例 + 标签） |
| `components/charts/sparkline.tsx` | 迷你趋势图 |
| `components/navbar.tsx` | 顶部导航栏 |
| `components/sidebar.tsx` | 侧边栏（折叠/展开） |
| `components/user-dropdown.tsx` | 用户头像下拉 |
| `components/search-command.tsx` | ⌘K 全局搜索面板 |

---

## 7. 新增依赖

安装以下新包：
```bash
pnpm add framer-motion                    # 动画
pnpm add @radix-ui/react-collapsible      # 折叠面板（已有部分shadcn依赖）
pnpm add cmdk                             # ⌘K 命令面板
pnpm add date-fns                        # (已有)
pnpm add recharts                        # (已有)
```

---

## 8. 实现优先级

| 阶段 | 内容 |
|------|------|
| 一 | 设计系统落地（Tailwind config: colors, fonts, spacing, shadows, radius） |
| 二 | Layout Shell 重写（Navbar + Sidebar + Footer） |
| 三 | 工作台 Dashboard (KPI + Charts + Timeline) |
| 四 | 需求管理（Kanban + Table 双视图） |
| 五 | 需求详情（Accordion Tree + 追溯链） |
| 六 | 任务管理（Kanban + 拖拽） |
| 七 | 项目管理（Card Grid + 详情 Tab） |
| 八 | 登录页重设计 |
| 九 | 响应式适配 |
| 十 | 动画打磨 + 性能优化 |

---

> **版本**: v1.0 | **日期**: 2026-04-29
> **关联文档**: `REST_API_SPEC.md` (API接口), `TECH_STACK.md` (后端架构)
