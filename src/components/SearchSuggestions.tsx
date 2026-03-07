'use client';

import { useState, useEffect, useRef } from 'react';

const LEGAL_TERMS = [
  'bail application procedure',
  'bail after arrest',
  'bail in murder case',
  'khula divorce procedure',
  'talaq procedure Pakistan',
  'property transfer Pakistan',
  'zameen ka intiqal',
  'writ petition procedure',
  'FIR registration procedure',
  'Section 302 PPC punishment',
  'Section 497 CrPC bail',
  'defamation case Pakistan',
  'child custody rights',
  'inheritance law Pakistan',
  'wirasat ka qanoon',
  'rent law eviction',
  'cyber crime reporting',
  'cheque bounce case',
  'pre-arrest bail',
  'quashment of FIR',
  'constitutional petition',
  'habeas corpus',
  'anti-terrorism court',
  'family court jurisdiction',
  'appeal in High Court',
  'revision petition',
  'land revenue record',
  'nikah registration',
  'domestic violence law',
  'consumer protection',
  'employment termination rights',
  'trade mark registration',
  'company winding up',
  'tax appeal tribunal',
  'banking court recovery',
];

export function SearchSuggestions({
  query,
  onSelect,
  visible,
}: {
  query: string;
  onSelect: (suggestion: string) => void;
  visible: boolean;
}) {
  const [suggestions, setSuggestions] = useState<string[]>([]);

  useEffect(() => {
    if (!query || query.length < 2 || !visible) {
      setSuggestions([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = LEGAL_TERMS
      .filter(t => t.toLowerCase().includes(q))
      .slice(0, 6);
    setSuggestions(matches);
  }, [query, visible]);

  if (suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-1 z-50 glass-strong !rounded-xl overflow-hidden animate-fade-in">
      <div className="px-4 py-2 border-b border-white/[0.06]">
        <span className="text-[10px] uppercase tracking-wider text-brass-400/50 font-semibold">Suggestions</span>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {suggestions.map((s, i) => (
          <button
            key={i}
            className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-white/[0.04] transition-colors text-left"
            onMouseDown={(e) => { e.preventDefault(); onSelect(s); }}
          >
            <svg className="w-3.5 h-3.5 text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <span className="text-sm text-gray-300">{s}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
