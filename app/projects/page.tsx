"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Search, RotateCcw, Pencil, Trash2, Download } from "lucide-react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { getAllProjects, getVersionsByProjectId, getIterationsByProjectId } from "@/lib/mock-data"
import type { Project } from "@/lib/types"

const statusConfig: Record<string, { label: string; color: string }> = {
  "进行中": { label: "进行中", color: "bg-blue-100 text-blue-700" },
  "已完成": { label: "已完成", color: "bg-green-100 text-green-700" },
  "已暂停": { label: "已暂停", color: "bg-yellow-100 text-yellow-700" },
  "未开始": { label: "未开始", color: "bg-gray-100 text-gray-700" },
}

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<Project[]>([])
  const [searchText, setSearchText] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [formOpen, setFormOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [selectedProject, setSelectedProject] = React.useState<Project | null>(null)
  const [isEdit, setIsEdit] = React.useState(false)
  
  // 分页
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // 表单数据
  const [formData, setFormData] = React.useState({
    name: "",
    code: "",
    financeCode: "",
    owner: "",
    manager: "",
    startDate: "",
    endDate: "",
    status: "未开始" as Project["status"],
    description: "",
  })

  React.useEffect(() => {
    setProjects(getAllProjects())
  }, [])

  // 筛选
  const filteredProjects = projects.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(searchText.toLowerCase()) ||
      p.code.toLowerCase().includes(searchText.toLowerCase()) ||
      p.financeCode.includes(searchText)
    const matchStatus = statusFilter === "all" || p.status === statusFilter
    return matchSearch && matchStatus
  })

  // 分页
  const totalCount = filteredProjects.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // 打开新增对话框
  const handleAdd = () => {
    setIsEdit(false)
    setFormData({
      name: "",
      code: "",
      financeCode: "",
      owner: "",
      manager: "",
      startDate: "",
      endDate: "",
      status: "未开始",
      description: "",
    })
    setFormOpen(true)
  }

  // 打开编辑对话框
  const handleEdit = (project: Project) => {
    setIsEdit(true)
    setSelectedProject(project)
    setFormData({
      name: project.name,
      code: project.code,
      financeCode: project.financeCode,
      owner: project.owner,
      manager: project.manager,
      startDate: project.startDate,
      endDate: project.endDate,
      status: project.status,
      description: project.description || "",
    })
    setFormOpen(true)
  }

  // 打开删除确认
  const handleDeleteClick = (project: Project) => {
    setSelectedProject(project)
    setDeleteOpen(true)
  }

  // 保存
  const handleSave = () => {
    // 这里是模拟保存，实际项目中需要调用API
    console.log("保存项目:", formData)
    setFormOpen(false)
  }

  // 删除
  const handleDelete = () => {
    console.log("删除项目:", selectedProject?.id)
    setDeleteOpen(false)
  }

  // 导出
  const handleExport = () => {
    const headers = ["项目名称", "项目代号", "财务编码", "负责人", "项目经理", "开始时间", "结束时间", "状态"]
    const rows = filteredProjects.map((p) => [
      p.name,
      p.code,
      p.financeCode,
      p.owner,
      p.manager,
      p.startDate,
      p.endDate,
      p.status,
    ])
    const csvContent =
      "\uFEFF" + headers.join(",") + "\n" + rows.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `项目列表_${new Date().toISOString().split("T")[0]}.csv`
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
              <BreadcrumbLink href="/projects">项目管理</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>项目</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 筛选栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">状态</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="未开始">未开始</SelectItem>
                  <SelectItem value="进行中">进行中</SelectItem>
                  <SelectItem value="已完成">已完成</SelectItem>
                  <SelectItem value="已暂停">已暂停</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="搜索项目名称/代号/财务编码"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchText("")
                setStatusFilter("all")
              }}
            >
              <RotateCcw className="size-4 mr-1" />
              重置
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Search className="size-4 mr-1" />
              查询
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="size-4 mr-1" />
              导出Excel
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={handleAdd}>
              <Plus className="size-4 mr-1" />
              新增
            </Button>
          </div>
        </div>

        {/* 表格 */}
        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[200px]">项目名称</TableHead>
                <TableHead className="w-[100px]">项目代号</TableHead>
                <TableHead className="w-[100px]">财务编码</TableHead>
                <TableHead className="w-[80px]">负责人</TableHead>
                <TableHead className="w-[80px]">项目经理</TableHead>
                <TableHead className="w-[100px]">开始时间</TableHead>
                <TableHead className="w-[100px]">结束时间</TableHead>
                <TableHead className="w-[60px]">版本数</TableHead>
                <TableHead className="w-[60px]">迭代数</TableHead>
                <TableHead className="w-[80px]">状态</TableHead>
                <TableHead className="w-[120px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedProjects.map((project) => {
                const versions = getVersionsByProjectId(project.id)
                const iterations = getIterationsByProjectId(project.id)
                const currentIter = iterations.find((i) => i.status === "进行中")
                const status = statusConfig[project.status] || statusConfig["未开始"]
                return (
                  <TableRow key={project.id} className="hover:bg-gray-50">
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {project.code}
                      </Link>
                    </TableCell>
                    <TableCell>{project.financeCode}</TableCell>
                    <TableCell>{project.owner}</TableCell>
                    <TableCell>{project.manager}</TableCell>
                    <TableCell>{project.startDate}</TableCell>
                    <TableCell>{project.endDate}</TableCell>
                    <TableCell>{versions.length}</TableCell>
                    <TableCell>{iterations.length}</TableCell>
                    <TableCell>
                      <Badge className={status.color}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-blue-600 hover:text-blue-700"
                          onClick={() => handleEdit(project)}
                        >
                          <Pencil className="size-3.5 mr-1" />
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(project)}
                        >
                          <Trash2 className="size-3.5 mr-1" />
                          删除
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {/* 分页 */}
        <div className="flex items-center justify-between mt-4 text-sm">
          <div className="text-gray-500">
            共 {totalCount} 条
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-gray-600">每页显示</span>
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
                className="px-4"
              >
                上一页
              </Button>
              <span className="px-3">
                {currentPage} / {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-4"
              >
                下一页
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">跳转至</span>
              <Input
                type="number"
                min={1}
                max={totalPages || 1}
                value={currentPage}
                onChange={(e) => {
                  const val = Number(e.target.value)
                  if (val >= 1 && val <= totalPages) {
                    setCurrentPage(val)
                  }
                }}
                className="w-16 text-center"
              />
              <span className="text-gray-600">页</span>
            </div>
          </div>
        </div>
      </div>

      {/* 新增/编辑对话框 */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "编辑项目" : "新增项目"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "修改项目信息" : "填写项目基本信息"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>项目名称 <span className="text-red-500">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="请输入项目名称"
              />
            </div>
            <div className="space-y-2">
              <Label>项目代号 <span className="text-red-500">*</span></Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                placeholder="如：Terra"
              />
            </div>
            <div className="space-y-2">
              <Label>财务编码 <span className="text-red-500">*</span></Label>
              <Input
                value={formData.financeCode}
                onChange={(e) => setFormData({ ...formData, financeCode: e.target.value })}
                placeholder="如：82525"
              />
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as Project["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="未开始">未开始</SelectItem>
                  <SelectItem value="进行中">进行中</SelectItem>
                  <SelectItem value="已完成">已完成</SelectItem>
                  <SelectItem value="已暂停">已暂停</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>负责人 <span className="text-red-500">*</span></Label>
              <Input
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                placeholder="请输入负责人"
              />
            </div>
            <div className="space-y-2">
              <Label>项目经理 <span className="text-red-500">*</span></Label>
              <Input
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
                placeholder="请输入项目经理"
              />
            </div>
            <div className="space-y-2">
              <Label>开始时间 <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>结束时间 <span className="text-red-500">*</span></Label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label>项目描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入项目描述"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              取消
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSave}>
              保存
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
              确定要删除项目"{selectedProject?.name}"吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDelete}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  )
}
