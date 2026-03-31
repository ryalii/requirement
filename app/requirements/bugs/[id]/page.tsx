"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft, Bug, History, FileText, User, Calendar,
  AlertTriangle, CheckCircle2, Clock, XCircle, Image as ImageIcon
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { getBugById, getTestCaseById, mockARDetails } from "@/lib/mock-data"
import type { Bug as BugType, BugStatus, OperationLog, TestCaseDetail, ARRequirementDetail } from "@/lib/types"

const statusConfig: Record<BugStatus, { label: string; color: string; icon: React.ReactNode }> = {
  "新建": { label: "新建", color: "bg-blue-100 text-blue-700", icon: <Clock className="size-4" /> },
  "处理中": { label: "处理中", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="size-4" /> },
  "已修复": { label: "已修复", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="size-4" /> },
  "已验证": { label: "已验证", color: "bg-purple-100 text-purple-700", icon: <CheckCircle2 className="size-4" /> },
  "已关闭": { label: "已关闭", color: "bg-gray-100 text-gray-700", icon: <XCircle className="size-4" /> },
  "重新打开": { label: "重新打开", color: "bg-red-100 text-red-700", icon: <AlertTriangle className="size-4" /> },
}

const severityConfig: Record<string, { label: string; color: string }> = {
  "致命": { label: "致命", color: "bg-red-500 text-white" },
  "严重": { label: "严重", color: "bg-red-100 text-red-700" },
  "一般": { label: "一般", color: "bg-yellow-100 text-yellow-700" },
  "轻微": { label: "轻微", color: "bg-blue-100 text-blue-700" },
  "建议": { label: "建议", color: "bg-gray-100 text-gray-700" },
}

// 状态流转配置
const statusTransitions: Record<BugStatus, BugStatus[]> = {
  "新建": ["处理中", "已关闭"],
  "处理中": ["已修复", "新建"],
  "已修复": ["已验证", "重新打开"],
  "已验证": ["已关闭", "重新打开"],
  "已关闭": ["重新打开"],
  "重新打开": ["处理中", "已关闭"],
}

