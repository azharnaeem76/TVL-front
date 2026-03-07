'use client';

export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-white/[0.06] rounded-lg ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="card-court animate-pulse">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 !rounded-full" />
            <Skeleton className="h-5 w-16 !rounded-full" />
            <Skeleton className="h-5 w-12 !rounded-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-8 !rounded-lg flex-shrink-0" />
      </div>
    </div>
  );
}

export function SearchResultsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-5 w-16 !rounded-full" />
      </div>
      <div className="court-panel p-6 space-y-3">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 !rounded-lg" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="h-5 w-36" />
      <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ChatMessageSkeleton() {
  return (
    <div className="flex justify-start">
      <div className="court-panel rounded-2xl rounded-bl-md px-5 py-4 max-w-[80%] space-y-2 animate-pulse">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-brass-400/10">
          <Skeleton className="h-3.5 w-3.5 !rounded" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-4/6" />
      </div>
    </div>
  );
}

export function CaseLawsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
