"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MenuItem {
  title: string
  icon?: React.ReactNode
  href?: string
  children?: MenuItem[]
}

const menuItems: MenuItem[] = [
  {
    title: "首页",
    icon: <Home className="size-4" />,
    href: "/",
  },
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
]

interface NavItemProps {
  item: MenuItem
  level?: number
  collapsed?: boolean
}

function NavItem({ item, level = 0, collapsed }: NavItemProps) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(true)
  const isActive = item.href === pathname || (item.href && pathname.startsWith(item.href.split("?")[0]) && item.href.includes(pathname))
  const hasChildren = item.children && item.children.length > 0

  if (hasChildren) {
    return (
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <button
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-blue-50 hover:text-blue-600",
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
        isActive && "bg-blue-50 text-blue-600 border-l-2 border-blue-600",
        level > 0 && "pl-8"
      )}
    >
      {item.icon}
      {!collapsed && <span>{item.title}</span>}
    </Link>
  )
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 顶部导航栏 */}
      <header className="h-14 bg-slate-800 text-white flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
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
              href="/requirements"
              className="px-4 py-2 text-sm bg-blue-600 rounded-md hover:bg-blue-500 transition-colors"
            >
              需求
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-white hover:bg-slate-700">
            <RefreshCw className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-600 text-xs">管</AvatarFallback>
            </Avatar>
            <span className="text-sm">admin01</span>
          </div>
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
            {menuItems.map((item) => (
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
    </div>
  )
}
