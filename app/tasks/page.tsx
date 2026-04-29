"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search, Plus, Eye, Pencil, Trash2, UserPlus, CheckCircle, XCircle,
  PlayCircle, Download, History, ChevronLeft, ChevronRight, Clock,
  AlertTriangle, Filter, Loader2, AlertCircle,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { listTasks, getTaskStats, getTask, createTask, updateTask, deleteTask, assignTask, changeTaskStatus, exportTasks } from "@/lib/api/tasks"
import type { TaskVO, TaskStatsVO } from "@/lib/api/tasks"

const typeConfig: Record<string, { bg: string; text: string }> = {
  "需求": { bg: "bg-blue-100", text: "text-blue-700" },
  "测试": { bg: "bg-green-100", text: "text-green-700" },
  "临时": { bg: "bg-orange-100", text: "text-orange-700" },
  "调研": { bg: "bg-purple-100", text: "text-purple-700" },
  "支持": { bg: "bg-cyan-100", text: "text-cyan-700" },
}

const statusConfig: Record<string, { bg: string; text: string }> = {
  "待分配": { bg: "bg-yellow-100", text: "text-yellow-700" },
  "进行中": { bg: "bg-blue-100", text: "text-blue-700" },
  "已完成": { bg: "bg-green-100", text: "text-green-700" },
  "已关闭": { bg: "bg-gray-100", text: "text-gray-600" },
}

