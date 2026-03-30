"use client"

import * as React from "react"
import {
  CheckCircle2,
  XCircle,
  Clock,
  Play,
  Plus,
  RefreshCw,
  FileText,
} from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { TestCase } from "@/lib/types"

interface TestCasesTableProps {
  testCases: TestCase[]
  arCode?: string
}

const statusConfig = {
  通过: {
    icon: CheckCircle2,
    color: "text-green-600",
    bg: "bg-green-100",
  },
  失败: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
  },
  未执行: {
    icon: Clock,
    color: "text-gray-500",
    bg: "bg-gray-100",
  },
}

export function TestCasesTable({ testCases, arCode }: TestCasesTableProps) {
  // 统计数据
  const stats = {
    total: testCases.length,
    passed: testCases.filter((tc) => tc.status === "通过").length,
    failed: testCases.filter((tc) => tc.status === "失败").length,
    pending: testCases.filter((tc) => tc.status === "未执行").length,
  }

  const passRate = stats.total > 0 
    ? Math.round((stats.passed / stats.total) * 100) 
    : 0

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <FileText className="size-4 text-blue-600" />
            关联测试用例
            {arCode && <span className="text-sm font-normal text-gray-500">({arCode})</span>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <RefreshCw className="size-3" />
              刷新
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Play className="size-3" />
              批量执行
            </Button>
            <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700">
              <Plus className="size-3" />
              关联用例
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-700">{stats.total}</div>
            <div className="text-xs text-gray-500">用例总数</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.passed}</div>
            <div className="text-xs text-green-600">通过</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <div className="text-xs text-red-600">失败</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-gray-500">{stats.pending}</div>
            <div className="text-xs text-gray-500">未执行</div>
          </div>
        </div>

        {/* 通过率进度条 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">测试通过率</span>
            <span className="font-medium text-gray-700">{passRate}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: `${passRate}%` }}
            />
          </div>
        </div>

        {/* 测试用例表格 */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="font-semibold text-gray-700">用例编号</TableHead>
                <TableHead className="font-semibold text-gray-700">用例名称</TableHead>
                <TableHead className="font-semibold text-gray-700">优先级</TableHead>
                <TableHead className="font-semibold text-gray-700">执行状态</TableHead>
                <TableHead className="font-semibold text-gray-700">执行时间</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-gray-500">
                    暂无关联测试用例
                  </TableCell>
                </TableRow>
              ) : (
                testCases.map((tc) => {
                  const StatusIcon = statusConfig[tc.status].icon
                  return (
                    <TableRow key={tc.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-blue-600">
                        {tc.code}
                      </TableCell>
                      <TableCell>{tc.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            tc.priority === "高"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : tc.priority === "中"
                              ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                              : "bg-gray-100 text-gray-700 border-gray-200"
                          }
                        >
                          {tc.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${statusConfig[tc.status].bg} ${statusConfig[tc.status].color}`}
                        >
                          <StatusIcon className="size-3.5" />
                          {tc.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {tc.executedAt || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Play className="size-3 mr-1" />
                            执行
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-gray-600 hover:text-gray-700"
                          >
                            详情
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
