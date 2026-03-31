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

// 任务类型
export type TaskType = "需求" | "测试" | "临时" | "调研" | "支持"

// 任务状态
export type TaskStatus = "待分配" | "进行中" | "已完成" | "已关闭"

// 任务接口
export interface Task {
  id: string
  code: string // 任务编号
  name: string // 任务名称
  type: TaskType // 任务类型
  assignee?: string // 分配人
  creator: string // 创建人
  deadline: string // 截止日期
  createdAt: string // 创建时间
  status: TaskStatus // 状态
  description?: string // 描述
  relatedRequirementId?: string // 关联需求ID
}

// 任务操作记录
export interface TaskHistory {
  id: string
  taskId: string
  action: string // 操作类型
  operator: string // 操作人
  timestamp: string // 操作时间
  oldValue?: string // 旧值
  newValue?: string // 新值
  description?: string // 描述
}
