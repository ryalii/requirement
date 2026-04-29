"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface DataPoint {
  name: string
  value: number
  color: string
}

interface DonutChartProps {
  data: DataPoint[]
  title?: string
  height?: number
  innerRadius?: number
}

export function DonutChart({ data, title, height = 300, innerRadius = 60 }: DonutChartProps) {
  if (!data || data.length === 0) {
    return <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">暂无数据</div>
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div>
      {title && <h3 className="text-sm font-medium mb-4">{title}</h3>}
      <div className="flex items-center justify-center">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={innerRadius + 40}
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value: number) => [`${value} (${((value / total) * 100).toFixed(1)}%)`, ""]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="space-y-2 ml-4">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
              <span className="text-muted-foreground">{d.name}</span>
              <span className="font-medium">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
