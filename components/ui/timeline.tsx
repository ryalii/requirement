"use client"

import { Clock } from "lucide-react"

interface TimelineItem {
  id: string | number
  title: string
  description?: string
  time?: string
  icon?: React.ReactNode
  color?: string
}

interface TimelineProps {
  items: TimelineItem[]
}

export function Timeline({ items }: TimelineProps) {
  if (items.length === 0) {
    return <div className="text-center py-8 text-sm text-muted-foreground">暂无动态</div>
  }

  return (
    <div className="relative">
      <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="relative flex items-start gap-4 pl-10">
            <div className={`absolute left-2.5 w-3 h-3 rounded-full border-2 border-white ${item.color || "bg-primary"} -translate-x-1/2 mt-1.5 z-10`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{item.title}</p>
              {item.description && <p className="text-xs text-muted-foreground mt-0.5">{item.description}</p>}
              {item.time && (
                <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                  <Clock className="size-3" />{item.time}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
