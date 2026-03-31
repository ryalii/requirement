"use client"

import * as React from "react"
import Link from "next/link"
import { Eye, Pencil, Trash2, MoreHorizontal, GitBranch, ArrowRightCircle, Download } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DecomposeDialog } from "@/components/decompose-dialog"
import { ConvertToIRDialog } from "@/components/convert-to-ir-dialog"
import type { Requirement, RequirementType } from "@/lib/types"
import { getRequirementById } from "@/lib/mock-data"

interface RequirementsTableProps {
  requirements: Requirement[]
  onDelete?: (id: string)=> void
  filterType?: string // 当前筛选的类型，如果有则隐藏类型列
  onExport?: () => void
}

const typeColors: Record<RequirementType, string> = {
  LMT: "bg-purple-100 text-purple-700 border-purple-200",
  IR: "bg-blue-100 text-blue-700 border-blue-200",
  SR: "bg-green-100 text-green-700 border-green-200",
  AR: "bg-orange-100 text-orange-700 border-orange-200",
}

const statusColors: Record<string, string> = {
  待分析: "bg-gray-100 text-gray-600",
  进行中: "bg-blue-100 text-blue-600",
  已完成: "bg-green-100 text-green-600",
  已关闭: "bg-gray-200 text-gray-500",
}

