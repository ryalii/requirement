"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FileText, ListTodo, FolderKanban, LayoutDashboard } from "lucide-react"

interface SearchCommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const routes = [
  { id: "workspace", label: "工作台", href: "/workspace", icon: LayoutDashboard },
  { id: "requirements", label: "需求管理", href: "/requirements", icon: FileText },
  { id: "tasks", label: "任务管理", href: "/tasks", icon: ListTodo },
  { id: "projects", label: "项目管理", href: "/projects", icon: FolderKanban },
]

export function SearchCommand({ open, onOpenChange }: SearchCommandProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [open, onOpenChange])

  useEffect(() => {
    setQuery("")
  }, [open])

  const filteredRoutes = routes.filter((r) =>
    r.label.toLowerCase().includes(query.toLowerCase())
  )

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={() => onOpenChange(false)} />
      <div className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-50">
        <div className="bg-white rounded-xl shadow-2xl border overflow-hidden">
          <div className="flex items-center px-4 border-b">
            <svg className="size-4 text-gray-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              className="flex-1 px-3 py-3.5 text-sm bg-transparent outline-none placeholder:text-gray-400"
              placeholder="搜索页面或输入需求/任务编号..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>
          <div className="p-2 max-h-64 overflow-y-auto">
            {filteredRoutes.length === 0 ? (
              <div className="text-center py-6 text-sm text-gray-400">无匹配结果</div>
            ) : (
              filteredRoutes.map((r) => (
                <button
                  key={r.id}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm hover:bg-gray-100 transition-colors"
                  onClick={() => { router.push(r.href); onOpenChange(false) }}
                >
                  <r.icon className="size-4 text-gray-500" />
                  <span>{r.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  )
}
