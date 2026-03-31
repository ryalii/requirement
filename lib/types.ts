// 需求类型
export type RequirementType = "LMT" | "IR" | "SR" | "AR"

// 需求状态
export type RequirementStatus = "待分析" | "进行中" | "已完成" | "已关闭"

// 需求优先级
export type RequirementPriority = "高" | "中" | "低"

// 基础需求接口
export interface Requirement {
  id: string
  code: string // 需求编号
  name: string // 需求名称
  type: RequirementType // 需求类型
  customer: string // 来源客户
  project?: string // 项目（非必填）
  expectedDate: string // 期望解决时间
  createdAt: string // 创建时间
  status: RequirementStatus // 状态
  priority: RequirementPriority // 优先级
  description?: string // 描述
  parentId?: string // 父需求ID
}

// LMT需求（市场需求）
export interface LMTRequirement extends Requirement {
  type: "LMT"
  irId?: string // 转换后的IR需求ID
}

// IR需求（原始需求）
export interface IRRequirement extends Requirement {
  type: "IR"
  srIds?: string[] // 关联的SR需求ID
}

// SR需求（系统需求）
export interface SRRequirement extends Requirement {
  type: "SR"
  parentIrId?: string // 上级IR需求ID
  arIds?: string[] // 关联的AR需求ID
}

// AR需求（软件需求）
export interface ARRequirement extends Requirement {
  type: "AR"
  parentSrId?: string // 上级SR需求ID
  testCases?: TestCase[] // 关联测试用例
}

// 测试用例
export interface TestCase {
  id: string
  code: string // 用例编号
  name: string // 用例名称
  status: "通过" | "失败" | "未执行"
  priority: "高" | "中" | "低"
  executedAt?: string // 执行时间
}

// 需求树节点
export interface RequirementTreeNode {
  requirement: Requirement
  children?: RequirementTreeNode[]
}
