import { useState } from "react";
import { LuSearch, LuFileText } from 'react-icons/lu';
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface TranscriptResult {
  id: string;
  sermonTitle: string;
  snippet: string;
  timestamp: string;
}

const mockTranscripts: TranscriptResult[] = [
  { id: "1", sermonTitle: "The Power of Faith", snippet: "...faith is the substance of things hoped for, the evidence of things not seen. When we walk by faith...", timestamp: "12:34" },
  { id: "2", sermonTitle: "Walking in Love", snippet: "...and above all these virtues put on love, which binds them all together in perfect unity. Love never fails...", timestamp: "25:10" },
  { id: "3", sermonTitle: "The Power of Faith", snippet: "...without faith it is impossible to please God, because anyone who comes to him must believe that he exists...", timestamp: "8:45" },
];

export function SermonTranscriptSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TranscriptResult[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    const filtered = mockTranscripts.filter(t => 
      t.snippet.toLowerCase().includes(query.toLowerCase()) ||
      t.sermonTitle.toLowerCase().includes(query.toLowerCase())
    );
    setResults(filtered);
    setSearched(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sermon transcripts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyUp={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 rounded-xl"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </div>

      {searched && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Found {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
          </p>
          {results.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
              <p>No results found. Try different keywords.</p>
            </div>
          ) : (
            results.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-primary">{result.sermonTitle}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                      {result.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80">
                    {result.snippet}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export function SermonTranscriptSearchPage() {
  return (
    <>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Sermon Transcript Search</h1>
          <p className="text-muted-foreground mb-8">Search through sermon transcripts for specific topics or phrases</p>
          <SermonTranscriptSearch />
        </div>
      </div>
    </>
  );
}
