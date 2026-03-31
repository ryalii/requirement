"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Repeat, Folder, GitBranch, FileCode, ExternalLink, ChevronRight, ChevronDown } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  getIterationById,
  getProjectById,
  getVersionById,
  getARDetailsByIterationId,
} from "@/lib/mock-data"
import type { Iteration, Project, Version, ARRequirementDetail } from "@/lib/types"

const iterStatusConfig: Record<string, { label: string; color: string }> = {
  "进行中": { label: "进行中", color: "bg-blue-100 text-blue-700" },
  "已完成": { label: "已完成", color: "bg-green-100 text-green-700" },
  "规划中": { label: "规划中", color: "bg-gray-100 text-gray-700" },
}

const arStatusConfig: Record<string, { label: string; color: string }> = {
  "待分析": { label: "待分析", color: "bg-gray-100 text-gray-700" },
  "进行中": { label: "进行中", color: "bg-blue-100 text-blue-700" },
  "已完成": { label: "已完成", color: "bg-green-100 text-green-700" },
  "已关闭": { label: "已关闭", color: "bg-red-100 text-red-700" },
}

// 树节点组件
interface TreeNodeProps {
  title: React.ReactNode
  icon: React.ReactNode
  badge?: React.ReactNode
  children?: React.ReactNode
  defaultOpen?: boolean
  level?: number
}

function TreeNode({ title, icon, badge, children, defaultOpen = false, level = 0 }: TreeNodeProps) {
  const [open, setOpen] = React.useState(defaultOpen)
  const hasChildren = React.Children.count(children) > 0

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${
          level === 0 ? "bg-gray-50" : ""
        }`}
        onClick={() => hasChildren && setOpen(!open)}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown className="size-4 text-gray-500 shrink-0" />
          ) : (
            <ChevronRight className="size-4 text-gray-500 shrink-0" />
          )
        ) : (
          <span className="w-4" />
        )}
        <span className="shrink-0">{icon}</span>
        <span className="flex-1 font-medium text-sm">{title}</span>
        {badge}
      </div>
      {open && hasChildren && <div>{children}</div>}
    </div>
  )
}

// AR需求行组件
function ARRow({ ar }: { ar: ARRequirementDetail }) {
  const status = arStatusConfig[ar.status] || arStatusConfig["待分析"]
  return (
    <div
      className="flex items-center gap-4 py-2 px-3 rounded-lg hover:bg-blue-50 transition-colors text-sm"
      style={{ paddingLeft: "60px" }}
    >
      <FileCode className="size-4 text-purple-600 shrink-0" />
      <Link
        href={`/requirements/${ar.id}`}
        className="text-blue-600 hover:underline font-medium min-w-[120px]"
      >
        {ar.code}
      </Link>
      <span className="flex-1 truncate">{ar.name}</span>
      <span className="text-gray-500 w-20">前端: {ar.frontend}</span>
      <span className="text-gray-500 w-20">后端: {ar.backend}</span>
      <span className="text-gray-500 w-20">测试: {ar.tester}</span>
      <span className="text-gray-500 w-24">用例: {ar.testCaseCount} 个</span>
      <Badge className={status.color}>{status.label}</Badge>
      <Link href={`/requirements/${ar.id}`}>
        <Button variant="ghost" size="sm" className="h-7 text-blue-600">
          <ExternalLink className="size-3.5" />
        </Button>
      </Link>
    </div>
  )
}

export default function IterationDetailPage() {
  const params = useParams()
  const iterationId = params.id as string
  const [iteration, setIteration] = React.useState<Iteration | null>(null)
  const [project, setProject] = React.useState<Project | null>(null)
  const [version, setVersion] = React.useState<Version | null>(null)
  const [ars, setArs] = React.useState<ARRequirementDetail[]>([])

  React.useEffect(() => {
    const iter = getIterationById(iterationId)
    if (iter) {
      setIteration(iter)
      const proj = getProjectById(iter.projectId)
      setProject(proj || null)
      const ver = getVersionById(iter.versionId)
      setVersion(ver || null)
      setArs(getARDetailsByIterationId(iterationId))
    }
  }, [iterationId])

  if (!iteration) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center py-20 text-gray-500">迭代不存在</div>
        </div>
      </AdminLayout>
    )
  }

  const status = iterStatusConfig[iteration.status] || iterStatusConfig["规划中"]

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
              <BreadcrumbLink href="/projects/iterations">迭代</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{iteration.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 返回按钮 */}
        <div className="mb-4">
          <Link href="/projects/iterations">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="size-4" />
              返回迭代列表
            </Button>
          </Link>
        </div>

        {/* 迭代信息卡片 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Repeat className="size-6 text-orange-600" />
                <span>{iteration.name}</span>
                <Badge className={status.color}>{status.label}</Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">所属项目:</span>
                {project ? (
                  <Link
                    href={`/projects/${project.id}`}
                    className="ml-2 text-blue-600 hover:underline font-medium"
                  >
                    {project.name} ({project.code})
                  </Link>
                ) : (
                  <span className="ml-2">-</span>
                )}
              </div>
              <div>
                <span className="text-gray-500">所属产品:</span>
                <span className="ml-2 font-medium">{iteration.productName}</span>
              </div>
              <div>
                <span className="text-gray-500">所属版本:</span>
                {version ? (
                  <Link
                    href={`/projects/versions/${version.id}`}
                    className="ml-2 text-blue-600 hover:underline font-medium"
                  >
                    {version.versionNumber}
                  </Link>
                ) : (
                  <span className="ml-2">-</span>
                )}
              </div>
              <div>
                <span className="text-gray-500">周期:</span>
                <span className="ml-2 font-medium">
                  {iteration.startDate} ~ {iteration.endDate}
                </span>
              </div>
            </div>
            {iteration.description && (
              <div className="mt-4 text-sm text-gray-600">
                <span className="text-gray-500">描述:</span> {iteration.description}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 关联数据树形结构 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">关联数据</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg divide-y">
              {/* 项目 */}
              {project && (
                <TreeNode
                  title={
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {project.name} ({project.code})
                    </Link>
                  }
                  icon={<Folder className="size-4 text-blue-600" />}
                  badge={<span className="text-xs text-gray-500">项目</span>}
                  level={0}
                />
              )}
              
              {/* 版本 */}
              {version && (
                <TreeNode
                  title={
                    <Link
                      href={`/projects/versions/${version.id}`}
                      className="text-blue-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {version.productName} - {version.versionNumber}
                    </Link>
                  }
                  icon={<GitBranch className="size-4 text-green-600" />}
                  badge={<span className="text-xs text-gray-500">版本</span>}
                  level={0}
                />
              )}
              
              {/* 需求列表 */}
              <TreeNode
                title={<span>关联需求</span>}
                icon={<FileCode className="size-4 text-purple-600" />}
                badge={<span className="text-xs text-gray-500">{ars.length} 个</span>}
                defaultOpen
                level={0}
              >
                {ars.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm" style={{ paddingLeft: "60px" }}>
                    暂无关联需求
                  </div>
                ) : (
                  ars.map((ar) => <ARRow key={ar.id} ar={ar} />)
                )}
              </TreeNode>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
