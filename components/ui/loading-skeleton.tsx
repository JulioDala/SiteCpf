// components/ui/loading-skeleton.tsx
import { Skeleton } from "@/components/ui/skeleton"

interface LoadingSkeletonProps {
  rows?: number
  columns?: number
  rowHeight?: string
  rowWidth?: string
}

export function LoadingSkeleton({
  rows = 3,
  columns = 2,
  rowHeight = "h-4",
  rowWidth = " w-28"
}: LoadingSkeletonProps) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex justify-between items-center p-3 bg-muted rounded-lg"
        >
          {Array.from({ length: columns }).map((_, j) => (
            <Skeleton key={j} className={`${rowHeight} ${rowWidth}`} />
          ))}
        </div>
      ))}
    </div>
  )
}
