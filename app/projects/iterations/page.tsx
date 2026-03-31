"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Search, RotateCcw, Pencil, Trash2, Download, Users, FileText, ListChecks } from "lucide-react"
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
import {
  getAllIterations,
  getAllProjects,
  getAllVersions,
  getProjectById,
  getVersionById,
  getVersionsByProjectId,
  getProjectMembers,
  getIterationRequirementCount,
  getARDetailsByIterationId,
  mockARDetails,
} from "@/lib/mock-data"
import type { Iteration, ProjectMember, ARRequirementDetail } from "@/lib/types"

const statusConfig: Record<string, { label: string; color: string }> = {
  "进行中": { label: "进行中", color: "bg-blue-100 text-blue-700" },
  "已完成": { label: "已完成", color: "bg-green-100 text-green-700" },
  "规划中": { label: "规划中", color: "bg-gray-100 text-gray-700" },
}

const roleColors: Record<string, string> = {
  "负责人": "bg-red-100 text-red-700",
  "项目经理": "bg-blue-100 text-blue-700",
  "前端开发": "bg-green-100 text-green-700",
  "后端开发": "bg-purple-100 text-purple-700",
  "测试工程师": "bg-orange-100 text-orange-700",
  "产品经理": "bg-cyan-100 text-cyan-700",
}

