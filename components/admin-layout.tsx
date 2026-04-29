"use client"

import * as React from "react"
import { Suspense } from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  FileText, ChevronDown, ChevronRight, PanelLeftClose, PanelLeft,
  LayoutDashboard, FileStack, FileCog, FileCode, FileCheck,
  LayoutGrid, ListTodo, FolderKanban, Layers, GitBranch, Repeat,
  LogOut, Settings, Key, User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Navbar } from "@/components/navbar"
import { Sidebar } from "@/components/sidebar"

interface MenuItem {
  title: string
  icon?: React.ReactNode
  href?: string
  children?: MenuItem[]
}

const workspaceMenuItems: MenuItem[] = [
  { title: "工作台", icon: <LayoutGrid className="size-4" />, href: "/workspace" },
]

const requirementMenuItems: MenuItem[] = [
  { title: "需求管理", icon: <FileText className="size-4" />, children: [
    { title: "概览", icon: <LayoutDashboard className="size-4" />, href: "/requirements" },
    { title: "LMT需求", icon: <FileStack className="size-4" />, href: "/requirements?type=LMT" },
    { title: "IR需求", icon: <FileCog className="size-4" />, href: "/requirements?type=IR" },
    { title: "SR需求", icon: <FileCode className="size-4" />, href: "/requirements?type=SR" },
    { title: "AR需求", icon: <FileCheck className="size-4" />, href: "/requirements?type=AR" },
  ]},
]

const taskMenuItems: MenuItem[] = [
  { title: "任务管理", icon: <ListTodo className="size-4" />, children: [
    { title: "概览", icon: <LayoutDashboard className="size-4" />, href: "/tasks" },
  ]},
]

const projectMenuItems: MenuItem[] = [
  { title: "项目管理", icon: <FolderKanban className="size-4" />, children: [
    { title: "项目", icon: <Layers className="size-4" />, href: "/projects" },
    { title: "版本", icon: <GitBranch className="size-4" />, href: "/projects/versions" },
    { title: "迭代", icon: <Repeat className="size-4" />, href: "/projects/iterations" },
  ]},
]

interface NavItemProps {
  item: MenuItem
  level?: number
  collapsed?: boolean
}

function NavItemContent({ item, level = 0, collapsed }: NavItemProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = React.useState(true)

  const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname
  const isActive = item.href === currentUrl || (item.href === pathname && !item.href?.includes("?") && !searchParams.toString())
  const hasChildren = item.children && item.children.length > 0

  if (hasChildren) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button className={cn("flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600 text-gray-600", level > 0 && "pl-8")}>
            {item.icon}
            {!collapsed && (<><span className="flex-1 text-left">{item.title}</span>{open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}</>)}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <NavItemContent key={child.title} item={child} level={level + 1} collapsed={collapsed} />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Link href={item.href || "#"}
      className={cn("flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-blue-50 hover:text-blue-600",
        isActive ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600" : "text-gray-600", level > 0 && "pl-8")}>
      {item.icon}
      {!collapsed && <span>{item.title}</span>}
    </Link>
  )
}

function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [saving, setSaving] = React.useState(false)
  const [oldPassword, setOldPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) { alert("请填写完整信息"); return }
    if (newPassword !== confirmPassword) { alert("两次输入的新密码不一致"); return }
    if (newPassword.length < 6) { alert("新密码长度不能少于6位"); return }
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setSaving(false); setOldPassword(""); setNewPassword(""); setConfirmPassword(""); onOpenChange(false)
    alert("密码修改成功！")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Key className="size-5 text-blue-600" />修改密码</DialogTitle><DialogDescription>请输入旧密码和新密码进行修改</DialogDescription></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>旧密码</Label><Input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="请输入旧密码" /></div>
          <div className="space-y-2"><Label>新密码</Label><Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="至少6位" /></div>
          <div className="space-y-2"><Label>确认新密码</Label><Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="请再次输入" /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600">{saving ? "保存中..." : "确认修改"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false)
  const pathname = usePathname()

  const isWorkspaceArea = pathname === "/workspace"
  const isRequirementsArea = pathname.startsWith("/requirements")
  const isTasksArea = pathname.startsWith("/tasks")
  const isProjectsArea = pathname.startsWith("/projects")

  const getCurrentMenuItems = () => {
    if (isWorkspaceArea) return workspaceMenuItems
    if (isRequirementsArea) return requirementMenuItems
    if (isTasksArea) return taskMenuItems
    if (isProjectsArea) return projectMenuItems
    return workspaceMenuItems
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />

      <div className="flex flex-1 pt-16">
        {/* Left sidebar with nav menu */}
        <aside className={cn("bg-white border-r flex flex-col shrink-0 transition-all duration-300 hidden lg:flex", sidebarCollapsed ? "w-16" : "w-52")}>
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto mt-2">
            {getCurrentMenuItems().map((item) => (
              <NavItem key={item.title} item={item} collapsed={sidebarCollapsed} />
            ))}
          </nav>
          <div className="p-2 border-t">
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              {sidebarCollapsed ? <PanelLeft className="size-4" /> : <><PanelLeftClose className="size-4" /><span>收起</span></>}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      <footer className="h-8 bg-white border-t flex items-center justify-center text-xs text-gray-500 shrink-0">
        Copyright &copy; 2026 研发需求管理系统 All rights reserved. v1.0
      </footer>

      <ChangePasswordDialog open={changePasswordOpen} onOpenChange={setChangePasswordOpen} />
    </div>
  )
}

export function NavItem(props: NavItemProps) {
  return (
    <Suspense fallback={<div className="h-9 animate-pulse bg-gray-100 rounded-md" />}>
      <NavItemContent {...props} />
    </Suspense>
  )
}