function TaskDetailDialog({ open, onOpenChange, task }: { open: boolean; onOpenChange: (o: boolean) => void; task: TaskVO | null }) {
  const [histories, setHistories] = React.useState<any[]>([])
  const [showHistory, setShowHistory] = React.useState(false)

  React.useEffect(() => {
    if (task && open) {
      getTask(task.id).then(t => setHistories(t.histories || [])).catch(() => {})
    }
  }, [task, open])

  if (!task) return null

  const typeStyle = typeConfig[task.type] || { bg: "bg-gray-100", text: "text-gray-700" }
  const statusStyle = statusConfig[task.status] || { bg: "bg-gray-100", text: "text-gray-600" }

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
            <div><Label>分配人</Label><p className="text-sm mt-1">{task.assignee || "未分配"}</p></div>
            <div><Label>创建人</Label><p className="text-sm mt-1">{task.creator}</p></div>
            <div><Label>截止日期</Label><p className="text-sm mt-1">{task.deadline}</p></div>
            <div><Label>创建时间</Label><p className="text-sm mt-1">{task.createdAt}</p></div>
          </div>
          {task.description && (
            <div><Label>描述</Label><p className="text-sm mt-1 whitespace-pre-wrap">{task.description}</p></div>
          )}
          {showHistory && histories.length > 0 && (
            <div>
              <Label>操作历史</Label>
              <div className="space-y-2 mt-2 max-h-48 overflow-y-auto">
                {histories.map((h: any) => (
                  <div key={h.id} className="flex items-center gap-2 text-sm p-2 bg-gray-50 rounded">
                    <span className="font-medium">{h.action}</span>
                    <span className="text-gray-500">by {h.operator}</span>
                    <span className="text-gray-400 text-xs">{h.timestamp}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowHistory(!showHistory)}>
            <History className="size-4 mr-1" />{showHistory ? "隐藏" : "显示"}历史
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<TaskVO[]>([])
  const [stats, setStats] = React.useState<TaskStatsVO | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [searchTerm, setSearchTerm] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [total, setTotal] = React.useState(0)

  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false)
  const [assignDialogOpen, setAssignDialogOpen] = React.useState(false)
  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedTask, setSelectedTask] = React.useState<TaskVO | null>(null)
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create")
  const [saving, setSaving] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)

  const fetchTasks = React.useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params: Record<string, string | number | undefined> = { page: currentPage, pageSize }
      if (typeFilter !== "all") params.type = typeFilter
      if (statusFilter !== "all") params.status = statusFilter
      if (searchTerm.trim()) params.keyword = searchTerm.trim()
      const [taskResult, statsResult] = await Promise.all([
        listTasks({ ...params, sortBy: 'deadline', sortOrder: 'asc' }),
        getTaskStats(),
      ])
      setTasks(taskResult.list)
      setTotal(taskResult.total)
      setStats(statsResult)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "加载失败")
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, typeFilter, statusFilter, searchTerm])

  React.useEffect(() => { fetchTasks() }, [fetchTasks])

  const totalPages = Math.ceil(total / pageSize)
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) { for (let i = 1; i <= totalPages; i++) pages.push(i) }
    else if (currentPage <= 4) pages.push(1, 2, 3, 4, 5, "...", totalPages)
    else if (currentPage >= totalPages - 3) pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    else pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
    return pages
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params: Record<string, string | undefined> = {}
      if (typeFilter !== "all") params.type = typeFilter
      if (statusFilter !== "all") params.status = statusFilter
      await exportTasks(params)
    } catch { alert("导出失败") }
    finally { setExporting(false) }
  }

  const handleCreate = async (formData: any) => {
    setSaving(true)
    try {
      await createTask({ name: formData.name, type: formData.type, creator: formData.creator || "管理员", deadline: formData.deadline, description: formData.description })
      setFormDialogOpen(false)
      fetchTasks()
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "创建失败") }
    finally { setSaving(false) }
  }

  const handleAssign = async () => {
    if (!selectedTask) return
    try {
      const input = document.getElementById('assignee-input') as HTMLInputElement
      await assignTask(selectedTask.id, input.value)
      setAssignDialogOpen(false)
      fetchTasks()
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "分配失败") }
  }

  const handleStatusChange = async (id: number, status: string) => {
    try { await changeTaskStatus(id, status); fetchTasks() }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "状态变更失败") }
  }

  const handleDelete = async () => {
    if (!selectedTask) return
    try { await deleteTask(selectedTask.id); setDeleteDialogOpen(false); fetchTasks() }
    catch (err: unknown) { alert(err instanceof Error ? err.message : "删除失败") }
  }

  const getRemainingDays = (deadline: string) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const d = new Date(deadline); d.setHours(0, 0, 0, 0)
    const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return { days: Math.abs(diff), isOverdue: diff < 0 }
  }

  const [formData, setFormData] = React.useState({ name: "", type: "需求", deadline: "", description: "" })

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/workspace">工作台</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem><BreadcrumbPage>任务管理</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card><CardHeader className="py-3"><CardTitle className="text-sm text-gray-500">总任务</CardTitle></CardHeader><CardContent className="py-2"><p className="text-2xl font-bold">{stats.total}</p></CardContent></Card>
            <Card><CardHeader className="py-3"><CardTitle className="text-sm text-yellow-600">待分配</CardTitle></CardHeader><CardContent className="py-2"><p className="text-2xl font-bold text-yellow-600">{stats.pending}</p></CardContent></Card>
            <Card><CardHeader className="py-3"><CardTitle className="text-sm text-blue-600">进行中</CardTitle></CardHeader><CardContent className="py-2"><p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p></CardContent></Card>
            <Card><CardHeader className="py-3"><CardTitle className="text-sm text-green-600">已完成</CardTitle></CardHeader><CardContent className="py-2"><p className="text-2xl font-bold text-green-600">{stats.completed}</p></CardContent></Card>
            <Card><CardHeader className="py-3"><CardTitle className="text-sm text-red-600">逾期</CardTitle></CardHeader><CardContent className="py-2"><p className="text-2xl font-bold text-red-600">{stats.overdue}</p></CardContent></Card>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">类型</span>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="需求">需求</SelectItem>
                <SelectItem value="测试">测试</SelectItem>
                <SelectItem value="临时">临时</SelectItem>
                <SelectItem value="调研">调研</SelectItem>
                <SelectItem value="支持">支持</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">状态</span>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1) }}>
              <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="待分配">待分配</SelectItem>
                <SelectItem value="进行中">进行中</SelectItem>
                <SelectItem value="已完成">已完成</SelectItem>
                <SelectItem value="已关闭">已关闭</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 max-w-xs">
            <Input placeholder="搜索任务编号/名称" value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { setCurrentPage(1); fetchTasks() } }} />
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={exporting}>
            {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            导出
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700"
            onClick={() => { setFormMode("create"); setFormData({ name: "", type: "需求", deadline: "", description: "" }); setFormDialogOpen(true) }}>
            <Plus className="size-4" />新增
          </Button>
        </div>

        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <div className="rounded-lg border bg-white">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50">
                    <TableHead className="font-semibold">编号</TableHead>
                    <TableHead className="font-semibold">名称</TableHead>
                    <TableHead className="font-semibold">类型</TableHead>
                    <TableHead className="font-semibold">分配人</TableHead>
                    <TableHead className="font-semibold">截止日期</TableHead>
                    <TableHead className="font-semibold">状态</TableHead>
                    <TableHead className="font-semibold">剩余</TableHead>
                    <TableHead className="font-semibold text-center">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.length === 0 ? (
                    <TableRow><TableCell colSpan={8} className="text-center text-gray-500 py-8">暂无数据</TableCell></TableRow>
                  ) : tasks.map((task) => {
                    const remaining = getRemainingDays(task.deadline)
                    return (
                      <TableRow key={task.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium text-blue-600">{task.code}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={task.name}>{task.name}</TableCell>
                        <TableCell>
                          <Badge className={(typeConfig[task.type] || { bg: "bg-gray-100", text: "text-gray-700" }).bg + " text-xs"}>
                            {task.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{task.assignee || <span className="text-gray-400">-</span>}</TableCell>
                        <TableCell>{task.deadline}</TableCell>
                        <TableCell>
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${(statusConfig[task.status] || { bg: "bg-gray-100", text: "text-gray-600" }).bg} ${(statusConfig[task.status] || { bg: "", text: "text-gray-600" }).text}`}>
                            {task.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {task.status === "已完成" || task.status === "已关闭" ? (
                            <span className="text-gray-400 text-sm">-</span>
                          ) : remaining.isOverdue ? (
                            <span className="text-red-600 text-sm flex items-center gap-1">
                              <AlertTriangle className="size-3" />逾期{remaining.days}天
                            </span>
                          ) : (
                            <span className="text-gray-600 text-sm flex items-center gap-1">
                              <Clock className="size-3" />{remaining.days}天
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button variant="ghost" size="sm" onClick={() => { setSelectedTask(task); setDetailDialogOpen(true) }}>
                              <Eye className="size-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm"><Pencil className="size-4" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                {task.status !== "已完成" && task.status !== "已关闭" && (
                                  <>
                                    <DropdownMenuItem onClick={() => { setSelectedTask(task); setAssignDialogOpen(true) }}>
                                      <UserPlus className="size-4 mr-2" />分配
                                    </DropdownMenuItem>
                                    {task.status === "待分配" && task.assignee && (
                                      <DropdownMenuItem onClick={() => handleStatusChange(task.id, "进行中")}>
                                        <PlayCircle className="size-4 mr-2" />开始
                                      </DropdownMenuItem>
                                    )}
                                    {task.status === "进行中" && (
                                      <DropdownMenuItem onClick={() => handleStatusChange(task.id, "已完成")}>
                                        <CheckCircle className="size-4 mr-2 text-green-600" />完成
                                      </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator />
                                  </>
                                )}
                                <DropdownMenuItem onClick={() => handleStatusChange(task.id, "已关闭")}>
                                  <XCircle className="size-4 mr-2" />关闭
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => { setSelectedTask(task); setDeleteDialogOpen(true) }}>
                                  <Trash2 className="size-4 mr-2" />删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg border">
              <span className="text-sm text-gray-600">共 <span className="font-medium">{total}</span> 条</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">每页</span>
                  <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setCurrentPage(1) }}>
                    <SelectTrigger className="w-20"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}>
                    <ChevronLeft className="size-4" />
                  </Button>
                  {getPageNumbers().map((p, i) => (
                    p === "..." ? <span key={i} className="px-2 text-gray-400">...</span>
                      : <Button key={i} variant={currentPage === p ? "default" : "outline"} size="sm"
                        onClick={() => setCurrentPage(p as number)}
                        className={`h-9 w-9 p-0 ${currentPage === p ? "bg-blue-600" : ""}`}>{p}</Button>
                  ))}
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages || totalPages === 0}>
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Detail Dialog */}
        <TaskDetailDialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen} task={selectedTask} />

        {/* Create/Edit Dialog */}
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>{formMode === "create" ? "新建任务" : "编辑任务"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>任务名称</Label>
                <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="请输入任务名称" />
              </div>
              <div>
                <Label>任务类型</Label>
                <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="需求">需求</SelectItem>
                    <SelectItem value="测试">测试</SelectItem>
                    <SelectItem value="临时">临时</SelectItem>
                    <SelectItem value="调研">调研</SelectItem>
                    <SelectItem value="支持">支持</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>截止日期</Label>
                <Input type="date" value={formData.deadline} onChange={e => setFormData({ ...formData, deadline: e.target.value })} />
              </div>
              <div>
                <Label>描述</Label>
                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFormDialogOpen(false)}>取消</Button>
              <Button onClick={() => handleCreate(formData)} disabled={saving} className="bg-blue-600">{saving ? "保存中..." : "创建"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Assign Dialog */}
        <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>分配任务</DialogTitle>
              <DialogDescription>为任务 {selectedTask?.code} 指定负责人</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label>负责人</Label>
              <Input id="assignee-input" placeholder="输入负责人姓名" className="mt-2" />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>取消</Button>
              <Button onClick={handleAssign} className="bg-blue-600">确认分配</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>确定要删除任务 {selectedTask?.code} 吗？</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600">删除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
