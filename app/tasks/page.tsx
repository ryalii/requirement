"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  UserPlus,
  CheckCircle,
  XCircle,
  PlayCircle,
  Download,
  History,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Filter,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
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
import { getAllTasks, getTaskHistories } from "@/lib/mock-data"
import type { Task, TaskType, TaskStatus, TaskHistory } from "@/lib/types"

const typeConfig: Record<TaskType, { bg: string; text: string }> = {
  "需求": { bg: "bg-blue-100", text: "text-blue-700" },
  "测试": { bg: "bg-green-100", text: "text-green-700" },
  "临时": { bg: "bg-orange-100", text: "text-orange-700" },
  "调研": { bg: "bg-purple-100", text: "text-purple-700" },
  "支持": { bg: "bg-cyan-100", text: "text-cyan-700" },
}

const statusConfig: Record<TaskStatus, { bg: string; text: string }> = {
  "待分配": { bg: "bg-yellow-100", text: "text-yellow-700" },
  "进行中": { bg: "bg-blue-100", text: "text-blue-700" },
  "已完成": { bg: "bg-green-100", text: "text-green-700" },
  "已关闭": { bg: "bg-gray-100", text: "text-gray-600" },
}

// 计算剩余天数
function getRemainingDays(deadline: string): { days: number; isOverdue: boolean } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const deadlineDate = new Date(deadline)
  deadlineDate.setHours(0, 0, 0, 0)
  const diffTime = deadlineDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return { days: diffDays, isOverdue: diffDays < 0 }
}

