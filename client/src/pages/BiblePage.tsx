import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { LuBookOpen, LuHighlighter, LuMessageSquare, LuStickyNote, LuPlus, LuTrash2 } from 'react-icons/lu';

const BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy", "Joshua", "Judges", "Ruth",
  "1 Samuel", "2 Samuel", "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah",
  "Esther", "Job", "Psalm", "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah",
  "Lamentations", "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans", "1 Corinthians", "2 Corinthians",
  "Galatians", "Ephesians", "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews", "James", "1 Peter", "2 Peter",
  "1 John", "2 John", "3 John", "Jude", "Revelation"
];

const HIGHLIGHT_COLORS = [
  { name: "Yellow", value: "#FFEB3B" },
  { name: "Green", value: "#4CAF50" },
  { name: "Blue", value: "#2196F3" },
  { name: "Pink", value: "#E91E63" },
  { name: "Orange", value: "#FF9800" },
  { name: "Purple", value: "#9C27B0" },
];

interface UserHighlight {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  color: string;
  note: string | null;
}

interface UserNote {
  id: number;
  book: string;
  chapter: number;
  verse: number;
  content: string;
}

interface VerseDiscussion {
  id: number;
  userId: string;
  book: string;
  chapter: number;
  verse: number;
  content: string;
  createdAt: string;
}

