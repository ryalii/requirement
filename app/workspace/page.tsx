"use client"

import * as React from "react"
import { AdminLayout } from "@/components/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Calendar,
  Clock,
  AlertCircle,
  ArrowRight,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import { getUrgentRequirements, getWorkItems, createWorkItem, deleteWorkItem, type WorkItemVO } from "@/lib/api/workspace"
import type { RequirementVO } from "@/lib/api/requirements"
import { getMe } from "@/lib/api/auth"
import { cn } from "@/lib/utils"

// 工作安排类型
interface WorkItem {
  id: string
  title: string
  date: string
  type: "meeting" | "task" | "review"
  color: string
}

// 获取类型标签样式
function getTypeColor(type: string) {
  switch (type) {
    case "LMT":
      return "bg-purple-100 text-purple-700 border-purple-200"
    case "IR":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "SR":
      return "bg-green-100 text-green-700 border-green-200"
    case "AR":
      return "bg-orange-100 text-orange-700 border-orange-200"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200"
  }
}

// 获取优先级样式
function getPriorityBadge(priority: string) {
  switch (priority) {
    case "高":
      return <Badge variant="destructive" className="text-xs">高</Badge>
    case "中":
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-xs">中</Badge>
    case "低":
      return <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">低</Badge>
    default:
      return null
  }
}

// 获取工作项颜色
function getWorkItemColor(type: string) {
  switch (type) {
    case "meeting":
      return "bg-blue-500"
    case "task":
      return "bg-green-500"
    case "review":
      return "bg-purple-500"
    default:
      return "bg-gray-500"
  }
}

