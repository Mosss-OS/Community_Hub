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
import { useLanguage } from "@/hooks/use-language";

interface SermonSummary {
  id: number; title: string; speaker: string; date: string;
  topic: string | null; series: string | null; summary: string; keyPoints: string[];
}

export default function SermonsPage() {
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [filters, setFilters] = useState<SermonFilters>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [verseSearch, setVerseSearch] = useState("");
  const [showAISearch, setShowAISearch] = useState(false);
  const [sermonTopics, setSermonTopics] = useState<{ topics: string[]; series: string[]; speakers: string[] }>({ topics: [], series: [], speakers: [] });
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
    fetch("/api/sermons/topics").then(res => res.json()).then(data => setSermonTopics(data)).catch(err => console.error("Error fetching topics:", err));
  }, []);

  const handleAdvancedSearch = async () => {
    const params = new URLSearchParams();
    if (searchQuery) params.append("q", searchQuery);
    if (verseSearch) params.append("verse", verseSearch);
    const res = await fetch(`/api/sermons/search/advanced?${params}`);
    const data = await res.json();
  };

  const handleFilterChange = (key: keyof SermonFilters, value: string) => {
    if (value === "all" || !value) { const newFilters = { ...filters }; delete newFilters[key]; setFilters(newFilters); }
    else { setFilters({ ...filters, [key]: value }); }
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    if (value) { setFilters({ ...filters, search: value }); }
    else { const newFilters = { ...filters }; delete newFilters.search; setFilters(newFilters); }
  };

  const { data: filteredSermons } = useSermons(filters);

  const fetchRelatedSermons = async (sermonId: number) => {
    setLoadingRelated(true);
    try { const res = await fetch(`/api/sermons/${sermonId}/related`); setRelatedSermons(await res.json()); }
    catch (err) { console.error("Error fetching related sermons:", err); }
    finally { setLoadingRelated(false); }
  };

  const fetchSermonSummary = async (sermonId: number) => {
    setLoadingSummary(true);
    try { const res = await fetch(`/api/sermons/${sermonId}/summary`); setSermonSummary(await res.json()); }
    catch (err) { console.error("Error fetching summary:", err); }
    finally { setLoadingSummary(false); }
  };

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true); setShowRecommendations(true);
    try { const res = await fetch("/api/sermons/recommendations", { credentials: "include" }); setRecommendations(await res.json()); }
    catch (err) { console.error("Error fetching recommendations:", err); }
    finally { setLoadingRecommendations(false); }
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
    if (!allSermons) return sermonTopics.topics;
    const topics = allSermons.map(s => s.topic).filter((t): t is string => Boolean(t));
    return Array.from(new Set([...topics, ...sermonTopics.topics]));
  }, [allSermons, sermonTopics.topics]);

  return (
    <div className="min-h-screen bg-background pb-10 sm:pb-16 md:pb-24">
      {/* Hero */}
      <div className="relative py-10 sm:py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="orb orb-blue w-48 sm:w-72 h-48 sm:h-72 top-0 right-0 animate-float" />
        <div className="orb orb-purple w-32 sm:w-48 h-32 sm:h-48 bottom-0 left-20" style={{ animationDelay: '3s' }} />
        <div className="container px-4 sm:px-6 md:px-8 relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-5">
            <div>
              <span className="text-accent font-bold text-xs sm:text-sm uppercase tracking-wider mb-2 sm:mb-3 block">{t("listenAndLearn")}</span>
              <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white font-[--font-display] tracking-tight mb-2 sm:mb-3">{t("sermonLibrary")}</h1>
              <p className="text-xs sm:text-lg md:text-xl text-white/40 max-w-2xl">
                {t("sermonsDescription")}
              </p>
            </div>
            <div className="flex gap-2 sm:gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAISearch(!showAISearch)}
                className={`rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm border-white/10 ${showAISearch ? "gradient-accent text-primary-foreground border-transparent shadow-lg" : "text-white/60 glass-dark hover:text-white hover:bg-white/10"}`}
              >
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> {t("aiSearch")}
              </Button>
              {isAuthenticated && (
                <Button variant="outline" size="sm" onClick={fetchRecommendations} className="rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm border-white/10 text-white/60 glass-dark hover:text-white hover:bg-white/10">
                  <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" /> {t("forYou")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 sm:px-6 md:px-10 py-6 sm:py-10 md:py-14">
        {/* AI Search Panel */}
        {showAISearch && (
          <div className="mb-8 glass-card-strong rounded-3xl p-6 shimmer-border">
            <h3 className="text-xl font-bold flex items-center gap-2 font-[--font-display] mb-4">
              <Sparkles className="w-5 h-5 text-accent" /> {t("smartSearch")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground/70">{t("keywordSearch")}</label>
                <Input placeholder={t("searchByTopicPlaceholder")} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground/70">{t("bibleVerse")}</label>
                <Input placeholder="e.g., John 3:16" value={verseSearch} onChange={(e) => setVerseSearch(e.target.value)} className="rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm" />
              </div>
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground/70">{t("topic")}</label>
                <Select onValueChange={(value) => handleFilterChange("topic", value)}>
                  <SelectTrigger className="bg-card/50 rounded-2xl border-border/50 backdrop-blur-sm"><SelectValue placeholder={t("selectTopic")} /></SelectTrigger>
                  <SelectContent className="glass-card-strong border-border/30 shadow-2xl rounded-2xl">
                    {uniqueTopics.map((topic) => (<SelectItem key={topic} value={topic}>{topic}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <Button onClick={handleAdvancedSearch} className="rounded-2xl font-bold gradient-accent text-primary-foreground shadow-lg"><Search className="w-4 h-4 mr-2" /> {t("search")}</Button>
              <Button variant="outline" className="rounded-2xl font-bold border-border/50" onClick={() => { setSearchQuery(""); setVerseSearch(""); setFilters({}); }}>{t("clear")}</Button>
            </div>
          </div>
        )}

        {/* Recommendations Dialog */}
        <Dialog open={showRecommendations} onOpenChange={setShowRecommendations}>
          <DialogContent className="max-w-2xl rounded-3xl glass-card-strong border-border/20">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-[--font-display]"><Users className="w-5 h-5" /> {t("recommendedForYou")}</DialogTitle>
            </DialogHeader>
            {loadingRecommendations ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-h-96 overflow-y-auto">
                {recommendations.map(sermon => (
                  <div key={sermon.id} className="cursor-pointer glass-card hover:shadow-lg rounded-2xl transition-all p-5" onClick={() => { setShowRecommendations(false); window.location.href = `/sermons/${sermon.id}`; }}>
                    <h4 className="font-bold line-clamp-1">{sermon.title}</h4>
                    <p className="text-sm text-muted-foreground">{sermon.speaker}</p>
                    <p className="text-sm text-muted-foreground mt-1.5">{new Date(sermon.date).toLocaleDateString()}</p>
                  </div>
                ))}
                {recommendations.length === 0 && <p className="text-muted-foreground col-span-2 text-center py-6">{t("noRecommendations")}</p>}
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Filters */}
        <div className="flex flex-col gap-2 sm:gap-4 mb-6 sm:mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <Input placeholder={t("searchByTitleOrPastor")} className="pl-8 sm:pl-10 rounded-xl sm:rounded-2xl border-border/50 bg-card/50 backdrop-blur-sm h-9 sm:h-11 text-xs sm:text-sm" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} />
          </div>
          <div className="flex gap-2 sm:gap-4 overflow-x-auto">
          {[
            { key: "status" as const, placeholder: t("status"), options: [{ value: "all", label: t("allMessages") }, { value: "past", label: t("pastMessages") }, { value: "upcoming", label: t("upcomingMessages") }] },
            { key: "series" as const, placeholder: t("series"), options: [{ value: "all", label: t("allSeries") }, ...uniqueSeries.map(s => ({ value: s, label: s }))] },
            { key: "speaker" as const, placeholder: t("speaker"), options: [{ value: "all", label: t("allSpeakers") }, ...uniqueSpeakers.map(s => ({ value: s, label: s }))] },
            { key: "topic" as const, placeholder: t("topic"), options: [{ value: "all", label: t("allTopics") || "All Topics" }, ...uniqueTopics.map(t => ({ value: t, label: t }))] },
          ].map(({ key, placeholder, options }) => (
            <Select key={key} value={filters[key] || "all"} onValueChange={(value) => handleFilterChange(key, value)}>
              <SelectTrigger className="w-full sm:w-[180px] bg-card/50 rounded-xl sm:rounded-2xl border-border/50 h-9 sm:h-11 backdrop-blur-sm text-xs sm:text-sm"><SelectValue placeholder={placeholder} /></SelectTrigger>
              <SelectContent className="glass-card-strong border-border/30 shadow-2xl rounded-xl sm:rounded-2xl">
                {options.map(opt => <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-video rounded-3xl" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            filteredSermons?.map(sermon => (<SermonCard key={sermon.id} sermon={sermon} />))
          )}
        </div>

        {filteredSermons?.length === 0 && !isLoading && (
          <div className="text-center py-16">
            <BookOpen className="w-14 h-14 mx-auto text-muted-foreground/15 mb-4" />
            <h3 className="text-xl font-bold mb-2 font-[--font-display]">{t("noSermonsFound")}</h3>
            <p className="text-muted-foreground">{t("tryAdjustingSearch")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
