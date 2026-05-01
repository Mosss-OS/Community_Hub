import { useState, useEffect } from "react";
import Link from "wouter";
import { SermonCard } from "@/components/SermonCard";
import { EmptyState } from "@/components/EmptyState";
import { HiBookmark, HiFolder, HiPlus } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

interface BookmarkWithFolder {
  id: string;
  folder: string;
}

const FOLDER_COLORS = ["#8B0000", "#2563eb", "#7c3aed", "#059669", "#d97706"];

export default function BookmarksPage() {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [folders, setFolders] = useState<string[]>(() => {
    const saved = localStorage.getItem("bookmark_folders");
    return saved ? JSON.parse(saved) : ["Uncategorized", "Sermons", "Devotionals", "Study Materials"];
  });
  const [selectedFolder, setSelectedFolder] = useState("All");
  const [newFolderName, setNewFolderName] = useState("");
  const [showAddFolder, setShowAddFolder] = useState(false);

  useEffect(() => {
    localStorage.setItem("bookmark_folders", JSON.stringify(folders));
  }, [folders]);

  useEffect(() => {
    const ids = JSON.parse(localStorage.getItem("sermon_bookmarks") || "[]");
    setBookmarkedIds(ids);

    const fetchBookmarkedSermons = async () => {
      try {
        const res = await fetch("/api/sermons");
        const data = await res.json();
        const sermonsArray = data.sermons || data || [];
        setSermons(sermonsArray.filter((s: Sermon) => ids.some((b: any) => b.id === s.id || b === s.id)));
      } catch (err) {
        console.error("Error fetching sermons:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookmarkedSermons();
  }, []);

  const getBookmarkFolder = (sermonId: string) => {
    const bookmarks = JSON.parse(localStorage.getItem("sermon_bookmarks") || "[]");
    const bookmark = bookmarks.find((b: any) => b.id === sermonId || b === sermonId);
    return bookmark?.folder || "Uncategorized";
  };

  const updateBookmarkFolder = (sermonId: string, folder: string) => {
    const bookmarks = JSON.parse(localStorage.getItem("sermon_bookmarks") || "[]");
    const newBookmarks = bookmarks.map((b: any) => {
      if (typeof b === 'string' && b === sermonId) {
        return { id: b, folder };
      } else if (b.id === sermonId) {
        return { ...b, folder };
      }
      return b;
    });
    localStorage.setItem("sermon_bookmarks", JSON.stringify(newBookmarks));
    setBookmarkedIds(newBookmarks);
  };

  const addFolder = () => {
    if (!newFolderName.trim()) return;
    setFolders([...folders, newFolderName.trim()]);
    setNewFolderName("");
    setShowAddFolder(false);
  };

  const filteredSermons = selectedFolder === "All" 
    ? sermons 
    : sermons.filter(s => getBookmarkFolder(s.id) === selectedFolder);

  if (loading) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-8">My Bookmarks</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Bookmarks</h1>
          <p className="text-muted-foreground mt-1">
            {filteredSermons.length} saved sermon{filteredSermons.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowAddFolder(!showAddFolder)}
          className="rounded-2xl"
        >
          <HiPlus className="w-4 h-4 mr-2" />
          Add Folder
        </Button>
      </div>

      {showAddFolder && (
        <div className="mb-6 p-4 bg-muted/50 rounded-xl flex items-center gap-2">
          <Input
            placeholder="Folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            className="rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && addFolder()}
          />
          <Button onClick={addFolder} size="sm" className="rounded-lg">Add</Button>
          <Button onClick={() => setShowAddFolder(false)} variant="ghost" size="sm">Cancel</Button>
        </div>
      )}

      <div className="flex gap-2 mb-6 flex-wrap">
        <button
          onClick={() => setSelectedFolder("All")}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selectedFolder === "All" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          All
        </button>
        {folders.map((folder, index) => (
          <button
            key={folder}
            onClick={() => setSelectedFolder(folder)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
              selectedFolder === folder 
                ? "bg-primary text-primary-foreground" 
                : "bg-muted hover:bg-muted/80"
            }`}
          >
            <HiFolder className="w-3 h-3" style={{ color: FOLDER_COLORS[index % FOLDER_COLORS.length] }} />
            {folder}
          </button>
        ))}
      </div>

      {filteredSermons.length === 0 ? (
        <EmptyState
          title="No bookmarks yet"
          description="Bookmark sermons to watch them later. Click the bookmark icon on any sermon to save it here."
          icon={<HiBookmark className="w-12 h-12" />}
          actionLabel="Browse Sermons"
          actionHref="/sermons"
        />
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSermons.map((sermon) => (
            <div key={sermon.id} className="relative">
              <SermonCard sermon={sermon} />
              <select
                value={getBookmarkFolder(sermon.id)}
                onChange={(e) => updateBookmarkFolder(sermon.id, e.target.value)}
                className="absolute top-2 right-2 text-xs bg-background/90 rounded border px-2 py-1"
              >
                {folders.map(folder => (
                  <option key={folder} value={folder}>{folder}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}