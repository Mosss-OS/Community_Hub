import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LuBookOpen, LuRefreshCw } from 'react-icons/lu';
import { Helmet } from "react-helmet-async";

interface BibleVerse {
  reference: string;
  text: string;
  translation: string;
}

const VERSES: BibleVerse[] = [
  { reference: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.", translation: "NIV" },
  { reference: "Philippians 4:13", text: "I can do all this through him who gives me strength.", translation: "NIV" },
  { reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the LORD, plans to prosper you and not to harm you, plans to give you hope and a future.", translation: "NIV" },
  { reference: "Psalm 23:1", text: "The LORD is my shepherd, I lack nothing.", translation: "NIV" },
  { reference: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.", translation: "NIV" },
  { reference: "Proverbs 3:5-6", text: "Trust in the LORD with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", translation: "NIV" },
  { reference: "Isaiah 41:10", text: "So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.", translation: "NIV" },
];

export function BibleVerseWidget() {
  const [verse, setVerse] = useState<BibleVerse | null>(null);

  const getDailyVerse = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today - new Date(today.getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
    const index = dayOfYear % VERSES.length;
    setVerse(VERSES[index]);
  };

  useEffect(() => {
    getDailyVerse();
  }, []);

  if (!verse) return null;

  return (
    <Card className="overflow-hidden border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BookOpen className="h-5 w-5 text-blue-600" />
          Verse of the Day
        </CardTitle>
      </CardHeader>
      <CardContent>
        <blockquote className="border-l-2 border-blue-200 pl-4 italic text-muted-foreground mb-3">
          "{verse.text}"
        </blockquote>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-foreground">{verse.reference}</p>
            <p className="text-xs text-muted-foreground">{verse.translation}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={getDailyVerse} title="Refresh verse">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
