"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Plus, Search, RotateCcw, Pencil, Trash2, Download, 
  Filter, Bug, AlertTriangle, CheckCircle2, Clock, Upload, X, ImageIcon
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { getAllBugs } from "@/lib/mock-data"
import type { Bug as BugType, BugStatus, BugSeverity } from "@/lib/types"

const statusConfig: Record<BugStatus, { label: string; color: string }> = {
  "新建": { label: "新建", color: "bg-blue-100 text-blue-700" },
  "处理中": { label: "处理中", color: "bg-yellow-100 text-yellow-700" },
  "已修复": { label: "已修复", color: "bg-green-100 text-green-700" },
  "已验证": { label: "已验证", color: "bg-purple-100 text-purple-700" },
  "已关闭": { label: "已关闭", color: "bg-gray-100 text-gray-700" },
  "重新打开": { label: "重新打开", color: "bg-red-100 text-red-700" },
}

const severityConfig: Record<BugSeverity, { label: string; color: string }> = {
  "致命": { label: "致命", color: "bg-red-500 text-white" },
  "严重": { label: "严重", color: "bg-red-100 text-red-700" },
  "一般": { label: "一般", color: "bg-yellow-100 text-yellow-700" },
  "轻微": { label: "轻微", color: "bg-blue-100 text-blue-700" },
  "建议": { label: "建议", color: "bg-gray-100 text-gray-700" },
}

