'use client';

import { useState } from 'react';

interface CaseForComparison {
  id: number;
  citation: string;
  title: string;
  court: string;
  year: number | null;
  judge_name: string | null;
  summary_en: string | null;
  headnotes: string | null;
  sections_applied: string | null;
}

export function useComparison() {
  const [cases, setCases] = useState<CaseForComparison[]>([]);

  const addToComparison = (c: CaseForComparison) => {
    setCases(prev => {
      if (prev.some(p => p.id === c.id)) return prev;
      if (prev.length >= 3) return prev;
      return [...prev, c];
    });
  };

  const removeFromComparison = (id: number) => {
    setCases(prev => prev.filter(c => c.id !== id));
  };

  const isInComparison = (id: number) => cases.some(c => c.id === id);

  const clearComparison = () => setCases([]);

  return { comparisonCases: cases, addToComparison, removeFromComparison, isInComparison, clearComparison };
}

export function ComparisonBar({
  cases,
  onOpen,
  onRemove,
  onClear,
}: {
  cases: CaseForComparison[];
  onOpen: () => void;
  onRemove: (id: number) => void;
  onClear: () => void;
}) {
  if (cases.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy-950/95 backdrop-blur-xl border-t border-brass-400/20 px-4 py-3 animate-slide-up">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 overflow-x-auto">
          <span className="text-xs text-brass-400/60 uppercase tracking-wider whitespace-nowrap">Compare ({cases.length}/3)</span>
          {cases.map(c => (
            <div key={c.id} className="flex items-center gap-2 px-3 py-1.5 bg-white/[0.04] rounded-lg border border-brass-400/15 whitespace-nowrap">
              <span className="text-xs text-brass-300 font-mono">{c.citation}</span>
              <button onClick={() => onRemove(c.id)} className="text-gray-500 hover:text-red-400">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={onClear} className="text-xs text-gray-500 hover:text-red-400 transition-colors">Clear</button>
          <button onClick={onOpen} disabled={cases.length < 2} className="btn-primary !py-2 !px-4 text-xs disabled:opacity-30">
            Compare
          </button>
        </div>
      </div>
    </div>
  );
}

export function ComparisonModal({
  cases,
  onClose,
}: {
  cases: CaseForComparison[];
  onClose: () => void;
}) {
  const formatCourt = (c: string) => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="fixed inset-0 z-[95] bg-navy-950/98 backdrop-blur-xl overflow-y-auto">
      <div className="sticky top-0 z-10 bg-navy-950/90 backdrop-blur-lg border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <span className="text-xs text-brass-400/50 uppercase tracking-wider font-semibold">Case Comparison</span>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className={`grid gap-6 ${cases.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {cases.map(c => (
            <div key={c.id} className="court-panel p-6 space-y-4">
              <div>
                <span className="font-mono text-sm font-bold text-brass-300">{c.citation}</span>
                <h3 className="text-lg font-display font-bold text-white mt-1">{c.title}</h3>
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  <span className="badge-court">{formatCourt(c.court)}</span>
                  {c.year && <span className="badge bg-white/[0.04] text-gray-400 border-white/[0.06]">{c.year}</span>}
                </div>
                {c.judge_name && <p className="text-xs text-gray-500 mt-2 italic">{c.judge_name}</p>}
              </div>

              {c.summary_en && (
                <div>
                  <h4 className="text-xs font-semibold text-brass-400/60 uppercase tracking-wider mb-1">Summary</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{c.summary_en}</p>
                </div>
              )}

              {c.headnotes && (
                <div>
                  <h4 className="text-xs font-semibold text-brass-400/60 uppercase tracking-wider mb-1">Headnotes</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{c.headnotes}</p>
                </div>
              )}

              {c.sections_applied && (
                <div>
                  <h4 className="text-xs font-semibold text-brass-400/60 uppercase tracking-wider mb-1">Sections</h4>
                  <div className="flex flex-wrap gap-1">
                    {JSON.parse(c.sections_applied).map((s: string, i: number) => (
                      <span key={i} className="badge-verdict text-[10px]">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
