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
  ChevronDown,
  Filter,
  Download,
  FlaskConical,
  TrendingUp,
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
    border: "border-green-200",
  },
  失败: {
    icon: XCircle,
    color: "text-red-600",
    bg: "bg-red-100",
    border: "border-red-200",
  },
  未执行: {
    icon: Clock,
    color: "text-gray-500",
    bg: "bg-gray-100",
    border: "border-gray-200",
  },
}

const priorityConfig = {
  高: "bg-red-100 text-red-700 border-red-200",
  中: "bg-yellow-100 text-yellow-700 border-yellow-200",
  低: "bg-gray-100 text-gray-700 border-gray-200",
}

export function TestCasesTable({ testCases, arCode }: TestCasesTableProps) {
  const [selectedCases, setSelectedCases] = React.useState<string[]>([])

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

  const executedRate = stats.total > 0
    ? Math.round(((stats.passed + stats.failed) / stats.total) * 100)
    : 0

  const toggleSelectAll = () => {
    if (selectedCases.length === testCases.length) {
      setSelectedCases([])
    } else {
      setSelectedCases(testCases.map(tc => tc.id))
    }
  }

  const toggleSelect = (id: string) => {
    setSelectedCases(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  return (
    <Card className="border-amber-200">
      <CardHeader className="pb-4 bg-amber-50/50 border-b border-amber-200">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <FlaskConical className="size-5 text-amber-600" />
              关联测试用例
              {arCode && (
                <Badge variant="outline" className="ml-1 bg-amber-100 text-amber-700 border-amber-200">
                  {arCode}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              管理和追踪与此AR需求相关的测试用例执行情况
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="size-3.5" />
              筛选
              <ChevronDown className="size-3" />
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="size-3.5" />
              导出
            </Button>
            <Button size="sm" className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white">
              <Plus className="size-3.5" />
              关联用例
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {/* 统计卡片 */}
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-gray-50 rounded-xl p-4 text-center border">
            <div className="text-3xl font-bold text-gray-700">{stats.total}</div>
            <div className="text-xs text-gray-500 mt-1">用例总数</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 text-center border border-green-200">
            <div className="flex items-center justify-center gap-1.5">
              <CheckCircle2 className="size-5 text-green-600" />
              <span className="text-3xl font-bold text-green-600">{stats.passed}</span>
            </div>
            <div className="text-xs text-green-600 mt-1">通过</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 text-center border border-red-200">
            <div className="flex items-center justify-center gap-1.5">
              <XCircle className="size-5 text-red-600" />
              <span className="text-3xl font-bold text-red-600">{stats.failed}</span>
            </div>
            <div className="text-xs text-red-600 mt-1">失败</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 text-center border">
            <div className="flex items-center justify-center gap-1.5">
              <Clock className="size-5 text-gray-500" />
              <span className="text-3xl font-bold text-gray-500">{stats.pending}</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">未执行</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center border border-amber-200">
            <div className="flex items-center justify-center gap-1.5">
              <TrendingUp className="size-5 text-amber-600" />
              <span className="text-3xl font-bold text-amber-600">{passRate}%</span>
            </div>
            <div className="text-xs text-amber-600 mt-1">通过率</div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="space-y-3 p-4 rounded-xl bg-gray-50 border">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">测试通过率</span>
              <span className="font-semibold text-gray-700">{passRate}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all"
                style={{ width: `${passRate}%` }}
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">测试执行率</span>
              <span className="font-semibold text-gray-700">{executedRate}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all"
                style={{ width: `${executedRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* 批量操作栏 */}
        {selectedCases.length > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <span className="text-sm text-blue-700">
              已选择 <strong>{selectedCases.length}</strong> 个用例
            </span>
            <div className="flex-1" />
            <Button variant="outline" size="sm" className="gap-1.5">
              <Play className="size-3.5" />
              批量执行
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50">
              取消关联
            </Button>
          </div>
        )}

        {/* 测试用例表格 */}
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50 hover:bg-gray-50">
                <TableHead className="w-12">
                  <Checkbox 
                    checked={selectedCases.length === testCases.length && testCases.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="font-semibold text-gray-700">用例编号</TableHead>
                <TableHead className="font-semibold text-gray-700">用例名称</TableHead>
                <TableHead className="font-semibold text-gray-700 w-24">优先级</TableHead>
                <TableHead className="font-semibold text-gray-700 w-28">执行状态</TableHead>
                <TableHead className="font-semibold text-gray-700 w-32">执行时间</TableHead>
                <TableHead className="font-semibold text-gray-700 text-center w-32">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {testCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <FileText className="size-6 text-gray-400" />
                      </div>
                      <p>暂无关联测试用例</p>
                      <p className="text-sm">点击"关联用例"按钮添加测试用例</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                testCases.map((tc) => {
                  const StatusIcon = statusConfig[tc.status].icon
                  const isSelected = selectedCases.includes(tc.id)
                  return (
                    <TableRow 
                      key={tc.id} 
                      className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                    >
                      <TableCell>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleSelect(tc.id)}
                        />
                      </TableCell>
                      <TableCell className="font-medium text-blue-600 hover:underline cursor-pointer">
                        {tc.code}
                      </TableCell>
                      <TableCell className="text-gray-700">{tc.name}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={priorityConfig[tc.priority]}
                        >
                          {tc.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div
                          className={`
                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold
                            ${statusConfig[tc.status].bg} 
                            ${statusConfig[tc.status].color}
                            ${statusConfig[tc.status].border}
                            border
                          `}
                        >
                          <StatusIcon className="size-3.5" />
                          {tc.status}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {tc.executedAt || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Play className="size-3.5 mr-1" />
                            执行
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-gray-600 hover:text-gray-700"
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