export default function BugsPage() {
  const [bugs, setBugs] = React.useState<BugType[]>([])
  
  // 筛选条件
  const [searchText, setSearchText] = React.useState("")
  const [filterStatus, setFilterStatus] = React.useState<string>("all")
  const [filterSeverity, setFilterSeverity] = React.useState<string>("all")
  
  // 弹窗状态
  const [formOpen, setFormOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [selectedBug, setSelectedBug] = React.useState<BugType | null>(null)
  const [isEdit, setIsEdit] = React.useState(false)
  
  // 表单数据
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    steps: "",
    severity: "一般" as BugSeverity,
    assignee: "",
    deadline: "",
    images: [] as string[],
  })

  React.useEffect(() => {
    setBugs(getAllBugs())
  }, [])

  // 筛选Bug
  const filteredBugs = React.useMemo(() => {
    return bugs.filter((bug) => {
      if (searchText && !bug.name.includes(searchText) && !bug.code.includes(searchText)) return false
      if (filterStatus !== "all" && bug.status !== filterStatus) return false
      if (filterSeverity !== "all" && bug.severity !== filterSeverity) return false
      return true
    })
  }, [bugs, searchText, filterStatus, filterSeverity])

  // 分页
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(filteredBugs.length / pageSize)
  const paginatedBugs = filteredBugs.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // 重置筛选
  const handleReset = () => {
    setSearchText("")
    setFilterStatus("all")
    setFilterSeverity("all")
  }

  // 新增
  const handleAdd = () => {
    setIsEdit(false)
    setSelectedBug(null)
    setFormData({
      name: "",
      description: "",
      steps: "",
      severity: "一般",
      assignee: "",
      deadline: "",
      images: [],
    })
    setFormOpen(true)
  }

  // 编辑
  const handleEdit = (bug: BugType) => {
    setIsEdit(true)
    setSelectedBug(bug)
    setFormData({
      name: bug.name,
      description: bug.description,
      steps: bug.steps,
      severity: bug.severity,
      assignee: bug.assignee || "",
      deadline: "",
      images: bug.images || [],
    })
    setFormOpen(true)
  }

  // 处理图片上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    
    // 模拟上传，实际项目应该上传到服务器
    const newImages = Array.from(files).map((file, index) => {
      return URL.createObjectURL(file)
    })
    setFormData({
      ...formData,
      images: [...formData.images, ...newImages],
    })
  }

  // 删除图片
  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    })
  }

  // 删除
  const handleDeleteClick = (bug: BugType) => {
    setSelectedBug(bug)
    setDeleteOpen(true)
  }

  // 确认删除
  const handleDeleteConfirm = () => {
    if (selectedBug) {
      setBugs(bugs.filter(b => b.id !== selectedBug.id))
      setDeleteOpen(false)
      setSelectedBug(null)
    }
  }

  // 保存
  const handleSave = () => {
    if (isEdit && selectedBug) {
      setBugs(bugs.map(b => 
        b.id === selectedBug.id 
          ? { ...b, ...formData, images: formData.images }
          : b
      ))
    } else {
      const newBug: BugType = {
        id: `bug-${Date.now()}`,
        code: `BUG-${String(bugs.length + 100).padStart(3, "0")}`,
        name: formData.name,
        description: formData.description,
        steps: formData.steps,
        severity: formData.severity,
        status: "新建",
        assignee: formData.assignee || undefined,
        creator: "当前用户",
        createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        images: formData.images,
        taskId: `task-${Date.now()}`,
      }
      setBugs([newBug, ...bugs])
      alert(`Bug ${newBug.code} 已创建（含${formData.images.length}张截图），同时生成任务，截止日期：${formData.deadline}`)
    }
    setFormOpen(false)
  }

  // 导出Excel
  const handleExport = () => {
    const headers = ["编号", "标题", "严重程度", "状态", "责任人", "创建人", "创建时间", "解决时间"]
    const rows = filteredBugs.map(bug => [
      bug.code,
      bug.name,
      bug.severity,
      bug.status,
      bug.assignee || "-",
      bug.creator,
      bug.createdAt,
      bug.resolvedAt || "-",
    ])
    
    let csvContent = "\uFEFF" + headers.join(",") + "\n"
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(",") + "\n"
    })
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `Bug列表_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  // 统计数据
  const stats = React.useMemo(() => {
    const total = bugs.length
    const open = bugs.filter(b => ["新建", "处理中", "重新打开"].includes(b.status)).length
    const fixed = bugs.filter(b => ["已修复", "已验证"].includes(b.status)).length
    const closed = bugs.filter(b => b.status === "已关闭").length
    return { total, open, fixed, closed }
  }, [bugs])

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
              <BreadcrumbPage>Bug单</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 标题和操作 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bug单</h1>
            <p className="text-sm text-gray-500 mt-1">管理Bug，跟踪修复进度</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="size-4 mr-1" />
              导出
            </Button>
            <Button className="bg-red-600 hover:bg-red-700" onClick={handleAdd}>
              <Plus className="size-4 mr-1" />
              新建Bug
            </Button>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">全部Bug</div>
                <div className="text-2xl font-bold mt-1">{stats.total}</div>
              </div>
              <Bug className="size-8 text-gray-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">待处理</div>
                <div className="text-2xl font-bold mt-1 text-red-600">{stats.open}</div>
              </div>
              <AlertTriangle className="size-8 text-red-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">已修复</div>
                <div className="text-2xl font-bold mt-1 text-green-600">{stats.fixed}</div>
              </div>
              <CheckCircle2 className="size-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-500">已关闭</div>
                <div className="text-2xl font-bold mt-1 text-gray-600">{stats.closed}</div>
              </div>
              <Clock className="size-8 text-gray-400" />
            </div>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="bg-white rounded-lg border p-4 mb-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-gray-500" />
              <span className="text-sm text-gray-600">筛选:</span>
            </div>
            <div className="flex-1 max-w-xs">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                <Input
                  placeholder="搜索编号或标题..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {Object.entries(statusConfig).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterSeverity} onValueChange={setFilterSeverity}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="严重程度" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部程度</SelectItem>
                {Object.entries(severityConfig).map(([key, val]) => (
                  <SelectItem key={key} value={key}>{val.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="sm" onClick={handleReset}>
              <RotateCcw className="size-4 mr-1" />
              重置
            </Button>
          </div>
        </div>

        {/* 表格 */}
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">编号</TableHead>
                <TableHead>标题</TableHead>
                <TableHead className="w-[100px]">严重程度</TableHead>
                <TableHead className="w-[100px]">状态</TableHead>
                <TableHead className="w-[100px]">责任人</TableHead>
                <TableHead className="w-[100px]">创建人</TableHead>
                <TableHead className="w-[150px]">创建时间</TableHead>
                <TableHead className="w-[120px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedBugs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    暂无Bug记录
                  </TableCell>
                </TableRow>
              ) : (
                paginatedBugs.map((bug) => {
                  const status = statusConfig[bug.status]
                  const severity = severityConfig[bug.severity]
                  return (
                    <TableRow key={bug.id}>
                      <TableCell>
                        <Link
                          href={`/requirements/bugs/${bug.id}`}
                          className="text-red-600 hover:underline font-medium"
                        >
                          {bug.code}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{bug.name}</TableCell>
                      <TableCell>
                        <Badge className={severity.color}>{severity.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>{bug.assignee || "-"}</TableCell>
                      <TableCell>{bug.creator}</TableCell>
                      <TableCell className="text-sm text-gray-500">{bug.createdAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleEdit(bug)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteClick(bug)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* 分页 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-500">
                共 {filteredBugs.length} 条记录
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  上一页
                </Button>
                <span className="text-sm text-gray-600">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  下一页
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 新增/编辑弹窗 */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEdit ? "编辑Bug" : "新建Bug"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "修改Bug信息" : "创建新的Bug并生成任务"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label>Bug标题 <span className="text-red-500">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入Bug标题"
              />
            </div>
            <div className="space-y-2">
              <Label>问题描述 <span className="text-red-500">*</span></Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请详细描述问题..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>复现步骤</Label>
              <Textarea
                value={formData.steps}
                onChange={(e) => setFormData({ ...formData, steps: e.target.value })}
                placeholder="请输入复现步骤..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>严重程度 <span className="text-red-500">*</span></Label>
                <Select
                  value={formData.severity}
                  onValueChange={(v) => setFormData({ ...formData, severity: v as BugSeverity })}
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
                  value={formData.assignee}
                  onValueChange={(v) => setFormData({ ...formData, assignee: v })}
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
            {/* 图片上传 */}
            <div className="space-y-2">
              <Label>问题截图</Label>
              <div className="border-2 border-dashed rounded-lg p-4">
                <input
                  type="file"
                  id="bug-images"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <label
                  htmlFor="bug-images"
                  className="flex flex-col items-center justify-center cursor-pointer py-4 hover:bg-gray-50 rounded transition-colors"
                >
                  <Upload className="size-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">点击上传截图</span>
                  <span className="text-xs text-gray-400">支持 jpg, png 格式</span>
                </label>
              </div>
              {/* 已上传图片预览 */}
              {formData.images.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.images.map((img, index) => (
                    <div key={index} className="relative group">
                      <div className="w-20 h-20 border rounded overflow-hidden bg-gray-100 flex items-center justify-center">
                        {img.startsWith("blob:") ? (
                          <img src={img} alt={`截图${index + 1}`} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="size-8 text-gray-400" />
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {!isEdit && (
              <div className="space-y-2">
                <Label>任务截止日期 <span className="text-red-500">*</span></Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
                <p className="text-xs text-gray-500">新建Bug时会同步生成一个任务</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>取消</Button>
            <Button
              className="bg-red-600 hover:bg-red-700"
              onClick={handleSave}
              disabled={!formData.name.trim() || !formData.description.trim() || (!isEdit && !formData.deadline)}
            >
              {isEdit ? "保存修改" : "创建Bug"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认 */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除</AlertDialogTitle>
            <AlertDialogDescription>
              确定要删除Bug <span className="font-medium text-gray-900">{selectedBug?.code}</span> 吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirm}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
