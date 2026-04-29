"use client"

import { Card, CardContent } from "@/components/ui/card"

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  className?: string
}

export function StatCard({ label, value, subValue, className }: StatCardProps) {
  return (
    <Card className={className}>
      <CardContent className="p-3 text-center">
        <p className="text-lg font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
        {subValue && <p className="text-xs text-muted-foreground mt-0.5">{subValue}</p>}
      </CardContent>
    </Card>
  )
}
