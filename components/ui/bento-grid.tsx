"use client"

interface BentoItem {
  id: string | number
  content: React.ReactNode
  colSpan?: 1 | 2 | 3
  rowSpan?: 1 | 2
  className?: string
}

interface BentoGridProps {
  items: BentoItem[]
  className?: string
}

export function BentoGrid({ items, className }: BentoGridProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 ${className || ""}`}>
      {items.map((item) => (
        <div
          key={item.id}
          className={`${
            item.colSpan === 2 ? "md:col-span-2 lg:col-span-2" :
            item.colSpan === 3 ? "md:col-span-3 lg:col-span-3" : "md:col-span-1 lg:col-span-1"
          } ${
            item.rowSpan === 2 ? "row-span-2" : ""
          } ${item.className || ""}`}
        >
          {item.content}
        </div>
      ))}
    </div>
  )
}
