import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonCardProps {
  className?: string;
}

export function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={`bg-card border rounded-card p-4 ${className}`}>
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2 mb-4" />
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

export function SkeletonList({ count = 3, type = "card" }: { count?: number; type?: "card" | "item" | "table" }) {
  if (type === "item") {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-card border rounded-lg">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === "table") {
    return (
      <div className="space-y-2">
        <div className="flex gap-4 p-3 bg-muted/50 rounded-lg">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex gap-4 p-3 border rounded-lg">
            {Array.from({ length: 5 }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} className="h-48" />
      ))}
    </div>
  );
}

export function SkeletonProfile() {
  return (
    <div className="flex items-center gap-4 p-4 bg-card border rounded-lg">
      <Skeleton className="h-16 w-16 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  );
}

export function SkeletonEventCard() {
  return (
    <div className="bg-card border rounded-card overflow-hidden">
      <Skeleton className="h-40 w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function SkeletonSermonCard() {
  return (
    <div className="bg-card border rounded-card overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  );
}
