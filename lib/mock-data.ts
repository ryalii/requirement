import type { Requirement, TestCase, Task, TaskHistory, Project, Version, Iteration, ARRequirementDetail, ProjectMember, OperationLog } from "./types"

// 测试用例数据
export const mockTestCases: TestCase[] = [
  {
    id: "tc-001",
    code: "TC-2024-001",
    name: "用户登录功能验证",
    status: "通过",
    priority: "高",
    executedAt: "2024-03-20",
  },
  {
    id: "tc-002",
    code: "TC-2024-002",
    name: "用户注册流程测试",
    status: "通过",
    priority: "高",
    executedAt: "2024-03-21",
  },
  {
    id: "tc-003",
    code: "TC-2024-003",
    name: "密码重置功能验证",
    status: "未执行",
    priority: "中",
  },
  {
    id: "tc-004",
    code: "TC-2024-004",
    name: "用户权限校验测试",
    status: "失败",
    priority: "高",
    executedAt: "2024-03-22",
  },
  {
    id: "tc-005",
    code: "TC-2024-005",
    name: "会话超时处理测试",
    status: "通过",
    priority: "低",
    executedAt: "2024-03-22",
  },
]

// 模拟需求数据
export const mockRequirements: Requirement[] = [
  // LMT需求（市场需求）
  {
    id: "lmt-001",
    code: "LMT-2024-001",
    name: "智能客服系统需求",
    type: "LMT",
    customer: "京东科技",
    project: "智能客服项目",
    expectedDate: "2024-09-30",
    createdAt: "2024-03-01",
    status: "待分析",
    priority: "高",
    description: "客户需要一套智能客服系统，支持多渠道接入和智能问答。",
  },
  {
    id: "lmt-002",
    code: "LMT-2024-002",
    name: "数据中台建设需求",
    type: "LMT",
    customer: "美团点评",
    project: "数据中台项目",
    expectedDate: "2024-10-15",
    createdAt: "2024-03-05",
    status: "待分析",
    priority: "中",
    description: "建设企业级数据中台，实现数据统一管理和共享。",
  },
  {
    id: "lmt-003",
    code: "LMT-2024-003",
    name: "供应链管理优化",
    type: "LMT",
    customer: "小米科技",
    project: "",
    expectedDate: "2024-11-01",
    createdAt: "2024-03-10",
    status: "待分析",
    priority: "低",
    description: "优化现有供应链管理系统，提升效率和可视化程度。",
  },
  // IR需求
  {
    id: "ir-001",
    code: "IR-2024-001",
    name: "用户管理系统升级",
    type: "IR",
    customer: "华为技术",
    project: "用户管理项目",
    expectedDate: "2024-06-30",
    createdAt: "2024-01-15",
    status: "进行中",
    priority: "高",
    description: "客户要求对现有用户管理系统进行全面升级，包括用户认证、权限管理等功能。",
  },
  {
    id: "ir-002",
    code: "IR-2024-002",
    name: "报表系统定制开发",
    type: "IR",
    customer: "阿里巴巴",
    project: "报表系统项目",
    expectedDate: "2024-07-15",
    createdAt: "2024-02-01",
    status: "待分析",
    priority: "中",
    description: "需要定制化报表系统，支持多维度数据分析和可视化展示。",
  },
  {
    id: "ir-003",
    code: "IR-2024-003",
    name: "移动端适配需求",
    type: "IR",
    customer: "腾讯科技",
    project: "移动端项目",
    expectedDate: "2024-08-01",
    createdAt: "2024-02-20",
    status: "待分析",
    priority: "高",
    description: "现有系统需要支持移动端访问，要求响应式设计和原生APP开发。",
  },
  // SR需求
  {
    id: "sr-001",
    code: "SR-2024-001",
    name: "用户认证模块重构",
    type: "SR",
    customer: "华为技术",
    project: "用户管理项目",
    expectedDate: "2024-04-30",
    createdAt: "2024-01-20",
    status: "进行中",
    priority: "高",
    description: "重构用户认证模块，支持多种认证方式包括OAuth2.0、SAML等。",
    parentId: "ir-001",
  },
  {
    id: "sr-002",
    code: "SR-2024-002",
    name: "权限管理系统设计",
    type: "SR",
    customer: "华为技术",
    project: "用户管理项目",
    expectedDate: "2024-05-15",
    createdAt: "2024-01-25",
    status: "进行中",
    priority: "高",
    description: "设计基于RBAC的权限管理系统，支持细粒度权限控制。",
    parentId: "ir-001",
  },
  {
    id: "sr-003",
    code: "SR-2024-003",
    name: "报表数据采集模块",
    type: "SR",
    customer: "阿里巴巴",
    project: "报表系统项目",
    expectedDate: "2024-05-30",
    createdAt: "2024-02-10",
    status: "待分析",
    priority: "中",
    description: "开发数据采集模块，支持多数据源接入和数据清洗。",
    parentId: "ir-002",
  },
  {
    id: "sr-004",
    code: "SR-2024-004",
    name: "移动端UI框架选型",
    type: "SR",
    customer: "腾讯科技",
    project: "移动端项目",
    expectedDate: "2024-04-15",
    createdAt: "2024-02-25",
    status: "已完成",
    priority: "中",
    description: "完成移动端UI框架的技术选型和原型设计。",
    parentId: "ir-003",
  },
  // AR需求
  {
    id: "ar-001",
    code: "AR-2024-001",
    name: "登录接口开发",
    type: "AR",
    customer: "华为技术",
    project: "用户管理项目",
    expectedDate: "2024-03-15",
    createdAt: "2024-02-01",
    status: "已完成",
    priority: "高",
    description: "开发用户登录API接口，支持JWT token认证。",
    parentId: "sr-001",
  },
  {
    id: "ar-002",
    code: "AR-2024-002",
    name: "OAuth2.0集成",
    type: "AR",
    customer: "华为技术",
    project: "用户管理项目",
    expectedDate: "2024-04-01",
    createdAt: "2024-02-05",
    status: "进行中",
    priority: "高",
    description: "集成OAuth2.0认证协议，支持第三方登录。",
    parentId: "sr-001",
  },
  {
    id: "ar-003",
    code: "AR-2024-003",
    name: "角色管理API",
    type: "AR",
    customer: "华为技术",
    project: "用户管理项目",
    expectedDate: "2024-04-15",
    createdAt: "2024-02-10",
    status: "进行中",
    priority: "中",
    description: "开发角色管理相关API，包括角色CRUD和权限分配。",
    parentId: "sr-002",
  },
  {
    id: "ar-004",
    code: "AR-2024-004",
    name: "权限校验中间件",
    type: "AR",
    customer: "华为技术",
    project: "用户管理项目",
    expectedDate: "2024-04-20",
    createdAt: "2024-02-15",
    status: "待分析",
    priority: "高",
    description: "开发通用权限校验中间件，实现请求级别的权限控制。",
    parentId: "sr-002",
  },
  {
    id: "ar-005",
    code: "AR-2024-005",
    name: "数据源连接池管理",
    type: "AR",
    customer: "阿里巴巴",
    project: "报表系统项目",
    expectedDate: "2024-04-30",
    createdAt: "2024-02-20",
    status: "待分析",
    priority: "中",
    description: "实现多数据源连接池管理，支持动态数据源切换。",
    parentId: "sr-003",
  },
  {
    id: "ar-006",
    code: "AR-2024-006",
    name: "移动端首页开发",
    type: "AR",
    customer: "腾讯科技",
    project: "移动端项目",
    expectedDate: "2024-05-01",
    createdAt: "2024-03-01",
    status: "待分析",
    priority: "中",
    description: "开发移动端首页界面，包括导航和核心功能入口。",
    parentId: "sr-004",
  },
]

