"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ChevronRight, ChevronDown, Folder, GitBranch, Repeat, FileCode, ExternalLink } from "lucide-react"
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
  getProjectById,
  getVersionsByProjectId,
  getIterationsByVersionId,
  getARDetailsByIterationId,
} from "@/lib/mock-data"
import type { Project, Version, Iteration, ARRequirementDetail } from "@/lib/types"

const projectStatusConfig: Record<string, { label: string; color: string }> = {
  "进行中": { label: "进行中", color: "bg-blue-100 text-blue-700" },
  "已完成": { label: "已完成", color: "bg-green-100 text-green-700" },
  "已暂停": { label: "已暂停", color: "bg-yellow-100 text-yellow-700" },
  "未开始": { label: "未开始", color: "bg-gray-100 text-gray-700" },
}

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
      style={{ paddingLeft: "108px" }}
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

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = React.useState<Project | null>(null)
  const [versions, setVersions] = React.useState<Version[]>([])

  React.useEffect(() => {
    const proj = getProjectById(projectId)
    if (proj) {
      setProject(proj)
      setVersions(getVersionsByProjectId(projectId))
    }
  }, [projectId])

  if (!project) {
    return (
      <AdminLayout>
        <div className="p-6">
          <div className="text-center py-20 text-gray-500">项目不存在</div>
        </div>
      </AdminLayout>
    )
  }

  const status = projectStatusConfig[project.status] || projectStatusConfig["未开始"]

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
              <BreadcrumbLink href="/projects">项目</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{project.code}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* 返回按钮 */}
        <div className="mb-4">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="size-4" />
              返回项目列表
            </Button>
          </Link>
        </div>

        {/* 项目信息卡片 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Folder className="size-6 text-blue-600" />
                <span>{project.name}</span>
                <Badge className={status.color}>{status.label}</Badge>
              </CardTitle>
              <span className="text-sm text-gray-500">代号: {project.code}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">财务编码:</span>
                <span className="ml-2 font-medium">{project.financeCode}</span>
              </div>
              <div>
                <span className="text-gray-500">负责人:</span>
                <span className="ml-2 font-medium">{project.owner}</span>
              </div>
              <div>
                <span className="text-gray-500">项目经理:</span>
                <span className="ml-2 font-medium">{project.manager}</span>
              </div>
              <div>
                <span className="text-gray-500">周期:</span>
                <span className="ml-2 font-medium">
                  {project.startDate} ~ {project.endDate}
                </span>
              </div>
            </div>
            {project.description && (
              <div className="mt-4 text-sm text-gray-600">
                <span className="text-gray-500">描述:</span> {project.description}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 版本/迭代/需求树形结构 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">项目结构</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg divide-y">
              {versions.length === 0 ? (
                <div className="text-center py-10 text-gray-500">暂无版本数据</div>
              ) : (
                versions.map((version) => {
                  const iterations = getIterationsByVersionId(version.id)
                  const versionStatus = versionStatusConfig[version.status] || versionStatusConfig["规划中"]
                  return (
                    <TreeNode
                      key={version.id}
                      title={
                        <span className="flex items-center gap-2">
                          <Link
                            href={`/projects/versions/${version.id}`}
                            className="text-blue-600 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {version.versionNumber}
                          </Link>
                          <span className="text-gray-500 text-xs">
                            ({version.startDate} ~ {version.endDate})
                          </span>
                        </span>
                      }
                      icon={<GitBranch className="size-4 text-green-600" />}
                      badge={<Badge className={versionStatus.color}>{versionStatus.label}</Badge>}
                      defaultOpen
                      level={0}
                    >
                      {iterations.map((iteration) => {
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
                            level={1}
                          >
                            {ars.map((ar) => (
                              <ARRow key={ar.id} ar={ar} />
                            ))}
                          </TreeNode>
                        )
                      })}
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
