"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import {
  FileText,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  PanelLeftClose,
  PanelLeft,
  LayoutDashboard,
  FileStack,
  FileCog,
  FileCode,
  FileCheck,
  LayoutGrid,
  ListTodo,
  ClipboardList,
  LogOut,
  Settings,
  Key,
  User,
  FolderKanban,
  Layers,
  GitBranch,
  Repeat,
  TestTube,
  Bug,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MenuItem {
  title: string
  icon?: React.ReactNode
  href?: string
  children?: MenuItem[]
}

// 工作台菜单
const workspaceMenuItems: MenuItem[] = [
  {
    title: "工作台",
    icon: <LayoutGrid className="size-4" />,
    href: "/workspace",
  },
]

// 需求管理菜单
const requirementMenuItems: MenuItem[] = [
  {
    title: "需求管理",
    icon: <FileText className="size-4" />,
    children: [
      {
        title: "概览",
        icon: <LayoutDashboard className="size-4" />,
        href: "/requirements",
      },
      {
        title: "LMT需求",
        icon: <FileStack className="size-4" />,
        href: "/requirements?type=LMT",
      },
      {
        title: "IR需求",
        icon: <FileCog className="size-4" />,
        href: "/requirements?type=IR",
      },
      {
        title: "SR需求",
        icon: <FileCode className="size-4" />,
        href: "/requirements?type=SR",
      },
      {
        title: "AR需求",
        icon: <FileCheck className="size-4" />,
        href: "/requirements?type=AR",
      },
    ],
  },
  {
    title: "测试管理",
    icon: <TestTube className="size-4" />,
    children: [
      {
        title: "测试用例",
        icon: <ClipboardList className="size-4" />,
        href: "/requirements/testing/test-cases",
      },
    ],
  },
  {
    title: "Bug单",
    icon: <Bug className="size-4" />,
    href: "/requirements/bugs",
  },
]

// 任务管理菜单
const taskMenuItems: MenuItem[] = [
  {
    title: "任务管理",
    icon: <ListTodo className="size-4" />,
    children: [
      {
        title: "概览",
        icon: <LayoutDashboard className="size-4" />,
        href: "/tasks",
      },
    ],
  },
]

// 项目管理菜单
const projectMenuItems: MenuItem[] = [
  {
    title: "项目管理",
    icon: <FolderKanban className="size-4" />,
    children: [
      {
        title: "项目",
        icon: <Layers className="size-4" />,
        href: "/projects",
      },
      {
        title: "版本",
        icon: <GitBranch className="size-4" />,
        href: "/projects/versions",
      },
      {
        title: "迭代",
        icon: <Repeat className="size-4" />,
        href: "/projects/iterations",
      },
    ],
  },
]

interface NavItemProps {
  item: MenuItem
  level?: number
  collapsed?: boolean
}

function NavItem({ item, level = 0, collapsed }: NavItemProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = React.useState(true)
  
  // 匹配逻辑：
  // 1. 如果href包含query参数，需要完全匹配
  // 2. 如果href不包含query参数，则用前缀匹配（支持详情页高亮父级）
  const currentUrl = searchParams.toString() ? `${pathname}?${searchParams.toString()}` : pathname
  const isActive = React.useMemo(() => {
    if (!item.href) return false
    // 如果菜单项的href有query参数，需要精确匹配
    if (item.href.includes("?")) {
      return item.href === currentUrl
    }
    // 否则用前缀匹配（详情页也能高亮父级菜单）
    return pathname === item.href || pathname.startsWith(item.href + "/")
  }, [item.href, pathname, currentUrl])
  
  const hasChildren = item.children && item.children.length > 0

  if (hasChildren) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-blue-50 hover:text-blue-600 text-gray-600",
              level > 0 && "pl-8"
            )}
          >
            {item.icon}
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.title}</span>
                {open ? (
                  <ChevronDown className="size-4" />
                ) : (
                  <ChevronRight className="size-4" />
                )}
              </>
            )}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <NavItem
                key={child.title}
                item={child}
                level={level + 1}
                collapsed={collapsed}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Link
      href={item.href || "#"}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        "hover:bg-blue-50 hover:text-blue-600",
        isActive 
          ? "bg-blue-50 text-blue-600 border-l-2 border-blue-600" 
          : "text-gray-600",
        level > 0 && "pl-8"
      )}
    >
      {item.icon}
      {!collapsed && <span>{item.title}</span>}
    </Link>
  )
}