// 获取所有需求
export function getAllRequirements(): Requirement[] {
  return mockRequirements
}

// 根据ID获取需求
export function getRequirementById(id: string): Requirement | undefined {
  return mockRequirements.find((r) => r.id === id)
}

// 获取IR需求的子需求（SR列表）
export function getSRsByIRId(irId: string): Requirement[] {
  return mockRequirements.filter((r) => r.type === "SR" && r.parentId === irId)
}

// 获取SR需求的子需求（AR列表）
export function getARsBySRId(srId: string): Requirement[] {
  return mockRequirements.filter((r) => r.type === "AR" && r.parentId === srId)
}

// 获取SR需求的父需求（IR）
export function getIRBySRId(srId: string): Requirement | undefined {
  const sr = mockRequirements.find((r) => r.id === srId)
  if (sr?.parentId) {
    return mockRequirements.find((r) => r.id === sr.parentId)
  }
  return undefined
}

// 获取AR需求的父需求（SR）
export function getSRByARId(arId: string): Requirement | undefined {
  const ar = mockRequirements.find((r) => r.id === arId)
  if (ar?.parentId) {
    return mockRequirements.find((r) => r.id === ar.parentId)
  }
  return undefined
}

// 获取AR的测试用例
export function getTestCasesByARId(arId: string): TestCase[] {
  // 模拟：每个AR都关联部分测试用例
  const arIndex = mockRequirements.findIndex((r) => r.id === arId)
  if (arIndex === -1) return []
  
  // 根据AR的index返回不同的测试用例组合
  const testCaseCount = (arIndex % 3) + 2
  return mockTestCases.slice(0, testCaseCount)
}

// 构建IR的需求树
export function buildIRTree(irId: string) {
  const ir = getRequirementById(irId)
  if (!ir || ir.type !== "IR") return null

  const srs = getSRsByIRId(irId)
  const srNodes = srs.map((sr) => {
    const ars = getARsBySRId(sr.id)
    return {
      requirement: sr,
      children: ars.map((ar) => ({
        requirement: ar,
        children: [],
      })),
    }
  })

  return {
    requirement: ir,
    children: srNodes,
  }
}

// 按类型获取需求
export function getRequirementsByType(type: string): Requirement[] {
  if (type === "all") return mockRequirements
  return mockRequirements.filter((r) => r.type === type)
}

