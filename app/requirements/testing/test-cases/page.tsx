"use client"

import * as React from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { 
  Plus, Search, RotateCcw, Pencil, Trash2, Download, 
  Filter, Users, CheckCircle2, XCircle, Clock, AlertCircle,
  FileText
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import {
  getAllTestCases,
  getAllProjects,
  getAllVersions,
  getAllIterations,
  mockARDetails,
} from "@/lib/mock-data"
import type { TestCaseDetail, TestCaseStatus, Project, Version, Iteration } from "@/lib/types"

const statusConfig: Record<TestCaseStatus, { label: string; color: string; icon: React.ReactNode }> = {
  "未执行": { label: "未执行", color: "bg-gray-100 text-gray-700", icon: <Clock className="size-3.5" /> },
  "执行中": { label: "执行中", color: "bg-blue-100 text-blue-700", icon: <Clock className="size-3.5" /> },
  "通过": { label: "通过", color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="size-3.5" /> },
  "不通过": { label: "不通过", color: "bg-red-100 text-red-700", icon: <XCircle className="size-3.5" /> },
  "阻塞": { label: "阻塞", color: "bg-orange-100 text-orange-700", icon: <AlertCircle className="size-3.5" /> },
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  "高": { label: "高", color: "bg-red-100 text-red-700" },
  "中": { label: "中", color: "bg-yellow-100 text-yellow-700" },
  "低": { label: "低", color: "bg-green-100 text-green-700" },
}

export default function TestCasesPage() {
  const searchParams = useSearchParams()
  const [testCases, setTestCases] = React.useState<TestCaseDetail[]>([])
  const [projects, setProjects] = React.useState<Project[]>([])
  const [versions, setVersions] = React.useState<Version[]>([])
  const [iterations, setIterations] = React.useState<Iteration[]>([])
  
  // 筛选条件
  const [searchText, setSearchText] = React.useState("")
  const [filterProject, setFilterProject] = React.useState<string>("all")
  const [filterVersion, setFilterVersion] = React.useState<string>("all")
  const [filterIteration, setFilterIteration] = React.useState<string>("all")
  const [filterStatus, setFilterStatus] = React.useState<string>("all")
  
  // 选中项
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  
  // 弹窗状态
  const [formOpen, setFormOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [assignOpen, setAssignOpen] = React.useState(false)
  const [selectedCase, setSelectedCase] = React.useState<TestCaseDetail | null>(null)
  const [isEdit, setIsEdit] = React.useState(false)
  
  // 批量分配
  const [assignee, setAssignee] = React.useState("")
  const [deadline, setDeadline] = React.useState("")
  
  // 表单数据
  const [formData, setFormData] = React.useState({
    name: "",
    description: "",
    precondition: "",
    priority: "中" as "高" | "中" | "低",
    relatedArIds: [] as string[],
  })

  React.useEffect(() => {
    setTestCases(getAllTestCases())
    setProjects(getAllProjects())
    setVersions(getAllVersions())
    setIterations(getAllIterations())
  }, [])

  // 根据项目筛选版本
  const filteredVersions = React.useMemo(() => {
    if (filterProject === "all") return versions
    return versions.filter(v => v.projectId === filterProject)
  }, [filterProject, versions])

  // 根据版本筛选迭代
  const filteredIterations = React.useMemo(() => {
    if (filterVersion === "all") {
      if (filterProject === "all") return iterations
      return iterations.filter(i => i.projectId === filterProject)
    }
    return iterations.filter(i => i.versionId === filterVersion)
  }, [filterProject, filterVersion, iterations])

  // 筛选测试用例
  const filteredTestCases = React.useMemo(() => {
    return testCases.filter((tc) => {
      if (searchText && !tc.name.includes(searchText) && !tc.code.includes(searchText)) return false
      if (filterProject !== "all" && tc.projectId !== filterProject) return false
      if (filterVersion !== "all" && tc.versionId !== filterVersion) return false
      if (filterIteration !== "all" && tc.iterationId !== filterIteration) return false
      if (filterStatus !== "all" && tc.status !== filterStatus) return false
      return true
    })
  }, [testCases, searchText, filterProject, filterVersion, filterIteration, filterStatus])

  // 分页
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 10
  const totalPages = Math.ceil(filteredTestCases.length / pageSize)
  const paginatedTestCases = filteredTestCases.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedIds.size === paginatedTestCases.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(paginatedTestCases.map(tc => tc.id)))
    }
  }

  // 单选
  const handleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  // 重置筛选
  const handleReset = () => {
    setSearchText("")
    setFilterProject("all")
    setFilterVersion("all")
    setFilterIteration("all")
    setFilterStatus("all")
  }

  // 新增
  const handleAdd = () => {
    setIsEdit(false)
    setSelectedCase(null)
    setFormData({
      name: "",
      description: "",
      precondition: "",
      priority: "中",
      relatedArIds: [],
    })
    setFormOpen(true)
  }

  // 编辑
  const handleEdit = (tc: TestCaseDetail) => {
    setIsEdit(true)
    setSelectedCase(tc)
    setFormData({
      name: tc.name,
      description: tc.description || "",
      precondition: tc.precondition || "",
      priority: tc.priority,
      relatedArIds: tc.relatedArIds,
    })
    setFormOpen(true)
  }

  // 删除
  const handleDeleteClick = (tc: TestCaseDetail) => {
    setSelectedCase(tc)
    setDeleteOpen(true)
  }

  // 确认删除
  const handleDeleteConfirm = () => {
    if (selectedCase) {
      setTestCases(testCases.filter(tc => tc.id !== selectedCase.id))
      setDeleteOpen(false)
      setSelectedCase(null)
    }
  }

  // 保存
  const handleSave = () => {
    if (isEdit && selectedCase) {
      setTestCases(testCases.map(tc => 
        tc.id === selectedCase.id 
          ? { ...tc, ...formData }
          : tc
      ))
    } else {
      const newCase: TestCaseDetail = {
        id: `tc-${Date.now()}`,
        code: `TC-${String(testCases.length + 1).padStart(3, "0")}`,
        name: formData.name,
        description: formData.description,
        precondition: formData.precondition,
        priority: formData.priority,
        status: "未执行",
        relatedArIds: formData.relatedArIds,
        steps: [],
        creator: "当前用户",
        createdAt: new Date().toISOString().slice(0, 19).replace("T", " "),
        bugCount: 0,
      }
      setTestCases([newCase, ...testCases])
    }
    setFormOpen(false)
  }

  // 批量分配
  const handleBatchAssign = () => {
    if (selectedIds.size === 0) {
      alert("请先选择要分配的测试用例")
      return
    }
    setAssignee("")
    setDeadline("")
    setAssignOpen(true)
  }

  // 确认分配
  const handleAssignConfirm = () => {
    if (!assignee || !deadline) {
      alert("请填写分配人和截止日期")
      return
    }
    // 更新选中的测试用例
    setTestCases(testCases.map(tc => 
      selectedIds.has(tc.id) 
        ? { ...tc, assignee, status: "执行中" as TestCaseStatus }
        : tc
    ))
    // 清空选中
    setSelectedIds(new Set())
    setAssignOpen(false)
    alert(`已成功分配 ${selectedIds.size} 个测试用例给 ${assignee}，截止日期：${deadline}`)
  }

  // 导出Excel
  const handleExport = () => {
    const headers = ["编号", "名称", "优先级", "状态", "关联需求数", "Bug数", "执行人", "创建人", "创建时间"]
    const rows = filteredTestCases.map(tc => [
      tc.code,
      tc.name,
      tc.priority,
      tc.status,
      tc.relatedArIds.length.toString(),
      tc.bugCount.toString(),
      tc.assignee || "-",
      tc.creator,
      tc.createdAt,
    ])
    
    let csvContent = "\uFEFF" + headers.join(",") + "\n"
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(",") + "\n"
    })
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `测试用例_${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
    URL.revokeObjectURL(url)
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
              <BreadcrumbLink href="/requirements/testing/test-cases">测试管理</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>测试用例</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 标题和操作 */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">测试用例</h1>
            <p className="text-sm text-gray-500 mt-1">管理测试用例，执行测试并记录结果</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="size-4 mr-1" />
              导出
            </Button>
            <Button 
              variant="outline" 
              onClick={handleBatchAssign}
              disabled={selectedIds.size === 0}
              className={selectedIds.size > 0 ? "border-blue-200 text-blue-600" : ""}
            >
              <Users className="size-4 mr-1" />
              批量分配 {selectedIds.size > 0 && `(${selectedIds.size})`}
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleAdd}>
              <Plus className="size-4 mr-1" />
              新增用例
            </Button>
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
                  placeholder="搜索编号或名称..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={filterProject} onValueChange={(v) => {
              setFilterProject(v)
              setFilterVersion("all")
              setFilterIteration("all")
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="选择项目" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部项目</SelectItem>
                {projects.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterVersion} onValueChange={(v) => {
              setFilterVersion(v)
              setFilterIteration("all")
            }}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="选择版本" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部版本</SelectItem>
                {filteredVersions.map(v => (
                  <SelectItem key={v.id} value={v.id}>{v.versionNumber}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterIteration} onValueChange={setFilterIteration}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="选择迭代" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部迭代</SelectItem>
                {filteredIterations.map(i => (
                  <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                {Object.entries(statusConfig).map(([key, val]) => (
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
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={selectedIds.size === paginatedTestCases.length && paginatedTestCases.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[100px]">编号</TableHead>
                <TableHead>名称</TableHead>
                <TableHead className="w-[80px]">关联需求</TableHead>
                <TableHead className="w-[80px]">优先级</TableHead>
                <TableHead className="w-[100px]">状态</TableHead>
                <TableHead className="w-[80px]">Bug数</TableHead>
                <TableHead className="w-[100px]">执行人</TableHead>
                <TableHead className="w-[150px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTestCases.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    暂无测试用例
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTestCases.map((tc) => {
                  const status = statusConfig[tc.status]
                  const priority = priorityConfig[tc.priority]
                  return (
                    <TableRow key={tc.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedIds.has(tc.id)}
                          onCheckedChange={() => handleSelect(tc.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/requirements/testing/test-cases/${tc.id}`}
                          className="text-blue-600 hover:underline font-medium"
                        >
                          {tc.code}
                        </Link>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate">{tc.name}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <FileText className="size-3.5 text-gray-400" />
                          {tc.relatedArIds.length}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={priority.color}>{priority.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${status.color} flex items-center gap-1 w-fit`}>
                          {status.icon}
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={tc.bugCount > 0 ? "text-red-600 font-medium" : ""}>
                          {tc.bugCount}
                        </span>
                      </TableCell>
                      <TableCell>{tc.assignee || "-"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2"
                            onClick={() => handleEdit(tc)}
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteClick(tc)}
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
                共 {filteredTestCases.length} 条记录
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
            <DialogTitle>{isEdit ? "编辑测试用例" : "新增测试用例"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "修改测试用例基本信息" : "创建新的测试用例"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>用例名称 <span className="text-red-500">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入用例名称"
              />
            </div>
            <div className="space-y-2">
              <Label>用例描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入用例描述"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>前置条件</Label>
              <Textarea
                value={formData.precondition}
                onChange={(e) => setFormData({ ...formData, precondition: e.target.value })}
                placeholder="请输入前置条件"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>优先级 <span className="text-red-500">*</span></Label>
              <Select
                value={formData.priority}
                onValueChange={(v) => setFormData({ ...formData, priority: v as "高" | "中" | "低" })}
              >
                <SelectTrigger>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>取消</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleSave}
              disabled={!formData.name.trim()}
            >
              {isEdit ? "保存修改" : "确认新增"}
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
              确定要删除测试用例 <span className="font-medium text-gray-900">{selectedCase?.code}</span> 吗？此操作不可撤销。
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

      {/* 批量分配弹窗 */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>批量分配测试用例</DialogTitle>
            <DialogDescription>
              将选中的 {selectedIds.size} 个测试用例分配给执行人
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>分配给 <span className="text-red-500">*</span></Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger>
                  <SelectValue placeholder="选择执行人" />
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
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              分配后将自动创建对应的测试任务，并设置截止日期
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignOpen(false)}>取消</Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAssignConfirm}
              disabled={!assignee || !deadline}
            >
              确认分配
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
