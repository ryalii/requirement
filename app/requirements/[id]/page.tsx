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
  Building2,
  Flag,
  Clock,
  GitBranch,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  ChevronRight,
  ExternalLink,
  Target,
  CheckSquare,
  AlertCircle,
} from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { RequirementTree } from "@/components/requirement-tree"
import { TestCasesTable } from "@/components/test-cases-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

const typeConfig: Record<RequirementType, { 
  color: string
  bgColor: string
  borderColor: string
  label: string
  description: string
}> = {
  IR: { 
    color: "text-blue-700", 
    bgColor: "bg-blue-50", 
    borderColor: "border-blue-200",
    label: "原始需求 (IR)",
    description: "来自客户的原始需求，需要分解为系统需求"
  },
  SR: { 
    color: "text-emerald-700", 
    bgColor: "bg-emerald-50", 
    borderColor: "border-emerald-200",
    label: "系统需求 (SR)",
    description: "从原始需求分解而来，需要进一步分解为软件需求"
  },
  AR: { 
    color: "text-amber-700", 
    bgColor: "bg-amber-50", 
    borderColor: "border-amber-200",
    label: "软件需求 (AR)",
    description: "最终的软件实现需求，需要关联测试用例验证"
  },
}

const statusConfig: Record<string, { bg: string; text: string }> = {
  "已完成": { bg: "bg-green-100", text: "text-green-700" },
  "进行中": { bg: "bg-blue-100", text: "text-blue-700" },
  "待分析": { bg: "bg-yellow-100", text: "text-yellow-700" },
  "已关闭": { bg: "bg-gray-100", text: "text-gray-600" },
}

const priorityConfig: Record<string, { bg: string; text: string }> = {
  "高": { bg: "bg-red-100", text: "text-red-700" },
  "中": { bg: "bg-yellow-100", text: "text-yellow-700" },
  "低": { bg: "bg-gray-100", text: "text-gray-700" },
}