// 任务数据
export const mockTasks: Task[] = [
  {
    id: "task-001",
    code: "TASK-2024-001",
    name: "用户登录功能分析",
    type: "需求",
    assignee: "张三",
    creator: "admin01",
    deadline: "2024-04-15",
    createdAt: "2024-03-20",
    status: "进行中",
    description: "分析用户登录功能的需求，包括多种登录方式的支持。",
    relatedRequirementId: "lmt-001",
  },
  {
    id: "task-002",
    code: "TASK-2024-002",
    name: "接口自动化测试",
    type: "测试",
    assignee: "李四",
    creator: "admin01",
    deadline: "2024-04-10",
    createdAt: "2024-03-18",
    status: "进行中",
    description: "完成用户管理模块的接口自动化测试用例编写。",
  },
  {
    id: "task-003",
    code: "TASK-2024-003",
    name: "紧急bug修复",
    type: "临时",
    assignee: "王五",
    creator: "admin01",
    deadline: "2024-03-25",
    createdAt: "2024-03-22",
    status: "已完成",
    description: "修复生产环境的紧急bug。",
  },
  {
    id: "task-004",
    code: "TASK-2024-004",
    name: "技术方案调研",
    type: "调研",
    assignee: "赵六",
    creator: "admin01",
    deadline: "2024-04-20",
    createdAt: "2024-03-15",
    status: "进行中",
    description: "调研新一代微服务架构方案。",
  },
  {
    id: "task-005",
    code: "TASK-2024-005",
    name: "客户现场支持",
    type: "支持",
    assignee: "",
    creator: "admin01",
    deadline: "2024-04-05",
    createdAt: "2024-03-28",
    status: "待分配",
    description: "协助华为客户现场部署和培训。",
  },
  {
    id: "task-006",
    code: "TASK-2024-006",
    name: "性能测试执行",
    type: "测试",
    assignee: "李四",
    creator: "admin01",
    deadline: "2024-04-12",
    createdAt: "2024-03-25",
    status: "待分配",
    description: "执行系统性能压力测试。",
  },
  {
    id: "task-007",
    code: "TASK-2024-007",
    name: "需求评审准备",
    type: "需求",
    assignee: "张三",
    creator: "admin01",
    deadline: "2024-03-30",
    createdAt: "2024-03-20",
    status: "已完成",
    description: "准备下周的需求评审会议材料。",
  },
  {
    id: "task-008",
    code: "TASK-2024-008",
    name: "AI技术预研",
    type: "调研",
    assignee: "",
    creator: "admin01",
    deadline: "2024-05-01",
    createdAt: "2024-03-28",
    status: "待分配",
    description: "预研大模型在智能客服中的应用。",
  },
]

// 任务操作历史
export const mockTaskHistories: TaskHistory[] = [
  {
    id: "th-001",
    taskId: "task-001",
    action: "创建",
    operator: "admin01",
    timestamp: "2024-03-20 09:00:00",
    description: "创建任务",
  },
  {
    id: "th-002",
    taskId: "task-001",
    action: "分配",
    operator: "admin01",
    timestamp: "2024-03-20 09:30:00",
    oldValue: "",
    newValue: "张三",
    description: "分配给张三",
  },
  {
    id: "th-003",
    taskId: "task-001",
    action: "状态变更",
    operator: "张三",
    timestamp: "2024-03-21 10:00:00",
    oldValue: "待分配",
    newValue: "进行中",
    description: "开始处理任务",
  },
  {
    id: "th-004",
    taskId: "task-003",
    action: "创建",
    operator: "admin01",
    timestamp: "2024-03-22 14:00:00",
    description: "创建紧急任务",
  },
  {
    id: "th-005",
    taskId: "task-003",
    action: "状态变更",
    operator: "王五",
    timestamp: "2024-03-24 18:00:00",
    oldValue: "进行中",
    newValue: "已完成",
    description: "bug已修复并验证",
  },
]

// 获取所有任务
export function getAllTasks(): Task[] {
  return mockTasks.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime())
}

// 根据ID获取任务
export function getTaskById(id: string): Task | undefined {
  return mockTasks.find((t) => t.id === id)
}

// 获取任务历史
export function getTaskHistories(taskId: string): TaskHistory[] {
  return mockTaskHistories.filter((h) => h.taskId === taskId)
}

// 项目数据
export const mockProjects: Project[] = [
  {
    id: "proj-001",
    name: "用户管理系统升级项目",
    code: "Terra",
    financeCode: "82525",
    owner: "张伟",
    manager: "李明",
    startDate: "2024-01-01",
    endDate: "2024-06-30",
    status: "进行中",
    description: "对现有用户管理系统进行全面升级",
  },
  {
    id: "proj-002",
    name: "报表系统定制项目",
    code: "Phoenix",
    financeCode: "82526",
    owner: "王芳",
    manager: "赵强",
    startDate: "2024-02-01",
    endDate: "2024-07-31",
    status: "进行中",
    description: "定制化报表系统开发",
  },
  {
    id: "proj-003",
    name: "移动端适配项目",
    code: "Atlas",
    financeCode: "82527",
    owner: "陈刚",
    manager: "刘洋",
    startDate: "2024-03-01",
    endDate: "2024-08-31",
    status: "进行中",
    description: "现有系统移动端适配开发",
  },
  {
    id: "proj-004",
    name: "智能客服系统项目",
    code: "Nova",
    financeCode: "82528",
    owner: "孙丽",
    manager: "周杰",
    startDate: "2024-04-01",
    endDate: "2024-12-31",
    status: "未开始",
    description: "智能客服系统开发",
  },
]

