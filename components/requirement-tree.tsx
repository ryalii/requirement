"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Folder, 
  FolderOpen,
  GitBranch,
  Layers,
  ArrowRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Requirement, RequirementType } from "@/lib/types"

interface RequirementTreeNode {
  requirement: Requirement
  children?: RequirementTreeNode[]
}

interface RequirementTreeProps {
  data: RequirementTreeNode
  currentId?: string
  title?: string
}

const typeConfig: Record<RequirementType, { 
  color: string
  bgColor: string
  borderColor: string
  label: string
}> = {
  IR: { 
    color: "text-blue-700", 
    bgColor: "bg-blue-50", 
    borderColor: "border-blue-200",
    label: "原始需求"
  },
  SR: { 
    color: "text-emerald-700", 
    bgColor: "bg-emerald-50", 
    borderColor: "border-emerald-200",
    label: "系统需求"
  },
  AR: { 
    color: "text-amber-700", 
    bgColor: "bg-amber-50", 
    borderColor: "border-amber-200",
    label: "软件需求"
  },
}

const statusConfig: Record<string, string> = {
  "已完成": "bg-green-100 text-green-700",
  "进行中": "bg-blue-100 text-blue-700",
  "待分析": "bg-yellow-100 text-yellow-700",
  "已关闭": "bg-gray-100 text-gray-600",
}

interface TreeNodeProps {
  node: RequirementTreeNode
  level: number
  currentId?: string
  isLast?: boolean
}

function TreeNode({ node, level, currentId, isLast }: TreeNodeProps) {
  const [expanded, setExpanded] = React.useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isCurrentNode = node.requirement.id === currentId
  const config = typeConfig[node.requirement.type]

  return (
    <div className="relative">
      {/* 连接线 */}
      {level > 0 && (
        <>
          <div 
            className="absolute left-0 top-0 h-6 w-px bg-gray-300"
            style={{ left: `${(level - 1) * 28 + 16}px` }}
          />
          <div 
            className="absolute top-6 h-px bg-gray-300"
            style={{ 
              left: `${(level - 1) * 28 + 16}px`,
              width: '12px'
            }}
          />
          {!isLast && (
            <div 
              className="absolute top-6 bottom-0 w-px bg-gray-300"
              style={{ left: `${(level - 1) * 28 + 16}px` }}
            />
          )}
        </>
      )}
      
      <div
        className={cn(
          "flex items-center gap-2 py-2.5 px-3 rounded-lg transition-all cursor-pointer group",
          isCurrentNode 
            ? `${config.bgColor} ${config.borderColor} border-2 shadow-sm` 
            : "hover:bg-gray-50 border border-transparent"
        )}
        style={{ marginLeft: `${level * 28}px` }}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setExpanded(!expanded)
            }}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            {expanded ? (
              <ChevronDown className="size-4 text-gray-500" />
            ) : (
              <ChevronRight className="size-4 text-gray-500" />
            )}
          </button>
        ) : (
          <span className="w-6" />
        )}

        {hasChildren ? (
          expanded ? (
            <FolderOpen className={cn("size-5", config.color)} />
          ) : (
            <Folder className={cn("size-5", config.color)} />
          )
        ) : (
          <FileText className={cn("size-5", config.color)} />
        )}

        <Badge 
          variant="outline" 
          className={cn(
            "text-xs font-semibold px-2",
            config.bgColor,
            config.color,
            config.borderColor
          )}
        >
          {node.requirement.type}
        </Badge>

        <Link
          href={`/requirements/${node.requirement.id}`}
          className={cn(
            "text-sm hover:underline flex-1 transition-colors",
            isCurrentNode 
              ? `${config.color} font-semibold` 
              : "text-gray-700 hover:text-blue-600 group-hover:text-blue-600"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="font-medium">{node.requirement.code}</span>
          <span className="mx-1.5 text-gray-400">-</span>
          <span>{node.requirement.name}</span>
        </Link>

        <span
          className={cn(
            "text-xs px-2 py-1 rounded-md font-medium",
            statusConfig[node.requirement.status] || "bg-gray-100 text-gray-600"
          )}
        >
          {node.requirement.status}
        </span>
      </div>

      {hasChildren && expanded && (
        <div className="relative">
          {node.children?.map((child, index) => (
            <TreeNode
              key={child.requirement.id}
              node={child}
              level={level + 1}
              currentId={currentId}
              isLast={index === (node.children?.length ?? 0) - 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function RequirementTree({ data, currentId, title }: RequirementTreeProps) {
  // 统计各层级数量
  const countNodes = (node: RequirementTreeNode): Record<RequirementType, number> => {
    const counts: Record<RequirementType, number> = { IR: 0, SR: 0, AR: 0 }
    
    const traverse = (n: RequirementTreeNode) => {
      counts[n.requirement.type]++
      n.children?.forEach(traverse)
    }
    
    traverse(node)
    return counts
  }
  
  const stats = countNodes(data)

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4 border-b bg-gray-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <GitBranch className="size-5 text-blue-600" />
            {title || "需求分解结构"}
          </CardTitle>
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span className="text-gray-600">IR: {stats.IR}</span>
              </span>
              <ArrowRight className="size-3 text-gray-400" />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="text-gray-600">SR: {stats.SR}</span>
              </span>
              <ArrowRight className="size-3 text-gray-400" />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-gray-600">AR: {stats.AR}</span>
              </span>
            </div>
          </div>
        </div>
        {/* 层级说明 */}
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
          <Layers className="size-3.5" />
          <span>层级关系: </span>
          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">IR 原始需求</span>
          <ArrowRight className="size-3" />
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">SR 系统需求</span>
          <ArrowRight className="size-3" />
          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">AR 软件需求</span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-1">
          <TreeNode node={data} level={0} currentId={currentId} />
        </div>
      </CardContent>
    </Card>
  )
}
