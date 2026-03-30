import type { Requirement, TestCase } from "./types"

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
  // IR需求
  {
    id: "ir-001",
    code: "IR-2024-001",
    name: "用户管理系统升级",
    type: "IR",
    customer: "华为技术",
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