// 版本数据
export const mockVersions: Version[] = [
  {
    id: "ver-001",
    productName: "用户管理系统",
    projectId: "proj-001",
    versionNumber: "V1.0.0",
    startDate: "2024-01-01",
    endDate: "2024-03-31",
    status: "已发布",
    description: "首个正式版本",
  },
  {
    id: "ver-002",
    productName: "用户管理系统",
    projectId: "proj-001",
    versionNumber: "V1.1.0",
    startDate: "2024-04-01",
    endDate: "2024-06-30",
    status: "进行中",
    description: "功能增强版本",
  },
  {
    id: "ver-003",
    productName: "报表系统",
    projectId: "proj-002",
    versionNumber: "V1.0.0",
    startDate: "2024-02-01",
    endDate: "2024-05-31",
    status: "进行中",
    description: "首个正式版本",
  },
  {
    id: "ver-004",
    productName: "移动端APP",
    projectId: "proj-003",
    versionNumber: "V1.0.0",
    startDate: "2024-03-01",
    endDate: "2024-06-30",
    status: "进行中",
    description: "首个移动端版本",
  },
]

// 迭代数据
export const mockIterations: Iteration[] = [
  {
    id: "iter-001",
    name: "Sprint 1",
    projectId: "proj-001",
    productName: "用户管理系统",
    versionId: "ver-001",
    startDate: "2024-01-01",
    endDate: "2024-01-31",
    status: "已完成",
    description: "用户认证模块开发",
  },
  {
    id: "iter-002",
    name: "Sprint 2",
    projectId: "proj-001",
    productName: "用户管理系统",
    versionId: "ver-001",
    startDate: "2024-02-01",
    endDate: "2024-02-29",
    status: "已完成",
    description: "权限管理模块开发",
  },
  {
    id: "iter-003",
    name: "Sprint 3",
    projectId: "proj-001",
    productName: "用户管理系统",
    versionId: "ver-001",
    startDate: "2024-03-01",
    endDate: "2024-03-31",
    status: "已完成",
    description: "系统集成测试",
  },
  {
    id: "iter-004",
    name: "Sprint 4",
    projectId: "proj-001",
    productName: "用户管理系统",
    versionId: "ver-002",
    startDate: "2024-04-01",
    endDate: "2024-04-30",
    status: "进行中",
    description: "OAuth2.0集成",
  },
  {
    id: "iter-005",
    name: "Sprint 5",
    projectId: "proj-001",
    productName: "用户管理系统",
    versionId: "ver-002",
    startDate: "2024-05-01",
    endDate: "2024-05-31",
    status: "规划中",
    description: "高级权限功能开发",
  },
  {
    id: "iter-006",
    name: "Sprint 1",
    projectId: "proj-002",
    productName: "报表系统",
    versionId: "ver-003",
    startDate: "2024-02-01",
    endDate: "2024-03-15",
    status: "已完成",
    description: "数据采集模块开发",
  },
  {
    id: "iter-007",
    name: "Sprint 2",
    projectId: "proj-002",
    productName: "报表系统",
    versionId: "ver-003",
    startDate: "2024-03-16",
    endDate: "2024-04-30",
    status: "进行中",
    description: "报表展示模块开发",
  },
  {
    id: "iter-008",
    name: "Sprint 1",
    projectId: "proj-003",
    productName: "移动端APP",
    versionId: "ver-004",
    startDate: "2024-03-01",
    endDate: "2024-04-15",
    status: "进行中",
    description: "移动端首页开发",
  },
]

// AR需求详情（带前后端负责人等）
export const mockARDetails: ARRequirementDetail[] = [
  {
    id: "ar-001",
    code: "AR-2024-001",
    name: "登录接口开发",
    frontend: "小王",
    backend: "小李",
    tester: "小张",
    testCaseCount: 5,
    status: "已完成",
    iterationId: "iter-001",
  },
  {
    id: "ar-002",
    code: "AR-2024-002",
    name: "OAuth2.0集成",
    frontend: "小王",
    backend: "小李",
    tester: "小张",
    testCaseCount: 8,
    status: "进行中",
    iterationId: "iter-004",
  },
  {
    id: "ar-003",
    code: "AR-2024-003",
    name: "角色管理API",
    frontend: "小赵",
    backend: "小钱",
    tester: "小孙",
    testCaseCount: 6,
    status: "进行中",
    iterationId: "iter-004",
  },
  {
    id: "ar-004",
    code: "AR-2024-004",
    name: "权限校验中间件",
    frontend: "-",
    backend: "小钱",
    tester: "小孙",
    testCaseCount: 4,
    status: "待分析",
    iterationId: "iter-005",
  },
  {
    id: "ar-005",
    code: "AR-2024-005",
    name: "数据源连接池管理",
    frontend: "-",
    backend: "小周",
    tester: "小吴",
    testCaseCount: 3,
    status: "待分析",
    iterationId: "iter-007",
  },
  {
    id: "ar-006",
    code: "AR-2024-006",
    name: "移动端首页开发",
    frontend: "小郑",
    backend: "小王",
    tester: "小冯",
    testCaseCount: 7,
    status: "待分析",
    iterationId: "iter-008",
  },
]

