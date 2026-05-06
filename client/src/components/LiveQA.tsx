import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { LuMessageSquare, LuSend, LuCheckCircle } from 'react-icons/lu';
import { useToast } from "@/components/ui/use-toast";
import { buildApiUrl } from "@/lib/api-config";

interface QAQuestion {
  id: string;
  question: string;
  askerName: string;
  sermonId: number;
  isAnswered: boolean;
  submittedAt: string;
}

export function LiveQA({ sermonId, isAdmin = false }: { sermonId: number; isAdmin?: boolean }) {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<QAQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [askerName, setAskerName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitQuestion = async () => {
    if (!newQuestion.trim()) {
      toast({ title: "Please enter a question", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(buildApiUrl("/api/sermons/qa"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          sermonId,
          question: newQuestion,
          askerName: askerName || "Anonymous",
        }),
      });

      if (response.ok) {
        const question = await response.json();
        setQuestions([...questions, question]);
        setNewQuestion("");
        setAskerName("");
        toast({ title: "Question submitted successfully!" });
      } else {
        toast({ title: "Failed to submit question", variant: "destructive" });
      }
    } catch {
      toast({ title: "Error submitting question", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Live Q&A
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <Input
            placeholder="Your name (optional)"
            value={askerName}
            onChange={(e) => setAskerName(e.target.value)}
          />
          <Textarea
            placeholder="Submit your question for the pastor..."
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            rows={3}
          />
          <Button onClick={submitQuestion} disabled={isSubmitting || !newQuestion.trim()} className="w-full">
            {isSubmitting ? (
              <>Loading...</>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Submit Question
              </>
            )}
          </Button>
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          <h4 className="font-semibold text-sm">Submitted Questions ({questions.length})</h4>
          {questions.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">No questions yet. Be the first to ask!</p>
          ) : (
            questions.map((q) => (
              <div key={q.id} className="p-3 bg-muted rounded-lg">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-medium">{q.askerName}</p>
                  {q.isAnswered && (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <p className="text-sm">{q.question}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(q.submittedAt).toLocaleTimeString()}
                </p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
