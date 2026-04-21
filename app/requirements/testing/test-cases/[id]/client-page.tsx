"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft, CheckCircle2, XCircle, Clock, AlertCircle,
  History, FileText, Bug, Upload, Plus, ChevronDown, ChevronRight,
  User, Calendar, Flag
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  getTestCaseDetailById,
  getBugsByTestCaseId,
  mockARDetails,
  getTestCaseLogs,
} from "@/lib/mock-data"
import type { TestCaseDetail, TestCaseStatus, Bug, OperationLog, BugSeverity } from "@/lib/types"

const statusConfig: Record<TestCaseStatus, { label: string; color: string; icon: React.ReactNode }> = {
  "未执行": { label: "未执行", color: "bg-gray-100 text-gray-700", icon: <Clock className="size-4" /> },
  "执行中": { label: "执行中", color: "bg-blue-100 text-blue-700", icon: <Clock className="size-4" /> },
  "通过": { label: "通过", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="size-4" /> },
  "不通过": { label: "不通过", color: "bg-red-100 text-red-700", icon: <XCircle className="size-4" /> },
  "阻塞": { label: "阻塞", color: "bg-orange-100 text-orange-700", icon: <AlertCircle className="size-4" /> },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  "高": { label: "高", color: "bg-red-100 text-red-700" },
  "中": { label: "中", color: "bg-yellow-100 text-yellow-700" },
  "低": { label: "低", color: "bg-green-100 text-green-700" },
}

const bugStatusConfig: Record<string, { label: string; color: string }> = {
  "新建": { label: "新建", color: "bg-blue-100 text-blue-700" },
  "处理中": { label: "处理中", color: "bg-yellow-100 text-yellow-700" },
  "已修复": { label: "已修复", color: "bg-green-100 text-green-700" },
  "已验证": { label: "已验证", color: "bg-purple-100 text-purple-700" },
  "已关闭": { label: "已关闭", color: "bg-gray-100 text-gray-700" },
  "重新打开": { label: "重新打开", color: "bg-red-100 text-red-700" },
}

