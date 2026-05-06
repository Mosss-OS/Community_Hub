import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { buildApiUrl } from "@/lib/api-config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { LuMusic, LuPlay, LuPause, LuPlus, LuListMusic, LuDisc, LuClock, LuUser, LuSearch } from 'react-icons/lu';

interface MusicTrack {
  id: number;
  title: string;
  artist: string;
  album: string | null;
  duration: number;
  genreId: number | null;
  genreName: string | null;
  audioUrl: string | null;
  coverUrl: string | null;
  plays: number;
}

interface Playlist {
  id: number;
  name: string;
  description: string | null;
  userId: string;
  userName: string | null;
  trackCount: number;
  createdAt: string;
}

interface Genre {
  id: number;
  name: string;
}

async function fetchMusic(): Promise<MusicTrack[]> {
  const response = await fetch(buildApiUrl("/api/music"));
  if (!response.ok) throw new Error("Failed to fetch music");
  return response.json();
}

async function fetchPlaylists(): Promise<Playlist[]> {
  const response = await fetch(buildApiUrl("/api/music/playlists"));
  if (!response.ok) throw new Error("Failed to fetch playlists");
  return response.json();
}

async function fetchGenres(): Promise<Genre[]> {
  const response = await fetch(buildApiUrl("/api/music/genres"));
  if (!response.ok) throw new Error("Failed to fetch genres");
  return response.json();
}

async function createPlaylist(data: { name: string; description?: string }) {
  const response = await fetch(buildApiUrl("/api/music/playlists"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create playlist");
  return response.json();
}

async function addToPlaylist(playlistId: number, musicId: number) {
  const response = await fetch(buildApiUrl(`/api/music/playlists/${playlistId}/tracks`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ musicId }),
  });
  if (!response.ok) throw new Error("Failed to add track");
  return response.json();
}

export default function MusicPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: "", description: "" });

  const { data: music, isLoading: musicLoading } = useQuery({
    queryKey: ["music"],
    queryFn: fetchMusic,
  });

  const { data: playlists, isLoading: playlistsLoading } = useQuery({
    queryKey: ["music-playlists"],
    queryFn: fetchPlaylists,
  });

  const { data: genres } = useQuery({
    queryKey: ["music-genres"],
    queryFn: fetchGenres,
  });

  const createPlaylistMutation = useMutation({
    mutationFn: createPlaylist,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["music-playlists"] });
      setShowCreatePlaylist(false);
      setNewPlaylist({ name: "", description: "" });
      toast({ title: "Success", description: "Playlist created!" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create playlist", variant: "destructive" });
    },
  });

  const isAdmin = user?.isAdmin;

  const filteredMusic = music?.filter(track => 
    track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
    track.album?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (musicLoading || playlistsLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Music</h1>
          <p className="text-gray-600 mt-1">Worship music library and playlists</p>
        </div>
        
        {user && (
          <Dialog open={showCreatePlaylist} onOpenChange={setShowCreatePlaylist}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Create Playlist
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Playlist</DialogTitle>
                <DialogDescription>Create a custom playlist</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Playlist Name</label>
                  <Input
                    value={newPlaylist.name}
                    onChange={e => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
                    placeholder="My Favorite Worship Songs"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description (optional)</label>
                  <Input
                    value={newPlaylist.description}
                    onChange={e => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
                    placeholder="A collection of worship songs"
                  />
                </div>
                <Button
                  onClick={() => createPlaylistMutation.mutate(newPlaylist)}
                  disabled={createPlaylistMutation.isPending || !newPlaylist.name}
                  className="w-full"
                >
                  {createPlaylistMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Tabs defaultValue="songs" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="songs" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Songs
          </TabsTrigger>
          <TabsTrigger value="playlists" className="flex items-center gap-2">
            <ListMusic className="w-4 h-4" />
            Playlists
          </TabsTrigger>
          <TabsTrigger value="genres" className="flex items-center gap-2">
            <Disc className="w-4 h-4" />
            Genres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="songs">
          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              className="pl-10"
              placeholder="Search songs, artists, albums..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Songs Grid */}
          {filteredMusic.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Music className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  {searchQuery ? "No songs found matching your search." : "No worship songs available yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3">
              {filteredMusic.map((track, index) => (
                <Card key={track.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                      {playingId === track.id ? (
                        <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
                      ) : (
                        <span className="text-primary font-bold">{index + 1}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{track.title}</h3>
                      <p className="text-sm text-gray-500 truncate">{track.artist}</p>
                    </div>
                    {track.album && (
                      <Badge variant="outline" className="hidden md:flex">
                        {track.album}
                      </Badge>
                    )}
                    {track.genreName && (
                      <Badge variant="secondary" className="hidden lg:flex">
                        {track.genreName}
                      </Badge>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {formatDuration(track.duration)}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setPlayingId(playingId === track.id ? null : track.id)}
                    >
                      {playingId === track.id ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5" />
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="playlists">
          {(!playlists || playlists.length === 0) ? (
            <Card>
              <CardContent className="py-8 text-center">
                <ListMusic className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No playlists yet. Create one to get started!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
              {playlists.map(playlist => (
                <Card key={playlist.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                    <ListMusic className="w-16 h-16 text-primary" />
                  </div>
                  <CardHeader className="p-4">
                    <CardTitle className="text-lg">{playlist.name}</CardTitle>
                    <CardDescription>{playlist.trackCount} tracks</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="genres">
          {(!genres || genres.length === 0) ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Disc className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No genres available yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-wrap gap-3">
              {genres.map(genre => (
                <Badge key={genre.id} variant="outline" className="px-4 py-2 text-sm">
                  {genre.name}
                </Badge>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