// 修改密码对话框
function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [saving, setSaving] = React.useState(false)
  const [oldPassword, setOldPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")

  const handleSubmit = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert("请填写完整信息")
      return
    }
    if (newPassword !== confirmPassword) {
      alert("两次输入的新密码不一致")
      return
    }
    if (newPassword.length < 6) {
      alert("新密码长度不能少于6位")
      return
    }
    setSaving(true)
    await new Promise(resolve => setTimeout(resolve, 500))
    setSaving(false)
    setOldPassword("")
    setNewPassword("")
    setConfirmPassword("")
    onOpenChange(false)
    alert("密码修改成功！")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-5 text-blue-600" />
            修改密码
          </DialogTitle>
          <DialogDescription>
            请输入旧密码和新密码进行修改
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>旧密码 <span className="text-red-500">*</span></Label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="请输入旧密码"
            />
          </div>
          <div className="space-y-2">
            <Label>新密码 <span className="text-red-500">*</span></Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码（至少6位）"
            />
          </div>
          <div className="space-y-2">
            <Label>确认新密码 <span className="text-red-500">*</span></Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>取消</Button>
          <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
            {saving ? "保存中..." : "确认修改"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)
  const [changePasswordOpen, setChangePasswordOpen] = React.useState(false)
  const pathname = usePathname()

  // 判断当前是在哪个区域
  const isWorkspaceArea = pathname === "/workspace"
  const isRequirementsArea = pathname.startsWith("/requirements")
  const isTasksArea = pathname.startsWith("/tasks")
  const isProjectsArea = pathname.startsWith("/projects")

  // 判断顶部导航的激活状态
  const isWorkspaceActive = isWorkspaceArea
  const isRequirementsActive = isRequirementsArea
  const isTasksActive = isTasksArea
  const isProjectsActive = isProjectsArea

  // 根据当前区域选择不同的菜单
  const getCurrentMenuItems = () => {
    if (isWorkspaceArea) return workspaceMenuItems
    if (isRequirementsArea) return requirementMenuItems
    if (isTasksArea) return taskMenuItems
    if (isProjectsArea) return projectMenuItems
    return workspaceMenuItems
  }

  const currentMenuItems = getCurrentMenuItems()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="h-14 bg-slate-800 text-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/workspace" className="flex items-center gap-2 font-semibold">
            <div className="size-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="size-5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
                <rect x="9" y="3" width="6" height="4" rx="1" />
                <path d="M9 12h6" />
                <path d="M9 16h6" />
              </svg>
            </div>
            <span>研发需求管理系统</span>
          </Link>
          <nav className="flex items-center gap-1 ml-4">
            <Link
              href="/workspace"
              className={cn(
                "px-4 py-2 text-sm rounded-md transition-colors",
                isWorkspaceActive 
                  ? "bg-blue-600" 
                  : "hover:bg-slate-700"
              )}
            >
              工作台
            </Link>
            <Link
              href="/requirements"
              className={cn(
                "px-4 py-2 text-sm rounded-md transition-colors",
                isRequirementsActive 
                  ? "bg-blue-600" 
                  : "hover:bg-slate-700"
              )}
            >
              需求管理
            </Link>
            <Link
              href="/tasks"
              className={cn(
                "px-4 py-2 text-sm rounded-md transition-colors",
                isTasksActive 
                  ? "bg-blue-600" 
                  : "hover:bg-slate-700"
              )}
            >
              任务管理
            </Link>
            <Link
              href="/projects"
              className={cn(
                "px-4 py-2 text-sm rounded-md transition-colors",
                isProjectsActive 
                  ? "bg-blue-600" 
                  : "hover:bg-slate-700"
              )}
            >
              项目管理
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
            <RefreshCw className="size-4" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 hover:bg-slate-700 rounded-md px-2 py-1 transition-colors">
                <Avatar className="size-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-600 text-xs">管</AvatarFallback>
                </Avatar>
                <span className="text-sm">admin01</span>
                <ChevronDown className="size-4 text-gray-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2">
                <User className="size-4" />
                个人中心
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2" onClick={() => setChangePasswordOpen(true)}>
                <Key className="size-4" />
                修改密码
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2">
                <Settings className="size-4" />
                系统设置
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 text-red-600">
                <LogOut className="size-4" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧导航菜单 */}
        <aside
          className={cn(
            "bg-white border-r flex flex-col shrink-0 transition-all duration-300",
            sidebarCollapsed ? "w-16" : "w-52"
          )}
        >
          <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
            {currentMenuItems.map((item) => (
              <NavItem key={item.title} item={item} collapsed={sidebarCollapsed} />
            ))}
          </nav>
          <div className="p-2 border-t">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              {sidebarCollapsed ? (
                <PanelLeft className="size-4" />
              ) : (
                <>
                  <PanelLeftClose className="size-4" />
                  <span>收起</span>
                </>
              )}
            </button>
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>

      {/* 页脚 */}
      <footer className="h-8 bg-white border-t flex items-center justify-center text-xs text-gray-500 shrink-0">
        Copyright © 2026 研发需求管理系统 All rights reserved. v1.0
      </footer>

      {/* 修改密码对话框 */}
      <ChangePasswordDialog 
        open={changePasswordOpen} 
        onOpenChange={setChangePasswordOpen} 
      />
    </div>
  )
}
