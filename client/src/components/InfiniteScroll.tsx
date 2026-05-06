import { ReactNode } from "react";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";
import { Skeleton } from "@/components/ui/skeleton";

interface InfiniteScrollProps {
  children: ReactNode;
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  className?: string;
  loaderClassName?: string;
}

export function InfiniteScroll({
  children,
  hasMore,
  isLoading,
  onLoadMore,
  className = "",
  loaderClassName = "",
}: InfiniteScrollProps) {
  const { containerRef, isFetching } = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore,
  });

  return (
    <div ref={containerRef} className={`overflow-auto ${className}`}>
      {children}
      {(isFetching || isLoading) && hasMore && (
        <div className={`space-y-3 p-4 ${loaderClassName}`}>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      )}
      {!hasMore && (
        <p className="text-center text-sm text-muted-foreground py-4">
          No more items to load
        </p>
      )}
    </div>
  );
}