export default function IterationsPage() {
  const [iterations, setIterations] = React.useState<Iteration[]>([])
  const [searchText, setSearchText] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState("all")
  const [projectFilter, setProjectFilter] = React.useState("all")
  const [formOpen, setFormOpen] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [membersOpen, setMembersOpen] = React.useState(false)
  const [requirementsOpen, setRequirementsOpen] = React.useState(false)
  const [selectedIteration, setSelectedIteration] = React.useState<Iteration | null>(null)
  const [selectedMembers, setSelectedMembers] = React.useState<ProjectMember[]>([])
  const [selectedProjectName, setSelectedProjectName] = React.useState("")
  const [iterationArs, setIterationArs] = React.useState<ARRequirementDetail[]>([])
  const [allArs, setAllArs] = React.useState<ARRequirementDetail[]>([])
  const [selectedArIds, setSelectedArIds] = React.useState<Set<string>>(new Set())
  const [isEdit, setIsEdit] = React.useState(false)
  const projects = getAllProjects()
  const allVersions = getAllVersions()

  // 分页
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)

  // 表单数据
  const [formData, setFormData] = React.useState({
    name: "",
    projectId: "",
    productName: "",
    versionId: "",
    startDate: "",
    endDate: "",
    status: "规划中" as Iteration["status"],
    description: "",
  })

  // 根据选中的项目筛选版本
  const filteredVersions = formData.projectId
    ? getVersionsByProjectId(formData.projectId)
    : allVersions

  React.useEffect(() => {
    setIterations(getAllIterations())
    setAllArs(mockARDetails)
  }, [])

  // 筛选
  const filteredIterations = iterations.filter((i) => {
    const matchSearch = i.name.toLowerCase().includes(searchText.toLowerCase())
    const matchStatus = statusFilter === "all" || i.status === statusFilter
    const matchProject = projectFilter === "all" || i.projectId === projectFilter
    return matchSearch && matchStatus && matchProject
  })

  // 分页
  const totalCount = filteredIterations.length
  const totalPages = Math.ceil(totalCount / pageSize)
  const paginatedIterations = filteredIterations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  const handleAdd = () => {
    setIsEdit(false)
    setFormData({
      name: "",
      projectId: "",
      productName: "",
      versionId: "",
      startDate: "",
      endDate: "",
      status: "规划中",
      description: "",
    })
    setFormOpen(true)
  }

  const handleEdit = (iteration: Iteration) => {
    setIsEdit(true)
    setSelectedIteration(iteration)
    setFormData({
      name: iteration.name,
      projectId: iteration.projectId,
      productName: iteration.productName,
      versionId: iteration.versionId,
      startDate: iteration.startDate,
      endDate: iteration.endDate,
      status: iteration.status,
      description: iteration.description || "",
    })
    setFormOpen(true)
  }

  const handleDeleteClick = (iteration: Iteration) => {
    setSelectedIteration(iteration)
    setDeleteOpen(true)
  }

  const handleMembersClick = (iteration: Iteration) => {
    const project = getProjectById(iteration.projectId)
    setSelectedIteration(iteration)
    setSelectedProjectName(project?.name || "")
    setSelectedMembers(getProjectMembers(iteration.projectId))
    setMembersOpen(true)
  }

  const handleRequirementsClick = (iteration: Iteration) => {
    setSelectedIteration(iteration)
    const ars = getARDetailsByIterationId(iteration.id)
    setIterationArs(ars)
    setSelectedArIds(new Set(ars.map(ar => ar.id)))
    setRequirementsOpen(true)
  }

  const handleArToggle = (arId: string) => {
    const newSelected = new Set(selectedArIds)
    if (newSelected.has(arId)) {
      newSelected.delete(arId)
    } else {
      newSelected.add(arId)
    }
    setSelectedArIds(newSelected)
  }

  const handleSaveRequirements = () => {
    console.log("保存迭代需求关联:", selectedIteration?.id, Array.from(selectedArIds))
    setRequirementsOpen(false)
  }

  const handleSave = () => {
    console.log("保存迭代:", formData)
    setFormOpen(false)
  }

  const handleDelete = () => {
    console.log("删除迭代:", selectedIteration?.id)
    setDeleteOpen(false)
  }

  const handleExport = () => {
    const headers = ["迭代名称", "所属项目", "所属产品", "所属版本", "开始时间", "结束时间", "人员数", "需求数", "状态"]
    const rows = filteredIterations.map((i) => {
      const project = getProjectById(i.projectId)
      const version = getVersionById(i.versionId)
      const members = getProjectMembers(i.projectId)
      const reqCount = getIterationRequirementCount(i.id)
      return [
        i.name,
        project?.code || "-",
        i.productName,
        version?.versionNumber || "-",
        i.startDate,
        i.endDate,
        members.length.toString(),
        reqCount.total.toString(),
        i.status,
      ]
    })
    const csvContent =
      "\uFEFF" + headers.join(",") + "\n" + rows.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `迭代列表_${new Date().toISOString().split("T")[0]}.csv`
    link.click()
    URL.revokeObjectURL(url)
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
              <BreadcrumbPage>迭代</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">所属项目</span>
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
                  <SelectItem value="已完成">已完成</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Input
              placeholder="搜索迭代名称"
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

        <div className="bg-white rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[120px]">迭代名称</TableHead>
                <TableHead className="w-[120px]">所属项目</TableHead>
                <TableHead className="w-[100px]">所属产品</TableHead>
                <TableHead className="w-[90px]">所属版本</TableHead>
                <TableHead className="w-[100px]">开始时间</TableHead>
                <TableHead className="w-[100px]">结束时间</TableHead>
                <TableHead className="w-[70px]">人员数</TableHead>
                <TableHead className="w-[70px]">需求数</TableHead>
                <TableHead className="w-[80px]">状态</TableHead>
                <TableHead className="w-[180px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedIterations.map((iteration) => {
                const project = getProjectById(iteration.projectId)
                const version = getVersionById(iteration.versionId)
                const members = getProjectMembers(iteration.projectId)
                const reqCount = getIterationRequirementCount(iteration.id)
                const status = statusConfig[iteration.status] || statusConfig["规划中"]
                return (
                  <TableRow key={iteration.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Link
                        href={`/projects/iterations/${iteration.id}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {iteration.name}
                      </Link>
                    </TableCell>
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
                    <TableCell>{iteration.productName}</TableCell>
                    <TableCell>
                      {version ? (
                        <Link
                          href={`/projects/versions/${version.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {version.versionNumber}
                        </Link>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>{iteration.startDate}</TableCell>
                    <TableCell>{iteration.endDate}</TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-blue-600 hover:text-blue-700 gap-1"
                        onClick={() => handleMembersClick(iteration)}
                      >
                        <Users className="size-3.5" />
                        {members.length}
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/requirements?type=AR&iteration=${iteration.id}`}
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
                          className="h-7 px-2 text-green-600 hover:text-green-700"
                          onClick={() => handleRequirementsClick(iteration)}
                        >
                          <ListChecks className="size-3.5 mr-1" />
                          需求
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-blue-600 hover:text-blue-700"
                          onClick={() => handleEdit(iteration)}
                        >
                          <Pencil className="size-3.5 mr-1" />
                          编辑
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteClick(iteration)}
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

      {/* 人员弹窗 */}
      <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>项目成员 - {selectedProjectName}</DialogTitle>
            <DialogDescription>
              共 {selectedMembers.length} 名成员
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-96 overflow-y-auto">
            {selectedMembers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无成员</div>
            ) : (
              <div className="space-y-3">
                {selectedMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                        {member.name.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        {member.email && (
                          <div className="text-sm text-gray-500">{member.email}</div>
                        )}
                      </div>
                    </div>
                    <Badge className={roleColors[member.role] || "bg-gray-100 text-gray-700"}>
                      {member.role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMembersOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 需求管理弹窗 */}
      <Dialog open={requirementsOpen} onOpenChange={setRequirementsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>管理迭代需求 - {selectedIteration?.name}</DialogTitle>
            <DialogDescription>
              选择要关联到此迭代的AR需求（当前已关联 {selectedArIds.size} 个）
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-96 overflow-y-auto">
            {allArs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无可用需求</div>
            ) : (
              <div className="space-y-2">
                {allArs.map((ar) => (
                  <div
                    key={ar.id}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleArToggle(ar.id)}
                  >
                    <Checkbox
                      checked={selectedArIds.has(ar.id)}
                      onCheckedChange={() => handleArToggle(ar.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-blue-600">{ar.code}</span>
                        <span>{ar.name}</span>
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
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequirementsOpen(false)}>
              取消
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSaveRequirements}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增/编辑对话框 */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{isEdit ? "编辑迭代" : "新增迭代"}</DialogTitle>
            <DialogDescription>
              {isEdit ? "修改迭代信息" : "填写迭代基本信息"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>迭代名称 <span className="text-red-500">*</span></Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="如：Sprint 1"
              />
            </div>
            <div className="space-y-2">
              <Label>所属项目 <span className="text-red-500">*</span></Label>
              <Select
                value={formData.projectId}
                onValueChange={(v) => {
                  setFormData({ ...formData, projectId: v, versionId: "" })
                }}
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
              <Label>产品名 <span className="text-red-500">*</span></Label>
              <Input
                value={formData.productName}
                onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                placeholder="请输入产品名"
              />
            </div>
            <div className="space-y-2">
              <Label>所属版本 <span className="text-red-500">*</span></Label>
              <Select
                value={formData.versionId}
                onValueChange={(v) => setFormData({ ...formData, versionId: v })}
                disabled={!formData.projectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.projectId ? "请选择版本" : "请先选择项目"} />
                </SelectTrigger>
                <SelectContent>
                  {filteredVersions.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.versionNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>状态</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as Iteration["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="规划中">规划中</SelectItem>
                  <SelectItem value="进行中">进行中</SelectItem>
                  <SelectItem value="已完成">已完成</SelectItem>
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
                placeholder="请输入迭代描述"
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
              确定要删除迭代"{selectedIteration?.name}"吗？此操作不可撤销。
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
