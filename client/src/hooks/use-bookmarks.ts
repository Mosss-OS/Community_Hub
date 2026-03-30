"use client";

import { useState, useEffect, useCallback } from "react";

interface Bookmark {
  id: string;
  type: "sermon" | "event" | "group";
  itemId: number;
  title: string;
  url: string;
  createdAt: Date;
}

const STORAGE_KEY = "chub_bookmarks";

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBookmarks(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveBookmarks = useCallback((newBookmarks: Bookmark[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBookmarks));
    setBookmarks(newBookmarks);
  }, []);

  const addBookmark = useCallback((bookmark: Omit<Bookmark, "id" | "createdAt">) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    saveBookmarks([...bookmarks, newBookmark]);
  }, [bookmarks, saveBookmarks]);

  const removeBookmark = useCallback((id: string) => {
    saveBookmarks(bookmarks.filter(b => b.id !== id));
  }, [bookmarks, saveBookmarks]);

  const isBookmarked = useCallback((itemId: number, type: Bookmark["type"]) => {
    return bookmarks.some(b => b.itemId === itemId && b.type === type);
  }, [bookmarks]);

  const toggleBookmark = useCallback((bookmark: Omit<Bookmark, "id" | "createdAt">) => {
    const existing = bookmarks.find(b => b.itemId === bookmark.itemId && b.type === bookmark.type);
    if (existing) {
      removeBookmark(existing.id);
    } else {
      addBookmark(bookmark);
    }
  }, [bookmarks, addBookmark, removeBookmark]);

  return {
    bookmarks,
    isLoaded,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark,
  };
}
