import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, User, CheckCircle } from "lucide-react";
import type { PrayerRequest } from "@/types/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePrayForRequest, useMarkPrayerAnswered } from "@/hooks/use-prayer";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PrayerCardProps {
  request: PrayerRequest;
}

export function PrayerCard({ request }: PrayerCardProps) {
  const { mutate: pray, isPending: isPraying } = usePrayForRequest();
  const { mutate: markAnswered, isPending: isMarkingAnswered } = useMarkPrayerAnswered();
  const { user } = useAuth();
  const [hasPrayed, setHasPrayed] = useState(false);

  const isOwner = user?.id === request.userId;
  const canMarkAnswered = isOwner || user?.isAdmin;

  const handlePray = () => {
    if (hasPrayed) return;
    pray(request.id, {
      onSuccess: () => setHasPrayed(true),
    });
  };

  const handleMarkAnswered = () => {
    markAnswered(request.id);
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "h-full flex flex-col border-border/50 hover:shadow-md transition-shadow rounded-none",
        request.isAnswered && "border-green-200 bg-green-50/30"
      )}>
      <CardContent className="p-4 sm:p-8 flex-1">
        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={14} className="sm:hidden" />
            <User size={18} className="hidden sm:block" />
          </div>
          <div>
            <div className="font-semibold text-xs sm:text-base flex items-center gap-2">
              {request.isAnonymous ? "Anonymous" : (request.authorName || "Community Member")}
              {request.isAnswered && (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                  <CheckCircle size={10} className="sm:w-3 sm:h-3" />
                  Answered
                </span>
              )}
            </div>
            <div className="text-[10px] sm:text-sm text-muted-foreground">
              {request.isAnswered && request.answeredAt
                ? `Answered ${formatDistanceToNow(new Date(request.answeredAt), { addSuffix: true })}`
                : formatDistanceToNow(new Date(request.createdAt || new Date()), { addSuffix: true })}
            </div>
          </div>
        </div>
        <p className={cn(
          "leading-relaxed italic text-xs sm:text-base",
          request.isAnswered && "line-through text-muted-foreground"
        )}>
          "{request.content}"
        </p>
      </CardContent>
      <CardFooter className="p-3 sm:p-5 bg-secondary/30 border-t border-border/50 flex justify-between items-center">
        <div className="text-xs sm:text-base text-muted-foreground">
          <span className="font-semibold text-primary">{request.prayCount}</span> prayed
        </div>
        {canMarkAnswered && !request.isAnswered ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAnswered}
            disabled={isMarkingAnswered}
            className="gap-1.5 transition-all rounded-lg text-xs sm:text-sm text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300"
          >
            <CheckCircle size={14} />
            Mark Answered
          </Button>
        ) : (
          <Button 
            variant={hasPrayed ? "secondary" : "outline"} 
            size="sm" 
            onClick={handlePray}
            disabled={isPraying || hasPrayed || request.isAnswered}
            className={cn(
              "gap-1.5 transition-all rounded-lg text-xs sm:text-sm",
              hasPrayed && "text-destructive bg-destructive/10 hover:bg-destructive/20 border-destructive/20",
              request.isAnswered && "opacity-50"
            )}
          >
            <Heart size={14} className={cn(hasPrayed && "fill-current")} />
            {hasPrayed ? "Prayed" : "I Prayed"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
