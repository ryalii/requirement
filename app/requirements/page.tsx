"use client"

import * as React from "react"
import { Search, RotateCcw, Plus, ChevronDown, Filter } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { RequirementsTable } from "@/components/requirements-table"
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination"
import { getAllRequirements } from "@/lib/mock-data"
import type { Requirement, RequirementType } from "@/lib/types"

export default function RequirementsPage() {
  const [requirements, setRequirements] = React.useState<Requirement[]>([])
  const [filteredRequirements, setFilteredRequirements] = React.useState<Requirement[]>([])
  const [typeFilter, setTypeFilter] = React.useState<string>("all")
  const [statusFilter, setStatusFilter] = React.useState<string>("all")
  const [searchCode, setSearchCode] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const pageSize = 10

  React.useEffect(() => {
    const data = getAllRequirements()
    setRequirements(data)
    setFilteredRequirements(data)
  }, [])

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
    setTypeFilter("all")
    setStatusFilter("all")
    setSearchCode("")
  }

  const handleDelete = (id: string) => {
    setRequirements((prev) => prev.filter((r) => r.id !== id))
  }

  // 分页
  const totalPages = Math.ceil(filteredRequirements.length / pageSize)
  const paginatedRequirements = filteredRequirements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        {/* 面包屑导航 */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">首页</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink href="/requirements">需求</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>需求管理</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 筛选区域 */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-lg border">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 whitespace-nowrap">需求类型</span>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="请选择需求类型" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部类型</SelectItem>
                <SelectItem value="IR">IR - 原始需求</SelectItem>
                <SelectItem value="SR">SR - 系统需求</SelectItem>
                <SelectItem value="AR">AR - 软件需求</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
              className="w-48"
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

          <div className="ml-auto">
            <Button className="gap-1 bg-blue-600 hover:bg-blue-700">
              <Plus className="size-4" />
              新增
            </Button>
          </div>
        </div>

        {/* 需求表格 */}
        <RequirementsTable
          requirements={paginatedRequirements}
          onDelete={handleDelete}
        />

        {/* 分页 */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">
            共 {filteredRequirements.length} 条
          </div>
          <div className="flex items-center gap-4">
            <Select defaultValue="10">
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10条/页</SelectItem>
                <SelectItem value="20">20条/页</SelectItem>
                <SelectItem value="50">50条/页</SelectItem>
              </SelectContent>
            </Select>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) setCurrentPage(currentPage - 1)
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => (
                  <PaginationItem key={i + 1}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === i + 1}
                      onClick={(e) => {
                        e.preventDefault()
                        setCurrentPage(i + 1)
                      }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                {totalPages > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        href="#"
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(totalPages)
                        }}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="flex items-center gap-2 text-sm">
              <span>前往</span>
              <Input
                type="number"
                min={1}
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = parseInt(e.target.value)
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page)
                  }
                }}
                className="w-16"
              />
              <span>页</span>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
