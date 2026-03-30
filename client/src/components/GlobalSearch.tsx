"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { useNavigate } from "@/lib/router-custom";

interface SearchResult {
  type: "sermon" | "event" | "member" | "group";
  title: string;
  url: string;
}

export function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      // Simulated search results - in production, this would call an API
      const mockResults: SearchResult[] = [
        { type: "sermon", title: "Finding Peace in Troubled Times", url: "/sermons/1" },
        { type: "event", title: "Sunday Service", url: "/events/1" },
        { type: "group", title: "Youth Fellowship", url: "/groups/1" },
      ].filter(r => r.title.toLowerCase().includes(q.toLowerCase()));
      
      setResults(mockResults);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      handleSearch(query);
    }, 300);
    return () => clearTimeout(debounce);
  }, [query, handleSearch]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground bg-muted/50 rounded-xl hover:bg-muted transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/50" onClick={() => setIsOpen(false)}>
      <div 
        className="w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 p-4 border-b">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sermons, events, members..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-lg"
            autoFocus
          />
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          ) : (
            <button onClick={() => setIsOpen(false)}>
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {results.length > 0 ? (
            <div className="p-2">
              {results.map((result, index) => (
                <Link
                  key={index}
                  href={result.url}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted transition-colors"
                >
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{result.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{result.type}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : query ? (
            <div className="p-8 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Start typing to search...
            </div>
          )}
        </div>
        
        <div className="p-3 border-t text-xs text-muted-foreground flex justify-center gap-4">
          <span>↑↓ Navigate</span>
          <span>↵ Select</span>
          <span>Esc Close</span>
        </div>
      </div>
    </div>
  );
}
