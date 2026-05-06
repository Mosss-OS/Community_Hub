import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { LuBookOpen, LuPlay, LuCheckCircle, LuCircle, LuAward, LuTarget, LuGraduationCap, LuLightbulb, LuChevronRight, LuMessageSquare } from 'react-icons/lu';

interface DiscipleshipTrack {
  id: number;
  title: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  estimatedWeeks: number | null;
  isActive: boolean;
  order: number;
}

interface Lesson {
  id: number;
  trackId: number;
  title: string;
  description: string | null;
  content: string | null;
  videoUrl: string | null;
  order: number;
  isPublished: boolean;
}

interface Quiz {
  id: number;
  lessonId: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string | null;
}

interface UserProgress {
  id: number;
  userId: string;
  trackId: number;
  lessonId: number;
  completed: boolean;
  completedAt: string | null;
  quizScore: number | null;
  quizAttempts: number;
  notes: string | null;
}

interface Reflection {
  id: number;
  userId: string;
  lessonId: number;
  content: string;
  isPrivate: boolean;
  createdAt: string;
}

async function fetchTracks(): Promise<DiscipleshipTrack[]> {
  const res = await fetch("/api/discipleship/tracks");
  if (!res.ok) throw new Error("Failed to fetch tracks");
  return res.json();
}

async function fetchLessons(trackId: number): Promise<Lesson[]> {
  const res = await fetch(`/api/discipleship/tracks/${trackId}/lessons`);
  if (!res.ok) throw new Error("Failed to fetch lessons");
  return res.json();
}

async function fetchLesson(lessonId: number): Promise<Lesson> {
  const res = await fetch(`/api/discipleship/lessons/${lessonId}`);
  if (!res.ok) throw new Error("Failed to fetch lesson");
  return res.json();
}

async function fetchQuizzes(lessonId: number): Promise<Quiz[]> {
  const res = await fetch(`/api/discipleship/lessons/${lessonId}/quizzes`);
  if (!res.ok) throw new Error("Failed to fetch quizzes");
  return res.json();
}

async function fetchUserProgress(): Promise<UserProgress[]> {
  const res = await fetch("/api/discipleship/progress", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch progress");
  return res.json();
}

async function updateProgress(data: { trackId: number; lessonId: number; completed: boolean; quizScore?: number }) {
  const res = await fetch("/api/discipleship/progress", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update progress");
  return res.json();
}

async function fetchReflections(lessonId?: number): Promise<Reflection[]> {
  const url = lessonId ? `/api/discipleship/reflections?lessonId=${lessonId}` : "/api/discipleship/reflections";
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch reflections");
  return res.json();
}

async function createReflection(data: { lessonId: number; content: string; isPrivate: boolean }) {
  const res = await fetch("/api/discipleship/reflections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create reflection");
  return res.json();
}

function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    new_believer: "New Believer",
    leadership: "Leadership",
    discipleship: "Discipleship",
    ministry: "Ministry",
    theology: "Theology",
    practical: "Practical Skills",
    other: "Other",
  };
  return labels[category] || category;
}

