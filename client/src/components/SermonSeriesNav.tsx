"use client";

import { useState } from "react";
import { Link } from "wouter";
import { ChevronLeft, ChevronRight, Play, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface SermonSeries {
  id: string;
  title: string;
  description?: string;
  coverImage?: string;
  sermons: {
    id: string;
    title: string;
    date: string;
    duration?: number;
  }[];
}

interface SermonSeriesNavigationProps {
  series: SermonSeries[];
  currentSermonId?: string;
}

export function SermonSeriesNavigation({ series, currentSermonId }: SermonSeriesNavigationProps) {
  const [expandedSeries, setExpandedSeries] = useState<string | null>(null);

  const currentIndex = currentSermonId
    ? series.findIndex(s => s.sermons.some(sermon => sermon.id === currentSermonId))
    : -1;

  const getPrevNext = () => {
    if (currentIndex === -1) return { prev: null, next: null };
    const currentSeries = series[currentIndex];
    const sermonIndex = currentSermonId
      ? currentSeries.sermons.findIndex(s => s.id === currentSermonId)
      : -1;

    let prev = null;
    let next = null;

    if (sermonIndex > 0) {
      prev = currentSeries.sermons[sermonIndex - 1];
    } else if (currentIndex > 0) {
      const prevSeries = series[currentIndex - 1];
      prev = prevSeries.sermons[prevSeries.sermons.length - 1];
    }

    if (sermonIndex < currentSeries.sermons.length - 1) {
      next = currentSeries.sermons[sermonIndex + 1];
    } else if (currentIndex < series.length - 1) {
      next = series[currentIndex + 1].sermons[0];
    }

    return { prev, next };
  };

  const { prev, next } = getPrevNext();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Series Navigation</h3>
      
      {prev && (
        <Link href={`/sermons/${prev.id}`}>
          <Button variant="outline" className="w-full justify-start gap-2">
            <ChevronLeft className="h-4 w-4" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Previous</p>
              <p className="font-medium truncate">{prev.title}</p>
            </div>
          </Button>
        </Link>
      )}

      {next && (
        <Link href={`/sermons/${next.id}`}>
          <Button variant="outline" className="w-full justify-end gap-2">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next</p>
              <p className="font-medium truncate">{next.title}</p>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </Link>
      )}

      <div className="border-t pt-4 mt-4">
        <h4 className="text-sm font-medium mb-3">All Series</h4>
        <div className="space-y-2">
          {series.map((s) => (
            <Card key={s.id} className="overflow-hidden">
              <button
                className="w-full text-left p-3 hover:bg-muted/50 transition-colors"
                onClick={() => setExpandedSeries(expandedSeries === s.id ? null : s.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{s.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.sermons.length} sermons
                    </p>
                  </div>
                  {expandedSeries === s.id ? (
                    <ChevronLeft className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              </button>
              
              {expandedSeries === s.id && (
                <CardContent className="pt-0 pb-3">
                  {s.sermons.map((sermon) => (
                    <Link
                      key={sermon.id}
                      href={`/sermons/${sermon.id}`}
                      className={`flex items-center gap-2 p-2 rounded-md hover:bg-muted transition-colors ${
                        sermon.id === currentSermonId ? "bg-primary/10" : ""
                      }`}
                    >
                      <Play className="h-3 w-3 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{sermon.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(sermon.date).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SermonSeriesCard({ series }: { series: SermonSeries }) {
  return (
    <Link href={`/sermons?series=${series.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
        {series.coverImage && (
          <div className="aspect-video relative">
            <img
              src={series.coverImage}
              alt={series.title}
              className="object-cover w-full h-full"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Play className="h-12 w-12 text-white" />
            </div>
          </div>
        )}
        <CardContent className="p-4">
          <h3 className="font-semibold mb-1">{series.title}</h3>
          {series.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {series.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {series.sermons.length} sermons
            </span>
            {series.sermons[0] && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(series.sermons[0].date).toLocaleDateString()}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
