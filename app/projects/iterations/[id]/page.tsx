"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Repeat, GitBranch, FileCode, ExternalLink, ChevronRight, ChevronDown, Briefcase, History, Clock, CheckCircle2, AlertCircle, ListChecks, Plus, Trash2 } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  getIterationById,
  getProjectById,
  getVersionById,
  getARDetailsByIterationId,
  getIterationRequirementCount,
  getOperationLogs,
  mockARDetails,
} from "@/lib/mock-data"
import type { Iteration, Project, Version, ARRequirementDetail, OperationLog } from "@/lib/types"

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

// 数字看板卡片
function StatCard({ title, value, icon, color, subText }: { 
  title: string
  value: number
  icon: React.ReactNode
  color: string
  subText?: string 
}) {
  return (
    <div className={`rounded-xl p-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium opacity-80">{title}</div>
          <div className="text-3xl font-bold mt-1">{value}</div>
          {subText && <div className="text-xs opacity-70 mt-1">{subText}</div>}
        </div>
        <div className="opacity-60">{icon}</div>
      </div>
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
  const [logs, setLogs] = React.useState<OperationLog[]>([])
  const [reqStats, setReqStats] = React.useState({ total: 0, completed: 0, inProgress: 0, blocked: 0 })
  const [logsOpen, setLogsOpen] = React.useState(false)
  const [requirementsOpen, setRequirementsOpen] = React.useState(false)
  const [allArs, setAllArs] = React.useState<ARRequirementDetail[]>([])
  const [selectedArIds, setSelectedArIds] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    const iter = getIterationById(iterationId)
    if (iter) {
      setIteration(iter)
      const proj = getProjectById(iter.projectId)
      setProject(proj || null)
      const ver = getVersionById(iter.versionId)
      setVersion(ver || null)
      const currentArs = getARDetailsByIterationId(iterationId)
      setArs(currentArs)
      setLogs(getOperationLogs("iteration", iterationId))
      setReqStats(getIterationRequirementCount(iterationId))
      setAllArs(mockARDetails)
      setSelectedArIds(new Set(currentArs.map(ar => ar.id)))
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
        <div className="mb-4 flex items-center justify-between">
          <Link href="/projects/iterations">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="size-4" />
              返回迭代列表
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setRequirementsOpen(true)}
              className="text-green-600 hover:text-green-700 border-green-200 hover:border-green-300"
            >
              <ListChecks className="size-4 mr-1" />
              管理需求
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLogsOpen(true)}>
              <History className="size-4 mr-1" />
              操作日志
            </Button>
          </div>
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

        {/* 数字看板 */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <StatCard
            title="总需求"
            value={reqStats.total}
            icon={<FileCode className="size-8" />}
            color="bg-gradient-to-br from-blue-500 to-blue-600 text-white"
          />
          <StatCard
            title="已完成"
            value={reqStats.completed}
            icon={<CheckCircle2 className="size-8" />}
            color="bg-gradient-to-br from-green-500 to-green-600 text-white"
            subText={reqStats.total > 0 ? `${Math.round((reqStats.completed / reqStats.total) * 100)}%` : "0%"}
          />
          <StatCard
            title="进行中"
            value={reqStats.inProgress}
            icon={<Clock className="size-8" />}
            color="bg-gradient-to-br from-amber-500 to-orange-500 text-white"
          />
          <StatCard
            title="已阻塞"
            value={reqStats.blocked}
            icon={<AlertCircle className="size-8" />}
            color="bg-gradient-to-br from-red-500 to-red-600 text-white"
          />
        </div>

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
                  icon={<Briefcase className="size-4 text-blue-600" />}
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

      {/* 需求管理弹窗 */}
      <Dialog open={requirementsOpen} onOpenChange={setRequirementsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>管理迭代需求 - {iteration.name}</DialogTitle>
            <DialogDescription>
              选择要关联到此迭代的AR需求（当前已关联 {selectedArIds.size} 个）
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[400px] overflow-y-auto">
            {allArs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无可用需求</div>
            ) : (
              <div className="space-y-2">
                {allArs.map((ar) => {
                  const isSelected = selectedArIds.has(ar.id)
                  const status = arStatusConfig[ar.status] || arStatusConfig["待分析"]
                  return (
                    <div
                      key={ar.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        const newSelected = new Set(selectedArIds)
                        if (newSelected.has(ar.id)) {
                          newSelected.delete(ar.id)
                        } else {
                          newSelected.add(ar.id)
                        }
                        setSelectedArIds(newSelected)
                      }}
                    >
                      <Checkbox checked={isSelected} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-blue-600">{ar.code}</span>
                          <span className="truncate">{ar.name}</span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          前端: {ar.frontend} | 后端: {ar.backend} | 测试: {ar.tester}
                        </div>
                      </div>
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRequirementsOpen(false)}>
              取消
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                // 更新关联的需求
                const newArs = allArs.filter(ar => selectedArIds.has(ar.id))
                setArs(newArs)
                setReqStats({
                  total: newArs.length,
                  completed: newArs.filter(ar => ar.status === "已完成").length,
                  inProgress: newArs.filter(ar => ar.status === "进行中").length,
                  blocked: newArs.filter(ar => ar.status === "已关闭").length,
                })
                setRequirementsOpen(false)
              }}
            >
              保存更改
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 操作日志弹窗 */}
      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>操作日志 - {iteration.name}</DialogTitle>
            <DialogDescription>
              迭代变更历史记录
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">暂无操作记录</div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <History className="size-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{log.action}</div>
                        <div className="text-sm text-gray-500">{log.timestamp}</div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">{log.description}</div>
                      {(log.oldValue || log.newValue) && (
                        <div className="text-sm mt-2 flex items-center gap-2">
                          {log.oldValue && (
                            <span className="px-2 py-0.5 bg-red-50 text-red-600 rounded">
                              {log.oldValue}
                            </span>
                          )}
                          {log.oldValue && log.newValue && <span className="text-gray-400">→</span>}
                          {log.newValue && (
                            <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded">
                              {log.newValue}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">操作人: {log.operator}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogsOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