async function fetchHighlights(): Promise<UserHighlight[]> {
  const res = await fetch("/api/bible/highlights", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch highlights");
  return res.json();
}

async function createHighlight(data: { book: string; chapter: number; verse: number; color: string; note?: string }) {
  const res = await fetch("/api/bible/highlights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create highlight");
  return res.json();
}

async function deleteHighlight(id: number) {
  const res = await fetch(`/api/bible/highlights/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete highlight");
}

async function fetchNotes(): Promise<UserNote[]> {
  const res = await fetch("/api/bible/notes", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch notes");
  return res.json();
}

async function createNote(data: { book: string; chapter: number; verse: number; content: string }) {
  const res = await fetch("/api/bible/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return res.json();
}

async function deleteNote(id: number) {
  const res = await fetch(`/api/bible/notes/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete note");
}

async function fetchDiscussions(book: string, chapter: number, verse: number): Promise<VerseDiscussion[]> {
  const res = await fetch(`/api/bible/discussions?book=${book}&chapter=${chapter}&verse=${verse}`);
  if (!res.ok) return [];
  return res.json();
}

async function createDiscussion(data: { book: string; chapter: number; verse: number; content: string }) {
  const res = await fetch("/api/bible/discussions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create discussion");
  return res.json();
}

interface GroupAnnotation {
  id: number;
  groupId: number;
  book: string;
  chapter: number;
  verse: number;
  content: string;
  createdAt: string;
  createdBy: string;
}

async function fetchGroupAnnotations(groupId: number): Promise<GroupAnnotation[]> {
  const res = await fetch(`/api/bible/group-annotations/${groupId}`, { credentials: "include" });
  if (!res.ok) return [];
  return res.json();
}

async function createGroupAnnotation(data: { groupId: number; book: string; chapter: number; verse: number; content: string }) {
  const res = await fetch("/api/bible/group-annotations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create group annotation");
  return res.json();
}

async function deleteGroupAnnotation(id: number) {
  const res = await fetch(`/api/bible/group-annotations/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete group annotation");
}

const DAILY_VERSES = [
  { verse: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
  { verse: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
  { verse: "Proverbs 3:5", text: "Trust in the Lord with all your heart and lean not on your own understanding." },
  { verse: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose." },
  { verse: "Philippians 4:13", text: "I can do all this through him who gives me strength." },
  { verse: "Isaiah 40:31", text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint." },
  { verse: "Matthew 11:28", text: "Come to me, all who labor and are heavy laden, and I will give you rest." },
  { verse: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come." },
  { verse: "Hebrews 11:1", text: "Now faith is the substance of things hoped for, the evidence of things not seen." },
  { verse: "1 Peter 5:7", text: "Cast all your anxiety on him because he cares for you." },
];

export default function BiblePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedBook, setSelectedBook] = useState("Psalm");
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedVerse, setSelectedVerse] = useState(1);
  
  const [highlights, setHighlights] = useState<UserHighlight[]>([]);
  const [notes, setNotes] = useState<UserNote[]>([]);
  const [discussions, setDiscussions] = useState<VerseDiscussion[]>([]);
  const [groupAnnotations, setGroupAnnotations] = useState<GroupAnnotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGroupAnnotations, setShowGroupAnnotations] = useState(false);
  
  const [showHighlightDialog, setShowHighlightDialog] = useState(false);
  const [showNoteDialog, setShowNoteDialog] = useState(false);
  const [showDiscussionDialog, setShowDiscussionDialog] = useState(false);
  const [showGroupAnnotationDialog, setShowGroupAnnotationDialog] = useState(false);
  
  const [highlightColor, setHighlightColor] = useState("#FFEB3B");
  const [highlightNote, setHighlightNote] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [discussionContent, setDiscussionContent] = useState("");
  const [groupAnnotationContent, setGroupAnnotationContent] = useState("");
  
  const dailyVerse = DAILY_VERSES[new Date().getDate() % DAILY_VERSES.length];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadDiscussions();
  }, [selectedBook, selectedChapter, selectedVerse]);

  async function loadData() {
    try {
      const [hl, nt] = await Promise.all([fetchHighlights(), fetchNotes()]);
      setHighlights(hl);
      setNotes(nt);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadDiscussions() {
    try {
      const ds = await fetchDiscussions(selectedBook, selectedChapter, selectedVerse);
      setDiscussions(ds);
    } catch (err) {
      console.error("Error loading discussions:", err);
    }
  }

  async function handleCreateHighlight() {
    try {
      const hl = await createHighlight({
        book: selectedBook,
        chapter: selectedChapter,
        verse: selectedVerse,
        color: highlightColor,
        note: highlightNote || undefined,
      });
      setHighlights([...highlights, hl]);
      setShowHighlightDialog(false);
      setHighlightColor("#FFEB3B");
      setHighlightNote("");
      toast({ title: "Success", description: "Verse highlighted!" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to highlight verse", variant: "destructive" });
    }
  }

  async function handleDeleteHighlight(id: number) {
    try {
      await deleteHighlight(id);
      setHighlights(highlights.filter(h => h.id !== id));
      toast({ title: "Success", description: "Highlight removed" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete highlight", variant: "destructive" });
    }
  }

  async function handleCreateNote() {
    try {
      const nt = await createNote({
        book: selectedBook,
        chapter: selectedChapter,
        verse: selectedVerse,
        content: noteContent,
      });
      setNotes([...notes, nt]);
      setShowNoteDialog(false);
      setNoteContent("");
      toast({ title: "Success", description: "Note saved!" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to save note", variant: "destructive" });
    }
  }

  async function handleDeleteNote(id: number) {
    try {
      await deleteNote(id);
      setNotes(notes.filter(n => n.id !== id));
      toast({ title: "Success", description: "Note deleted" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete note", variant: "destructive" });
    }
  }

  async function handleCreateDiscussion() {
    try {
      const ds = await createDiscussion({
        book: selectedBook,
        chapter: selectedChapter,
        verse: selectedVerse,
        content: discussionContent,
      });
      setDiscussions([...discussions, ds]);
      setShowDiscussionDialog(false);
      setDiscussionContent("");
      toast({ title: "Success", description: "Discussion posted!" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to post discussion", variant: "destructive" });
    }
  }

  async function handleCreateGroupAnnotation() {
    try {
      const annotations = await createGroupAnnotation({
        groupId: 1,
        book: selectedBook,
        chapter: selectedChapter,
        verse: selectedVerse,
        content: groupAnnotationContent,
      });
      setGroupAnnotations([...groupAnnotations, annotations]);
      setShowGroupAnnotationDialog(false);
      setGroupAnnotationContent("");
      toast({ title: "Success", description: "Group annotation added!" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to add annotation", variant: "destructive" });
    }
  }

  async function handleDeleteGroupAnnotation(id: number) {
    try {
      await deleteGroupAnnotation(id);
      setGroupAnnotations(groupAnnotations.filter(a => a.id !== id));
      toast({ title: "Success", description: "Annotation removed" });
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete annotation", variant: "destructive" });
    }
  }

  const verseHighlights = highlights.filter(h => 
    h.book === selectedBook && h.chapter === selectedChapter && h.verse === selectedVerse
  );

  const verseNotes = notes.filter(n => 
    n.book === selectedBook && n.chapter === selectedChapter && n.verse === selectedVerse
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BookOpen className="w-8 h-8" />
          Bible Study
        </h1>
        <p className="text-gray-600 mt-1">Read, highlight, take notes, and discuss verses</p>
      </div>

      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">☀️</span> Daily Verse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xl font-semibold text-blue-800 mb-2">{dailyVerse.verse}</p>
          <p className="text-gray-700 italic">"{dailyVerse.text}"</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Select Passage</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Book</label>
              <select
                value={selectedBook}
                onChange={(e) => { setSelectedBook(e.target.value); setSelectedChapter(1); setSelectedVerse(1); }}
                className="w-full mt-1 h-10 rounded-md border border-input bg-background px-3 py-2"
              >
                {BOOKS.map(book => (
                  <option key={book} value={book}>{book}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Chapter</label>
                <Input
                  type="number"
                  min={1}
                  value={selectedChapter}
                  onChange={(e) => setSelectedChapter(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Verse</label>
                <Input
                  type="number"
                  min={1}
                  value={selectedVerse}
                  onChange={(e) => setSelectedVerse(parseInt(e.target.value) || 1)}
                  className="mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl">
                {selectedBook} {selectedChapter}:{selectedVerse}
              </CardTitle>
              {user && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowHighlightDialog(true)}>
                    <Highlighter className="w-4 h-4 mr-1" /> Highlight
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowNoteDialog(true)}>
                    <StickyNote className="w-4 h-4 mr-1" /> Note
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setShowDiscussionDialog(true)}>
                    <MessageSquare className="w-4 h-4 mr-1" /> Discuss
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="text-lg leading-relaxed space-y-4">
                <p className="text-gray-800">
                  Use the selectors to navigate through Scripture. You can highlight verses, add notes, and discuss with others.
                </p>
              </div>

              {verseHighlights.length > 0 && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <Highlighter className="w-4 h-4" /> Highlights
                  </h4>
                  {verseHighlights.map(hl => (
                    <div key={hl.id} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: hl.color }}></span>
                        {hl.note || "Highlighted"}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteHighlight(hl.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {verseNotes.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <StickyNote className="w-4 h-4" /> Notes
                  </h4>
                  {verseNotes.map(nt => (
                    <div key={nt.id} className="flex items-center justify-between text-sm mb-2">
                      <span>{nt.content}</span>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteNote(nt.id)}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" /> Discussions ({discussions.length})
                </h4>
                {discussions.length === 0 ? (
                  <p className="text-sm text-gray-500">No discussions yet. Be the first!</p>
                ) : (
                  <div className="space-y-2">
                    {discussions.map(ds => (
                      <div key={ds.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                        {ds.content}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Highlighter className="w-5 h-5" /> My Highlights ({highlights.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {highlights.length === 0 ? (
                  <p className="text-sm text-gray-500">No highlights yet</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {highlights.slice(0, 10).map(hl => (
                      <div key={hl.id} className="flex items-center justify-between text-sm">
                        <span>
                          <span className="w-2 h-2 inline-block rounded-full mr-2" style={{ backgroundColor: hl.color }}></span>
                          {hl.book} {hl.chapter}:{hl.verse}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <StickyNote className="w-5 h-5" /> My Notes ({notes.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {notes.length === 0 ? (
                  <p className="text-sm text-gray-500">No notes yet</p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {notes.slice(0, 10).map(nt => (
                      <div key={nt.id} className="text-sm">
                        <span className="font-medium">{nt.book} {nt.chapter}:{nt.verse}</span>
                        <p className="text-gray-600 truncate">{nt.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showHighlightDialog} onOpenChange={setShowHighlightDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Highlight Verse</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2 mt-1">
                {HIGHLIGHT_COLORS.map(c => (
                  <button
                    key={c.value}
                    className={`w-8 h-8 rounded-full border-2 ${highlightColor === c.value ? "border-black" : "border-transparent"}`}
                    style={{ backgroundColor: c.value }}
                    onClick={() => setHighlightColor(c.value)}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Note (optional)</label>
              <Textarea
                value={highlightNote}
                onChange={(e) => setHighlightNote(e.target.value)}
                placeholder="Add a note..."
                rows={3}
              />
            </div>
            <Button onClick={handleCreateHighlight} className="w-full">Save Highlight</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Note</label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Write your note..."
                rows={4}
              />
            </div>
            <Button onClick={handleCreateNote} className="w-full" disabled={!noteContent}>Save Note</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showDiscussionDialog} onOpenChange={setShowDiscussionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Discussion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              {selectedBook} {selectedChapter}:{selectedVerse}
            </div>
            <div>
              <label className="text-sm font-medium">Your thoughts</label>
              <Textarea
                value={discussionContent}
                onChange={(e) => setDiscussionContent(e.target.value)}
                placeholder="Share your thoughts on this verse..."
                rows={4}
              />
            </div>
            <Button onClick={handleCreateDiscussion} className="w-full" disabled={!discussionContent}>Post Discussion</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