// 项目相关函数
export function getAllProjects(): Project[] {
  return mockProjects
}

export function getProjectById(id: string): Project | undefined {
  return mockProjects.find((p) => p.id === id)
}

export function getProjectByCode(code: string): Project | undefined {
  return mockProjects.find((p) => p.code === code)
}

// 版本相关函数
export function getAllVersions(): Version[] {
  return mockVersions
}

export function getVersionById(id: string): Version | undefined {
  return mockVersions.find((v) => v.id === id)
}

export function getVersionsByProjectId(projectId: string): Version[] {
  return mockVersions.filter((v) => v.projectId === projectId)
}

// 迭代相关函数
export function getAllIterations(): Iteration[] {
  return mockIterations
}

export function getIterationById(id: string): Iteration | undefined {
  return mockIterations.find((i) => i.id === id)
}

export function getIterationsByVersionId(versionId: string): Iteration[] {
  return mockIterations.filter((i) => i.versionId === versionId)
}

export function getIterationsByProjectId(projectId: string): Iteration[] {
  return mockIterations.filter((i) => i.projectId === projectId)
}

// AR详情相关函数
export function getARDetailsByIterationId(iterationId: string): ARRequirementDetail[] {
  return mockARDetails.filter((ar) => ar.iterationId === iterationId)
}

export function getARDetailById(id: string): ARRequirementDetail | undefined {
  return mockARDetails.find((ar) => ar.id === id)
}

// 项目成员数据
export const mockProjectMembers: Record<string, ProjectMember[]> = {
  "proj-001": [
    { id: "mem-001", name: "张伟", role: "负责人", email: "zhangwei@company.com" },
    { id: "mem-002", name: "李明", role: "项目经理", email: "liming@company.com" },
    { id: "mem-003", name: "小王", role: "前端开发", email: "xiaowang@company.com" },
    { id: "mem-004", name: "小李", role: "后端开发", email: "xiaoli@company.com" },
    { id: "mem-005", name: "小张", role: "测试工程师", email: "xiaozhang@company.com" },
    { id: "mem-006", name: "刘芳", role: "产品经理", email: "liufang@company.com" },
  ],
  "proj-002": [
    { id: "mem-011", name: "王芳", role: "负责人", email: "wangfang@company.com" },
    { id: "mem-012", name: "赵强", role: "项目经理", email: "zhaoqiang@company.com" },
    { id: "mem-013", name: "小周", role: "后端开发", email: "xiaozhou@company.com" },
    { id: "mem-014", name: "小吴", role: "测试工程师", email: "xiaowu@company.com" },
  ],
  "proj-003": [
    { id: "mem-021", name: "陈刚", role: "负责人", email: "chengang@company.com" },
    { id: "mem-022", name: "刘洋", role: "项目经理", email: "liuyang@company.com" },
    { id: "mem-023", name: "小郑", role: "前端开发", email: "xiaozheng@company.com" },
    { id: "mem-024", name: "小王", role: "后端开发", email: "xiaowang2@company.com" },
    { id: "mem-025", name: "小冯", role: "测试工程师", email: "xiaofeng@company.com" },
  ],
  "proj-004": [
    { id: "mem-031", name: "孙丽", role: "负责人", email: "sunli@company.com" },
    { id: "mem-032", name: "周杰", role: "项目经理", email: "zhoujie@company.com" },
  ],
}

