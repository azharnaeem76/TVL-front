'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'tvl_saved_searches';

interface SavedSearch {
  id: number;
  query: string;
  category?: string;
  court?: string;
  savedAt: number;
  lastChecked?: number;
  newResults?: number;
}

export function useSavedSearches() {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSavedSearches(JSON.parse(stored));
    } catch {}
  }, []);

  const save = useCallback((items: SavedSearch[]) => {
    setSavedSearches(items);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, []);

  const saveSearch = useCallback((query: string, category?: string, court?: string) => {
    setSavedSearches(prev => {
      if (prev.some(s => s.query === query)) return prev;
      const next = [...prev, { id: Date.now(), query, category, court, savedAt: Date.now() }];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeSearch = useCallback((id: number) => {
    setSavedSearches(prev => {
      const next = prev.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearAll = useCallback(() => save([]), [save]);

  return { savedSearches, saveSearch, removeSearch, clearAll };
}

export function SavedSearchesPanel({
  searches,
  onSelect,
  onRemove,
}: {
  searches: SavedSearch[];
  onSelect: (query: string) => void;
  onRemove: (id: number) => void;
}) {
  if (searches.length === 0) return null;

  return (
    <div className="court-panel p-4">
      <h3 className="text-xs font-semibold text-brass-400/50 uppercase tracking-wider mb-3 flex items-center gap-2">
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        Saved Searches
      </h3>
      <div className="space-y-1">
        {searches.map(s => (
          <div key={s.id} className="flex items-center gap-2 group">
            <button
              onClick={() => onSelect(s.query)}
              className="flex-1 text-left text-sm text-gray-400 hover:text-brass-300 truncate transition-colors py-1"
            >
              {s.query}
            </button>
            {s.newResults && s.newResults > 0 && (
              <span className="badge-verdict text-[9px] !py-0">{s.newResults} new</span>
            )}
            <button
              onClick={() => onRemove(s.id)}
              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
