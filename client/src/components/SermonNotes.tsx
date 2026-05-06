import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LuPenLine, LuTrash2, LuSave, LuBookOpen } from 'react-icons/lu';
import { useToast } from "@/components/ui/use-toast";

interface Note {
  id: string;
  sermonId: number;
  timestamp?: number;
  content: string;
  highlightColor?: string;
  createdAt: string;
}

const COLORS = ["yellow", "green", "blue", "pink", "orange"];

export function SermonNotes({ sermonId, currentTime }: { sermonId: number; currentTime?: number }) {
  const { toast } = useToast();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [selectedColor, setSelectedColor] = useState("yellow");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`sermon-notes-${sermonId}`);
    if (saved) {
      setNotes(JSON.parse(saved));
    }
  }, [sermonId]);

  const saveNotes = () => {
    localStorage.setItem(`sermon-notes-${sermonId}`, JSON.stringify(notes));
  };

  const addNote = () => {
    if (!newNote.trim()) return;

    const note: Note = {
      id: Date.now().toString(),
      sermonId,
      timestamp: currentTime,
      content: newNote,
      highlightColor: selectedColor,
      createdAt: new Date().toISOString(),
    };

    const updated = [...notes, note];
    setNotes(updated);
    localStorage.setItem(`sermon-notes-${sermonId}`, JSON.stringify(updated));
    setNewNote("");
    toast({ title: "Note added successfully" });
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    localStorage.setItem(`sermon-notes-${sermonId}`, JSON.stringify(updated));
    toast({ title: "Note deleted" });
  };

  const formatTime = (seconds?: number) => {
    if (!seconds) return "";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const colorMap: Record<string, string> = {
    yellow: "bg-yellow-100 border-yellow-300",
    green: "bg-green-100 border-green-300",
    blue: "bg-blue-100 border-blue-300",
    pink: "bg-pink-100 border-pink-300",
    orange: "bg-orange-100 border-orange-300",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenLine className="h-5 w-5 text-primary" />
          Sermon Notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-2">
          {COLORS.map((color) => (
            <button
              key={color}
              className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? "border-foreground" : "border-transparent"} bg-${color}-200`}
              onClick={() => setSelectedColor(color)}
              title={color}
            />
          ))}
        </div>

        <div className="flex gap-2">
          <Textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder={currentTime ? `Add note at ${formatTime(currentTime)}...` : "Take a note..."}
            className="flex-1"
            rows={3}
          />
        </div>

        <Button onClick={addNote} disabled={!newNote.trim()} className="w-full">
          <Save className="mr-2 h-4 w-4" />
          Add Note {currentTime && `at ${formatTime(currentTime)}`}
        </Button>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No notes yet. Start taking notes!</p>
          ) : (
            notes.map((note) => (
              <div key={note.id} className={`p-3 rounded-lg border ${colorMap[note.highlightColor || "yellow"]}`}>
                <div className="flex justify-between items-start mb-1">
                  {note.timestamp && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {formatTime(note.timestamp)}
                    </span>
                  )}
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteNote(note.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <p className="text-sm">{note.content}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