export function RequirementsTable({
  requirements,
  onDelete,
  filterType,
  onExport,
}: RequirementsTableProps) {
  const [decomposeOpen, setDecomposeOpen] = React.useState(false)
  const [convertOpen, setConvertOpen] = React.useState(false)
  const [selectedRequirement, setSelectedRequirement] = React.useState<Requirement | null>(null)
  const [targetType, setTargetType] = React.useState<"SR" | "AR">("SR")

  // 是否显示类型列（如果已经按类型筛选则隐藏）
  const showTypeColumn = !filterType || filterType === "all"
  
  // 是否显示上级需求列（SR和AR需要显示）
  const showParentColumn = filterType === "SR" || filterType === "AR"

  const handleDecompose = (req: Requirement, target: "SR" | "AR") => {
    setSelectedRequirement(req)
    setTargetType(target)
    setDecomposeOpen(true)
  }

  const handleConvertToIR = (req: Requirement) => {
    setSelectedRequirement(req)
    setConvertOpen(true)
  }

  const handleDecomposeSave = (items: { id: string; name: string; description: string; priority: string }[]) => {
    console.log("保存拆解结果:", items)
    alert(`成功拆解为 ${items.length} 个 ${targetType} 需求`)
  }

  const handleConvertSave = (data: { name: string; description: string; priority: string; expectedDate: string }) => {
    console.log("转换为IR:", data)
    alert(`成功将 ${selectedRequirement?.code} 转换为 IR 需求`)
  }

  // 获取上级需求信息
  const getParentRequirement = (req: Requirement) => {
    if (!req.parentId) return null
    return getRequirementById(req.parentId)
  }

  return (
    <>
      <div className="rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="font-semibold text-gray-700 whitespace-nowrap">需求编号</TableHead>
              <TableHead className="font-semibold text-gray-700 whitespace-nowrap">需求名称</TableHead>
              {showTypeColumn && (
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap">需求类型</TableHead>
              )}
              {showParentColumn && (
                <TableHead className="font-semibold text-gray-700 whitespace-nowrap">上级需求</TableHead>
              )}
              <TableHead className="font-semibold text-gray-700 whitespace-nowrap">项目</TableHead>
              <TableHead className="font-semibold text-gray-700 whitespace-nowrap">来源客户</TableHead>
              <TableHead className="font-semibold text-gray-700 whitespace-nowrap">优先级</TableHead>
              <TableHead className="font-semibold text-gray-700 whitespace-nowrap">状态</TableHead>
              <TableHead className="font-semibold text-gray-700 whitespace-nowrap">期望解决时间</TableHead>
              <TableHead className="font-semibold text-gray-700 whitespace-nowrap">创建时间</TableHead>
              <TableHead className="font-semibold text-gray-700 text-center whitespace-nowrap">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {requirements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={showTypeColumn ? (showParentColumn ? 11 : 10) : (showParentColumn ? 10 : 9)} className="h-24 text-center text-gray-500">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              requirements.map((req) => {
                const parentReq = getParentRequirement(req)
                return (
                  <TableRow key={req.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium text-blue-600 whitespace-nowrap">
                      <Link href={`/requirements/${req.id}`} className="hover:underline">
                        {req.code}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate" title={req.name}>
                      {req.name}
                    </TableCell>
                    {showTypeColumn && (
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={typeColors[req.type]}
                        >
                          {req.type}
                        </Badge>
                      </TableCell>
                    )}
                    {showParentColumn && (
                      <TableCell>
                        {parentReq ? (
                          <Link 
                            href={`/requirements/${parentReq.id}`}
                            className="text-blue-600 hover:underline flex items-center gap-1"
                          >
                            <Badge variant="outline" className={typeColors[parentReq.type] + " text-xs"}>
                              {parentReq.type}
                            </Badge>
                            <span className="truncate max-w-[120px]" title={parentReq.code}>
                              {parentReq.code}
                            </span>
                          </Link>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-gray-600">
                      {req.project || <span className="text-gray-400">-</span>}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{req.customer}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          req.priority === "高"
                            ? "bg-red-100 text-red-700"
                            : req.priority === "中"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {req.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          statusColors[req.status] || "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {req.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600 whitespace-nowrap">{req.expectedDate}</TableCell>
                    <TableCell className="text-gray-600 whitespace-nowrap">{req.createdAt}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-1">
                        <Link href={`/requirements/${req.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 whitespace-nowrap">
                            <Eye className="size-4 mr-1" />
                            详情
                          </Button>
                        </Link>
                        <Button variant="ghost" size="sm" className="h-8 text-gray-600 hover:text-gray-700 hover:bg-gray-100 whitespace-nowrap">
                          <Pencil className="size-4 mr-1" />
                          编辑
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 text-gray-600 whitespace-nowrap">
                              <MoreHorizontal className="size-4" />
                              更多
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            {/* LMT特有操作：转换为IR */}
                            {req.type === "LMT" && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleConvertToIR(req)}
                                  className="text-purple-600"
                                >
                                  <ArrowRightCircle className="size-4 mr-2" />
                                  转换为 IR
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {/* IR特有操作：拆解为SR */}
                            {req.type === "IR" && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleDecompose(req, "SR")}
                                  className="text-blue-600"
                                >
                                  <GitBranch className="size-4 mr-2" />
                                  拆解为 SR
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            {/* SR特有操作：拆解为AR */}
                            {req.type === "SR" && (
                              <>
                                <DropdownMenuItem 
                                  onClick={() => handleDecompose(req, "AR")}
                                  className="text-green-600"
                                >
                                  <GitBranch className="size-4 mr-2" />
                                  拆解为 AR
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem>复制链接</DropdownMenuItem>
                            <DropdownMenuItem>查看历史</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-red-600 focus:text-red-600"
                                >
                                  <Trash2 className="size-4 mr-2" />
                                  删除
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    确定要删除需求 "{req.code}" 吗？此操作无法撤销。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    className="bg-red-600 hover:bg-red-700"
                                    onClick={() => onDelete?.(req.id)}
                                  >
                                    删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* 拆解对话框 */}
      <DecomposeDialog
        open={decomposeOpen}
        onOpenChange={setDecomposeOpen}
        requirement={selectedRequirement}
        targetType={targetType}
        onSave={handleDecomposeSave}
      />

      {/* LMT转IR对话框 */}
      <ConvertToIRDialog
        open={convertOpen}
        onOpenChange={setConvertOpen}
        lmtRequirement={selectedRequirement}
        onSave={handleConvertSave}
      />
    </>
  )
}
