import { usePrayerRequests } from "@/hooks/use-prayer";
import { PrayerCard } from "@/components/PrayerCard";
import { CreatePrayerDialog } from "@/components/CreatePrayerDialog";
import { Skeleton } from "@/components/ui/skeleton";

export default function PrayerPage() {
  const { data: requests, isLoading } = usePrayerRequests();

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-24">
      <div className="bg-secondary/30 py-16 md:py-24 border-b border-border">
        <div className="container px-6 md:px-8 text-center">
          <span className="text-primary font-semibold tracking-wider uppercase text-sm md:text-base mb-3 block">Prayer Wall</span>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-5 md:mb-8">How Can We Pray For You?</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 md:mb-10">
            Share your request with our community. We believe that prayer changes things.
          </p>
          <CreatePrayerDialog />
        </div>
      </div>

      <div className="container px-6 md:px-10 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-56 md:h-72 w-full rounded-xl" />
            ))
          ) : (
            requests?.map(request => (
              <PrayerCard key={request.id} request={request} />
            ))
          )}
        </div>
        
        {requests?.length === 0 && (
          <div className="text-center py-16 md:py-24 text-muted-foreground">
            <p className="text-lg md:text-xl">No prayer requests yet. Be the first to share.</p>
          </div>
        )}
      </div>
    </div>
  );
}
