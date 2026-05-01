import { Link } from "wouter";
import { format } from "date-fns";
import { Play, Calendar, User } from "lucide-react";
import { HiBookmark } from "react-icons/hi";
import type { Sermon } from "@/types/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { useState } from "react";

interface SermonCardProps {
  sermon: Sermon;
}

export function SermonCard({ sermon }: SermonCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(() => {
    if (typeof window !== "undefined") {
      const bookmarks = JSON.parse(localStorage.getItem("sermon_bookmarks") || "[]");
      return bookmarks.includes(sermon.id);
    }
    return false;
  });

  const toggleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const bookmarks = JSON.parse(localStorage.getItem("sermon_bookmarks") || "[]");
    let newBookmarks;
    
    if (bookmarks.includes(sermon.id)) {
      newBookmarks = bookmarks.filter((id: string) => id !== sermon.id);
    } else {
      newBookmarks = [...bookmarks, sermon.id];
    }
    
    localStorage.setItem("sermon_bookmarks", JSON.stringify(newBookmarks));
    setIsBookmarked(!isBookmarked);
  };

  return (
    <Link href={`/sermons/${sermon.id}`}>
      <motion.div
        whileHover={{ y: -6 }}
        transition={{ duration: 0.2 }}
        className="cursor-pointer relative"
      >
        <button
          onClick={toggleBookmark}
          className={`absolute top-2 right-2 z-10 p-2 rounded-full shadow-md ${
            isBookmarked ? "bg-primary text-white" : "bg-white/90 text-gray-600 hover:text-primary"
          }`}
        >
          <HiBookmark className="w-4 h-4" />
        </button>
        <Card className="group h-full overflow-hidden hover:shadow-md transition-all duration-300 border-border/50 rounded-none">
        <div className="relative aspect-video overflow-hidden bg-muted">
          {sermon.thumbnailUrl ? (
            <img 
              src={sermon.thumbnailUrl} 
              alt={sermon.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            // Fallback placeholder
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Play className="text-primary/40 w-12 h-12 md:w-14 md:h-14" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
              <Play className="w-5 h-5 md:w-6 md:h-6 text-primary ml-0.5" />
            </div>
          </div>
        </div>
        <CardContent className="p-4 sm:p-6 md:p-7">
          <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3 md:mb-4">
            <Badge variant="secondary" className="text-[10px] sm:text-xs md:text-sm font-normal">
              {sermon.series || "Sunday Service"}
            </Badge>
            <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground flex items-center gap-1">
              <Calendar className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
              {format(new Date(sermon.date), "MMM d, yyyy")}
            </span>
          </div>
          <h3 className="font-display font-bold text-sm sm:text-lg md:text-xl leading-tight mb-1.5 sm:mb-2 md:mb-3 group-hover:text-primary transition-colors">
            {sermon.title}
          </h3>
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 text-xs sm:text-sm md:text-base text-muted-foreground">
            <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4" />
            <span>{sermon.speaker}</span>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </Link>
  );
}
