import { Card, CardContent } from "./card"
import { Avatar, AvatarFallback } from "./avatar"

export function MessageSkeleton() {
  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar skeleton */}
          <div className="h-10 w-10 rounded-full bg-slate-800 animate-skeleton" />
          
          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            {/* Header line */}
            <div className="flex items-center gap-2">
              <div className="h-4 w-32 bg-slate-800 rounded animate-skeleton" />
              <div className="h-3 w-3 bg-slate-800 rounded animate-skeleton" />
            </div>
            
            {/* Title line */}
            <div className="h-5 w-24 bg-slate-800 rounded animate-skeleton" />
            
            {/* Content lines */}
            <div className="space-y-1.5">
              <div className="h-4 w-full bg-slate-800 rounded animate-skeleton" />
              <div className="h-4 w-4/5 bg-slate-800 rounded animate-skeleton" />
            </div>
          </div>
          
          {/* Timestamp skeleton */}
          <div className="h-3 w-16 bg-slate-800 rounded animate-skeleton" />
        </div>
      </CardContent>
    </Card>
  )
}

export function MessageSkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} />
      ))}
    </div>
  )
}

