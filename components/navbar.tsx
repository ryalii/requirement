"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { UserDropdown } from "@/components/user-dropdown"
import { SearchCommand } from "@/components/search-command"

interface NavbarProps {
  onToggleSidebar: () => void
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)

  const navLinks = [
    { href: "/workspace", label: "工作台" },
    { href: "/requirements", label: "需求管理" },
    { href: "/tasks", label: "任务管理" },
    { href: "/projects", label: "项目管理" },
  ]

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white border-b">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="lg:hidden">
              <Menu className="size-5" />
            </Button>
            <Link href="/workspace" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">R</span>
              </div>
              <span className="font-semibold text-gray-900 hidden sm:inline">需求管理</span>
            </Link>
            <nav className="hidden md:flex items-center ml-6 space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname.startsWith(link.href)
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md border bg-gray-50 text-sm text-gray-400 hover:bg-gray-100 transition-colors"
            >
              <Search className="size-4" />
              <span>搜索...</span>
              <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded border bg-white text-xs text-gray-400">
                ⌘K
              </kbd>
            </button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5 text-gray-500" />
            </Button>
            <UserDropdown />
          </div>
        </div>
      </header>

      <SearchCommand open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
