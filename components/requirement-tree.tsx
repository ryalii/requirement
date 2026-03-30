"use client"

import * as React from "react"
import Link from "next/link"
import { ChevronRight, ChevronDown, FileText, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import type { Requirement, RequirementType } from "@/lib/types"

interface RequirementTreeNode {
  requirement: Requirement
  children?: RequirementTreeNode[]
}

interface RequirementTreeProps {
  data: RequirementTreeNode
  currentId?: string
}

const typeColors: Record<RequirementType, string> = {
  IR: "bg-blue-100 text-blue-700 border-blue-200",
  SR: "bg-green-100 text-green-700 border-green-200",
  AR: "bg-orange-100 text-orange-700 border-orange-200",
}

interface TreeNodeProps {
  node: RequirementTreeNode
  level: number
  currentId?: string
}

function TreeNode({ node, level, currentId }: TreeNodeProps) {
  const [expanded, setExpanded] = React.useState(true)
  const hasChildren = node.children && node.children.length > 0
  const isCurrentNode = node.requirement.id === currentId

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-md hover:bg-gray-100 transition-colors cursor-pointer",
          isCurrentNode && "bg-blue-50 border border-blue-200"
        )}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
      >
        {hasChildren ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-0.5 hover:bg-gray-200 rounded"
          >
            {expanded ? (
              <ChevronDown className="size-4 text-gray-500" />
            ) : (
              <ChevronRight className="size-4 text-gray-500" />
            )}
          </button>
        ) : (
          <span className="w-5" />
        )}

        {hasChildren ? (
          expanded ? (
            <FolderOpen className="size-4 text-yellow-500" />
          ) : (
            <Folder className="size-4 text-yellow-500" />
          )
        ) : (
          <FileText className="size-4 text-gray-400" />
        )}

        <Badge variant="outline" className={cn("text-xs", typeColors[node.requirement.type])}>
          {node.requirement.type}
        </Badge>

        <Link
          href={`/requirements/${node.requirement.id}`}
          className={cn(
            "text-sm hover:text-blue-600 hover:underline flex-1",
            isCurrentNode ? "text-blue-600 font-medium" : "text-gray-700"
          )}
        >
          {node.requirement.code} - {node.requirement.name}
        </Link>

        <span
          className={cn(
            "text-xs px-2 py-0.5 rounded",
            node.requirement.status === "已完成"
              ? "bg-green-100 text-green-600"
              : node.requirement.status === "进行中"
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-600"
          )}
        >
          {node.requirement.status}
        </span>
      </div>

      {hasChildren && expanded && (
        <div className="border-l border-gray-200 ml-6">
          {node.children?.map((child) => (
            <TreeNode
              key={child.requirement.id}
              node={child}
              level={level + 1}
              currentId={currentId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function RequirementTree({ data, currentId }: RequirementTreeProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <Folder className="size-4 text-yellow-500" />
        需求树结构
      </h3>
      <div className="space-y-1">
        <TreeNode node={data} level={0} currentId={currentId} />
      </div>
    </div>
  )
}
