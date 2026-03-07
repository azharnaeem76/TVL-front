'use client';

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'tvl-search-history';
const MAX_HISTORY = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const addSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setHistory(prev => {
      const filtered = prev.filter(q => q !== trimmed);
      const updated = [trimmed, ...filtered].slice(0, MAX_HISTORY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeSearch = (query: string) => {
    setHistory(prev => {
      const updated = prev.filter(q => q !== query);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { history, addSearch, removeSearch, clearHistory };
}

export function SearchHistoryDropdown({
  history,
  onSelect,
  onRemove,
  onClear,
}: {
  history: string[];
  onSelect: (q: string) => void;
  onRemove: (q: string) => void;
  onClear: () => void;
}) {
  if (history.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 z-50 glass-strong !rounded-xl overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/[0.06]">
        <span className="text-[10px] uppercase tracking-wider text-brass-400/50 font-semibold">Recent Searches</span>
        <button onClick={onClear} className="text-[10px] text-gray-500 hover:text-red-400 transition-colors">Clear All</button>
      </div>
      <div className="max-h-60 overflow-y-auto">
        {history.map((q, i) => (
          <div key={i} className="flex items-center gap-2 px-4 py-2.5 hover:bg-white/[0.04] transition-colors group cursor-pointer" onClick={() => onSelect(q)}>
            <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="flex-1 text-sm text-gray-300 truncate">{q}</span>
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(q); }}
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
