"use client"

import * as React from "react"
import Link from "next/link"
import { Eye, Pencil, Trash2, MoreHorizontal } from "lucide-react"
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
import type { Requirement, RequirementType } from "@/lib/types"

interface RequirementsTableProps {
  requirements: Requirement[]
  onDelete?: (id: string) => void
}

const typeColors: Record<RequirementType, string> = {
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
}: RequirementsTableProps) {
  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-700">需求编号</TableHead>
            <TableHead className="font-semibold text-gray-700">需求名称</TableHead>
            <TableHead className="font-semibold text-gray-700">需求类型</TableHead>
            <TableHead className="font-semibold text-gray-700">来源客户</TableHead>
            <TableHead className="font-semibold text-gray-700">优先级</TableHead>
            <TableHead className="font-semibold text-gray-700">状态</TableHead>
            <TableHead className="font-semibold text-gray-700">期望解决时间</TableHead>
            <TableHead className="font-semibold text-gray-700">创建时间</TableHead>
            <TableHead className="font-semibold text-gray-700 text-center">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requirements.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center text-gray-500">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            requirements.map((req) => (
              <TableRow key={req.id} className="hover:bg-gray-50">
                <TableCell className="font-medium text-blue-600">
                  <Link href={`/requirements/${req.id}`} className="hover:underline">
                    {req.code}
                  </Link>
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={req.name}>
                  {req.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={typeColors[req.type]}
                  >
                    {req.type}
                  </Badge>
                </TableCell>
                <TableCell>{req.customer}</TableCell>
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
                <TableCell className="text-gray-600">{req.expectedDate}</TableCell>
                <TableCell className="text-gray-600">{req.createdAt}</TableCell>
                <TableCell>
                  <div className="flex items-center justify-center gap-1">
                    <Link href={`/requirements/${req.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                        <Eye className="size-4 mr-1" />
                        详情
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" className="h-8 text-gray-600 hover:text-gray-700 hover:bg-gray-100">
                      <Pencil className="size-4 mr-1" />
                      编辑
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="size-4 mr-1" />
                          删除
                        </Button>
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
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 text-gray-600">
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>复制链接</DropdownMenuItem>
                        <DropdownMenuItem>导出</DropdownMenuItem>
                        <DropdownMenuItem>查看历史</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
