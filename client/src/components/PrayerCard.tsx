import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { Heart, User } from "lucide-react";
import type { PrayerRequest } from "@/types/api";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { usePrayForRequest } from "@/hooks/use-prayer";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PrayerCardProps {
  request: PrayerRequest;
}

export function PrayerCard({ request }: PrayerCardProps) {
  const { mutate: pray, isPending } = usePrayForRequest();
  const [hasPrayed, setHasPrayed] = useState(false);

  const handlePray = () => {
    if (hasPrayed) return;
    pray(request.id, {
      onSuccess: () => setHasPrayed(true),
    });
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="h-full flex flex-col border-border/50 hover:shadow-md transition-shadow rounded-none">
      <CardContent className="p-8 flex-1">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={18} />
          </div>
          <div>
            <div className="font-semibold text-base">
              {request.isAnonymous ? "Anonymous" : (request.authorName || "Community Member")}
            </div>
            <div className="text-sm text-muted-foreground">
              {formatDistanceToNow(new Date(request.createdAt || new Date()), { addSuffix: true })}
            </div>
          </div>
        </div>
        <p className="text-foreground/90 leading-relaxed italic text-base">
          "{request.content}"
        </p>
      </CardContent>
      <CardFooter className="p-5 bg-secondary/30 border-t border-border/50 flex justify-between items-center">
        <div className="text-base text-muted-foreground">
          <span className="font-semibold text-primary">{request.prayCount}</span> prayed
        </div>
        <Button 
          variant={hasPrayed ? "secondary" : "outline"} 
          size="sm" 
          onClick={handlePray}
          disabled={isPending || hasPrayed}
          className={cn(
            "gap-2 transition-all rounded-lg",
            hasPrayed && "text-destructive bg-destructive/10 hover:bg-destructive/20 border-destructive/20"
          )}
        >
          <Heart size={16} className={cn(hasPrayed && "fill-current")} />
          {hasPrayed ? "Prayed" : "I Prayed"}
        </Button>
      </CardFooter>
    </Card>
    </motion.div>
  );
}
