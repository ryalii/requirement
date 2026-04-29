"use client"

import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  title = "加载失败",
  message = "出现了一些问题，请稍后重试",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <div className="p-4 rounded-full bg-destructive/10 mb-4">
        <AlertCircle className="size-8 text-destructive" />
      </div>
      <h3 className="text-base font-medium text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" className="mt-4 gap-1" onClick={onRetry}>
          <RefreshCw className="size-3" />重试
        </Button>
      )}
    </div>
  )
}
