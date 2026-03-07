'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tvl_bookmarks';

export interface BookmarkedCase {
  id: number;
  citation: string;
  title: string;
  court: string;
  year: number | null;
  bookmarkedAt: number;
  note?: string;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<BookmarkedCase[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setBookmarks(JSON.parse(stored));
    } catch {}
  }, []);

  const save = useCallback((items: BookmarkedCase[]) => {
    setBookmarks(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const addBookmark = useCallback((caseData: Omit<BookmarkedCase, 'bookmarkedAt'>) => {
    setBookmarks(prev => {
      if (prev.some(b => b.id === caseData.id)) return prev;
      const next = [...prev, { ...caseData, bookmarkedAt: Date.now() }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeBookmark = useCallback((id: number) => {
    setBookmarks(prev => {
      const next = prev.filter(b => b.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const isBookmarked = useCallback((id: number) => {
    return bookmarks.some(b => b.id === id);
  }, [bookmarks]);

  const updateNote = useCallback((id: number, note: string) => {
    setBookmarks(prev => {
      const next = prev.map(b => b.id === id ? { ...b, note } : b);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => save([]), [save]);

  return { bookmarks, addBookmark, removeBookmark, isBookmarked, updateNote, clearAll };
}

interface BookmarkButtonProps {
  caseData: { id: number; citation: string; title: string; court: string; year: number | null };
  isBookmarked: boolean;
  onToggle: () => void;
  size?: number;
}

export function BookmarkButton({ isBookmarked, onToggle, size = 20 }: BookmarkButtonProps) {
  const [animating, setAnimating] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimating(true);
    onToggle();
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <button
      onClick={handleClick}
      className={`relative flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 ${
        isBookmarked
          ? 'text-brass-400 bg-brass-400/15 border border-brass-400/30'
          : 'text-gray-500 hover:text-brass-300 bg-white/[0.03] border border-white/[0.06] hover:border-brass-400/20'
      }`}
      title={isBookmarked ? 'Remove bookmark' : 'Bookmark this case'}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={isBookmarked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={1.5}
        className={animating ? 'animate-bookmark-pop' : 'transition-transform duration-200'}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
    </button>
  );
}
