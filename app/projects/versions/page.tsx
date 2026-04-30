"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Search, RotateCcw, Pencil, Trash2, Download, FileText } from "lucide-react"
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
import { listVersions, createVersion, updateVersion, deleteVersion, getVersionIterations, getVersionStats, exportVersions } from "@/lib/api/versions"
import { listProjects } from "@/lib/api/projects"
import type { VersionVO } from "@/lib/api/versions"
import type { ProjectVO } from "@/lib/api/projects"

const statusConfig: Record<string, { label: string; color: string }> = {
  "进行中": { label: "进行中", color: "bg-blue-100 text-blue-700" },
  "已发布": { label: "已发布", color: "bg-green-100 text-green-700" },
  "规划中": { label: "规划中", color: "bg-gray-100 text-gray-700" },
}

export default function VersionsPage() {
  const [versions, setVersions] = React.useState<VersionVO[]>([])
  const [projects, setProjects] = React.useState<ProjectVO[]>([])
  const [iterationCounts, setIterationCounts] = React.useState<Record<number, number>>({})
  const [statsMap, setStatsMap] = React.useState<Record<number, { total: number }>>({})
  const [totalCount, setTotalCount] = React.useState(0)
  const [searchText, setSearchText] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [projectFilter, setProjectFilter] = React.useState("all")
  const [formOpen, setFormOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [selectedVersion, setSelectedVersion] = React.useState<VersionVO | null>(null)
  const [isEdit, setIsEdit] = React.useState(false)

  // 分页
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // 表单数据
  const [formData, setFormData] = React.useState({
    productName: "",
    projectId: "",
    versionNumber: "",
    startDate: "",
    endDate: "",
    status: "规划中",
    description: "",
  })

  React.useEffect(() => {
    fetchProjects()
    fetchVersions()
  }, [])

  React.useEffect(() => {
    fetchVersions()
  }, [searchText, statusFilter, projectFilter, currentPage, pageSize])

  async function fetchProjects() {
    try {
      const result = await listProjects({ page: 1, pageSize: 1000 })
      setProjects(result.list)
    } catch (error) {
      console.error("加载项目失败", error)
    }
  }

  async function fetchVersions() {
    try {
      const result = await listVersions({
        page: currentPage,
        pageSize,
        keyword: searchText || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        projectId: projectFilter === "all" ? undefined : Number(projectFilter),
      })
      setVersions(result.list)
      setTotalCount(result.total)

      const [counts, stats] = await Promise.all([
        Promise.all(result.list.map(async (item) => {
          const items = await getVersionIterations(item.id)
          return [item.id, items.length] as const
        })),
        Promise.all(result.list.map(async (item) => {
          const stat = await getVersionStats(item.id)
          return [item.id, { total: Number((stat as Record<string, unknown>).totalRequirements ?? (stat as Record<string, unknown>).total ?? 0) }] as const
        })),
      ])
      setIterationCounts(Object.fromEntries(counts))
      setStatsMap(Object.fromEntries(stats))
    } catch (error) {
      console.error("加载版本失败", error)
    }
  }

  // 筛选
  const filteredVersions = versions
    const matchSearch =
      v.productName.toLowerCase().includes(searchText.toLowerCase()) ||
      v.versionNumber.toLowerCase().includes(searchText.toLowerCase())
    const matchStatus = statusFilter === "all" || v.status === statusFilter
    const matchProject = projectFilter === "all" || v.projectId === projectFilter
    return matchSearch && matchStatus && matchProject
  })

  // 分页
  const totalCount = filteredVersions.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const paginatedVersions = filteredVersions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleAdd = () => {
    setIsEdit(false)
    setFormData({
      productName: "",
      projectId: "",
      versionNumber: "",
      startDate: "",
      endDate: "",
      status: "规划中",
      description: "",
    })
    setFormOpen(true)
  }

  const handleEdit = (version: Version) => {
    setIsEdit(true)
    setSelectedVersion(version)
    setFormData({
      productName: version.productName,
      projectId: version.projectId,
      versionNumber: version.versionNumber,
      startDate: version.startDate,
      endDate: version.endDate,
      status: version.status,
      description: version.description || "",
    })
    setFormOpen(true)
  }

  const handleDeleteClick = (version: VersionVO) => {
    setSelectedVersion(version)
    setDeleteOpen(true)
  }

  const handleSave = async () => {
    try {
      const payload = {
        productName: formData.productName,
        projectId: Number(formData.projectId),
        versionNumber: formData.versionNumber,
        startDate: formData.startDate,
        endDate: formData.endDate,
        status: formData.status,
        description: formData.description,
      }
      if (isEdit && selectedVersion) {
        await updateVersion(selectedVersion.id, payload)
      } else {
        await createVersion(payload)
      }
      setFormOpen(false)
      fetchVersions()
    } catch (error) {
      console.error("保存版本失败", error)
      alert("保存失败，请稍后重试")
    }
  }

  const handleDelete = async () => {
    try {
      if (selectedVersion) {
        await deleteVersion(selectedVersion.id)
        setDeleteOpen(false)
        fetchVersions()
      }
    } catch (error) {
      console.error("删除版本失败", error)
      alert("删除失败，请稍后重试")
    }
  }

  const handleExport = async () => {
    try {
      await exportVersions({
        projectId: projectFilter === "all" ? undefined : Number(projectFilter),
        status: statusFilter === "all" ? undefined : statusFilter,
        keyword: searchText || undefined,
      })
    } catch (error) {
      console.error("导出版本失败", error)
      alert("导出失败，请稍后重试")
    }
  }

  return (
    <AdminLayout>
      <div className="p-6">
        <Breadcrumb className="mb-4">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/projects">项目管理</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>版本</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">关联项目</span>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">状态</span>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部</SelectItem>
                  <SelectItem value="规划中">规划中</SelectItem>
                  <SelectItem value="进行中">进行中</SelectItem>
                  <SelectItem value="已发布">已发布</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="搜索产品名/版本号"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-48"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchText("")
                setStatusFilter("all")
                setProjectFilter("all")
              }}
            >
              <RotateCcw className="size-4 mr-1" />
              重置
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700" onClick={fetchVersions}>
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

        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[100px]">版本号</TableHead>
                <TableHead className="w-[150px]">产品名</TableHead>
                <TableHead className="w-[120px]">关联项目</TableHead>
                <TableHead className="w-[110px]">开始时间</TableHead>
                <TableHead className="w-[110px]">结束时间</TableHead>
                <TableHead className="w-[70px]">迭代数</TableHead>
                <TableHead className="w-[70px]">需求数</TableHead>
                <TableHead className="w-[80px]">状态</TableHead>
                <TableHead className="w-[120px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedVersions.map((version) => {
                const project = projects.find((p) => p.id === version.projectId)
                const iterationCount = iterationCounts[version.id] || 0
                const reqCount = statsMap[version.id] || { total: 0 }
                const status = statusConfig[version.status] || statusConfig["规划中"]
                return (
                  <TableRow key={version.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Link
                        href={`/projects/versions/${version.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {version.versionNumber}
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">{version.productName}</TableCell>
                    <TableCell>
                      {project ? (
                        <Link
                          href={`/projects/${project.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {project.code}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{version.startDate}</TableCell>
                    <TableCell>{version.endDate}</TableCell>
                    <TableCell>{iterations.length}</TableCell>
                    <TableCell>
                      <Link
                        href={`/requirements?type=AR&version=${version.id}`}
                        className="text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="size-3.5" />
                        {reqCount.total}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={status.color}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-blue-600 hover:text-blue-700"
                          onClick={() => handleEdit(version)}
                        >
                          <Pencil className="size-3.5 mr-1" />
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(version)}
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
          <div className="text-gray-500">共 {totalCount} 条</div>
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "编辑版本" : "新增版本"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "修改版本信息" : "填写版本基本信息"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>版本号 <span className="text-red-500">*</span></Label>
              <Input
                value={formData.versionNumber}
                onChange={(e) => setFormData({ ...formData, versionNumber: e.target.value })}
                placeholder="如：V1.0.0"
              />
            </div>
            <div className="space-y-2">
              <Label>产品名 <span className="text-red-500">*</span></Label>
              <Input
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="请输入产品名"
              />
            </div>
            <div className="space-y-2">
              <Label>关联项目 <span className="text-red-500">*</span></Label>
              <Select
                value={formData.projectId}
                onValueChange={(v) => setFormData({ ...formData, projectId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="请选择项目" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} ({p.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="规划中">规划中</SelectItem>
                  <SelectItem value="进行中">进行中</SelectItem>
                  <SelectItem value="已发布">已发布</SelectItem>
                </SelectContent>
              </Select>
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
              <Label>描述</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入版本描述"
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
              确定要删除版本"{selectedVersion?.versionNumber}"吗？此操作不可撤销。
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
