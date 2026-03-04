import React, { useState, useMemo, useEffect } from "react";
import ReactPlayer from "react-player";
import { useSermons, type SermonFilters } from "@/hooks/use-sermons";
import { SermonCard } from "@/components/SermonCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Sparkles, BookOpen, Users, Lightbulb, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SermonSummary {
  id: number;
  title: string;
  speaker: string;
  date: string;
  topic: string | null;
  series: string | null;
  summary: string;
  keyPoints: string[];
}

export default function SermonsPage() {
  const { user, isAuthenticated } = useAuth();
  const [filters, setFilters] = useState<SermonFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [verseSearch, setVerseSearch] = useState("");
  const [showAISearch, setShowAISearch] = useState(false);
  const [sermonTopics, setSermonTopics] = useState<{ topics: string[]; series: string[]; speakers: string[] }>({
    topics: [], series: [], speakers: []
  });
  const [relatedSermons, setRelatedSermons] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [selectedSermon, setSelectedSermon] = useState<number | null>(null);
  const [sermonSummary, setSermonSummary] = useState<SermonSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const { data: allSermons, isLoading } = useSermons();

  useEffect(() => {
    fetch("/api/sermons/topics")
      .then(res => res.json())
      .then(data => setSermonTopics(data))
      .catch(err => console.error("Error fetching topics:", err));
  }, []);

  const handleAdvancedSearch = async () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("q", searchQuery);
    if (verseSearch) params.append("verse", verseSearch);
    
    const res = await fetch(`/api/sermons/search/advanced?${params}`);
    const data = await res.json();
  };

  const handleFilterChange = (key: keyof SermonFilters, value: string) => {
    if (value === "all" || !value) {
      const newFilters = { ...filters };
      delete newFilters[key];
      setFilters(newFilters);
    } else {
      setFilters({ ...filters, [key]: value });
    }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value) {
      setFilters({ ...filters, search: value });
    } else {
      const newFilters = { ...filters };
      delete newFilters.search;
      setFilters(newFilters);
    }
  };

  const { data: filteredSermons } = useSermons(filters);

  const fetchRelatedSermons = async (sermonId: number) => {
    setLoadingRelated(true);
    try {
      const res = await fetch(`/api/sermons/${sermonId}/related`);
      const data = await res.json();
      setRelatedSermons(data);
    } catch (err) {
      console.error("Error fetching related sermons:", err);
    } finally {
      setLoadingRelated(false);
    }
  };

  const fetchSermonSummary = async (sermonId: number) => {
    setLoadingSummary(true);
    try {
      const res = await fetch(`/api/sermons/${sermonId}/summary`);
      const data = await res.json();
      setSermonSummary(data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true);
    setShowRecommendations(true);
    try {
      const res = await fetch("/api/sermons/recommendations", {
        credentials: "include"
      });
      const data = await res.json();
      setRecommendations(data);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const uniqueSeries = useMemo(() => {
    if (!allSermons) return sermonTopics.series;
    const series = allSermons.map(s => s.series).filter((s): s is string => Boolean(s));
    return Array.from(new Set([...series, ...sermonTopics.series]));
  }, [allSermons, sermonTopics.series]);

  const uniqueSpeakers = useMemo(() => {
    if (!allSermons) return sermonTopics.speakers;
    const speakers = allSermons.map(s => s.speaker).filter((s): s is string => Boolean(s));
    return Array.from(new Set([...speakers, ...sermonTopics.speakers]));
  }, [allSermons, sermonTopics.speakers]);

  const uniqueTopics = useMemo(() => {
    return sermonTopics.topics;
  }, [sermonTopics.topics]);

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-24">
      {/* Header */}
      <div className="bg-secondary/30 py-16 md:py-24 border-b border-border">
        <div className="container px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
            <div>
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-3 md:mb-5">Sermon Library</h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Explore our collection of messages to help you grow in your faith journey.
              </p>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowAISearch(!showAISearch)}
                className={showAISearch ? "bg-primary text-primary-foreground" : ""}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                AI Search
              </Button>
              {isAuthenticated && (
                <Button variant="outline" onClick={fetchRecommendations}>
                  <Users className="w-4 h-4 mr-2" />
                  For You
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container px-6 md:px-10 py-10 md:py-14">
        {/* AI Search Panel */}
        {showAISearch && (
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Smart Search
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="text-sm font-medium mb-2 block">Keyword Search</label>
                  <Input 
                    placeholder="Search by topic, title, keyword..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Bible Verse</label>
                  <Input 
                    placeholder="e.g., John 3:16" 
                    value={verseSearch}
                    onChange={(e) => setVerseSearch(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Topic</label>
                  <Select onValueChange={(value) => handleFilterChange("topic", value)}>
                    <SelectTrigger className="bg-white">
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 shadow-xl">
                      {uniqueTopics.map((topic) => (
                        <SelectItem key={topic} value={topic}>{topic}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <Button onClick={handleAdvancedSearch}>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </Button>
                <Button variant="outline" onClick={() => {
                  setSearchQuery("");
                  setVerseSearch("");
                  setFilters({});
                }}>
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations Dialog */}
        <Dialog open={showRecommendations} onOpenChange={setShowRecommendations}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recommended For You
              </DialogTitle>
            </DialogHeader>
            {loadingRecommendations ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-96 overflow-y-auto">
                {recommendations.map(sermon => (
                  <Card key={sermon.id} className="cursor-pointer hover:bg-slate-50" onClick={() => {
                    setShowRecommendations(false);
                    window.location.href = `/sermons/${sermon.id}`;
                  }}>
                    <CardContent className="pt-5">
                      <h4 className="font-medium line-clamp-1">{sermon.title}</h4>
                      <p className="text-sm text-muted-foreground">{sermon.speaker}</p>
                      <p className="text-sm text-muted-foreground mt-1.5">
                        {new Date(sermon.date).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
                {recommendations.length === 0 && (
                  <p className="text-muted-foreground col-span-2 text-center py-6">
                    No recommendations available yet. Watch some sermons to get personalized suggestions!
                  </p>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-5 mb-8 md:mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Search by title or pastor name..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <Select value={filters.status || "all"} onValueChange={(value) => handleFilterChange("status", value)}>
            <SelectTrigger className="w-full md:w-[180px] lg:w-[200px] bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-xl">
              <SelectItem value="all">All Messages</SelectItem>
              <SelectItem value="past">Past Messages</SelectItem>
              <SelectItem value="upcoming">Upcoming Messages</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.series || "all"} onValueChange={(value) => handleFilterChange("series", value)}>
            <SelectTrigger className="w-full md:w-[180px] lg:w-[200px] bg-white">
              <SelectValue placeholder="Series" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-xl">
              <SelectItem value="all">All Series</SelectItem>
              {uniqueSeries.map((series) => (
                <SelectItem key={series} value={series}>{series}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filters.speaker || "all"} onValueChange={(value) => handleFilterChange("speaker", value)}>
            <SelectTrigger className="w-full md:w-[180px] lg:w-[200px] bg-white">
              <SelectValue placeholder="Speaker" />
            </SelectTrigger>
            <SelectContent className="bg-white border-gray-200 shadow-xl">
              <SelectItem value="all">All Speakers</SelectItem>
              {uniqueSpeakers.map((speaker) => (
                <SelectItem key={speaker} value={speaker}>{speaker}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-4 md:space-y-5">
                <Skeleton className="aspect-video rounded-xl" />
                <Skeleton className="h-6 md:h-7 w-3/4" />
                <Skeleton className="h-4 md:h-5 w-1/2" />
              </div>
            ))
          ) : (
            filteredSermons?.map(sermon => (
              <SermonCard key={sermon.id} sermon={sermon} />
            ))
          )}
        </div>

        {filteredSermons?.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <BookOpen className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No sermons found</h3>
            <p className="text-base text-muted-foreground">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