export default function WorkspacePage() {
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [workItems, setWorkItems] = React.useState<WorkItem[]>([])
  const [urgentRequirements, setUrgentRequirements] = React.useState<RequirementVO[]>([])
  const [loading, setLoading] = React.useState(true)
  const [workItemsLoading, setWorkItemsLoading] = React.useState(true)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [currentUser, setCurrentUser] = React.useState<{email: string} | null>(null)
  const [newWorkItem, setNewWorkItem] = React.useState({
    title: "",
    date: formatDateString(new Date()),
    type: "task" as const,
  })

  React.useEffect(() => {
    let active = true

    async function fetchData() {
      try {
        // 获取当前用户信息
        const userInfo = await getMe()
        if (active) {
          setCurrentUser(userInfo)
        }

        // 获取紧急需求
        const urgentData = await getUrgentRequirements(8)
        if (active) {
          setUrgentRequirements(urgentData)
        }

        // 获取工作安排
        const workItemsData = await getWorkItems()
        if (active) {
          setWorkItems(workItemsData.map(item => ({
            id: item.id.toString(),
            title: item.title,
            date: item.date,
            type: item.type,
            color: item.color,
          })))
        }
      } catch (error) {
        console.error("获取数据失败", error)
      } finally {
        if (active) {
          setLoading(false)
          setWorkItemsLoading(false)
        }
      }
    }

    fetchData()
    return () => {
      active = false
    }
  }, [])

  // 日历相关函数
  function getDaysInMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  function getFirstDayOfMonth(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  function formatDateString(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
  }

  function addDays(date: Date, days: number) {
    const result = new Date(date)
    result.setDate(result.getDate() + days)
    return result
  }

  function prevMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  function nextMonth() {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  function goToToday() {
    setCurrentDate(new Date())
  }

  // 获取某一天的工作安排
  function getWorkItemsForDate(date: string) {
    return workItems.filter((item) => item.date === date)
  }

  // 添加工作安排
  async function handleAddWorkItem() {
    if (!newWorkItem.title.trim() || !currentUser) return

    try {
      const item = await createWorkItem({
        title: newWorkItem.title,
        date: newWorkItem.date,
        type: newWorkItem.type,
        color: getWorkItemColor(newWorkItem.type),
        creator: currentUser.email,
      })

      setWorkItems([...workItems, {
        id: item.id.toString(),
        title: item.title,
        date: item.date,
        type: item.type,
        color: item.color,
      }])
      setNewWorkItem({ title: "", date: formatDateString(new Date()), type: "task" })
      setDialogOpen(false)
    } catch (error) {
      console.error("添加工作安排失败", error)
    }
  }

  // 删除工作安排
  async function handleDeleteWorkItem(id: string) {
    try {
      await deleteWorkItem(id)
      setWorkItems(workItems.filter((item) => item.id !== id))
    } catch (error) {
      console.error("删除工作安排失败", error)
    }
  }

  // 计算日历需要的天数
  const daysInMonth = getDaysInMonth(currentDate)
  const firstDay = getFirstDayOfMonth(currentDate)
  const today = formatDateString(new Date())

  // 生成日历格子
  const calendarDays = []
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null)
  }
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i)
  }

  const weekDays = ["日", "一", "二", "三", "四", "五", "六"]
  const monthNames = [
    "一月", "二月", "三月", "四月", "五月", "六月",
    "七月", "八月", "九月", "十月", "十一月", "十二月"
  ]

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 面包屑 */}
        <div className="mb-6">
          <nav className="text-sm text-gray-500">
            <span>工作台</span>
          </nav>
          <h1 className="text-2xl font-semibold mt-2">工作台</h1>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* 日历区域 */}
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <Calendar className="size-5 text-blue-600" />
                工作日历
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={goToToday}>
                  今天
                </Button>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="size-4 mr-1" />
                      添加安排
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>添加工作安排</DialogTitle>
                      <DialogDescription>
                        添加一个新的工作安排到日历中
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>标题</Label>
                        <Input
                          placeholder="输入工作安排标题"
                          value={newWorkItem.title}
                          onChange={(e) =>
                            setNewWorkItem({ ...newWorkItem, title: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>日期</Label>
                        <Input
                          type="date"
                          value={newWorkItem.date}
                          onChange={(e) =>
                            setNewWorkItem({ ...newWorkItem, date: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>类型</Label>
                        <Select
                          value={newWorkItem.type}
                          onValueChange={(value: "meeting" | "task" | "review" | "deadline") =>
                            setNewWorkItem({ ...newWorkItem, type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="meeting">会议</SelectItem>
                            <SelectItem value="task">任务</SelectItem>
                            <SelectItem value="review">评审</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>
                        取消
                      </Button>
                      <Button
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={handleAddWorkItem}
                      >
                        添加
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* 月份导航 */}
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="size-5" />
                </Button>
                <span className="text-lg font-medium">
                  {currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}
                </span>
                <Button variant="ghost" size="icon" onClick={nextMonth}>
                  <ChevronRight className="size-5" />
                </Button>
              </div>

              {/* 星期标题 */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                  <div
                    key={day}
                    className="text-center text-sm font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* 日历格子 */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  if (day === null) {
                    return <div key={`empty-${index}`} className="h-24" />
                  }

                  const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                  const dayWorkItems = getWorkItemsForDate(dateStr)
                  const isToday = dateStr === today

                  return (
                    <div
                      key={day}
                      className={cn(
                        "h-24 p-1 border rounded-md overflow-hidden",
                        isToday ? "bg-blue-50 border-blue-300" : "border-gray-200 hover:bg-gray-50"
                      )}
                    >
                      <div
                        className={cn(
                          "text-sm font-medium mb-1",
                          isToday ? "text-blue-600" : "text-gray-700"
                        )}
                      >
                        {day}
                      </div>
                      <div className="space-y-0.5 overflow-y-auto max-h-16">
                        {dayWorkItems.slice(0, 3).map((item) => (
                          <div
                            key={item.id}
                            className={cn(
                              "text-xs text-white px-1 py-0.5 rounded truncate group relative",
                              item.color
                            )}
                            title={item.title}
                          >
                            {item.title}
                          </div>
                        ))}
                        {dayWorkItems.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{dayWorkItems.length - 3} 更多
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* 工作安排列表 */}
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">我的工作安排</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {workItemsLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : workItems.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">暂无工作安排</p>
                  ) : (
                    workItems
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between p-2 rounded-md bg-gray-50 hover:bg-gray-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn("size-3 rounded-full", item.color)} />
                            <div>
                              <p className="text-sm font-medium">{item.title}</p>
                              <p className="text-xs text-gray-500">{item.date}</p>
                            </div>
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="size-8 text-gray-400 hover:text-red-500">
                                <Trash2 className="size-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>确认删除</AlertDialogTitle>
                                <AlertDialogDescription>
                                  确定要删除工作安排 "{item.title}" 吗？此操作无法撤销。
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>取消</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDeleteWorkItem(item.id)}
                                >
                                  删除
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 近期需求 */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center gap-2">
                <AlertCircle className="size-5 text-orange-500" />
                近期待处理需求
              </CardTitle>
              <p className="text-sm text-gray-500">按优先级和截止日期排序</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </div>
              ) : urgentRequirements.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">暂无紧急需求</div>
              ) : (
                <div className="space-y-3">
                  {urgentRequirements.map((req) => {
                    const daysLeft = Math.ceil(
                      (new Date(req.expectedDate).getTime() - new Date().getTime()) /
                        (1000 * 60 * 60 * 24)
                    )
                    const isOverdue = daysLeft < 0
                    const isUrgent = daysLeft >= 0 && daysLeft <= 7

                    return (
                      <Link
                        key={req.id}
                        href={`/requirements/${req.id}`}
                        className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <Badge
                            variant="outline"
                            className={cn("text-xs shrink-0", getTypeColor(req.type))}
                          >
                            {req.type}
                          </Badge>
                          {getPriorityBadge(req.priority)}
                        </div>
                        <p className="text-sm font-medium text-gray-900 mb-1 line-clamp-1">
                          {req.name}
                        </p>
                        <p className="text-xs text-gray-500 mb-2">{req.code}</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1 text-xs">
                            <Clock className="size-3" />
                            <span
                              className={cn(
                                isOverdue
                                  ? "text-red-600 font-medium"
                                  : isUrgent
                                  ? "text-orange-600"
                                  : "text-gray-500"
                              )}
                            >
                              {isOverdue
                                ? `已逾期 ${Math.abs(daysLeft)} 天`
                                : daysLeft === 0
                                ? "今天截止"
                                : `${daysLeft} 天后截止`}
                            </span>
                          </div>
                          <ArrowRight className="size-4 text-gray-400" />
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}

              <Link
                href="/requirements"
                className="mt-4 flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                查看全部需求
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}
