import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { LuBookOpen, LuLoader2, LuCalendar, LuChevronRight, LuClock, LuTarget, LuPlus, LuSparkles, LuCheckCircle2, LuArrowLeft } from 'react-icons/lu';
import { buildApiUrl } from "@/lib/api-config";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {};
  const token = localStorage.getItem('auth_token');
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

interface DailyDevotional {
  id: number; title: string; content: string; author: string | null;
  bibleVerse: string | null; theme: string | null; imageUrl: string | null; publishDate: string;
}

interface BibleReadingPlan {
  id: number; title: string; description: string | null; duration: number;
  imageUrl: string | null; isActive: boolean;
}

interface ReadingProgress {
  id: number; dayNumber: number; completed: boolean; completedAt: string | null;
}

export default function DevotionalsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [todayDevotional, setTodayDevotional] = useState<DailyDevotional | null>(null);
  const [devotionals, setDevotionals] = useState<DailyDevotional[]>([]);
  const [readingPlans, setReadingPlans] = useState<BibleReadingPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<BibleReadingPlan | null>(null);
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevotionalId, setSelectedDevotionalId] = useState<number | null>(null);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [newDevotional, setNewDevotional] = useState({ title: "", content: "", author: "", bibleVerse: "", theme: "", publishDate: "" });
  const [aiPrompt, setAiPrompt] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const isAdmin = user?.isAdmin;

  useEffect(() => {
    async function fetchData() {
      try {
        const authHeaders = getAuthHeaders();
        const [devotionalRes, plansRes] = await Promise.all([
          fetch(buildApiUrl("/api/devotionals?published=true"), { credentials: "include", headers: authHeaders }),
          fetch(buildApiUrl("/api/reading-plans?active=true"), { credentials: "include", headers: authHeaders }),
        ]);
        if (devotionalRes.ok) {
          const devotionalData = await devotionalRes.json();
          setDevotionals(devotionalData);
          if (devotionalData.length > 0) { setTodayDevotional(devotionalData[0]); setSelectedDevotionalId(devotionalData[0].id); }
        }
        if (plansRes.ok) {
          const plansData = await plansRes.json();
          setReadingPlans(plansData);
          if (plansData.length > 0) setSelectedPlan(plansData[0]);
        }
      } catch (err) { console.error("Error fetching data:", err); }
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (!user || !selectedPlan) return;
    async function fetchProgress() {
      if (!selectedPlan) return;
      try {
        const res = await fetch(buildApiUrl(`/api/reading-plans/${selectedPlan.id}/progress`), { credentials: "include", headers: getAuthHeaders() });
        if (res.ok) setProgress(await res.json());
      } catch (err) { console.error("Error fetching progress:", err); }
    }
    fetchProgress();
  }, [user, selectedPlan]);

  const markDayComplete = async (dayNumber: number) => {
    if (!user || !selectedPlan) return;
    try {
      const res = await fetch(buildApiUrl(`/api/reading-plans/${selectedPlan.id}/progress`), {
        method: "POST", headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
        credentials: "include", body: JSON.stringify({ dayNumber }),
      });
      if (res.ok) {
        const newProgress = await res.json();
        setProgress([...progress.filter(p => p.dayNumber !== dayNumber), newProgress]);
      }
    } catch (err) { console.error("Error marking day complete:", err); }
  };

  const completedDays = progress.filter(p => p.completed).length;
  const progressPercentage = selectedPlan ? Math.round((completedDays / selectedPlan.duration) * 100) : 0;

  const createDevotional = async () => {
    if (!newDevotional.title || !newDevotional.content) {
      toast({ title: "Error", description: "Title and content are required", variant: "destructive" });
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch(buildApiUrl("/api/devotionals"), { method: "POST", headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify(newDevotional) });
      if (res.ok) {
        toast({ title: "Success", description: "Devotional created successfully!" });
        setShowCreateDialog(false);
        setNewDevotional({ title: "", content: "", author: "", bibleVerse: "", theme: "", publishDate: "" });
        const devotionalRes = await fetch(buildApiUrl("/api/devotionals?published=true"), { headers: getAuthHeaders() });
        if (devotionalRes.ok) setDevotionals(await devotionalRes.json());
      }
    } catch (err) { toast({ title: "Error", description: "Failed to create devotional", variant: "destructive" }); }
    finally { setIsCreating(false); }
  };

  const generateWithAI = async () => {
    if (!aiPrompt) { toast({ title: "Error", description: "Please enter a topic or theme", variant: "destructive" }); return; }
    setIsGenerating(true);
    try {
      const res = await fetch(buildApiUrl("/api/devotionals/ai-generate"), { method: "POST", headers: { ...getAuthHeaders(), "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ prompt: aiPrompt }) });
      if (res.ok) {
        const data = await res.json();
        setNewDevotional({ title: data.title || "", content: data.content || "", author: data.author || "", bibleVerse: data.bibleVerse || "", theme: data.theme || "", publishDate: data.publishDate || "" });
        toast({ title: "Success", description: "Devotional generated! You can edit before saving." });
        setShowAIDialog(false);
        setShowCreateDialog(true);
      } else { toast({ title: "Error", description: "Failed to generate devotional", variant: "destructive" }); }
    } catch (err) { toast({ title: "Error", description: "Failed to generate devotional", variant: "destructive" }); }
    finally { setIsGenerating(false); }
  };

  const selectedDevotional = devotionals.find(d => d.id === selectedDevotionalId) || todayDevotional;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 gradient-hero" />
        <div className="orb orb-purple w-72 h-72 top-0 right-0 animate-float" />
        <div className="orb orb-blue w-48 h-48 bottom-0 left-20" style={{ animationDelay: '2s' }} />
        <div className="container px-6 md:px-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="text-accent font-bold text-sm uppercase tracking-wider mb-3 block">Daily Word</span>
              <h1 className="text-3xl md:text-5xl font-bold text-white font-[--font-display] tracking-tight mb-3">Daily Devotionals</h1>
              <p className="text-white/40 text-lg">Grow in your faith with daily reflections and Bible reading plans</p>
            </div>
            {isAdmin && (
              <div className="flex items-center gap-3">
                <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="gap-2 rounded-2xl border-white/10 text-white/60 glass-dark hover:text-white">
                      <Sparkles className="w-4 h-4" /> Generate with AI
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl glass-card-strong border-border/20">
                    <DialogHeader>
                      <DialogTitle className="font-[--font-display]">AI Devotional Generator</DialogTitle>
                      <DialogDescription>Enter a topic or theme, and AI will generate a devotional for you</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Topic or Theme</Label>
                        <Textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} placeholder="e.g., God's love, faith, forgiveness, Easter, etc." rows={3} className="mt-1.5 rounded-2xl border-border/50 bg-card/50 resize-none" />
                      </div>
                      <Button onClick={generateWithAI} disabled={isGenerating} className="w-full h-11 rounded-2xl gradient-accent text-primary-foreground font-bold shadow-lg gap-2">
                        {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        Generate Devotional
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 rounded-2xl gradient-accent text-primary-foreground font-bold shadow-lg">
                      <Plus className="w-4 h-4" /> Create
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl rounded-3xl glass-card-strong border-border/20">
                    <DialogHeader>
                      <DialogTitle className="font-[--font-display]">Create New Devotional</DialogTitle>
                      <DialogDescription>Create a new daily devotional for the community</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                      <div><Label>Title *</Label><Input value={newDevotional.title} onChange={(e) => setNewDevotional({ ...newDevotional, title: e.target.value })} placeholder="Enter devotional title" className="mt-1.5 rounded-2xl border-border/50 bg-card/50" /></div>
                      <div><Label>Content *</Label><Textarea value={newDevotional.content} onChange={(e) => setNewDevotional({ ...newDevotional, content: e.target.value })} placeholder="Write your devotional content..." rows={8} className="mt-1.5 rounded-2xl border-border/50 bg-card/50 resize-none" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Author</Label><Input value={newDevotional.author} onChange={(e) => setNewDevotional({ ...newDevotional, author: e.target.value })} placeholder="Author name" className="mt-1.5 rounded-2xl border-border/50 bg-card/50" /></div>
                        <div><Label>Bible Verse</Label><Input value={newDevotional.bibleVerse} onChange={(e) => setNewDevotional({ ...newDevotional, bibleVerse: e.target.value })} placeholder="e.g., John 3:16" className="mt-1.5 rounded-2xl border-border/50 bg-card/50" /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><Label>Theme</Label><Input value={newDevotional.theme} onChange={(e) => setNewDevotional({ ...newDevotional, theme: e.target.value })} placeholder="Theme or category" className="mt-1.5 rounded-2xl border-border/50 bg-card/50" /></div>
                        <div><Label>Publish Date</Label><Input type="date" value={newDevotional.publishDate} onChange={(e) => setNewDevotional({ ...newDevotional, publishDate: e.target.value })} className="mt-1.5 rounded-2xl border-border/50 bg-card/50" /></div>
                      </div>
                      <Button onClick={createDevotional} disabled={isCreating} className="w-full h-11 rounded-2xl gradient-accent text-primary-foreground font-bold shadow-lg">
                        {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {isCreating ? "Creating..." : "Create Devotional"}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <main>
            {selectedDevotional ? (
              <article className="glass-card-strong rounded-3xl overflow-hidden shadow-xl">
                {selectedDevotional.imageUrl && (
                  <div className="h-56 overflow-hidden">
                    <img src={selectedDevotional.imageUrl} alt={selectedDevotional.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-8 md:p-10">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mb-6">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      {new Date(selectedDevotional.publishDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    {selectedDevotional.theme && (
                      <>
                        <span className="text-border">·</span>
                        <span className="px-2.5 py-1 rounded-full bg-secondary/10 text-secondary font-medium text-xs">
                          {selectedDevotional.theme}
                        </span>
                      </>
                    )}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-foreground tracking-tight mb-2 font-[--font-display]">
                    {selectedDevotional.title}
                  </h2>
                  {selectedDevotional.author && (
                    <p className="text-muted-foreground mb-8">By {selectedDevotional.author}</p>
                  )}
                  
                  <div className="prose prose-lg max-w-none">
                    <p className="whitespace-pre-wrap leading-8 text-foreground/70 text-[17px] font-normal">
                      {selectedDevotional.content}
                    </p>
                  </div>
                  
                  {selectedDevotional.bibleVerse && (
                    <div className="mt-10 p-6 rounded-2xl glass-card shimmer-border">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">Bible Verse</p>
                      <p className="text-lg font-medium text-foreground">{selectedDevotional.bibleVerse}</p>
                    </div>
                  )}
                </div>
              </article>
            ) : (
              <div className="glass-card-strong rounded-3xl p-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/20 mb-4" />
                <p className="text-muted-foreground">No devotional available today.</p>
              </div>
            )}

            {devotionals.length > 1 && (
              <div className="mt-10">
                <h3 className="text-lg font-bold text-foreground mb-6 font-[--font-display]">Past Devotionals</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  {devotionals.slice(1, 5).map((devotional) => (
                    <button
                      key={devotional.id}
                      onClick={() => setSelectedDevotionalId(devotional.id)}
                      className={`text-left p-5 rounded-2xl transition-all duration-200 ${
                        selectedDevotionalId === devotional.id
                          ? 'glass-card-strong shadow-lg shimmer-border'
                          : 'glass-card hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(devotional.publishDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      <h4 className="font-bold text-foreground mb-1.5 line-clamp-1 font-[--font-display]">{devotional.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{devotional.content.substring(0, 100)}...</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside className="space-y-6">
            <div className="glass-card-strong rounded-3xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-secondary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground font-[--font-display]">Reading Plans</h3>
                  <p className="text-sm text-muted-foreground">Bible reading tracks</p>
                </div>
              </div>

              {readingPlans.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No reading plans available</p>
              ) : (
                <>
                  <div className="space-y-2 mb-6">
                    {readingPlans.map((plan) => (
                      <button
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan)}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 ${
                          selectedPlan?.id === plan.id
                            ? 'gradient-accent text-primary-foreground shadow-lg'
                            : 'glass-card hover:bg-muted/50'
                        }`}
                      >
                        {plan.title}
                      </button>
                    ))}
                  </div>

                  {selectedPlan && (
                    <div className="border-t border-border/20 pt-5">
                      <div className="flex items-center justify-between text-sm mb-3">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-bold text-foreground">{progressPercentage}%</span>
                      </div>
                      <div className="h-2 bg-muted/50 rounded-full overflow-hidden mb-4">
                        <div className="h-full gradient-accent rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }} />
                      </div>
                      
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{selectedPlan.duration} days</span>
                        <span className="text-border">·</span>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{completedDays} completed</span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5 max-h-48 overflow-y-auto">
                        {Array.from({ length: selectedPlan.duration }, (_, i) => {
                          const dayNumber = i + 1;
                          const isCompleted = progress.some(p => p.dayNumber === dayNumber && p.completed);
                          return (
                            <button
                              key={dayNumber}
                              onClick={() => !isCompleted && markDayComplete(dayNumber)}
                              disabled={!user || isCompleted}
                              className={`h-9 rounded-xl text-xs font-medium transition-all duration-200 ${
                                isCompleted
                                  ? 'bg-primary/15 text-primary'
                                  : user
                                  ? 'glass-card hover:bg-secondary/10 hover:text-secondary'
                                  : 'bg-muted/30 text-muted-foreground/30 cursor-not-allowed'
                              }`}
                            >
                              {dayNumber}
                            </button>
                          );
                        })}
                      </div>

                      {!user && (
                        <p className="text-xs text-muted-foreground text-center mt-4">Sign in to track progress</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
