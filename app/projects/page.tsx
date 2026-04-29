"use client"

import * as React from "react"
import Link from "next/link"
import { Plus, Pencil, Trash2, Download, Loader2, AlertCircle } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { listProjects, createProject, updateProject, deleteProject, exportProjects } from "@/lib/api/projects"
import type { ProjectVO } from "@/lib/api/projects"

const statusColors: Record<string, string> = {
  "未开始": "text-gray-600 bg-gray-100",
  "进行中": "text-blue-600 bg-blue-100",
  "已完成": "text-green-600 bg-green-100",
  "已暂停": "text-orange-600 bg-orange-100",
}

export default function ProjectsPage() {
  const [projects, setProjects] = React.useState<ProjectVO[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [pageSize] = React.useState(20)
  const [total, setTotal] = React.useState(0)

  const [formDialogOpen, setFormDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [selectedProject, setSelectedProject] = React.useState<ProjectVO | null>(null)
  const [saving, setSaving] = React.useState(false)
  const [exporting, setExporting] = React.useState(false)
  const [formMode, setFormMode] = React.useState<"create" | "edit">("create")
  const [formData, setFormData] = React.useState({ name: "", code: "", financeCode: "", owner: "", manager: "", description: "" })

  const fetchProjects = React.useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const result = await listProjects({ page: currentPage, pageSize })
      setProjects(result.list)
      setTotal(result.total)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "加载失败")
    } finally { setLoading(false) }
  }, [currentPage, pageSize])

  React.useEffect(() => { fetchProjects() }, [fetchProjects])

  const handleCreate = async () => {
    setSaving(true)
    try {
      await createProject({ name: formData.name, code: formData.code, financeCode: formData.financeCode, owner: formData.owner, manager: formData.manager, description: formData.description })
      setFormDialogOpen(false)
      fetchProjects()
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "操作失败") }
    finally { setSaving(false) }
  }

  const handleEdit = async () => {
    if (!selectedProject) return
    setSaving(true)
    try {
      await updateProject(selectedProject.id, { name: formData.name, financeCode: formData.financeCode, owner: formData.owner, manager: formData.manager, description: formData.description })
      setFormDialogOpen(false)
      fetchProjects()
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "更新失败") }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!selectedProject) return
    try {
      await deleteProject(selectedProject.id)
      setDeleteDialogOpen(false)
      fetchProjects()
    } catch (err: unknown) { alert(err instanceof Error ? err.message : "删除失败") }
  }

  const handleExport = async () => {
    setExporting(true)
    try { await exportProjects({}) }
    catch { alert("导出失败") }
    finally { setExporting(false) }
  }

  return (
    <AdminLayout>
      <div className="p-6 space-y-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem><BreadcrumbLink href="/workspace">工作台</BreadcrumbLink></BreadcrumbItem>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <BreadcrumbItem><BreadcrumbPage>项目管理</BreadcrumbPage></BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">项目管理</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport} disabled={exporting}>
              {exporting ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
              导出
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700"
              onClick={() => { setFormMode("create"); setFormData({ name: "", code: "", financeCode: "", owner: "", manager: "", description: "" }); setFormDialogOpen(true) }}>
              <Plus className="size-4" />新增项目
            </Button>
          </div>
        </div>

        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
        ) : (
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">项目名称</TableHead>
                  <TableHead className="font-semibold">编号</TableHead>
                  <TableHead className="font-semibold">财务编号</TableHead>
                  <TableHead className="font-semibold">负责人</TableHead>
                  <TableHead className="font-semibold">状态</TableHead>
                  <TableHead className="font-semibold text-center">版本/迭代/成员</TableHead>
                  <TableHead className="font-semibold text-center">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center text-gray-500 py-8">暂无数据</TableCell></TableRow>
                ) : projects.map((p) => (
                  <TableRow key={p.id} className="hover:bg-gray-50">
                    <TableCell>
                      <Link href={`/projects/${p.id}`} className="text-blue-600 hover:underline font-medium">{p.name}</Link>
                    </TableCell>
                    <TableCell className="text-gray-600">{p.code}</TableCell>
                    <TableCell className="text-gray-600">{p.financeCode || "-"}</TableCell>
                    <TableCell>{p.owner || "-"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${statusColors[p.status] || "bg-gray-100 text-gray-600"}`}>
                        {p.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm text-gray-500">{p.versionCount}V / {p.iterationCount}I / {p.memberCount}M</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button variant="ghost" size="sm" onClick={() => {
                          setSelectedProject(p)
                          setFormData({ name: p.name, code: p.code, financeCode: p.financeCode || "", owner: p.owner || "", manager: p.manager || "", description: p.description || "" })
                          setFormMode("edit"); setFormDialogOpen(true)
                        }}>
                          <Pencil className="size-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600" onClick={() => { setSelectedProject(p); setDeleteDialogOpen(true) }}>
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {total > pageSize && (
              <div className="flex justify-between items-center px-6 py-4 border-t">
                <span className="text-sm text-gray-500">共 {total} 条</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>上一页</Button>
                  <Button variant="outline" size="sm" disabled={currentPage * pageSize >= total} onClick={() => setCurrentPage(p => p + 1)}>下一页</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{formMode === "create" ? "新建项目" : "编辑项目"}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>项目名称</Label><Input value={formData.name} onChange={e => setFormData(d => ({ ...d, name: e.target.value }))} /></div>
                <div><Label>项目编号</Label><Input value={formData.code} onChange={e => setFormData(d => ({ ...d, code: e.target.value }))} disabled={formMode === "edit"} /></div>
                <div><Label>财务编号</Label><Input value={formData.financeCode} onChange={e => setFormData(d => ({ ...d, financeCode: e.target.value }))} /></div>
                <div><Label>负责人</Label><Input value={formData.owner} onChange={e => setFormData(d => ({ ...d, owner: e.target.value }))} /></div>
                <div><Label>项目经理</Label><Input value={formData.manager} onChange={e => setFormData(d => ({ ...d, manager: e.target.value }))} /></div>
              </div>
              <div><Label>描述</Label><Textarea value={formData.description} onChange={e => setFormData(d => ({ ...d, description: e.target.value }))} rows={3} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setFormDialogOpen(false)}>取消</Button>
              <Button onClick={formMode === "create" ? handleCreate : handleEdit} disabled={saving} className="bg-blue-600">
                {saving ? "保存中..." : formMode === "create" ? "创建" : "保存"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader><AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>确定要删除项目 {selectedProject?.name} 吗？</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600">删除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  )
}
