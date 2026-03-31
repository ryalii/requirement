"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Requirement, RequirementType } from "@/lib/types"
import { getAllRequirements } from "@/lib/mock-data"

interface RequirementFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  defaultType?: RequirementType // 默认需求类型（从特定类型页面新增时使用）
  requirement?: Requirement | null // 编辑时传入的需求数据
  onSave: (data: Partial<Requirement>) => void
}

export function RequirementFormDialog({
  open,
  onOpenChange,
  mode,
  defaultType,
  requirement,
  onSave,
}: RequirementFormDialogProps) {
  const [saving, setSaving] = React.useState(false)
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    type: defaultType || "LMT" as RequirementType,
    customer: "",
    project: "",
    expectedDate: "",
    priority: "中" as "高" | "中" | "低",
    status: "待分析" as "待分析" | "进行中" | "已完成" | "已关闭",
    description: "",
    parentId: "",
  })

  // 获取可选的父需求列表
  const allRequirements = getAllRequirements()
  
  // 根据当前类型获取可选的父需求
  const getParentOptions = () => {
    switch (formData.type) {
      case "SR":
        return allRequirements.filter(r => r.type === "IR")
      case "AR":
        return allRequirements.filter(r => r.type === "SR")
      default:
        return []
    }
  }

  const parentOptions = getParentOptions()
  const showParentSelect = formData.type === "SR" || formData.type === "AR"
  const showTypeSelect = !defaultType // 只有在概览页面新增时才显示类型选择

  // 初始化表单数据
  React.useEffect(() => {
    if (mode === "edit" && requirement) {
      setFormData({
        code: requirement.code,
        name: requirement.name,
        type: requirement.type,
        customer: requirement.customer,
        project: requirement.project || "",
        expectedDate: requirement.expectedDate,
        priority: requirement.priority,
        status: requirement.status,
        description: requirement.description || "",
        parentId: requirement.parentId || "",
      })
    } else if (mode === "create") {
      // 重置表单
      const newCode = generateCode(defaultType || "LMT")
      setFormData({
        code: newCode,
        name: "",
        type: defaultType || "LMT",
        customer: "",
        project: "",
        expectedDate: "",
        priority: "中",
        status: "待分析",
        description: "",
        parentId: "",
      })
    }
  }, [mode, requirement, defaultType, open])

  // 当类型变化时，清空父需求选择并更新编号
  React.useEffect(() => {
    if (mode === "create") {
      setFormData(prev => ({
        ...prev,
        parentId: "",
        code: generateCode(prev.type),
      }))
    }
  }, [formData.type, mode])

  // 生成需求编号
  function generateCode(type: RequirementType): string {
    const year = new Date().getFullYear()
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, "0")
    return `${type}-${year}-${random}`
  }

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("请输入需求名称")
      return
    }
    if (!formData.customer.trim()) {
      alert("请输入来源客户")
      return
    }
    if (!formData.expectedDate) {
      alert("请选择期望解决时间")
      return
    }
    if (showParentSelect && !formData.parentId) {
      alert(`请选择上级${formData.type === "SR" ? "IR" : "SR"}需求`)
      return
    }

    setSaving(true)
    // 模拟保存延迟
    await new Promise(resolve => setTimeout(resolve, 500))
    
    onSave({
      ...formData,
      id: requirement?.id || `${formData.type.toLowerCase()}-${Date.now()}`,
      createdAt: requirement?.createdAt || new Date().toISOString().split("T")[0],
    })
    
    setSaving(false)
    onOpenChange(false)
  }

  const dialogTitle = mode === "create" 
    ? (defaultType ? `新增${defaultType}需求` : "新增需求")
    : "编辑需求"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            {/* 需求编号 */}
            <div className="space-y-2">
              <Label htmlFor="code">需求编号</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="自动生成"
                disabled={mode === "edit"}
              />
            </div>

            {/* 需求类型 - 只在概览页新增时显示 */}
            {showTypeSelect && (
              <div className="space-y-2">
                <Label>需求类型</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v) => setFormData({ ...formData, type: v as RequirementType })}
                  disabled={mode === "edit"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="请选择需求类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LMT">LMT - 市场需求</SelectItem>
                    <SelectItem value="IR">IR - 原始需求</SelectItem>
                    <SelectItem value="SR">SR - 系统需求</SelectItem>
                    <SelectItem value="AR">AR - 软件需求</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* 默认类型时显示只读类型 */}
            {!showTypeSelect && (
              <div className="space-y-2">
                <Label>需求类型</Label>
                <Input value={`${defaultType} 需求`} disabled />
              </div>
            )}
          </div>

          {/* 需求名称 */}
          <div className="space-y-2">
            <Label htmlFor="name">
              需求名称 <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入需求名称"
            />
          </div>

          {/* 父需求选择 - SR和AR需要 */}
          {showParentSelect && (
            <div className="space-y-2">
              <Label>
                上级{formData.type === "SR" ? "IR" : "SR"}需求 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.parentId}
                onValueChange={(v) => setFormData({ ...formData, parentId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={`请选择上级${formData.type === "SR" ? "IR" : "SR"}需求`} />
                </SelectTrigger>
                <SelectContent>
                  {parentOptions.map((req) => (
                    <SelectItem key={req.id} value={req.id}>
                      {req.code} - {req.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {/* 来源客户 */}
            <div className="space-y-2">
              <Label htmlFor="customer">
                来源客户 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customer"
                value={formData.customer}
                onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                placeholder="请输入来源客户"
              />
            </div>

            {/* 项目 */}
            <div className="space-y-2">
              <Label htmlFor="project">项目</Label>
              <Input
                id="project"
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                placeholder="请输入项目名称（选填）"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {/* 优先级 */}
            <div className="space-y-2">
              <Label>优先级</Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as "高" | "中" | "低" })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="高">高</SelectItem>
                  <SelectItem value="中">中</SelectItem>
                  <SelectItem value="低">低</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 状态 */}
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="待分析">待分析</SelectItem>
                  <SelectItem value="进行中">进行中</SelectItem>
                  <SelectItem value="已完成">已完成</SelectItem>
                  <SelectItem value="已关闭">已关闭</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 期望解决时间 */}
            <div className="space-y-2">
              <Label htmlFor="expectedDate">
                期望解决时间 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="expectedDate"
                type="date"
                value={formData.expectedDate}
                onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
              />
            </div>
          </div>

          {/* 需求描述 */}
          <div className="space-y-2">
            <Label htmlFor="description">需求描述</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入需求描述"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving && <Loader2 className="size-4 mr-2 animate-spin" />}
            {mode === "create" ? "创建" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