export default function DiscipleshipPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [tracks, setTracks] = useState<DiscipleshipTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<DiscipleshipTrack | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [progress, setProgress] = useState<UserProgress[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [reflectionContent, setReflectionContent] = useState("");
  const [showReflectionDialog, setShowReflectionDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTracks();
    if (user) {
      loadProgress();
    }
  }, [user]);

  useEffect(() => {
    if (selectedTrack) {
      loadLessons(selectedTrack.id);
    }
  }, [selectedTrack]);

  useEffect(() => {
    if (selectedLesson) {
      loadQuizzes(selectedLesson.id);
      loadReflections(selectedLesson.id);
    }
  }, [selectedLesson]);

  async function loadTracks() {
    try {
      const data = await fetchTracks();
      setTracks(data);
    } catch (err) {
      console.error("Error loading tracks:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadLessons(trackId: number) {
    try {
      const data = await fetchLessons(trackId);
      setLessons(data);
    } catch (err) {
      console.error("Error loading lessons:", err);
    }
  }

  async function loadQuizzes(lessonId: number) {
    try {
      const data = await fetchQuizzes(lessonId);
      setQuizzes(data);
      setSelectedAnswers({});
      setShowResults(false);
    } catch (err) {
      console.error("Error loading quizzes:", err);
    }
  }

  async function loadProgress() {
    try {
      const data = await fetchUserProgress();
      setProgress(data);
    } catch (err) {
      console.error("Error loading progress:", err);
    }
  }

  async function loadReflections(lessonId: number) {
    try {
      const data = await fetchReflections(lessonId);
      setReflections(data);
    } catch (err) {
      console.error("Error loading reflections:", err);
    }
  }

  async function handleMarkComplete() {
    if (!selectedLesson || !selectedTrack) return;
    try {
      await updateProgress({
        trackId: selectedTrack.id,
        lessonId: selectedLesson.id,
        completed: true,
      });
      toast({ title: "Lesson completed!", description: "Great job! Keep learning." });
      loadProgress();
    } catch (err) {
      console.error("Error completing lesson:", err);
      toast({ title: "Error", description: "Failed to mark lesson as complete", variant: "destructive" });
    }
  }

  async function handleSubmitQuiz() {
    if (!selectedLesson || !selectedTrack) return;
    
    let correct = 0;
    quizzes.forEach((quiz, index) => {
      if (selectedAnswers[index] === quiz.correctAnswer) {
        correct++;
      }
    });
    
    const score = Math.round((correct / quizzes.length) * 100);
    
    try {
      await updateProgress({
        trackId: selectedTrack.id,
        lessonId: selectedLesson.id,
        completed: true,
        quizScore: score,
      });
      setShowResults(true);
      toast({ title: `Quiz completed! Score: ${score}%`, description: score >= 70 ? "Great job!" : "Keep studying and try again!" });
      loadProgress();
    } catch (err) {
      console.error("Error saving quiz:", err);
      toast({ title: "Error", description: "Failed to save quiz results", variant: "destructive" });
    }
  }

  async function handleSubmitReflection() {
    if (!selectedLesson || !reflectionContent) return;
    try {
      await createReflection({
        lessonId: selectedLesson.id,
        content: reflectionContent,
        isPrivate: true,
      });
      toast({ title: "Reflection saved!", description: "Your thoughts have been recorded." });
      setReflectionContent("");
      setShowReflectionDialog(false);
      loadReflections(selectedLesson.id);
    } catch (err) {
      console.error("Error creating reflection:", err);
      toast({ title: "Error", description: "Failed to save reflection", variant: "destructive" });
    }
  }

  const getTrackProgress = (trackId: number): number => {
    const trackLessons = lessons.filter(l => l.trackId === trackId);
    if (trackLessons.length === 0) return 0;
    const completedLessons = progress.filter(p => p.trackId === trackId && p.completed).length;
    return Math.round((completedLessons / trackLessons.length) * 100);
  };

  const isLessonCompleted = (lessonId: number): boolean => {
    return progress.some(p => p.lessonId === lessonId && p.completed);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Discipleship Pathways</h1>
        <p className="text-gray-600 text-lg">Grow in your faith through structured learning tracks</p>
      </div>

      {!user && (
        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Sign in to track your progress</h3>
                <p className="text-blue-700">Create an account or log in to save your learning journey</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedTrack ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tracks.map((track) => (
            <Card key={track.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setSelectedTrack(track)}>
              {track.imageUrl && (
                <div className="h-40 overflow-hidden rounded-t-lg">
                  <img src={track.imageUrl} alt={track.title} className="w-full h-full object-cover" />
                </div>
              )}
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-xl">{track.title}</CardTitle>
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                    {getCategoryLabel(track.category)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">{track.description}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{track.estimatedWeeks ? `${track.estimatedWeeks} weeks` : "Self-paced"}</span>
                  </div>
                  {user && (
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${getTrackProgress(track.id)}%` }}></div>
                      </div>
                      <span>{getTrackProgress(track.id)}%</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div>
          <Button variant="ghost" onClick={() => { setSelectedTrack(null); setSelectedLesson(null); }} className="mb-4">
            ← Back to All Tracks
          </Button>
          
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-2">{selectedTrack.title}</h2>
            <p className="text-gray-600">{selectedTrack.description}</p>
          </div>

          {!selectedLesson ? (
            <div className="space-y-4">
              {lessons.map((lesson, index) => (
                <Card key={lesson.id} className={`hover:shadow-md transition-shadow cursor-pointer ${lesson.isPublished ? '' : 'opacity-60'}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isLessonCompleted(lesson.id) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}>
                      {isLessonCompleted(lesson.id) ? <CheckCircle className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                    </div>
                    <div className="flex-1" onClick={() => lesson.isPublished && setSelectedLesson(lesson)}>
                      <h3 className="font-semibold">{index + 1}. {lesson.title}</h3>
                      <p className="text-sm text-gray-500">{lesson.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {lesson.videoUrl && <Play className="w-4 h-4 text-gray-400" />}
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div>
              <Button variant="ghost" onClick={() => setSelectedLesson(null)} className="mb-4">
                ← Back to Lessons
              </Button>
              
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>{selectedLesson.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {selectedLesson.videoUrl && (
                        <div className="mb-6 aspect-video bg-gray-900 rounded-lg overflow-hidden">
                          <iframe src={selectedLesson.videoUrl} className="w-full h-full" allowFullScreen title={selectedLesson.title}></iframe>
                        </div>
                      )}
                      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedLesson.content || "<p>No content available.</p>" }} />
                      
                      <div className="mt-8 flex gap-4">
                        {!isLessonCompleted(selectedLesson.id) && (
                          <Button onClick={handleMarkComplete} className="gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Mark as Complete
                          </Button>
                        )}
                        <Dialog open={showReflectionDialog} onOpenChange={setShowReflectionDialog}>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Add Reflection
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Write Your Reflection</DialogTitle>
                            </DialogHeader>
                            <Textarea
                              value={reflectionContent}
                              onChange={(e) => setReflectionContent(e.target.value)}
                              placeholder="What did you learn from this lesson? How will you apply it?"
                              rows={6}
                            />
                            <Button onClick={handleSubmitReflection} className="mt-4">
                              Save Reflection
                            </Button>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>

                  {quizzes.length > 0 && (
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          Knowledge Check
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {quizzes.map((quiz, index) => (
                          <div key={quiz.id} className="space-y-3">
                            <p className="font-medium">{index + 1}. {quiz.question}</p>
                            <div className="space-y-2">
                              {quiz.options.map((option, optIndex) => {
                                const isSelected = selectedAnswers[index] === optIndex;
                                const isCorrect = showResults && optIndex === quiz.correctAnswer;
                                const isWrong = showResults && isSelected && optIndex !== quiz.correctAnswer;
                                
                                return (
                                  <button
                                    key={optIndex}
                                    onClick={() => !showResults && setSelectedAnswers({ ...selectedAnswers, [index]: optIndex })}
                                    disabled={showResults}
                                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                      isCorrect ? "border-green-500 bg-green-50" :
                                      isWrong ? "border-red-500 bg-red-50" :
                                      isSelected ? "border-primary bg-primary/5" :
                                      "border-gray-200 hover:border-primary/50"
                                    }`}
                                  >
                                    {option}
                                    {isCorrect && <CheckCircle className="w-4 h-4 inline ml-2 text-green-600" />}
                                  </button>
                                );
                              })}
                            </div>
                            {showResults && quiz.explanation && (
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{quiz.explanation}</p>
                            )}
                          </div>
                        ))}
                        {!showResults && (
                          <Button onClick={handleSubmitQuiz} className="w-full">
                            Submit Answers
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Progress
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Track Progress</span>
                            <span>{getTrackProgress(selectedTrack.id)}%</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${getTrackProgress(selectedTrack.id)}%` }}></div>
                          </div>
                        </div>
                        
                        {lessons.map((lesson, index) => (
                          <div key={lesson.id} className="flex items-center gap-2 text-sm">
                            {isLessonCompleted(lesson.id) ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-300" />
                            )}
                            <span className={isLessonCompleted(lesson.id) ? "text-gray-900" : "text-gray-500"}>
                              {index + 1}. {lesson.title}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
