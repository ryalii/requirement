"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  Share2,
  FileText,
  Calendar,
  User,
  Building2,
  Flag,
  Clock,
  GitBranch,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { RequirementTree } from "@/components/requirement-tree"
import { TestCasesTable } from "@/components/test-cases-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  getRequirementById,
  buildIRTree,
  getSRsByIRId,
  getARsBySRId,
  getIRBySRId,
  getSRByARId,
  getTestCasesByARId,
} from "@/lib/mock-data"
import type { Requirement, RequirementType } from "@/lib/types"

const typeColors: Record<RequirementType, string> = {
  IR: "bg-blue-100 text-blue-700 border-blue-200",
  SR: "bg-green-100 text-green-700 border-green-200",
  AR: "bg-orange-100 text-orange-700 border-orange-200",
}

const typeLabels: Record<RequirementType, string> = {
  IR: "原始需求 (IR)",
  SR: "系统需求 (SR)",
  AR: "软件需求 (AR)",
}

export default function RequirementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const requirement = getRequirementById(id)

  if (!requirement) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96 gap-4">
          <FileText className="size-16 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-700">需求不存在</h2>
          <p className="text-gray-500">找不到ID为 {id} 的需求</p>
          <Button onClick={() => router.push("/requirements")}>
            返回需求列表
          </Button>
        </div>
      </AdminLayout>
    )
  }

  // 根据需求类型获取不同的关联数据
  const renderRelatedContent = () => {
    switch (requirement.type) {
      case "IR": {
        // IR显示树形结构（IR -> SR -> AR）
        const treeData = buildIRTree(requirement.id)
        if (treeData) {
          return (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <GitBranch className="size-5 text-blue-600" />
                需求分解结构
              </h3>
              <RequirementTree data={treeData} currentId={requirement.id} />
            </div>
          )
        }
        return null
      }
      case "SR": {
        // SR显示上级IR和下级AR
        const parentIR = getIRBySRId(requirement.id)
        const childARs = getARsBySRId(requirement.id)

        return (
          <div className="space-y-6">
            {/* 上级需求 */}
            {parentIR && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowUpRight className="size-4 text-blue-600" />
                    上级需求 (IR)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/requirements/${parentIR.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <Badge variant="outline" className={typeColors[parentIR.type]}>
                      {parentIR.type}
                    </Badge>
                    <span className="font-medium text-blue-600 hover:underline">
                      {parentIR.code}
                    </span>
                    <span className="text-gray-700">{parentIR.name}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {parentIR.status}
                    </span>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* 子需求列表 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ArrowDownRight className="size-4 text-orange-600" />
                  子需求列表 (AR)
                  <Badge variant="secondary" className="ml-2">
                    {childARs.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {childARs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    暂无子需求
                  </div>
                ) : (
                  <div className="space-y-2">
                    {childARs.map((ar) => (
                      <Link
                        key={ar.id}
                        href={`/requirements/${ar.id}`}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                      >
                        <Badge variant="outline" className={typeColors[ar.type]}>
                          {ar.type}
                        </Badge>
                        <span className="font-medium text-blue-600 hover:underline">
                          {ar.code}
                        </span>
                        <span className="text-gray-700 flex-1">{ar.name}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            ar.status === "已完成"
                              ? "bg-green-100 text-green-600"
                              : ar.status === "进行中"
                              ? "bg-blue-100 text-blue-600"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {ar.status}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      }
      case "AR": {
        // AR显示上级SR和关联测试用例
        const parentSR = getSRByARId(requirement.id)
        const testCases = getTestCasesByARId(requirement.id)

        return (
          <div className="space-y-6">
            {/* 上级需求 */}
            {parentSR && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowUpRight className="size-4 text-green-600" />
                    上级需求 (SR)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`/requirements/${parentSR.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <Badge variant="outline" className={typeColors[parentSR.type]}>
                      {parentSR.type}
                    </Badge>
                    <span className="font-medium text-blue-600 hover:underline">
                      {parentSR.code}
                    </span>
                    <span className="text-gray-700">{parentSR.name}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {parentSR.status}
                    </span>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* 测试用例 */}
            <TestCasesTable testCases={testCases} arCode={requirement.code} />
          </div>
        )
      }
      default:
        return null
    }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
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
              <BreadcrumbLink href="/requirements">需求管理</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>{requirement.code}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.push("/requirements")}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            返回列表
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="size-4" />
              分享
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Pencil className="size-4" />
              编辑
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="size-4" />
              删除
            </Button>
          </div>
        </div>

        {/* 需求详情卡片 */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`text-sm ${typeColors[requirement.type]}`}
                  >
                    {requirement.type}
                  </Badge>
                  <span className="text-xl font-bold text-gray-800">
                    {requirement.code}
                  </span>
                </div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {requirement.name}
                </h1>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    requirement.status === "已完成"
                      ? "bg-green-100 text-green-700"
                      : requirement.status === "进行中"
                      ? "bg-blue-100 text-blue-700"
                      : requirement.status === "待分析"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {requirement.status}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    requirement.priority === "高"
                      ? "bg-red-100 text-red-700"
                      : requirement.priority === "中"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  优先级: {requirement.priority}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="size-4 text-gray-400" />
                <span className="text-gray-500">类型:</span>
                <span className="text-gray-700">{typeLabels[requirement.type]}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="size-4 text-gray-400" />
                <span className="text-gray-500">客户:</span>
                <span className="text-gray-700">{requirement.customer}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-gray-400" />
                <span className="text-gray-500">期望解决:</span>
                <span className="text-gray-700">{requirement.expectedDate}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="size-4 text-gray-400" />
                <span className="text-gray-500">创建时间:</span>
                <span className="text-gray-700">{requirement.createdAt}</span>
              </div>
            </div>

            <Separator />

            {/* 描述 */}
            {requirement.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">需求描述</h3>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg">
                  {requirement.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 关联内容区域 */}
        {renderRelatedContent()}
      </div>
    </AdminLayout>
  )
}
