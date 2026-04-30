"use client"

import * as React from "react"
import { Sparkles, ArrowRight } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Requirement, RequirementPriority } from "@/lib/types"

interface ConvertToIRDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lmtRequirement: Requirement | null
  onSave: (irData: {
    name: string
    description: string
    priority: RequirementPriority
    expectedDate: string
  }) => void
}

export function ConvertToIRDialog({
  open,
  onOpenChange,
  lmtRequirement,
  onSave,
}: ConvertToIRDialogProps) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [priority, setPriority] = React.useState<RequirementPriority>("中")
  const [expectedDate, setExpectedDate] = React.useState("")

  React.useEffect(() => {
    if (open && lmtRequirement) {
      setName(lmtRequirement.name)
      setDescription(lmtRequirement.description || "")
      setPriority(lmtRequirement.priority)
      setExpectedDate(lmtRequirement.expectedDate)
    }
  }, [open, lmtRequirement])

  const handleAIGenerate = () => {
    setName(`[IR] ${lmtRequirement?.name}`)
    setDescription(
      `【需求背景】\n基于市场需求"${lmtRequirement?.name}"，需要进行系统化的需求分析和规划。\n\n` +
      `【需求目标】\n${lmtRequirement?.description || "待补充"}\n\n` +
      `【验收标准】\n1. 功能完整性：满足所有功能需求\n2. 性能指标：系统响应时间 < 2s\n3. 可用性：系统可用性 > 99.9%\n\n` +
      `【约束条件】\n1. 技术栈：符合公司技术规范\n2. 安全要求：通过安全审计`
    )
    setPriority(lmtRequirement?.priority || "中")
  }

  const handleSave = () => {
    if (name.trim()) {
      onSave({
        name,
        description,
        priority,
        expectedDate,
      })
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            转换为IR需求
            <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
              LMT → IR
            </Badge>
          </DialogTitle>
          <DialogDescription>
            将市场需求(LMT)转换为原始需求(IR)，进入需求分析流程
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-auto pr-2">
          {/* 源需求信息 */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                LMT
              </Badge>
              <span className="text-sm text-gray-500">源市场需求</span>
            </div>
            <div className="font-medium">{lmtRequirement?.code} - {lmtRequirement?.name}</div>
            {lmtRequirement?.description && (
              <div className="text-sm text-gray-600 mt-2">{lmtRequirement.description}</div>
            )}
          </div>

          {/* 转换箭头 */}
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-gray-400">
              <ArrowRight className="size-5" />
              <span className="text-sm">转换为</span>
              <ArrowRight className="size-5" />
            </div>
          </div>

          {/* AI辅助按钮 */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={handleAIGenerate}
              className="gap-2"
            >
              <Sparkles className="size-4 text-amber-500" />
              AI 辅助优化
            </Button>
          </div>

          {/* IR需求表单 */}
          <div className="p-4 border rounded-lg bg-white space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                IR
              </Badge>
              <span className="text-sm text-gray-500">目标原始需求</span>
            </div>

            <div>
              <Label>需求名称 <span className="text-red-500">*</span></Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="请输入IR需求名称"
                className="mt-1"
              />
            </div>

            <div>
              <Label>需求描述</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="请输入详细的需求描述"
                className="mt-1 resize-none"
                rows={8}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>优先级</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as RequirementPriority)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="高">高</SelectItem>
                    <SelectItem value="中">中</SelectItem>
                    <SelectItem value="低">低</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>期望完成日期</Label>
                <Input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={!name.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            确认转换
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
