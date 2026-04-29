"use client"

import { useState } from "react"

interface KanbanColumn {
  id: string
  title: string
  color: string
  items: React.ReactNode[]
  count: number
}

interface KanbanBoardProps {
  columns: KanbanColumn[]
  className?: string
}

export function KanbanBoard({ columns, className }: KanbanBoardProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-x-auto ${className || ""}`}>
      {columns.map((col) => (
        <div key={col.id} className="bg-gray-50 rounded-lg p-3 min-h-[400px]">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${col.color}`} />
              <h3 className="text-sm font-medium text-gray-700">{col.title}</h3>
            </div>
            <span className="text-xs text-gray-400 bg-white px-2 py-0.5 rounded-full border">
              {col.count}
            </span>
          </div>
          <div className="space-y-2">
            {col.items.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">暂无数据</div>
            ) : (
              col.items.map((item, i) => <div key={i}>{item}</div>)
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