export default function BugDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bugId = params.id as string
  
  const [bug, setBug] = React.useState<BugType | null>(null)
  const [relatedTestCase, setRelatedTestCase] = React.useState<TestCaseDetail | null>(null)
  const [relatedAr, setRelatedAr] = React.useState<ARRequirementDetail | null>(null)
  const [logs, setLogs] = React.useState<OperationLog[]>([])
  const [logsOpen, setLogsOpen] = React.useState(false)
  const [statusOpen, setStatusOpen] = React.useState(false)
  const [newStatus, setNewStatus] = React.useState<BugStatus>("新建")
  const [statusRemark, setStatusRemark] = React.useState("")

  React.useEffect(() => {
    const b = getBugById(bugId)
    if (b) {
      setBug(b)
      if (b.relatedTestCaseId) {
        setRelatedTestCase(getTestCaseById(b.relatedTestCaseId) || null)
      }
      if (b.relatedArId) {
        setRelatedAr(mockARDetails.find(ar => ar.id === b.relatedArId) || null)
      }
      // 模拟操作日志
      setLogs([
        {
          id: "log-bug-001",
          targetType: "bug",
          targetId: bugId,
          action: "创建",
          operator: b.creator,
          timestamp: b.createdAt,
          description: `创建Bug: ${b.name}`,
        },
        ...(b.assignee ? [{
          id: "log-bug-002",
          targetType: "bug" as const,
          targetId: bugId,
          action: "分配",
          operator: b.creator,
          timestamp: b.createdAt,
          description: `分配给 ${b.assignee}`,
        }] : []),
        ...(b.status === "处理中" ? [{
          id: "log-bug-003",
          targetType: "bug" as const,
          targetId: bugId,
          action: "状态变更",
          operator: b.assignee || "开发人员",
          timestamp: b.createdAt,
          oldValue: "新建",
          newValue: "处理中",
          description: "开始处理",
        }] : []),
        ...(b.resolvedAt ? [{
          id: "log-bug-004",
          targetType: "bug" as const,
          targetId: bugId,
          action: "状态变更",
          operator: b.assignee || "开发人员",
          timestamp: b.resolvedAt,
          oldValue: "处理中",
          newValue: "已修复",
          description: "问题已修复",
        }] : []),
      ])
    }
  }, [bugId])

  if (!bug) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center py-20 text-gray-500">Bug不存在</div>
        </div>
      </AdminLayout>
    )
  }

  const status = statusConfig[bug.status]
  const severity = severityConfig[bug.severity]
  const availableTransitions = statusTransitions[bug.status] || []

  // 变更状态
  const handleStatusChange = () => {
    if (!newStatus) return
    
    const log: OperationLog = {
      id: `log-bug-${Date.now()}`,
      targetType: "bug",
      targetId: bugId,
      action: "状态变更",
      operator: "当前用户",
      timestamp: new Date().toISOString().slice(0, 19).replace("T", " "),
      oldValue: bug.status,
      newValue: newStatus,
      description: statusRemark || `状态从 ${bug.status} 变更为 ${newStatus}`,
    }
    
    setBug({
      ...bug,
      status: newStatus,
      resolvedAt: newStatus === "已修复" ? new Date().toISOString().slice(0, 19).replace("T", " ") : bug.resolvedAt,
    })
    setLogs([log, ...logs])
    setStatusOpen(false)
    setStatusRemark("")
  }

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 面包屑 */}
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/requirements">需求管理</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/requirements/bugs">Bug单</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{bug.code}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 返回和操作 */}
        <div className="mb-4 flex items-center justify-between">
          <Link href="/requirements/bugs">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="size-4" />
              返回列表
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {availableTransitions.length > 0 && (
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setNewStatus(availableTransitions[0])
                  setStatusOpen(true)
                }}
              >
                变更状态
              </Button>
            )}
            <Button variant="outline" onClick={() => setLogsOpen(true)}>
              <History className="size-4 mr-1" />
              操作记录
            </Button>
          </div>
        </div>

        {/* 基本信息卡片 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Bug className="size-6 text-red-600" />
                <span className="text-red-600">{bug.code}</span>
                <span>{bug.name}</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={severity.color}>{severity.label}</Badge>
                <Badge className={`${status.color} flex items-center gap-1`}>
                  {status.icon}
                  {status.label}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm mb-4">
              <div className="flex items-center gap-2">
                <User className="size-4 text-gray-400" />
                <span className="text-gray-500">创建人:</span>
                <span className="font-medium">{bug.creator}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-gray-400" />
                <span className="text-gray-500">创建时间:</span>
                <span className="font-medium">{bug.createdAt}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="size-4 text-gray-400" />
                <span className="text-gray-500">责任人:</span>
                <span className="font-medium">{bug.assignee || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-gray-400" />
                <span className="text-gray-500">解决时间:</span>
                <span className="font-medium">{bug.resolvedAt || "-"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 问题描述 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">问题描述</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 whitespace-pre-wrap">{bug.description}</p>
          </CardContent>
        </Card>

        {/* 复现步骤 */}
        {bug.steps && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">复现步骤</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{bug.steps}</pre>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 问题截图 */}
        {bug.images && bug.images.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <ImageIcon className="size-5" />
                问题截图
                <Badge variant="outline">{bug.images.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                {bug.images.map((img, index) => (
                  <div
                    key={index}
                    className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center text-gray-400"
                  >
                    <div className="text-center">
                      <ImageIcon className="size-8 mx-auto mb-2" />
                      <span className="text-sm">截图 {index + 1}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 关联信息 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 关联测试用例 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="size-5 text-blue-600" />
                关联测试用例
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedTestCase ? (
                <div className="p-3 rounded-lg border hover:bg-gray-50">
                  <Link
                    href={`/requirements/testing/test-cases/${relatedTestCase.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {relatedTestCase.code}
                  </Link>
                  <span className="ml-2">{relatedTestCase.name}</span>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">无关联测试用例</div>
              )}
            </CardContent>
          </Card>

          {/* 关联需求 */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="size-5 text-purple-600" />
                关联需求
              </CardTitle>
            </CardHeader>
            <CardContent>
              {relatedAr ? (
                <div className="p-3 rounded-lg border hover:bg-gray-50">
                  <Link
                    href={`/requirements/${relatedAr.id}`}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {relatedAr.code}
                  </Link>
                  <span className="ml-2">{relatedAr.name}</span>
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">无关联需求</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 变更状态弹窗 */}
      <Dialog open={statusOpen} onOpenChange={setStatusOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>变更Bug状态</DialogTitle>
            <DialogDescription>
              当前状态: {bug.status}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>新状态 <span className="text-red-500">*</span></Label>
              <Select value={newStatus} onValueChange={(v) => setNewStatus(v as BugStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableTransitions.map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusConfig[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>备注</Label>
              <Textarea
                value={statusRemark}
                onChange={(e) => setStatusRemark(e.target.value)}
                placeholder="请输入变更备注..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusOpen(false)}>取消</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleStatusChange}
            >
              确认变更
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 操作记录弹窗 */}
      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>操作记录 - {bug.code}</DialogTitle>
            <DialogDescription>
              Bug变更历史记录
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无操作记录</div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="size-8 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                      <History className="size-4 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-gray-500">{log.timestamp}</div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{log.description}</div>
                      {(log.oldValue || log.newValue) && (
                        <div className="text-sm mt-2 flex items-center gap-2">
                          {log.oldValue && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded">
                              {log.oldValue}
                            </span>
                          )}
                          {log.oldValue && log.newValue && <span className="text-gray-400">→</span>}
                          {log.newValue && (
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded">
                              {log.newValue}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">操作人: {log.operator}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogsOpen(false)}>关闭</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