export default function TestCaseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const testCaseId = params.id as string
  
  const [testCase, setTestCase] = React.useState<TestCaseDetail | null>(null)
  const [bugs, setBugs] = React.useState<Bug[]>([])
  const [logs, setLogs] = React.useState<OperationLog[]>([])
  const [logsOpen, setLogsOpen] = React.useState(false)
  const [closeOpen, setCloseOpen] = React.useState(false)
  const [bugOpen, setBugOpen] = React.useState(false)
  const [stepsExpanded, setStepsExpanded] = React.useState(true)
  const [editArOpen, setEditArOpen] = React.useState(false)
  const [selectedArIds, setSelectedArIds] = React.useState<Set<string>>(new Set())
  
  // 关闭用例表单
  const [closeResult, setCloseResult] = React.useState<"通过" | "不通过">("通过")
  const [conclusion, setConclusion] = React.useState("")
  
  // 新建Bug表单
  const [bugForm, setBugForm] = React.useState({
    name: "",
    description: "",
    steps: "",
    severity: "一般" as BugSeverity,
    assignee: "",
    images: [] as string[],
    deadline: "",
  })

  React.useEffect(() => {
    const tc = getTestCaseDetailById(testCaseId)
    if (tc) {
      setTestCase(tc)
      setBugs(getBugsByTestCaseId(testCaseId))
      setSelectedArIds(new Set(tc.relatedArIds))
      // 模拟操作日志
      setLogs([
        {
          id: "log-tc-001",
          targetType: "testcase",
          targetId: testCaseId,
          action: "创建",
          operator: tc.creator,
          timestamp: tc.createdAt,
          description: "创建测试用例",
        },
        ...(tc.assignee ? [{
          id: "log-tc-002",
          targetType: "testcase" as const,
          targetId: testCaseId,
          action: "分配",
          operator: "系统",
          timestamp: tc.createdAt,
          description: `分配给 ${tc.assignee}`,
        }] : []),
        ...(tc.executedAt ? [{
          id: "log-tc-003",
          targetType: "testcase" as const,
          targetId: testCaseId,
          action: "执行",
          operator: tc.assignee || "测试员",
          timestamp: tc.executedAt,
          description: `执行结果：${tc.status}`,
          newValue: tc.status,
        }] : []),
      ])
    }
  }, [testCaseId])

  if (!testCase) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center py-20 text-gray-500">测试用例不存在</div>
        </div>
      </AdminLayout>
    )
  }

  const status = statusConfig[testCase.status]
  const priority = priorityConfig[testCase.priority]
  
  // 获取关联的AR需求
  const relatedArs = mockARDetails.filter(ar => testCase.relatedArIds.includes(ar.id))

  // 关闭用例 - 通过
  const handlePassClose = () => {
    if (!conclusion.trim()) {
      alert("请输入测试结论")
      return
    }
    const now = new Date().toISOString().slice(0, 19).replace("T", " ")
    setTestCase({
      ...testCase,
      status: "通过",
      conclusion,
      executedAt: now,
    })
    
    // 添加操作日志
    const taskId = `TASK-${Date.now().toString().slice(-6)}`
    const closedArCodes = relatedArs.map(ar => ar.code).join(", ")
    
    setLogs([
      ...logs,
      {
        id: `log-tc-${Date.now()}`,
        targetType: "testcase",
        targetId: testCaseId,
        action: "测试通过",
        operator: testCase.assignee || "当前用户",
        timestamp: now,
        description: `测试结论：${conclusion}`,
        newValue: "通过",
      },
      {
        id: `log-tc-${Date.now() + 1}`,
        targetType: "testcase",
        targetId: testCaseId,
        action: "生成任务",
        operator: "系统",
        timestamp: now,
        description: `生成任务 ${taskId}（已完成）`,
      },
      {
        id: `log-tc-${Date.now() + 2}`,
        targetType: "testcase",
        targetId: testCaseId,
        action: "关闭关联需求",
        operator: "系统",
        timestamp: now,
        description: `关联需求 ${closedArCodes} 已关闭`,
      },
    ])
    
    setCloseOpen(false)
    alert(`测试通过！\n\n已生成任务 ${taskId}（状态：已完成）\n\n关联需求已关闭：\n${closedArCodes}`)
  }
  
  // 关闭用例 - 不通过，打开Bug创建弹窗
  const handleFailClose = () => {
    if (!conclusion.trim()) {
      alert("请输入测试结论")
      return
    }
    setTestCase({
      ...testCase,
      status: "不通过",
      conclusion,
      executedAt: new Date().toISOString().slice(0, 19).replace("T", " "),
    })
    setCloseOpen(false)
    // 引导创建Bug
    setBugOpen(true)
  }

  // 创建Bug（不通过时调用）
  const handleCreateBug = () => {
    if (!bugForm.name.trim() || !bugForm.description.trim()) {
      alert("请填写Bug标题和描述")
      return
    }
    if (!bugForm.deadline) {
      alert("请选择任务截止日期")
      return
    }
    
    const now = new Date().toISOString().slice(0, 19).replace("T", " ")
    const myTaskId = `TASK-${Date.now().toString().slice(-6)}`
    const assigneeTaskId = `TASK-${(Date.now() + 1).toString().slice(-6)}`
    
    const newBug: Bug = {
      id: `bug-${Date.now()}`,
      code: `BUG-${String(bugs.length + 100).padStart(3, "0")}`,
      name: bugForm.name,
      description: bugForm.description,
      steps: bugForm.steps,
      severity: bugForm.severity,
      status: "新建",
      assignee: bugForm.assignee || undefined,
      creator: "当前用户",
      createdAt: now,
      images: bugForm.images,
      relatedTestCaseId: testCaseId,
      relatedArId: testCase.relatedArIds[0],
      taskId: assigneeTaskId,
    }
    setBugs([newBug, ...bugs])
    setTestCase({ ...testCase, bugCount: testCase.bugCount + 1 })
    
    // 添加操作日志
    setLogs([
      ...logs,
      {
        id: `log-tc-${Date.now()}`,
        targetType: "testcase",
        targetId: testCaseId,
        action: "测试不通过",
        operator: testCase.assignee || "当前用户",
        timestamp: now,
        description: `创建Bug ${newBug.code}`,
        newValue: "不通过",
      },
      {
        id: `log-tc-${Date.now() + 1}`,
        targetType: "testcase",
        targetId: testCaseId,
        action: "生成任务",
        operator: "系统",
        timestamp: now,
        description: `生成任务 ${myTaskId}（已完成，当前用户）、${assigneeTaskId}（进行中，${bugForm.assignee || "待分配"}，截止日期：${bugForm.deadline}）`,
      },
    ])
    
    setBugOpen(false)
    setBugForm({
      name: "",
      description: "",
      steps: "",
      severity: "一般",
      assignee: "",
      images: [],
      deadline: "",
    })
    
    alert(`Bug ${newBug.code} 已创建！\n\n生成任务：\n1. ${myTaskId}（当前用户，已完成）\n2. ${assigneeTaskId}（${bugForm.assignee || "待分配"}，进行中，截止日期：${bugForm.deadline}）`)
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
              <BreadcrumbLink href="/requirements/testing/test-cases">测试用例</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{testCase.code}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 返回和操作 */}
        <div className="mb-4 flex items-center justify-between">
          <Link href="/requirements/testing/test-cases">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="size-4" />
              返回列表
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            {(testCase.status === "未执行" || testCase.status === "执行中") && (
              <>
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setCloseResult("通过")
                    setConclusion("")
                    setCloseOpen(true)
                  }}
                >
                  <CheckCircle2 className="size-4 mr-1" />
                  通过
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    setCloseResult("不通过")
                    setConclusion("")
                    setCloseOpen(true)
                  }}
                >
                  <XCircle className="size-4 mr-1" />
                  不通过
                </Button>
              </>
            )}
            <Button variant="outline" onClick={() => setLogsOpen(true)}>
              <History className="size-4 mr-1" />
              操作日志
            </Button>
          </div>
        </div>

        {/* 基本信息卡片 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <span className="text-blue-600">{testCase.code}</span>
                <span>{testCase.name}</span>
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge className={priority.color}>{priority.label}</Badge>
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
                <span className="font-medium">{testCase.creator}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-gray-400" />
                <span className="text-gray-500">创建时间:</span>
                <span className="font-medium">{testCase.createdAt}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="size-4 text-gray-400" />
                <span className="text-gray-500">执行人:</span>
                <span className="font-medium">{testCase.assignee || "-"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-gray-400" />
                <span className="text-gray-500">执行时间:</span>
                <span className="font-medium">{testCase.executedAt || "-"}</span>
              </div>
            </div>
            {testCase.description && (
              <div className="text-sm text-gray-600 mb-4">
                <span className="text-gray-500">描述:</span> {testCase.description}
              </div>
            )}
            {testCase.precondition && (
              <div className="text-sm text-gray-600 mb-4">
                <span className="text-gray-500">前置条件:</span> {testCase.precondition}
              </div>
            )}
            {testCase.conclusion && (
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                <span className="text-gray-500">测试结论:</span>
                <span className="ml-2">{testCase.conclusion}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 测试步骤 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setStepsExpanded(!stepsExpanded)}
            >
              <CardTitle className="text-lg flex items-center gap-2">
                {stepsExpanded ? <ChevronDown className="size-5" /> : <ChevronRight className="size-5" />}
                测试步骤
              </CardTitle>
              <Badge variant="outline">{testCase.steps.length} 步</Badge>
            </div>
          </CardHeader>
          {stepsExpanded && (
            <CardContent>
              {testCase.steps.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无测试步骤</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[60px]">步骤</TableHead>
                      <TableHead>操作步骤</TableHead>
                      <TableHead>期望结果</TableHead>
                      <TableHead className="w-[150px]">实际结果</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {testCase.steps.map((step) => (
                      <TableRow key={step.id}>
                        <TableCell className="font-medium text-center">{step.stepNumber}</TableCell>
                        <TableCell>{step.action}</TableCell>
                        <TableCell>{step.expectedResult}</TableCell>
                        <TableCell>{step.actualResult || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          )}
        </Card>

        {/* 关联需求 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="size-5 text-purple-600" />
                关联需求
                <Badge variant="outline">{relatedArs.length}</Badge>
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedArIds(new Set(testCase.relatedArIds))
                  setEditArOpen(true)
                }}
              >
                <Plus className="size-4 mr-1" />
                修改关联
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {relatedArs.length === 0 ? (
              <div className="text-center py-4 text-gray-500">暂无关联需求</div>
            ) : (
              <div className="space-y-2">
                {relatedArs.map((ar) => (
                  <div
                    key={ar.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/requirements/${ar.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {ar.code}
                      </Link>
                      <span>{ar.name}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>前端: {ar.frontend}</span>
                      <span>后端: {ar.backend}</span>
                      <span>测试: {ar.tester}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 关��Bug */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Bug className="size-5 text-red-600" />
              关联Bug
              <Badge variant="outline" className={bugs.length > 0 ? "bg-red-50 text-red-600" : ""}>
                {bugs.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bugs.length === 0 ? (
              <div className="text-center py-4 text-gray-500">暂无关联Bug</div>
            ) : (
              <div className="space-y-2">
                {bugs.map((bug) => {
                  const bugStatus = bugStatusConfig[bug.status]
                  return (
                    <div
                      key={bug.id}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/requirements/bugs/${bug.id}`}
                          className="text-red-600 hover:underline font-medium"
                        >
                          {bug.code}
                        </Link>
                        <span>{bug.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={bugStatus.color}>{bugStatus.label}</Badge>
                        <span className="text-sm text-gray-500">{bug.assignee || "-"}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 关闭用例弹窗 */}
      <Dialog open={closeOpen} onOpenChange={setCloseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>关闭测试用例</DialogTitle>
            <DialogDescription>
              请选择测试结果并填写测试结论
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>测试结果 <span className="text-red-500">*</span></Label>
              <Select value={closeResult} onValueChange={(v) => setCloseResult(v as "通过" | "不通过")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="通过">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-green-600" />
                      通过
                    </span>
                  </SelectItem>
                  <SelectItem value="不通过">
                    <span className="flex items-center gap-2">
                      <XCircle className="size-4 text-red-600" />
                      不通过
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>测试结论 <span className="text-red-500">*</span></Label>
              <Textarea
                value={conclusion}
                onChange={(e) => setConclusion(e.target.value)}
                placeholder="请输入测试结论..."
                rows={4}
              />
            </div>
            {closeResult === "不通过" && (
              <div className="p-3 bg-red-50 rounded-lg text-sm text-red-700">
                选择"不通过"后，将引导您创建Bug单
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCloseOpen(false)}>取消</Button>
            <Button
              className={closeResult === "通过" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              onClick={closeResult === "通过" ? handlePassClose : handleFailClose}
              disabled={!conclusion.trim()}
            >
              {closeResult === "通过" ? "确认通过" : "确认不通过"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新建Bug弹窗 */}
      <Dialog open={bugOpen} onOpenChange={setBugOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>新建Bug</DialogTitle>
            <DialogDescription>
              创建Bug并生成对应任务
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Bug标题 <span className="text-red-500">*</span></Label>
              <Input
                value={bugForm.name}
                onChange={(e) => setBugForm({ ...bugForm, name: e.target.value })}
                placeholder="请输入Bug标题"
              />
            </div>
            <div className="space-y-2">
              <Label>问题描述 <span className="text-red-500">*</span></Label>
              <Textarea
                value={bugForm.description}
                onChange={(e) => setBugForm({ ...bugForm, description: e.target.value })}
                placeholder="请详细描述问题..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>复现步骤</Label>
              <Textarea
                value={bugForm.steps}
                onChange={(e) => setBugForm({ ...bugForm, steps: e.target.value })}
                placeholder="请输入复现步骤..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>严重程度 <span className="text-red-500">*</span></Label>
                <Select
                  value={bugForm.severity}
                  onValueChange={(v) => setBugForm({ ...bugForm, severity: v as BugSeverity })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="致命">致命</SelectItem>
                    <SelectItem value="严重">严重</SelectItem>
                    <SelectItem value="一般">一般</SelectItem>
                    <SelectItem value="轻微">轻微</SelectItem>
                    <SelectItem value="建议">建议</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>责任人</Label>
                <Select
                  value={bugForm.assignee}
                  onValueChange={(v) => setBugForm({ ...bugForm, assignee: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择责任人" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="张三">张三</SelectItem>
                    <SelectItem value="李四">李四</SelectItem>
                    <SelectItem value="王五">王五</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>任务截止日期 <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={bugForm.deadline}
                onChange={(e) => setBugForm({ ...bugForm, deadline: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>上传截图</Label>
              <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-blue-300 cursor-pointer transition-colors">
                <Upload className="size-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500">点击或拖拽上传截图</p>
                <p className="text-xs text-gray-400 mt-1">支持 PNG, JPG 格式</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBugOpen(false)}>取消</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleCreateBug}
              disabled={!bugForm.name.trim() || !bugForm.description.trim() || !bugForm.deadline}
            >
              创建Bug
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 修改关联需求弹窗 */}
      <Dialog open={editArOpen} onOpenChange={setEditArOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>修改关联需求 - {testCase.code}</DialogTitle>
            <DialogDescription>
              选择要关联到此测试用例的AR需求（当前已关联 {selectedArIds.size} 个）
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {mockARDetails.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无可用需求</div>
            ) : (
              <div className="space-y-2">
                {mockARDetails.map((ar) => {
                  const isSelected = selectedArIds.has(ar.id)
                  return (
                    <div
                      key={ar.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        const newSelected = new Set(selectedArIds)
                        if (newSelected.has(ar.id)) {
                          newSelected.delete(ar.id)
                        } else {
                          newSelected.add(ar.id)
                        }
                        setSelectedArIds(newSelected)
                      }}
                    >
                      <Checkbox checked={isSelected} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-blue-600">{ar.code}</span>
                          <span className="truncate">{ar.name}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          前端: {ar.frontend} | 后端: {ar.backend} | 测试: {ar.tester}
                        </div>
                      </div>
                      <Badge className={
                        ar.status === "已完成" ? "bg-green-100 text-green-700" :
                        ar.status === "进行中" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                      }>
                        {ar.status}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditArOpen(false)}>取消</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // 更新测试用例的关联需求
                setTestCase({
                  ...testCase,
                  relatedArIds: Array.from(selectedArIds),
                })
                // 添加操作日志
                const now = new Date().toISOString().slice(0, 19).replace("T", " ")
                setLogs([
                  ...logs,
                  {
                    id: `log-tc-${Date.now()}`,
                    targetType: "testcase",
                    targetId: testCaseId,
                    action: "修改关联需求",
                    operator: "当前用户",
                    timestamp: now,
                    description: `关联需求数量变更为 ${selectedArIds.size} 个`,
                  },
                ])
                setEditArOpen(false)
              }}
            >
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 操作日志弹窗 */}
      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>操作日志 - {testCase.code}</DialogTitle>
            <DialogDescription>
              测试用例变更历史记录
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无操作记录</div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <History className="size-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-gray-500">{log.timestamp}</div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{log.description}</div>
                      {log.newValue && (
                        <div className="text-sm mt-2">
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded">
                            {log.newValue}
                          </span>
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
