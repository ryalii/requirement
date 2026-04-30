"use client"

import { History } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { Requirement } from "@/lib/types"

interface RequirementHistoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requirement?: Requirement | null
  requirementCode?: string
}

export function RequirementHistoryDialog({
  open,
  onOpenChange,
  requirement,
  requirementCode,
}: RequirementHistoryDialogProps) {
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

        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <History className="size-12 mb-4 text-gray-300" />
          <p className="text-lg font-medium">暂无历史记录</p>
          <p className="text-sm mt-1">需求变更历史功能开发中</p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
