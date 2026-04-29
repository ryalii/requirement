"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, ChevronRight, ChevronDown, GitBranch, Repeat, FileCode, ExternalLink, Briefcase, Clock, CheckCircle2, AlertCircle, History, Users, Plus, Trash2 } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { getProject, getProjectMembers, getProjectLogs, getProjectTree } from "@/lib/api/projects"
import type { ProjectDetailVO, ProjectMemberVO, OperationLogVO } from "@/lib/api/projects"

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

const roleColors: Record<string, string> = {
  "负责人": "bg-red-100 text-red-700",
  "项目经理": "bg-blue-100 text-blue-700",
  "前端开发": "bg-green-100 text-green-700",
  "后端开发": "bg-purple-100 text-purple-700",
  "测试工程师": "bg-orange-100 text-orange-700",
  "产品经理": "bg-cyan-100 text-cyan-700",
  "架构师": "bg-indigo-100 text-indigo-700",
  "UI设计师": "bg-pink-100 text-pink-700",
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

export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const [project, setProject] = React.useState<any>(null)
  const [versions, setVersions] = React.useState<any[]>([])
  const [members, setMembers] = React.useState<any[]>([])
  const [logs, setLogs] = React.useState<any[]>([])
  const [reqStats, setReqStats] = React.useState({ total: 0, completed: 0, inProgress: 0, blocked: 0 })
  const [membersOpen, setMembersOpen] = React.useState(false)
  const [logsOpen, setLogsOpen] = React.useState(false)
  const [addMemberOpen, setAddMemberOpen] = React.useState(false)
  const [deleteMemberOpen, setDeleteMemberOpen] = React.useState(false)
  const [memberToDelete, setMemberToDelete] = React.useState<any>(null)
  const [newMember, setNewMember] = React.useState({
    name: "",
    email: "",
    role: "前端开发" as string,
  })

  React.useEffect(() => {
    async function fetchData() {
      try {
        const pid = Number(projectId)
        const [detail, treeData] = await Promise.all([
          getProject(pid),
          getProjectTree(pid).catch(() => null),
        ])
        setProject(detail.project)
        setReqStats(detail.stats)
        setMembers(detail.members)
        setLogs(detail.logs)
        if (treeData) {
          const versions = treeData.versions || []
          setVersions(versions)
        }
      } catch {
        setProject(null)
      }
    }
    fetchData()
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
        <div className="mb-4 flex items-center justify-between">
          <Link href="/projects">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="size-4" />
              返回项目列表
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setMembersOpen(true)}>
              <Users className="size-4 mr-1" />
              团队成员 ({members.length})
            </Button>
            <Button variant="outline" size="sm" onClick={() => setLogsOpen(true)}>
              <History className="size-4 mr-1" />
              操作日志
            </Button>
          </div>
        </div>

        {/* 项目信息卡片 */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3">
                <Briefcase className="size-6 text-blue-600" />
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
                  const iterations = version.iterations || []
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
                        const ars = iteration.ars || []
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

      {/* 团队成员管理弹窗 */}
      <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>团队成员管理 - {project.name}</DialogTitle>
            <DialogDescription>
              共 {members.length} 名成员，可新增或删除成员
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500">成员列表</span>
              <Button
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => {
                  setNewMember({ name: "", email: "", role: "前端开发" })
                  setAddMemberOpen(true)
                }}
              >
                <Plus className="size-4 mr-1" />
                新增成员
              </Button>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {members.length === 0 ? (
                <div className="text-center py-8 text-gray-500">暂无成员，点击上方按钮添加</div>
              ) : (
                <div className="space-y-3">
                  {members.map((member) => (
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
                      <div className="flex items-center gap-2">
                        <Badge className={roleColors[member.role] || "bg-gray-100 text-gray-700"}>
                          {member.role}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setMemberToDelete(member)
                            setDeleteMemberOpen(true)
                          }}
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMembersOpen(false)}>
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 新增成员弹窗 */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>新增成员</DialogTitle>
            <DialogDescription>
              添加新的团队成员到项目中
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>姓名 <span className="text-red-500">*</span></Label>
              <Input
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                placeholder="请输入成员姓名"
              />
            </div>
            <div className="space-y-2">
              <Label>邮箱</Label>
              <Input
                type="email"
                value={newMember.email}
                onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                placeholder="请输入邮箱地址"
              />
            </div>
            <div className="space-y-2">
              <Label>角色 <span className="text-red-500">*</span></Label>
              <Select
                value={newMember.role}
                onValueChange={(v) => setNewMember({ ...newMember, role: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="负责人">负责人</SelectItem>
                  <SelectItem value="项目经理">项目经理</SelectItem>
                  <SelectItem value="产品经理">产品经理</SelectItem>
                  <SelectItem value="前端开发">前端开发</SelectItem>
                  <SelectItem value="后端开发">后端开发</SelectItem>
                  <SelectItem value="测试工程师">测试工程师</SelectItem>
                  <SelectItem value="架构师">架构师</SelectItem>
                  <SelectItem value="UI设计师">UI设计师</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
              取消
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (newMember.name.trim()) {
                  const newMemberData: ProjectMember = {
                    id: `member-${Date.now()}`,
                    projectId: projectId,
                    name: newMember.name,
                    email: newMember.email || undefined,
                    role: newMember.role,
                  }
                  setMembers([...members, newMemberData])
                  setAddMemberOpen(false)
                  setNewMember({ name: "", email: "", role: "前端开发" })
                }
              }}
              disabled={!newMember.name.trim()}
            >
              确定添加
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除成员确认弹窗 */}
      <AlertDialog open={deleteMemberOpen} onOpenChange={setDeleteMemberOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除成员</AlertDialogTitle>
            <AlertDialogDescription>
              确定要将 <span className="font-medium text-gray-900">{memberToDelete?.name}</span> 从项目团队中移除吗？此操作不可撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (memberToDelete) {
                  setMembers(members.filter(m => m.id !== memberToDelete.id))
                  setMemberToDelete(null)
                }
              }}
            >
              确认删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* 操作日志弹窗 */}
      <Dialog open={logsOpen} onOpenChange={setLogsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>操作日志 - {project.name}</DialogTitle>
            <DialogDescription>
              项目变更历史记录
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
