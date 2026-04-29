"use client"

import * as React from "react"
import Link from "next/link"
import { Calendar, Clock, AlertCircle, ArrowRight, FileText, ListTodo, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { KpiCard } from "@/components/ui/kpi-card"
import { LineChart } from "@/components/charts/line-chart"
import { DonutChart } from "@/components/charts/donut-chart"
import { Timeline } from "@/components/ui/timeline"
import { getUrgentRequirements, getOverdueTasks } from "@/lib/api/workspace"
import { getTaskStats } from "@/lib/api/tasks"
import { listRequirements } from "@/lib/api/requirements"
import type { RequirementVO } from "@/lib/api/requirements"
import type { TaskVO } from "@/lib/api/tasks"
import type { TaskStatsVO } from "@/lib/api/tasks"

const priorityBadge = (p: string) => {
  if (p === "高") return <Badge variant="destructive" className="text-xs">{p}</Badge>
  if (p === "中") return <Badge variant="default" className="bg-yellow-500 text-xs">{p}</Badge>
  return <Badge variant="outline" className="text-xs">{p}</Badge>
}

const typeColors: Record<string, string> = {
  LMT: "bg-purple-100 text-purple-700 border-purple-200",
  IR: "bg-blue-100 text-blue-700 border-blue-200",
  SR: "bg-green-100 text-green-700 border-green-200",
  AR: "bg-orange-100 text-orange-700 border-orange-200",
}

export default function WorkspacePage() {
  const [urgentReqs, setUrgentReqs] = React.useState<RequirementVO[]>([])
  const [overdueTasks, setOverdueTasks] = React.useState<TaskVO[]>([])
  const [taskStats, setTaskStats] = React.useState<TaskStatsVO | null>(null)
  const [totalReqs, setTotalReqs] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    async function load() {
      try {
        const [urgent, overdue, stats, reqs] = await Promise.all([
          getUrgentRequirements(6),
          getOverdueTasks(),
          getTaskStats(),
          listRequirements({ page: 1, pageSize: 1 }),
        ])
        setUrgentReqs(urgent)
        setOverdueTasks(overdue)
        setTaskStats(stats)
        setTotalReqs(reqs.total)
      } catch {
        // silent fail
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const completionRate = taskStats && taskStats.total > 0
    ? Math.round((taskStats.completed / taskStats.total) * 100)
    : 0

  const timelineItems = overdueTasks.slice(0, 5).map(t => ({
    id: t.id,
    title: t.name,
    description: `负责人: ${t.assignee || "未分配"} · 截止: ${t.deadline}`,
    time: `逾期 ${t.daysRemaining} 天`,
    color: "bg-red-500",
  }))

  const chartData = [
    { name: "1月", value: 4 }, { name: "2月", value: 3 }, { name: "3月", value: 7 },
    { name: "4月", value: 5 }, { name: "5月", value: 8 }, { name: "6月", value: 6 },
  ]

  const typeDistData = [
    { name: "LMT", value: 3, color: "#7C3AED" },
    { name: "IR", value: 5, color: "#3B82F6" },
    { name: "SR", value: 8, color: "#10B981" },
    { name: "AR", value: 4, color: "#F59E0B" },
  ]

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold">工作台</h1>
          <p className="text-sm text-muted-foreground mt-1">欢迎回来，这里是系统的运行概览</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard title="需求总数" value={totalReqs} icon={<FileText className="size-5" />} />
          <KpiCard title="进行中任务" value={taskStats?.inProgress || 0} icon={<ListTodo className="size-5 text-blue-600" />} />
          <KpiCard title="完成率" value={`${completionRate}%`} icon={<CheckCircle2 className="size-5 text-green-600" />} trend="up" trendLabel={`${taskStats?.completed || 0} 个已完成`} />
          <KpiCard title="逾期任务" value={taskStats?.overdue || 0} icon={<AlertTriangle className="size-5 text-red-600" />} trend="down" trendLabel="需要立即处理" />
        </div>

        {/* Charts + Timeline */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">需求趋势</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="h-[300px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
                : <LineChart data={chartData} height={300} />}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">需求类型分布</CardTitle></CardHeader>
            <CardContent>
              {loading ? <div className="h-[300px] flex items-center justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>
                : <DonutChart data={typeDistData} height={300} />}
            </CardContent>
          </Card>
        </div>

        {/* Urgent + Overdue */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Urgent Requirements */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="size-4 text-orange-500" />紧急需求
              </CardTitle>
              <Link href="/requirements?status=待分析&priority=高">
                <Button variant="ghost" size="sm"><ArrowRight className="size-4" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
              ) : urgentReqs.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">暂无紧急需求</div>
              ) : (
                <div className="space-y-3">
                  {urgentReqs.map((req) => (
                    <Link key={req.id} href={`/requirements/${req.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium border ${typeColors[req.type] || "bg-gray-100"}`}>{req.type}</span>
                          <span className="text-xs font-mono text-blue-600">{req.code}</span>
                          {priorityBadge(req.priority)}
                        </div>
                        <p className="text-sm font-medium mt-1 truncate">{req.name}</p>
                      </div>
                      <div className="text-xs text-gray-500 shrink-0 ml-2">{req.expectedDate}</div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Overdue Tasks */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4 text-red-500" />逾期任务
              </CardTitle>
              <Link href="/tasks">
                <Button variant="ghost" size="sm"><ArrowRight className="size-4" /></Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" /></div>
              ) : overdueTasks.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">没有逾期任务</div>
              ) : (
                <Timeline items={timelineItems} />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
