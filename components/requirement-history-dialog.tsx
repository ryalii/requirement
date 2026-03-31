"use client"

import * as React from "react"
import { History, User, Calendar, ArrowRight, FileText, Tag, AlertCircle, CheckCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Requirement } from "@/lib/types"

interface HistoryRecord {
  id: string
  action: "创建" | "修改" | "状态变更" | "优先级变更" | "分配" | "关联"
  field?: string
  oldValue?: string
  newValue?: string
  operator: string
  operateTime: string
  remark?: string
}

// 模拟历史记录数据
function generateMockHistory(requirement: Requirement): HistoryRecord[] {
  const baseTime = new Date(requirement.createdAt)
  
  const histories: HistoryRecord[] = [
    {
      id: "h-001",
      action: "创建",
      operator: "admin01",
      operateTime: requirement.createdAt + " 09:30:00",
      remark: `创建需求 ${requirement.code}`,
    },
  ]

  // 根据需求状态添加状态变更记录
  if (requirement.status !== "待分析") {
    histories.push({
      id: "h-002",
      action: "状态变更",
      field: "状态",
      oldValue: "待分析",
      newValue: "进行中",
      operator: "zhangsan",
      operateTime: new Date(baseTime.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] + " 14:20:00",
      remark: "开始需求分析",
    })
  }

  if (requirement.status === "已完成") {
    histories.push({
      id: "h-003",
      action: "状态变更",
      field: "状态",
      oldValue: "进行中",
      newValue: "已完成",
      operator: "lisi",
      operateTime: new Date(baseTime.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] + " 16:45:00",
      remark: "需求已完成开发和测试",
    })
  }

  // 添加一些通用修改记录
  histories.push({
    id: "h-004",
    action: "修改",
    field: "需求描述",
    oldValue: "原始描述内容...",
    newValue: requirement.description || "更新后的描述内容",
    operator: "wangwu",
    operateTime: new Date(baseTime.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] + " 10:15:00",
    remark: "补充需求细节",
  })

  if (requirement.priority === "高") {
    histories.push({
      id: "h-005",
      action: "优先级变更",
      field: "优先级",
      oldValue: "中",
      newValue: "高",
      operator: "admin01",
      operateTime: new Date(baseTime.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0] + " 09:00:00",
      remark: "客户要求加急处理",
    })
  }

  // 按时间倒序排列
  return histories.sort((a, b) => 
    new Date(b.operateTime).getTime() - new Date(a.operateTime).getTime()
  )
}

const actionIcons: Record<string, React.ReactNode> = {
  "创建": <FileText className="size-4 text-green-600" />,
  "修改": <FileText className="size-4 text-blue-600" />,
  "状态变更": <CheckCircle className="size-4 text-purple-600" />,
  "优先级变更": <AlertCircle className="size-4 text-orange-600" />,
  "分配": <User className="size-4 text-cyan-600" />,
  "关联": <Tag className="size-4 text-gray-600" />,
}

const actionColors: Record<string, string> = {
  "创建": "bg-green-100 text-green-700",
  "修改": "bg-blue-100 text-blue-700",
  "状态变更": "bg-purple-100 text-purple-700",
  "优先级变更": "bg-orange-100 text-orange-700",
  "分配": "bg-cyan-100 text-cyan-700",
  "关联": "bg-gray-100 text-gray-700",
}

interface RequirementHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requirement?: Requirement | null
  requirementCode?: string // 支持只传编号的方式
}

export function RequirementHistoryDialog({
  open,
  onOpenChange,
  requirement,
  requirementCode,
}: RequirementHistoryDialogProps) {
  // 如果没有requirement对象，但有code，创建一个临时对象用于显示
  const displayRequirement = requirement || (requirementCode ? {
    id: "temp",
    code: requirementCode,
    name: "需求详情",
    type: "IR" as const,
    customer: "",
    expectedDate: "",
    createdAt: new Date().toISOString().split("T")[0],
    status: "进行中" as const,
    priority: "中" as const,
  } : null)

  if (!displayRequirement) return null

  const histories = generateMockHistory(displayRequirement)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-5 text-blue-600" />
            变更历史记录
          </DialogTitle>
          <div className="text-sm text-gray-500 pt-1">
            {displayRequirement.code} {requirement?.name ? `- ${requirement.name}` : ""}
          </div>
        </DialogHeader>

        <ScrollArea className="h-[500px] pr-4">
          <div className="relative">
            {/* 时间轴线 */}
            <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-gray-200" />
            
            <div className="space-y-6">
              {histories.map((record, index) => (
                <div key={record.id} className="relative flex gap-4">
                  {/* 时间轴节点 */}
                  <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-white border-2 border-gray-200">
                    {actionIcons[record.action]}
                  </div>

                  {/* 内容卡片 */}
                  <div className="flex-1 rounded-lg border bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className={actionColors[record.action]}>
                            {record.action}
                          </Badge>
                          {record.field && (
                            <span className="text-sm text-gray-600">
                              字段: {record.field}
                            </span>
                          )}
                        </div>
                        
                        {/* 变更详情 */}
                        {record.oldValue && record.newValue && (
                          <div className="flex items-center gap-2 text-sm mt-2 p-2 bg-gray-50 rounded">
                            <span className="text-gray-500 line-through max-w-[200px] truncate" title={record.oldValue}>
                              {record.oldValue}
                            </span>
                            <ArrowRight className="size-4 text-gray-400 shrink-0" />
                            <span className="text-gray-900 font-medium max-w-[200px] truncate" title={record.newValue}>
                              {record.newValue}
                            </span>
                          </div>
                        )}

                        {/* 备注 */}
                        {record.remark && (
                          <p className="text-sm text-gray-600 mt-2">
                            {record.remark}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* 操作信息 */}
                    <div className="flex items-center gap-4 mt-3 pt-3 border-t text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="size-3" />
                        <span>{record.operator}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        <span>{record.operateTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