// 操作日志数据
export const mockOperationLogs: OperationLog[] = [
  {
    id: "log-001",
    targetType: "project",
    targetId: "proj-001",
    action: "创建",
    operator: "admin",
    timestamp: "2024-01-01 09:00:00",
    description: "创建项目",
  },
  {
    id: "log-002",
    targetType: "project",
    targetId: "proj-001",
    action: "状态变更",
    operator: "李明",
    timestamp: "2024-01-15 10:30:00",
    oldValue: "未开始",
    newValue: "进行中",
    description: "项目正式启动",
  },
  {
    id: "log-003",
    targetType: "project",
    targetId: "proj-001",
    action: "添加成员",
    operator: "李明",
    timestamp: "2024-01-16 14:00:00",
    newValue: "小王、小李、小张",
    description: "添加开发团队成员",
  },
  {
    id: "log-004",
    targetType: "version",
    targetId: "ver-001",
    action: "创建",
    operator: "李明",
    timestamp: "2024-01-01 09:30:00",
    description: "创建版本 V1.0.0",
  },
  {
    id: "log-005",
    targetType: "version",
    targetId: "ver-001",
    action: "状态变更",
    operator: "张伟",
    timestamp: "2024-03-31 18:00:00",
    oldValue: "进行中",
    newValue: "已发布",
    description: "版本发布上线",
  },
  {
    id: "log-006",
    targetType: "version",
    targetId: "ver-002",
    action: "创建",
    operator: "李明",
    timestamp: "2024-04-01 09:00:00",
    description: "创建版本 V1.1.0",
  },
  {
    id: "log-007",
    targetType: "iteration",
    targetId: "iter-001",
    action: "创建",
    operator: "李明",
    timestamp: "2024-01-01 10:00:00",
    description: "创建迭代 Sprint 1",
  },
  {
    id: "log-008",
    targetType: "iteration",
    targetId: "iter-001",
    action: "添加需求",
    operator: "刘芳",
    timestamp: "2024-01-02 11:00:00",
    newValue: "AR-2024-001",
    description: "关联需求到迭代",
  },
  {
    id: "log-009",
    targetType: "iteration",
    targetId: "iter-001",
    action: "状态变更",
    operator: "李明",
    timestamp: "2024-01-31 18:00:00",
    oldValue: "进行中",
    newValue: "已完成",
    description: "迭代完成评审",
  },
  {
    id: "log-010",
    targetType: "iteration",
    targetId: "iter-004",
    action: "创建",
    operator: "李明",
    timestamp: "2024-04-01 09:30:00",
    description: "创建迭代 Sprint 4",
  },
  {
    id: "log-011",
    targetType: "project",
    targetId: "proj-002",
    action: "创建",
    operator: "admin",
    timestamp: "2024-02-01 09:00:00",
    description: "创建项目",
  },
  {
    id: "log-012",
    targetType: "project",
    targetId: "proj-003",
    action: "创建",
    operator: "admin",
    timestamp: "2024-03-01 09:00:00",
    description: "创建项目",
  },
]

// 获取项目成员
export function getProjectMembers(projectId: string): ProjectMember[] {
  return mockProjectMembers[projectId] || []
}

// 获取操作日志
export function getOperationLogs(targetType: "project" | "version" | "iteration", targetId: string): OperationLog[] {
  return mockOperationLogs.filter((log) => log.targetType === targetType && log.targetId === targetId)
}

// 获取项目的需求数量
export function getProjectRequirementCount(projectId: string): { total: number; completed: number; inProgress: number; blocked: number } {
  const iterations = getIterationsByProjectId(projectId)
  let total = 0
  let completed = 0
  let inProgress = 0
  let blocked = 0
  
  iterations.forEach((iter) => {
    const ars = getARDetailsByIterationId(iter.id)
    ars.forEach((ar) => {
      total++
      if (ar.status === "已完成") completed++
      else if (ar.status === "进行中") inProgress++
      else if (ar.status === "已关闭") blocked++
    })
  })
  
  return { total, completed, inProgress, blocked }
}

// 获取版本的需求数量
export function getVersionRequirementCount(versionId: string): { total: number; completed: number; inProgress: number; blocked: number } {
  const iterations = getIterationsByVersionId(versionId)
  let total = 0
  let completed = 0
  let inProgress = 0
  let blocked = 0
  
  iterations.forEach((iter) => {
    const ars = getARDetailsByIterationId(iter.id)
    ars.forEach((ar) => {
      total++
      if (ar.status === "已完成") completed++
      else if (ar.status === "进行中") inProgress++
      else if (ar.status === "已关闭") blocked++
    })
  })
  
  return { total, completed, inProgress, blocked }
}

// 获取迭代的需求数量
export function getIterationRequirementCount(iterationId: string): { total: number; completed: number; inProgress: number; blocked: number } {
  const ars = getARDetailsByIterationId(iterationId)
  let total = 0
  let completed = 0
  let inProgress = 0
  let blocked = 0
  
  ars.forEach((ar) => {
    total++
    if (ar.status === "已完成") completed++
    else if (ar.status === "进行中") inProgress++
    else if (ar.status === "已关闭") blocked++
  })
  
  return { total, completed, inProgress, blocked }
}

// ============ 测试用例数据 ============
import type { TestCaseDetail, TestStep, Bug, BugStatus, BugSeverity, TestCaseStatus } from "./types"

