import { useState, useEffect } from "react";
import Link from "wouter";
import { SermonCard } from "@/components/SermonCard";
import { EmptyState } from "@/components/EmptyState";
import { HiBookmark } from "react-icons/hi";

interface Sermon {
  id: string;
  title: string;
  description: string | null;
  speaker: string | null;
  series: string | null;
  thumbnailUrl: string | null;
  duration: number | null;
  createdAt: string;
  videoUrl: string | null;
  audioUrl: string | null;
}

export default function BookmarksPage() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("sermon_bookmarks") || "[]");
    setBookmarkedIds(ids);

    const fetchBookmarkedSermons = async () => {
      try {
        const res = await fetch("/api/sermons");
        const data = await res.json();
        const sermonsArray = data.sermons || data || [];
        setSermons(sermonsArray.filter((s: Sermon) => ids.includes(s.id)));
      } catch (err) {
        console.error("Error fetching sermons:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedSermons();
  }, []);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (sermons.length === 0) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>
        <EmptyState
          title="No bookmarks yet"
          description="Bookmark sermons to watch them later. Click the bookmark icon on any sermon to save it here."
          icon={<HiBookmark className="w-12 h-12" />}
          actionLabel="Browse Sermons"
          actionHref="/sermons"
        />
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Bookmarks</h1>
          <p className="text-muted-foreground mt-1">
            {sermons.length} saved sermon{sermons.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sermons.map((sermon) => (
          <SermonCard key={sermon.id} sermon={sermon} />
        ))}
      </div>
    </div>
  );
}