// 需求链路追溯组件
function RequirementTraceCard({ 
  requirement, 
  relation,
  icon: Icon,
}: { 
  requirement: Requirement
  relation: "parent" | "child"
  icon: React.ElementType
}) {
  const config = typeConfig[requirement.type]
  const status = statusConfig[requirement.status] || statusConfig["待分析"]
  
  return (
    <Link
      href={`/requirements/${requirement.id}`}
      className="block group"
    >
      <div className={`
        flex items-center gap-4 p-4 rounded-xl border-2 transition-all
        hover:shadow-md hover:border-blue-300 hover:bg-blue-50/30
        ${config.borderColor} ${config.bgColor}
      `}>
        <div className={`
          p-2.5 rounded-lg ${config.bgColor} border ${config.borderColor}
        `}>
          <Icon className={`size-5 ${config.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Badge 
              variant="outline" 
              className={`text-xs font-semibold ${config.bgColor} ${config.color} ${config.borderColor}`}
            >
              {requirement.type}
            </Badge>
            <span className="text-xs text-gray-500">
              {relation === "parent" ? "上级需求" : "下级需求"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-semibold ${config.color} group-hover:underline`}>
              {requirement.code}
            </span>
            <span className="text-gray-600 truncate">{requirement.name}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
            <span>{requirement.customer}</span>
            <span>|</span>
            <span>期望: {requirement.expectedDate}</span>
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-2">
          <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${status.bg} ${status.text}`}>
            {requirement.status}
          </span>
          <ExternalLink className="size-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
        </div>
      </div>
    </Link>
  )
}

// 子需求列表项组件
function ChildRequirementItem({ requirement }: { requirement: Requirement }) {
  const config = typeConfig[requirement.type]
  const status = statusConfig[requirement.status] || statusConfig["待分析"]
  
  return (
    <Link
      href={`/requirements/${requirement.id}`}
      className="block group"
    >
      <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 hover:border-gray-300 transition-all">
        <Badge 
          variant="outline" 
          className={`text-xs font-semibold ${config.bgColor} ${config.color} ${config.borderColor}`}
        >
          {requirement.type}
        </Badge>
        <span className="font-medium text-blue-600 group-hover:underline">
          {requirement.code}
        </span>
        <span className="text-gray-700 flex-1 truncate">{requirement.name}</span>
        <span className="text-xs text-gray-500">{requirement.customer}</span>
        <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${status.bg} ${status.text}`}>
          {requirement.status}
        </span>
        <ChevronRight className="size-4 text-gray-400 group-hover:text-blue-500" />
      </div>
    </Link>
  )
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
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
            <FileText className="size-10 text-gray-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-700">需求不存在</h2>
          <p className="text-gray-500">找不到ID为 {id} 的需求</p>
          <Button onClick={() => router.push("/requirements")}>
            返回需求列表
          </Button>
        </div>
      </AdminLayout>
    )
  }

  const config = typeConfig[requirement.type]
  const status = statusConfig[requirement.status] || statusConfig["待分析"]
  const priority = priorityConfig[requirement.priority] || priorityConfig["中"]

  // 根据需求类型获取不同的关联数据和渲染内容
  const renderRelatedContent = () => {
    switch (requirement.type) {
      case "IR": {
        // IR显示完整的树形结构（IR -> SR -> AR）
        const treeData = buildIRTree(requirement.id)
        const childSRs = getSRsByIRId(requirement.id)
        
        return (
          <div className="space-y-6">
            {/* 需求分解说明 */}
            <Card className="border-blue-200 bg-blue-50/30">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Layers className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800">原始需求分解</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      此IR需求已分解为 <strong>{childSRs.length}</strong> 个系统需求(SR)，
                      共计 <strong>{childSRs.reduce((acc, sr) => acc + getARsBySRId(sr.id).length, 0)}</strong> 个软件需求(AR)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 树形结构展示 */}
            {treeData && (
              <RequirementTree 
                data={treeData} 
                currentId={requirement.id}
                title="需求分解结构 (IR → SR → AR)"
              />
            )}
          </div>
        )
      }
      
      case "SR": {
        // SR显示上级IR和下级AR列表
        const parentIR = getIRBySRId(requirement.id)
        const childARs = getARsBySRId(requirement.id)

        // 计算AR状态统计
        const arStats = {
          total: childARs.length,
          completed: childARs.filter(ar => ar.status === "已完成").length,
          inProgress: childARs.filter(ar => ar.status === "进行中").length,
          pending: childARs.filter(ar => ar.status === "待分析").length,
        }

        return (
          <div className="space-y-6">
            {/* 需求链路追溯 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <GitBranch className="size-5 text-emerald-600" />
                  需求链路追溯
                </CardTitle>
                <CardDescription>
                  展示当前SR需求在需求层级中的位置关系
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 上级IR需求 */}
                {parentIR ? (
                  <div>
                    <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
                      <ArrowUpRight className="size-4 text-blue-600" />
                      <span className="font-medium">上级需求 (IR)</span>
                    </div>
                    <RequirementTraceCard 
                      requirement={parentIR} 
                      relation="parent"
                      icon={Target}
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-gray-50 text-gray-500">
                    <AlertCircle className="size-4" />
                    <span>未关联上级IR需求</span>
                  </div>
                )}

                {/* 当前需求指示 */}
                <div className="flex items-center gap-3 py-2">
                  <div className="flex-1 h-px bg-gray-200" />
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 ${config.borderColor} ${config.bgColor}`}>
                    <span className={`text-sm font-semibold ${config.color}`}>
                      当前: {requirement.code}
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
              </CardContent>
            </Card>

            {/* 子需求列表 (AR) */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      <ArrowDownRight className="size-5 text-amber-600" />
                      下级需求列表 (AR)
                      <Badge variant="secondary" className="ml-1">
                        {childARs.length}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="mt-1">
                      从当前SR分解的软件需求
                    </CardDescription>
                  </div>
                  <Button size="sm" className="gap-1.5 bg-amber-600 hover:bg-amber-700">
                    <span>新建AR</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* AR统计 */}
                {childARs.length > 0 && (
                  <div className="grid grid-cols-4 gap-3">
                    <div className="text-center p-3 rounded-lg bg-gray-50">
                      <div className="text-xl font-bold text-gray-700">{arStats.total}</div>
                      <div className="text-xs text-gray-500">AR总数</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-green-50">
                      <div className="text-xl font-bold text-green-600">{arStats.completed}</div>
                      <div className="text-xs text-green-600">已完成</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-blue-50">
                      <div className="text-xl font-bold text-blue-600">{arStats.inProgress}</div>
                      <div className="text-xs text-blue-600">进行中</div>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-yellow-50">
                      <div className="text-xl font-bold text-yellow-600">{arStats.pending}</div>
                      <div className="text-xs text-yellow-600">待分析</div>
                    </div>
                  </div>
                )}

                {/* AR列表 */}
                {childARs.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <FileText className="size-8 text-gray-400" />
                    </div>
                    <p>暂无下级AR需求</p>
                    <p className="text-sm mt-1">点击上方按钮创建新的软件需求</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {childARs.map((ar) => (
                      <ChildRequirementItem key={ar.id} requirement={ar} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )
      }
      
      case "AR": {
        // AR显示完整链路追溯和关联测试用例
        const parentSR = getSRByARId(requirement.id)
        const parentIR = parentSR ? getIRBySRId(parentSR.id) : undefined
        const testCases = getTestCasesByARId(requirement.id)

        return (
          <div className="space-y-6">
            {/* 完整需求链路追溯 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <GitBranch className="size-5 text-amber-600" />
                  需求链路追溯
                </CardTitle>
                <CardDescription>
                  展示从原始需求(IR)到软件需求(AR)的完整追溯链路
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 完整链路展示 */}
                <div className="flex items-center gap-2 p-4 rounded-xl bg-gradient-to-r from-blue-50 via-emerald-50 to-amber-50 border">
                  {parentIR ? (
                    <>
                      <Link 
                        href={`/requirements/${parentIR.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 transition-colors"
                      >
                        <span className="text-xs opacity-60">IR</span>
                        <span>{parentIR.code}</span>
                      </Link>
                      <ChevronRight className="size-4 text-gray-400" />
                    </>
                  ) : null}
                  {parentSR ? (
                    <>
                      <Link 
                        href={`/requirements/${parentSR.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200 transition-colors"
                      >
                        <span className="text-xs opacity-60">SR</span>
                        <span>{parentSR.code}</span>
                      </Link>
                      <ChevronRight className="size-4 text-gray-400" />
                    </>
                  ) : null}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-200 text-amber-800 text-sm font-semibold border-2 border-amber-400">
                    <span className="text-xs opacity-60">AR</span>
                    <span>{requirement.code}</span>
                    <span className="text-xs ml-1">(当前)</span>
                  </div>
                </div>

                {/* 上级需求详情卡片 */}
                <div className="grid md:grid-cols-2 gap-4">
                  {parentIR && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                        <span className="font-medium">原始需求 (IR)</span>
                      </div>
                      <RequirementTraceCard 
                        requirement={parentIR} 
                        relation="parent"
                        icon={Target}
                      />
                    </div>
                  )}
                  {parentSR && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 text-sm text-gray-600">
                        <span className="font-medium">系统需求 (SR)</span>
                      </div>
                      <RequirementTraceCard 
                        requirement={parentSR} 
                        relation="parent"
                        icon={Layers}
                      />
                    </div>
                  )}
                </div>

                {!parentSR && !parentIR && (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-gray-50 text-gray-500">
                    <AlertCircle className="size-4" />
                    <span>未关联上级需求</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 关联测试用例 */}
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
        <Card className={`border-2 ${config.borderColor}`}>
          <CardHeader className={`${config.bgColor} border-b ${config.borderColor}`}>
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className={`text-sm font-semibold px-3 py-1 ${config.bgColor} ${config.color} ${config.borderColor}`}
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
                <p className="text-sm text-gray-600">
                  {config.description}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${status.bg} ${status.text}`}>
                  {requirement.status}
                </span>
                <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${priority.bg} ${priority.text}`}>
                  优先级: {requirement.priority}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2.5 text-sm p-3 rounded-lg bg-gray-50">
                <FileText className="size-4 text-gray-400" />
                <div>
                  <span className="text-gray-500 block text-xs">类型</span>
                  <span className="text-gray-700 font-medium">{config.label}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-sm p-3 rounded-lg bg-gray-50">
                <Building2 className="size-4 text-gray-400" />
                <div>
                  <span className="text-gray-500 block text-xs">来源客户</span>
                  <span className="text-gray-700 font-medium">{requirement.customer}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-sm p-3 rounded-lg bg-gray-50">
                <Calendar className="size-4 text-gray-400" />
                <div>
                  <span className="text-gray-500 block text-xs">期望解决时间</span>
                  <span className="text-gray-700 font-medium">{requirement.expectedDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-2.5 text-sm p-3 rounded-lg bg-gray-50">
                <Clock className="size-4 text-gray-400" />
                <div>
                  <span className="text-gray-500 block text-xs">创建时间</span>
                  <span className="text-gray-700 font-medium">{requirement.createdAt}</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* 描述 */}
            {requirement.description && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="size-4" />
                  需求描述
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-lg border">
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