export const mockTestCases: TestCaseDetail[] = [
  {
    id: "tc-001",
    code: "TC-001",
    name: "用户登录功能验证",
    description: "验证用户使用正确的账号密码能够成功登录系统",
    precondition: "用户已注册账号，系统正常运行",
    steps: [
      { id: "step-001", stepNumber: 1, action: "打开登录页面", expectedResult: "显示登录表单" },
      { id: "step-002", stepNumber: 2, action: "输入正确的用户名", expectedResult: "用户名输入框显示输入内容" },
      { id: "step-003", stepNumber: 3, action: "输入正确的密码", expectedResult: "密码以掩码显示" },
      { id: "step-004", stepNumber: 4, action: "点击登录按钮", expectedResult: "成功登录并跳转到首页" },
    ],
    priority: "高",
    status: "通过",
    relatedArIds: ["ar-001"],
    assignee: "张三",
    creator: "李明",
    createdAt: "2024-03-01 10:00:00",
    executedAt: "2024-03-15 14:30:00",
    conclusion: "测试通过，功能正常",
    bugCount: 0,
    projectId: "proj-001",
    versionId: "ver-001",
    iterationId: "iter-001",
  },
  {
    id: "tc-002",
    code: "TC-002",
    name: "用户登录失败提示验证",
    description: "验证用户使用错误密码登录时的错误提示",
    precondition: "用户已注册账号",
    steps: [
      { id: "step-005", stepNumber: 1, action: "打开登录页面", expectedResult: "显示登录表单" },
      { id: "step-006", stepNumber: 2, action: "输入正确的用户名", expectedResult: "用户名输入框显示输入内容" },
      { id: "step-007", stepNumber: 3, action: "输入错误的密码", expectedResult: "密码以掩码显示" },
      { id: "step-008", stepNumber: 4, action: "点击登录按钮", expectedResult: "显示密码错误提示" },
    ],
    priority: "中",
    status: "不通过",
    relatedArIds: ["ar-001"],
    assignee: "张三",
    creator: "李明",
    createdAt: "2024-03-01 10:30:00",
    executedAt: "2024-03-15 15:00:00",
    conclusion: "错误提示不明确，需要优化",
    bugCount: 1,
    projectId: "proj-001",
    versionId: "ver-001",
    iterationId: "iter-001",
  },
  {
    id: "tc-003",
    code: "TC-003",
    name: "需求列表查询功���验证",
    description: "验证需求列表的搜索和筛选功能",
    precondition: "系统中已有需求数据",
    steps: [
      { id: "step-009", stepNumber: 1, action: "进入需求列表页面", expectedResult: "显示需求列表" },
      { id: "step-010", stepNumber: 2, action: "在搜索框输入关键字", expectedResult: "输入内容正常显示" },
      { id: "step-011", stepNumber: 3, action: "点击搜索按钮", expectedResult: "列表显示匹配结果" },
    ],
    priority: "高",
    status: "未执行",
    relatedArIds: ["ar-002"],
    creator: "王五",
    createdAt: "2024-03-05 09:00:00",
    bugCount: 0,
    projectId: "proj-001",
    versionId: "ver-001",
    iterationId: "iter-002",
  },
  {
    id: "tc-004",
    code: "TC-004",
    name: "需求详情编辑功能验证",
    description: "验证需求详情的编辑和保存功能",
    precondition: "有编辑权限的用户已登录",
    steps: [
      { id: "step-012", stepNumber: 1, action: "进入需求详情页面", expectedResult: "显示需求详情" },
      { id: "step-013", stepNumber: 2, action: "点击编辑按钮", expectedResult: "进入编辑模式" },
      { id: "step-014", stepNumber: 3, action: "修改需求内容", expectedResult: "内容可编辑" },
      { id: "step-015", stepNumber: 4, action: "点击保存按钮", expectedResult: "保存成功并显示更新内容" },
    ],
    priority: "高",
    status: "执行中",
    relatedArIds: ["ar-002", "ar-003"],
    assignee: "李四",
    creator: "王五",
    createdAt: "2024-03-06 10:00:00",
    bugCount: 2,
    projectId: "proj-001",
    versionId: "ver-002",
    iterationId: "iter-003",
  },
  {
    id: "tc-005",
    code: "TC-005",
    name: "报表导出功能验证",
    description: "验证报表数据导出为Excel功能",
    precondition: "报表有数据",
    steps: [
      { id: "step-016", stepNumber: 1, action: "进入报表页面", expectedResult: "显示报表数据" },
      { id: "step-017", stepNumber: 2, action: "点击导出按钮", expectedResult: "显示导出选项" },
      { id: "step-018", stepNumber: 3, action: "选择Excel格式", expectedResult: "开始下载" },
    ],
    priority: "中",
    status: "阻塞",
    relatedArIds: ["ar-004"],
    creator: "张三",
    createdAt: "2024-03-10 11:00:00",
    bugCount: 0,
    projectId: "proj-002",
    versionId: "ver-003",
    iterationId: "iter-004",
  },
]

