"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Search, RotateCcw, Plus, ChevronDown, Filter, ChevronLeft, ChevronRight, Download, Loader2, AlertCircle, LayoutList, Columns3 } from "lucide-react"
import { KanbanBoard } from "@/components/ui/kanban-board"
import { KanbanCard } from "@/components/ui/kanban-card"
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
import { Alert, AlertDescription } from "@/components/ui/alert"
import { listRequirements, deleteRequirement, createRequirement, exportRequirements } from "@/lib/api/requirements"
import type { RequirementVO } from "@/lib/api/requirements"

function RequirementsContent() {
  const searchParams = useSearchParams()
  const typeFromUrl = searchParams.get("type") as string | null

  const [requirements, setRequirements] = React.useState<RequirementVO[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [typeFilter, setTypeFilter] = React.useState<string>(typeFromUrl || "all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [searchCode, setSearchCode] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize, setPageSize] = React.useState(10)
  const [total, setTotal] = React.useState(0)
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)
  const [viewMode, setViewMode] = React.useState<"table" | "kanban">("table")

  const fetchRequirements = React.useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const params: Record<string, string | number | undefined> = { page: currentPage, pageSize }
      if (typeFilter !== "all") params.type = typeFilter
      if (statusFilter !== "all") params.status = statusFilter
      if (searchCode.trim()) params.keyword = searchCode.trim()
      const result = await listRequirements(params)
      setRequirements(result.list)
      setTotal(result.total)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "加载失败")
    } finally {
      setLoading(false)
    }
  }, [currentPage, pageSize, typeFilter, statusFilter, searchCode])

  React.useEffect(() => {
    fetchRequirements()
  }, [fetchRequirements])

  React.useEffect(() => {
    if (typeFromUrl) setTypeFilter(typeFromUrl)
  }, [typeFromUrl])

  const handleReset = () => {
    setTypeFilter(typeFromUrl || "all")
    setStatusFilter("all")
    setSearchCode("")
    setCurrentPage(1)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteRequirement(Number(id))
      fetchRequirements()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "删除失败")
    }
  }

  const handleCreate = async (data: Record<string, unknown>) => {
    try {
      const parentId = data.parentId ? Number(data.parentId) : undefined
      await createRequirement({
        name: data.name as string,
        type: data.type as string,
        customer: data.customer as string,
        project: data.project as string | undefined,
        expectedDate: data.expectedDate as string,
        status: data.status as string | undefined,
        priority: data.priority as string | undefined,
        description: data.description as string | undefined,
        parentId,
      })
      setCreateDialogOpen(false)
      fetchRequirements()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "创建失败")
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params: Record<string, string | undefined> = {}
      if (typeFilter !== "all") params.type = typeFilter
      if (statusFilter !== "all") params.status = statusFilter
      if (searchCode.trim()) params.keyword = searchCode.trim()
      await exportRequirements(params)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "导出失败")
    } finally {
      setExporting(false)
    }
  }

  const totalPages = Math.ceil(total / pageSize)

  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else if (currentPage <= 4) {
      pages.push(1, 2, 3, 4, 5, "...", totalPages)
    } else if (currentPage >= totalPages - 3) {
      pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
    }
    return pages
  }

  const pageTitle = typeFromUrl ? `${typeFromUrl}需求列表` : "全部需求"
  const breadcrumbTitle = typeFromUrl ? `${typeFromUrl}需求` : "概览"

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/workspace">工作台</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem><BreadcrumbLink href="/requirements">需求管理</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem><BreadcrumbPage>{breadcrumbTitle}</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border">
          {!typeFromUrl && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 whitespace-nowrap">需求类型</span>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setCurrentPage(1); }}>
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
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setCurrentPage(1); }}>
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
              onKeyDown={(e) => { if (e.key === 'Enter') { setCurrentPage(1); fetchRequirements(); } }}
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Filter className="size-4" />展开<ChevronDown className="size-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} className="gap-1">
              <RotateCcw className="size-4" />重置
            </Button>
            <Button size="sm" className="gap-1 bg-blue-600 hover:bg-blue-700" onClick={() => { setCurrentPage(1); fetchRequirements(); }}>
              <Search className="size-4" />查询
            </Button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center border rounded-md overflow-hidden">
              <button onClick={() => setViewMode("table")}
                className={`p-1.5 ${viewMode === "table" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
                <LayoutList className="size-4" />
              </button>
              <button onClick={() => setViewMode("kanban")}
                className={`p-1.5 ${viewMode === "kanban" ? "bg-blue-50 text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
                <Columns3 className="size-4" />
              </button>
            </div>
            <Button variant="outline" className="gap-1" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              导出
            </Button>
            <Button className="gap-1 bg-blue-600 hover:bg-blue-700" onClick={() => setCreateDialogOpen(true)}>
              <Plus className="size-4" />新增
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : viewMode === "kanban" ? (
          <KanbanBoard
            columns={[
              { id: "analyze", title: "待分析", color: "bg-gray-400", count: requirements.filter(r => r.status === "待分析").length,
                items: requirements.filter(r => r.status === "待分析").map(r => (
                  <KanbanCard key={r.id} id={r.id} code={r.code} name={r.name} priority={r.priority} deadline={r.expectedDate} />
                )) },
              { id: "progress", title: "进行中", color: "bg-blue-400", count: requirements.filter(r => r.status === "进行中").length,
                items: requirements.filter(r => r.status === "进行中").map(r => (
                  <KanbanCard key={r.id} id={r.id} code={r.code} name={r.name} priority={r.priority} deadline={r.expectedDate} />
                )) },
              { id: "done", title: "已完成", color: "bg-green-400", count: requirements.filter(r => r.status === "已完成").length,
                items: requirements.filter(r => r.status === "已完成").map(r => (
                  <KanbanCard key={r.id} id={r.id} code={r.code} name={r.name} priority={r.priority} deadline={r.expectedDate} />
                )) },
              { id: "closed", title: "已关闭", color: "bg-gray-400", count: requirements.filter(r => r.status === "已关闭").length,
                items: requirements.filter(r => r.status === "已关闭").map(r => (
                  <KanbanCard key={r.id} id={r.id} code={r.code} name={r.name} priority={r.priority} deadline={r.expectedDate} />
                )) },
            ]}
          />
        ) : (
          <>
            <RequirementsTable
              requirements={requirements}
              onDelete={handleDelete}
              filterType={typeFromUrl || undefined}
              onUpdate={() => fetchRequirements()}
            />

            <div className="flex items-center justify-between bg-white px-6 py-4 rounded-lg border">
              <div className="text-sm text-gray-600">
                共 <span className="font-medium text-gray-900">{total}</span> 条记录
              </div>

              <div className="flex items-center gap-8">
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

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="h-9 px-4 gap-1">
                    <ChevronLeft className="size-4" />上一页
                  </Button>

                  {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                      {page === "..." ? (
                        <span className="px-3 text-gray-400">...</span>
                      ) : (
                        <Button variant={currentPage === page ? "default" : "outline"} size="sm"
                          onClick={() => setCurrentPage(page as number)}
                          className={`h-9 w-10 p-0 ${currentPage === page ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}`}>
                          {page}
                        </Button>
                      )}
                    </React.Fragment>
                  ))}

                  <Button variant="outline" size="sm"
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || totalPages === 0} className="h-9 px-4 gap-1">
                    下一页<ChevronRight className="size-4" />
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 whitespace-nowrap">跳转至</span>
                  <Input type="number" min={1} max={totalPages || 1} value={currentPage}
                    onChange={(e) => { const p = parseInt(e.target.value); if (p >= 1 && p <= totalPages) setCurrentPage(p); }}
                    className="w-20 h-9 text-center" />
                  <span className="text-sm text-gray-600 whitespace-nowrap">页</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

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

function RequirementsLoading() {
  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <div className="h-10 w-48 bg-muted rounded animate-pulse" />
        <div className="h-32 w-full bg-muted rounded animate-pulse" />
        <div className="h-96 w-full bg-muted rounded animate-pulse" />
      </div>
    </AdminLayout>
  )
}

export default function RequirementsPage() {
  return (
    <Suspense fallback={<RequirementsLoading />}>
      <RequirementsContent />
    </Suspense>
  )
}
