"use client"

import * as React from "react"
import { Search, RotateCcw, Plus, ChevronDown, Filter, ChevronLeft, ChevronRight, Download } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { RequirementsTable } from "@/components/requirements-table"
import { RequirementFormDialog } from "@/components/requirement-form-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getAllRequirements } from "@/lib/mock-data"
import type { Requirement, RequirementType } from "@/lib/types"

export default function RequirementsPage() {
  const [typeFromUrl, setTypeFromUrl] = React.useState<RequirementType | null>(null)

  const [requirements, setRequirements] = React.useState<Requirement[]>([])
  const [filteredRequirements, setFilteredRequirements] = React.useState<Requirement[]>([])
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [searchCode, setSearchCode] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)

  React.useEffect(() => {
    // 客户端读取 URL query，避免静态导出时 useSearchParams 的 Suspense 报错
    const params = new URLSearchParams(window.location.search)
    const type = params.get("type") as RequirementType | null
    setTypeFromUrl(type)
    if (type) setTypeFilter(type)
  }, [])

  React.useEffect(() => {
    const data = getAllRequirements()
    setRequirements(data)
    setFilteredRequirements(data)
  }, [])

  React.useEffect(() => {
    if (typeFromUrl) {
      setTypeFilter(typeFromUrl)
    } else {
      setTypeFilter("all")
    }
  }, [typeFromUrl])

  React.useEffect(() => {
    let filtered = requirements

    if (typeFilter !== "all") {
      filtered = filtered.filter((r) => r.type === typeFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((r) => r.status === statusFilter)
    }

    if (searchCode.trim()) {
      filtered = filtered.filter(
        (r) =>
          r.code.toLowerCase().includes(searchCode.toLowerCase()) ||
          r.name.toLowerCase().includes(searchCode.toLowerCase())
      )
    }

    setFilteredRequirements(filtered)
    setCurrentPage(1)
  }, [typeFilter, statusFilter, searchCode, requirements])

  const handleReset = () => {
    setTypeFilter(typeFromUrl || "all")
    setStatusFilter("all")
    setSearchCode("")
  }

  const handleDelete = (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id))
  }

  const handleCreate = (data: Partial<Requirement>) => {
    const newRequirement = data as Requirement
    setRequirements((prev) => [newRequirement, ...prev])
    alert(`成功创建需求: ${newRequirement.code}`)
  }

  // 导出Excel功能
  const handleExport = () => {
    // 构建CSV数据
    const headers = ["需求编号", "需求名称", "需求类型", "项目", "来源客户", "优先级", "状态", "期望解决时间", "创建时间"]
    const rows = filteredRequirements.map(req => [
      req.code,
      req.name,
      req.type,
      req.project || "",
      req.customer,
      req.priority,
      req.status,
      req.expectedDate,
      req.createdAt,
    ])

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n")

    // 添加BOM以支持中文
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `需求列表_${typeFromUrl || "全部"}_${new Date().toISOString().split("T")[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // 分页计算
  const totalPages = Math.ceil(filteredRequirements.length / pageSize)
  const paginatedRequirements = filteredRequirements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // 生成页码数组
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages)
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }
    return pages
  }

  const pageTitle = typeFromUrl 
    ? `${typeFromUrl}需求列表` 
    : "全部需求"

  const breadcrumbTitle = typeFromUrl
    ? `${typeFromUrl}需求`
    : "概览"

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        {/* 面包屑导航 */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/workspace">工作台</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/requirements">需求管理</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{breadcrumbTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 筛选区域 */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border">
          {/* 只有在概览页面显示类型筛选 */}
          {!typeFromUrl && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">需求类型</span>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="请选择需求类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部类型</SelectItem>
                  <SelectItem value="LMT">LMT - 市场需求</SelectItem>
                  <SelectItem value="IR">IR - 原始需求</SelectItem>
                  <SelectItem value="SR">SR - 系统需求</SelectItem>
                  <SelectItem value="AR">AR - 软件需求</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">状态</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="请选择状态" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部状态</SelectItem>
                <SelectItem value="待分析">待分析</SelectItem>
                <SelectItem value="进行中">进行中</SelectItem>
                <SelectItem value="已完成">已完成</SelectItem>
                <SelectItem value="已关闭">已关闭</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">编号/名称</span>
            <Input
              placeholder="请输入需求编号或名称"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              className="w-52"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="size-4" />
              展开
              <ChevronDown className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="gap-1"
            >
              <RotateCcw className="size-4" />
              重置
            </Button>
            <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700">
              <Search className="size-4" />
              查询
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button 
              variant="outline" 
              className="gap-1"
              onClick={handleExport}
            >
              <Download className="size-4" />
              导出 Excel
            </Button>
            <Button 
              className="gap-1 bg-blue-600 hover:bg-blue-700"
              onClick={() => setCreateDialogOpen(true)}
            >
              <Plus className="size-4" />
              新增
            </Button>
          </div>
        </div>

        {/* 需求表格 */}
        <RequirementsTable
          requirements={paginatedRequirements}
          onDelete={handleDelete}
          filterType={typeFromUrl || undefined}
        />

        {/* 分页 - 中文版本，更宽松的布局 */}
        <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg border">
          <div className="text-sm text-gray-600">
            共 <span className="font-medium text-gray-900">{filteredRequirements.length}</span> 条记录
          </div>
          
          <div className="flex items-center gap-8">
            {/* 每页条数选择 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 whitespace-nowrap">每页显示</span>
              <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 条</SelectItem>
                  <SelectItem value="20">20 条</SelectItem>
                  <SelectItem value="50">50 条</SelectItem>
                  <SelectItem value="100">100 条</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 分页按钮 */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-9 px-4 gap-1"
              >
                <ChevronLeft className="size-4" />
                上一页
              </Button>
              
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === "..." ? (
                    <span className="px-3 text-gray-400">...</span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page as number)}
                      className={`h-9 w-10 p-0 ${
                        currentPage === page 
                          ? "bg-blue-600 hover:bg-blue-700 text-white" 
                          : ""
                      }`}
                    >
                      {page}
                    </Button>
                  )}
                </React.Fragment>
              ))}
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
                className="h-9 px-4 gap-1"
              >
                下一页
                <ChevronRight className="size-4" />
              </Button>
            </div>

            {/* 跳转输入 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 whitespace-nowrap">跳转至</span>
              <Input
                type="number"
                min={1}
                max={totalPages || 1}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value)
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page)
                  }
                }}
                className="w-20 h-9 text-center"
              />
              <span className="text-sm text-gray-600 whitespace-nowrap">页</span>
            </div>
          </div>
        </div>
      </div>

      {/* 新增需求对话框 */}
      <RequirementFormDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        mode="create"
        defaultType={typeFromUrl || undefined}
        onSave={handleCreate}
      />
    </AdminLayout>
  )
}