// ============ Bug 数据 ============
export const mockBugs: Bug[] = [
  {
    id: "bug-001",
    code: "BUG-001",
    name: "登录失败提示信息不明确",
    description: "当用户输入错误密码时，系统只显示「登录失败」，没有具体说明是密码错误还是账号不存在",
    steps: "1. 打开登录页面\n2. 输入正确用户名和错误密码\n3. 点击登录按钮\n4. 观察错误提示",
    severity: "一般",
    status: "处理中",
    assignee: "张三",
    creator: "李明",
    createdAt: "2024-03-15 15:30:00",
    relatedTestCaseId: "tc-002",
    relatedArId: "ar-001",
    projectId: "proj-001",
    versionId: "ver-001",
    iterationId: "iter-001",
    taskId: "task-101",
  },
  {
    id: "bug-002",
    code: "BUG-002",
    name: "需求详情页面保存后数据未刷新",
    description: "编辑需求详情并保存后，页面显示的仍然是旧数据，需要手动刷新才能看到更新",
    steps: "1. 进入需求详情页\n2. 点击编辑\n3. 修改需求描述\n4. 点击保存\n5. 观察页面数据",
    severity: "严重",
    status: "新建",
    assignee: "王五",
    creator: "李四",
    createdAt: "2024-03-18 09:00:00",
    images: ["/uploads/bug-002-1.png", "/uploads/bug-002-2.png"],
    relatedTestCaseId: "tc-004",
    relatedArId: "ar-002",
    projectId: "proj-001",
    versionId: "ver-002",
    iterationId: "iter-003",
    taskId: "task-102",
  },
  {
    id: "bug-003",
    code: "BUG-003",
    name: "需求列表分页显示异常",
    description: "当需求列表数据超过100条时，分页组件显示错乱",
    steps: "1. 准备超过100条需求数据\n2. 打开需求列表\n3. 观察分页组件",
    severity: "一般",
    status: "已修复",
    assignee: "张三",
    creator: "王五",
    createdAt: "2024-03-12 14:00:00",
    resolvedAt: "2024-03-14 10:00:00",
    relatedArId: "ar-002",
    projectId: "proj-001",
    versionId: "ver-001",
    iterationId: "iter-002",
    taskId: "task-103",
  },
  {
    id: "bug-004",
    code: "BUG-004",
    name: "导出Excel文件格式错误",
    description: "导出的Excel文件用WPS打开时提示格式错误",
    steps: "1. 进入报表页面\n2. 点击导出\n3. 用WPS打开下载的文件",
    severity: "轻微",
    status: "已关闭",
    assignee: "李四",
    creator: "张三",
    createdAt: "2024-03-08 16:00:00",
    resolvedAt: "2024-03-10 11:00:00",
    relatedArId: "ar-004",
    projectId: "proj-002",
    versionId: "ver-003",
    iterationId: "iter-004",
  },
  {
    id: "bug-005",
    code: "BUG-005",
    name: "系统在IE浏览器下样式异常",
    description: "使用IE11浏览器访问系统时，部分页面样式显示不正常",
    steps: "1. 使用IE11打开系统\n2. 查看各页面样式",
    severity: "建议",
    status: "已关闭",
    creator: "测试员",
    createdAt: "2024-02-20 10:00:00",
    resolvedAt: "2024-02-22 15:00:00",
    projectId: "proj-001",
  },
]

// 获取所有测试用例
export function getAllTestCases(): TestCaseDetail[] {
  return mockTestCases
}

// 根据ID获取测试用例
export function getTestCaseById(id: string): TestCaseDetail | undefined {
  return mockTestCases.find((tc) => tc.id === id)
}

// 根据条件筛选测试用例
export function filterTestCases(filters: {
  projectId?: string
  versionId?: string
  iterationId?: string
  status?: TestCaseStatus
}): TestCaseDetail[] {
  return mockTestCases.filter((tc) => {
    if (filters.projectId && tc.projectId !== filters.projectId) return false
    if (filters.versionId && tc.versionId !== filters.versionId) return false
    if (filters.iterationId && tc.iterationId !== filters.iterationId) return false
    if (filters.status && tc.status !== filters.status) return false
    return true
  })
}

// 获取测试用例的操作日志
export function getTestCaseLogs(testCaseId: string): OperationLog[] {
  return mockOperationLogs.filter((log) => log.targetType === "testcase" && log.targetId === testCaseId)
}

// 获取所有Bug
export function getAllBugs(): Bug[] {
  return mockBugs
}

// 根据ID获取Bug
export function getBugById(id: string): Bug | undefined {
  return mockBugs.find((bug) => bug.id === id)
}

// 根据条件筛选Bug
export function filterBugs(filters: {
  projectId?: string
  versionId?: string
  iterationId?: string
  status?: BugStatus
  severity?: BugSeverity
}): Bug[] {
  return mockBugs.filter((bug) => {
    if (filters.projectId && bug.projectId !== filters.projectId) return false
    if (filters.versionId && bug.versionId !== filters.versionId) return false
    if (filters.iterationId && bug.iterationId !== filters.iterationId) return false
    if (filters.status && bug.status !== filters.status) return false
    if (filters.severity && bug.severity !== filters.severity) return false
    return true
  })
}

// 获取Bug的操作日志
export function getBugLogs(bugId: string): OperationLog[] {
  return mockOperationLogs.filter((log) => log.targetType === "bug" && log.targetId === bugId)
}

// 根据测试用例ID获取关联的Bug
export function getBugsByTestCaseId(testCaseId: string): Bug[] {
  return mockBugs.filter((bug) => bug.relatedTestCaseId === testCaseId)
}

// 根据AR需求ID获取关联的测试用例
export function getTestCasesByArId(arId: string): TestCaseDetail[] {
  return mockTestCases.filter((tc) => tc.relatedArIds.includes(arId))
}

// 根据AR需求ID获取关联的Bug
export function getBugsByArId(arId: string): Bug[] {
  return mockBugs.filter((bug) => bug.relatedArId === arId)
}