// 任务详情对话框
function TaskDetailDialog({
  open,
  onOpenChange,
  task,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
}) {
  const [showHistory, setShowHistory] = React.useState(false)
  const histories = task ? getTaskHistories(task.id) : []

  if (!task) return null

  const typeStyle = typeConfig[task.type]
  const statusStyle = statusConfig[task.status]
  const remaining = getRemainingDays(task.deadline)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span>{task.code}</span>
            <Badge className={`${typeStyle.bg} ${typeStyle.text}`}>{task.type}</Badge>
            <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>{task.status}</Badge>
          </DialogTitle>
          <DialogDescription>{task.name}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-gray-500">分配人</Label>
              <p className="font-medium">{task.assignee || "未分配"}</p>
            </div>
            <div>
              <Label className="text-gray-500">创建人</Label>
              <p className="font-medium">{task.creator}</p>
            </div>
            <div>
              <Label className="text-gray-500">截止日期</Label>
              <p className="font-medium flex items-center gap-2">
                {task.deadline}
                {task.status !== "已完成" && task.status !== "已关闭" && (
                  <span className={`text-sm ${remaining.isOverdue ? "text-red-600" : remaining.days <= 3 ? "text-orange-600" : "text-green-600"}`}>
                    ({remaining.isOverdue ? `已逾期${Math.abs(remaining.days)}天` : `剩余${remaining.days}天`})
                  </span>
                )}
              </p>
            </div>
            <div>
              <Label className="text-gray-500">创建时间</Label>
              <p className="font-medium">{task.createdAt}</p>
            </div>
          </div>
          
          {task.description && (
            <div>
              <Label className="text-gray-500">任务描述</Label>
              <p className="mt-1 text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* 操作记录 */}
          <div className="border-t pt-4">
            <button
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="size-4" />
              {showHistory ? "收起操作记录" : "查看操作记录"}
            </button>
            
            {showHistory && (
              <div className="mt-4 space-y-3">
                {histories.length === 0 ? (
                  <p className="text-gray-500 text-sm">暂无操作记录</p>
                ) : (
                  histories.map((h) => (
                    <div key={h.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                        <History className="size-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-gray-700">{h.operator}</span>
                          <span className="text-gray-500">{h.action}</span>
                          {h.oldValue && h.newValue && (
                            <span className="text-gray-500">
                              {h.oldValue || "空"} → {h.newValue}
                            </span>
                          )}
                        </div>
                        {h.description && (
                          <p className="text-sm text-gray-600 mt-0.5">{h.description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">{h.timestamp}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 分配对话框
function AssignDialog({
  open,
  onOpenChange,
  task,
  onAssign,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: Task | null
  onAssign: (assignee: string) => void
}) {
  const [assignee, setAssignee] = React.useState("")

  React.useEffect(() => {
    if (task) {
      setAssignee(task.assignee || "")
    }
  }, [task])

  if (!task) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5 text-blue-600" />
            分配任务
          </DialogTitle>
          <DialogDescription>
            将任务 {task.code} 分配给指定人员
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>任务名称</Label>
            <Input value={task.name} disabled />
          </div>
          <div className="space-y-2">
            <Label>分配给 <span className="text-red-500">*</span></Label>
            <Select value={assignee} onValueChange={setAssignee}>
              <SelectTrigger>
                <SelectValue placeholder="请选择分配人" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="张三">张三</SelectItem>
                <SelectItem value="李四">李四</SelectItem>
                <SelectItem value="王五">王五</SelectItem>
                <SelectItem value="赵六">赵六</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button 
            onClick={() => {
              if (assignee) {
                onAssign(assignee)
                onOpenChange(false)
              }
            }}
            className="bg-blue-600 hover:bg-blue-700"
          >
            确认分配
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// 新增/编辑任务对话框
function TaskFormDialog({
  open,
  onOpenChange,
  mode,
  task,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  task?: Task | null
  onSave: (data: Partial<Task>) => void
}) {
  const [formData, setFormData] = React.useState({
    code: "",
    name: "",
    type: "需求" as TaskType,
    assignee: "",
    deadline: "",
    description: "",
  })
  const [saving, setSaving] = React.useState(false)

  React.useEffect(() => {
    if (mode === "edit" && task) {
      setFormData({
        code: task.code,
        name: task.name,
        type: task.type,
        assignee: task.assignee || "",
        deadline: task.deadline,
        description: task.description || "",
      })
    } else if (mode === "create") {
      const newCode = `TASK-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`
      setFormData({
        code: newCode,
        name: "",
        type: "需求",
        assignee: "",
        deadline: "",
        description: "",
      })
    }
  }, [mode, task, open])

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      alert("请输入任务名称")
      return
    }
    if (!formData.deadline) {
      alert("请选择截止日期")
      return
    }
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    onSave({
      ...formData,
      id: task?.id || `task-${Date.now()}`,
      creator: "admin01",
      createdAt: task?.createdAt || new Date().toISOString().split("T")[0],
      status: formData.assignee ? "进行中" : "待分配",
    })
    setSaving(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "新增任务" : "编辑任务"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>任务编号</Label>
              <Input value={formData.code} disabled />
            </div>
            <div className="space-y-2">
              <Label>任务类型</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as TaskType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="需求">需求</SelectItem>
                  <SelectItem value="测试">测试</SelectItem>
                  <SelectItem value="临时">临时</SelectItem>
                  <SelectItem value="调研">调研</SelectItem>
                  <SelectItem value="支持">支持</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>任务名称 <span className="text-red-500">*</span></Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="请输入任务名称"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>分配给</Label>
              <Select
                value={formData.assignee}
                onValueChange={(v) => setFormData({ ...formData, assignee: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选填" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="张三">张三</SelectItem>
                  <SelectItem value="李四">李四</SelectItem>
                  <SelectItem value="王五">王五</SelectItem>
                  <SelectItem value="赵六">赵六</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>截止日期 <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>任务描述</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="请输入任务描述"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? "保存中..." : mode === "create" ? "创建" : "保存"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [searchTerm, setSearchTerm] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // 对话框状态
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false)
  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null)
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create")

  React.useEffect(() => {
    setTasks(getAllTasks())
  }, [])

  // 筛选任务
  const filteredTasks = tasks.filter((task) => {
    const matchSearch = task.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchType = typeFilter === "all" || task.type === typeFilter
    const matchStatus = statusFilter === "all" || task.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  // 按截止日期倒序排列
  const sortedTasks = [...filteredTasks].sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  )

  // 分页
  const totalPages = Math.ceil(sortedTasks.length / pageSize)
  const paginatedTasks = sortedTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // 导出Excel
  const handleExport = () => {
    const headers = ["任务编号", "任务名称", "任务类型", "分配人", "截止日期", "状态", "剩余天数"]
    const rows = filteredTasks.map((task) => {
      const remaining = getRemainingDays(task.deadline)
      return [
        task.code,
        task.name,
        task.type,
        task.assignee || "未分配",
        task.deadline,
        task.status,
        task.status === "已完成" || task.status === "已关闭" 
          ? "-" 
          : remaining.isOverdue ? `逾期${Math.abs(remaining.days)}天` : `${remaining.days}天`,
      ]
    })
    
    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `任务列表_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
  }

  // 统计数据
  const stats = {
    total: tasks.length,
    pending: tasks.filter(t => t.status === "待分配").length,
    inProgress: tasks.filter(t => t.status === "进行中").length,
    completed: tasks.filter(t => t.status === "已完成").length,
    overdue: tasks.filter(t => {
      if (t.status === "已完成" || t.status === "已关闭") return false
      return getRemainingDays(t.deadline).isOverdue
    }).length,
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* 面包屑 */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/workspace">首页</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/tasks">任务管理</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>概览</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 统计卡片 */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
                <p className="text-sm text-gray-500">全部任务</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-sm text-gray-500">待分配</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
                <p className="text-sm text-gray-500">进行中</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-sm text-gray-500">已完成</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
                <p className="text-sm text-gray-500">已逾期</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 筛选栏 */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="搜索任务编号或名称"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 w-64"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="任务类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="需求">需求</SelectItem>
                <SelectItem value="测试">测试</SelectItem>
                <SelectItem value="临时">临时</SelectItem>
                <SelectItem value="调研">调研</SelectItem>
                <SelectItem value="支持">支持</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="待分配">待分配</SelectItem>
                <SelectItem value="进行中">进行中</SelectItem>
                <SelectItem value="已完成">已完成</SelectItem>
                <SelectItem value="已关闭">已关闭</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport} className="gap-2">
              <Download className="size-4" />
              导出Excel
            </Button>
            <Button 
              onClick={() => {
                setFormMode("create")
                setSelectedTask(null)
                setFormDialogOpen(true)
              }}
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="size-4" />
              新增任务
            </Button>
          </div>
        </div>

        {/* 任务表格 */}
        <Card>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-36">任务编号</TableHead>
                <TableHead>任务名称</TableHead>
                <TableHead className="w-24">任务类型</TableHead>
                <TableHead className="w-24">分配人</TableHead>
                <TableHead className="w-28">截止日期</TableHead>
                <TableHead className="w-24">状态</TableHead>
                <TableHead className="w-24">剩余时间</TableHead>
                <TableHead className="w-48 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTasks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-gray-500">
                    暂无任务数据
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTasks.map((task) => {
                  const typeStyle = typeConfig[task.type]
                  const statusStyle = statusConfig[task.status]
                  const remaining = getRemainingDays(task.deadline)
                  const isCompleted = task.status === "已完成" || task.status === "已关闭"
                  
                  return (
                    <TableRow key={task.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-blue-600">{task.code}</TableCell>
                      <TableCell className="max-w-xs truncate">{task.name}</TableCell>
                      <TableCell>
                        <Badge className={`${typeStyle.bg} ${typeStyle.text}`}>
                          {task.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{task.assignee || <span className="text-gray-400">未分配</span>}</TableCell>
                      <TableCell>{task.deadline}</TableCell>
                      <TableCell>
                        <Badge className={`${statusStyle.bg} ${statusStyle.text}`}>
                          {task.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {isCompleted ? (
                          <span className="text-gray-400">-</span>
                        ) : remaining.isOverdue ? (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertTriangle className="size-3" />
                            逾期{Math.abs(remaining.days)}天
                          </span>
                        ) : remaining.days <= 3 ? (
                          <span className="flex items-center gap-1 text-orange-600">
                            <Clock className="size-3" />
                            {remaining.days}天
                          </span>
                        ) : (
                          <span className="text-green-600">{remaining.days}天</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1 text-gray-600"
                            onClick={() => {
                              setSelectedTask(task)
                              setDetailDialogOpen(true)
                            }}
                          >
                            <Eye className="size-4" />
                            详情
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-gray-600">
                                更多
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  setSelectedTask(task)
                                  setAssignDialogOpen(true)
                                }}
                              >
                                <UserPlus className="size-4" />
                                分配
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="gap-2"
                                onClick={() => {
                                  setSelectedTask(task)
                                  setFormMode("edit")
                                  setFormDialogOpen(true)
                                }}
                              >
                                <Pencil className="size-4" />
                                编辑
                              </DropdownMenuItem>
                              {task.status === "待分配" && (
                                <DropdownMenuItem className="gap-2 text-green-600">
                                  <PlayCircle className="size-4" />
                                  接受
                                </DropdownMenuItem>
                              )}
                              {task.status === "进行中" && (
                                <DropdownMenuItem className="gap-2 text-green-600">
                                  <CheckCircle className="size-4" />
                                  完成
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="gap-2">
                                <XCircle className="size-4" />
                                关闭
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="gap-2 text-red-600"
                                onClick={() => {
                                  setSelectedTask(task)
                                  setDeleteDialogOpen(true)
                                }}
                              >
                                <Trash2 className="size-4" />
                                删除
                              </DropdownMenuItem>
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
        </Card>

        {/* 分页 */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            共 {filteredTasks.length} 条数据
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">每页显示</span>
              <Select value={pageSize.toString()} onValueChange={(v) => setPageSize(Number(v))}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 条</SelectItem>
                  <SelectItem value="20">20 条</SelectItem>
                  <SelectItem value="50">50 条</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
                className="gap-1 px-4"
              >
                <ChevronLeft className="size-4" />
                上一页
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      className="w-10"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="gap-1 px-4"
              >
                下一页
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">跳转至</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                className="w-16"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const value = parseInt((e.target as HTMLInputElement).value)
                    if (value >= 1 && value <= totalPages) {
                      setCurrentPage(value)
                    }
                  }
                }}
              />
              <span className="text-sm text-gray-600">页</span>
            </div>
          </div>
        </div>
      </div>

      {/* 详情对话框 */}
      <TaskDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        task={selectedTask}
      />

      {/* 分配对话框 */}
      <AssignDialog
        open={assignDialogOpen}
        onOpenChange={setAssignDialogOpen}
        task={selectedTask}
        onAssign={(assignee) => {
          console.log("分配任务给:", assignee)
        }}
      />

      {/* 新增/编辑对话框 */}
      <TaskFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        mode={formMode}
        task={selectedTask}
        onSave={(data) => {
          console.log("保存任务:", data)
        }}
      />

      {/* 删除确认对话框 */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除任务 {selectedTask?.code} 吗？此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700">
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
