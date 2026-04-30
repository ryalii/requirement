"use client"

import * as React from "react"
import { Sparkles, Plus, Trash2, Loader2 } from "lucide-react"
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
import type { Requirement, RequirementType, RequirementPriority } from "@/lib/types"

interface DecomposeItem {
  id: string
  name: string
  description: string
  priority: RequirementPriority
}

interface DecomposeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requirement: Requirement | null
  targetType: "SR" | "AR" // IR拆解为SR，SR拆解为AR
  onSave: (items: DecomposeItem[]) => void
}

export function DecomposeDialog({
  open,
  onOpenChange,
  requirement,
  targetType,
  onSave,
}: DecomposeDialogProps) {
  const [items, setItems] = React.useState<DecomposeItem[]>([])

  const sourceType = targetType === "SR" ? "IR" : "SR"
  const targetLabel = targetType === "SR" ? "系统需求(SR)" : "软件需求(AR)"

  React.useEffect(() => {
    if (open) {
      setItems([])
    }
  }, [open])

  const handleAIGenerate = () => {
    const aiGeneratedItems: DecomposeItem[] = targetType === "SR"
      ? [
          {
            id: `temp-${Date.now()}-1`,
            name: `${requirement?.name} - 功能模块设计`,
            description: `基于原始需求"${requirement?.name}"，设计核心功能模块架构，定义模块接口和数据流。`,
            priority: "高",
          },
          {
            id: `temp-${Date.now()}-2`,
            name: `${requirement?.name} - 性能需求分析`,
            description: `分析系统性能指标要求，包括响应时间、并发处理能力、数据吞吐量等。`,
            priority: "中",
          },
          {
            id: `temp-${Date.now()}-3`,
            name: `${requirement?.name} - 安全需求规范`,
            description: `定义系统安全需求，包括身份认证、权限控制、数据加密、审计日志等。`,
            priority: "高",
          },
        ]
      : [
          {
            id: `temp-${Date.now()}-1`,
            name: `${requirement?.name} - 接口开发`,
            description: `实现${requirement?.name}相关的后端API接口，包括数据校验、业务逻辑处理。`,
            priority: "高",
          },
          {
            id: `temp-${Date.now()}-2`,
            name: `${requirement?.name} - 前端页面`,
            description: `开发${requirement?.name}对应的前端页面组件，实现用户交互功能。`,
            priority: "中",
          },
          {
            id: `temp-${Date.now()}-3`,
            name: `${requirement?.name} - 单元测试`,
            description: `编写${requirement?.name}功能的单元测试用例，确保代码质量。`,
            priority: "低",
          },
        ]

    setItems(aiGeneratedItems)
  }

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        id: `temp-${Date.now()}`,
        name: "",
        description: "",
        priority: "中",
      },
    ])
  }

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const handleItemChange = (id: string, field: keyof DecomposeItem, value: string) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  const handleSave = () => {
    const validItems = items.filter((item) => item.name.trim())
    if (validItems.length > 0) {
      onSave(validItems)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            需求拆解
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              {sourceType} → {targetType}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            将 {sourceType} 需求拆解为多个 {targetLabel}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-auto pr-2">
          {/* 源需求信息 */}
          <div className="p-4 bg-gray-50 rounded-lg border">
            <div className="text-sm text-gray-500 mb-1">源需求</div>
            <div className="font-medium">{requirement?.code} - {requirement?.name}</div>
            {requirement?.description && (
              <div className="text-sm text-gray-600 mt-2">{requirement.description}</div>
            )}
          </div>

          {/* AI辅助按钮 */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handleAIGenerate}
              className="gap-2"
            >
              <Sparkles className="size-4 text-amber-500" />
              AI 辅助拆解
            </Button>
            <Button variant="outline" size="sm" onClick={handleAddItem} className="gap-1">
              <Plus className="size-4" />
              手动添加
            </Button>
          </div>

          {/* 拆解项列表 */}
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                点击「AI 辅助拆解」自动生成，或「手动添加」逐条录入
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-4 border rounded-lg bg-white space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {targetType} #{index + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 px-2"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid grid-cols-4 gap-3">
                      <div className="col-span-3">
                        <Label className="text-xs text-gray-500">需求名称</Label>
                        <Input
                          value={item.name}
                          onChange={(e) =>
                            handleItemChange(item.id, "name", e.target.value)
                          }
                          placeholder="请输入需求名称"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500">优先级</Label>
                        <Select
                          value={item.priority}
                          onValueChange={(value) =>
                            handleItemChange(item.id, "priority", value)
                          }
                        >
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
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500">需求描述</Label>
                      <Textarea
                        value={item.description}
                        onChange={(e) =>
                          handleItemChange(item.id, "description", e.target.value)
                        }
                        placeholder="请输入需求描述"
                        className="mt-1 resize-none"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter className="border-t pt-4 mt-4">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-gray-500">
              共 {items.filter((i) => i.name.trim()).length} 个有效拆解项
            </span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <Button
                onClick={handleSave}
                disabled={items.filter((i) => i.name.trim()).length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                保存拆解
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
