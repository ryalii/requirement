"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar } from "lucide-react"

interface KanbanCardProps {
  id: string | number
  code: string
  name: string
  priority: string
  deadline?: string
  assignee?: string
  onClick?: () => void
}

const priorityColors: Record<string, string> = {
  "高": "bg-red-100 text-red-700 border-red-200",
  "中": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "低": "bg-gray-100 text-gray-600 border-gray-200",
}

export function KanbanCard({ code, name, priority, deadline, assignee, onClick }: KanbanCardProps) {
  return (
    <div
      className="bg-white rounded-lg border p-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <span className="text-xs font-mono text-blue-600">{code}</span>
        <Badge variant="outline" className={`text-xs px-1.5 py-0 ${priorityColors[priority] || priorityColors["中"]}`}>
          {priority}
        </Badge>
      </div>
      <p className="text-sm font-medium text-gray-900 line-clamp-2">{name}</p>
      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
        {deadline ? (
          <span className="flex items-center gap-1">
            <Calendar className="size-3" />
            {deadline}
          </span>
        ) : <span />}
        {assignee && <span>{assignee}</span>}
      </div>
    </div>
  )
}
