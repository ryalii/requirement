"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ChevronRight, ChevronDown, GitBranch, Repeat, FileCode, ExternalLink, Folder } from "lucide-react"
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
  getVersionById,
  getProjectById,
  getIterationsByVersionId,
  getARDetailsByIterationId,
} from "@/lib/mock-data"
import type { Version, Project, Iteration, ARRequirementDetail } from "@/lib/types"

const versionStatusConfig: Record<string, { label: string; color: string }> = {
  "进行中": { label: "进行中", color: "bg-blue-100 text-blue-700" },
  "已发布": { label: "已发布", color: "bg-green-100 text-green-700" },
  "规划中": { label: "规划中", color: "bg-gray-100 text-gray-700" },
}

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
      style={{ paddingLeft: "84px" }}
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

export default function VersionDetailPage() {
  const params = useParams()
  const versionId = params.id as string
  const [version, setVersion] = React.useState<Version | null>(null)
  const [project, setProject] = React.useState<Project | null>(null)
  const [iterations, setIterations] = React.useState<Iteration[]>([])

  React.useEffect(() => {
    const ver = getVersionById(versionId)
    if (ver) {
      setVersion(ver)
      const proj = getProjectById(ver.projectId)
      setProject(proj || null)
      setIterations(getIterationsByVersionId(versionId))
    }
  }, [versionId])

  if (!version) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center py-20 text-gray-500">版本不存在</div>
        </div>
      </AdminLayout>
    )
  }

  const status = versionStatusConfig[version.status] || versionStatusConfig["规划中"]

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
              <BreadcrumbLink href="/projects/versions">版本</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{version.versionNumber}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 返回按钮 */}
        <div className="mb-4">
          <Link href="/projects/versions">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="size-4" />
              返回版本列表
            </Button>
          </Link>
        </div>

        {/* 版本信息卡片 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <GitBranch className="size-6 text-green-600" />
                <span>{version.productName} - {version.versionNumber}</span>
                <Badge className={status.color}>{status.label}</Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">归属项目:</span>
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
                <span className="text-gray-500">开始时间:</span>
                <span className="ml-2 font-medium">{version.startDate}</span>
              </div>
              <div>
                <span className="text-gray-500">结束时间:</span>
                <span className="ml-2 font-medium">{version.endDate}</span>
              </div>
              <div>
                <span className="text-gray-500">迭代数:</span>
                <span className="ml-2 font-medium">{iterations.length} 个</span>
              </div>
            </div>
            {version.description && (
              <div className="mt-4 text-sm text-gray-600">
                <span className="text-gray-500">描述:</span> {version.description}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 迭代/需求树形结构 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">迭代与需求</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg divide-y">
              {iterations.length === 0 ? (
                <div className="text-center py-10 text-gray-500">暂无迭代数据</div>
              ) : (
                iterations.map((iteration) => {
                  const ars = getARDetailsByIterationId(iteration.id)
                  const iterStatus = iterStatusConfig[iteration.status] || iterStatusConfig["规划中"]
                  return (
                    <TreeNode
                      key={iteration.id}
                      title={
                        <span className="flex items-center gap-2">
                          <Link
                            href={`/projects/iterations/${iteration.id}`}
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {iteration.name}
                          </Link>
                          <span className="text-gray-500 text-xs">
                            ({iteration.startDate} ~ {iteration.endDate})
                          </span>
                        </span>
                      }
                      icon={<Repeat className="size-4 text-orange-600" />}
                      badge={
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{ars.length} 个需求</span>
                          <Badge className={iterStatus.color}>{iterStatus.label}</Badge>
                        </div>
                      }
                      defaultOpen
                      level={0}
                    >
                      {ars.map((ar) => (
                        <ARRow key={ar.id} ar={ar} />
                      ))}
                    </TreeNode>
                  )
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
