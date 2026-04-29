"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TrendingUp, TrendingDown } from "lucide-react"

interface KpiCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: "up" | "down"
  trendLabel?: string
  className?: string
}

export function KpiCard({ title, value, icon, trend, trendLabel, className }: KpiCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          {icon && <div className="p-2 rounded-lg bg-primary/10 text-primary">{icon}</div>}
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs">
            {trend === "up" ? (
              <TrendingUp className="size-3 text-green-600" />
            ) : (
              <TrendingDown className="size-3 text-red-600" />
            )}
            <span className={trend === "up" ? "text-green-600" : "text-red-600"}>{trendLabel}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
