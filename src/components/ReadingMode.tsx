'use client';

import { useState } from 'react';

interface ReadingModeProps {
  title: string;
  citation: string;
  court: string;
  year: number | null;
  judge?: string | null;
  summaryEn?: string | null;
  summaryUr?: string | null;
  headnotes?: string | null;
  sections?: string | null;
  onClose: () => void;
}

export default function ReadingMode({
  title, citation, court, year, judge,
  summaryEn, summaryUr, headnotes, sections,
  onClose,
}: ReadingModeProps) {
  const [fontSize, setFontSize] = useState(16);

  const formatCourt = (c: string) => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="fixed inset-0 z-[90] bg-navy-950/98 backdrop-blur-xl overflow-y-auto">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 bg-navy-950/90 backdrop-blur-lg border-b border-white/[0.06]">
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <span className="text-xs text-brass-400/50 uppercase tracking-wider font-semibold">Reading Mode</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setFontSize(f => Math.max(12, f - 2))} className="w-8 h-8 rounded-lg bg-white/[0.04] text-gray-400 hover:text-white text-sm font-bold transition-colors">A-</button>
            <span className="text-xs text-gray-500 w-8 text-center">{fontSize}</span>
            <button onClick={() => setFontSize(f => Math.min(24, f + 2))} className="w-8 h-8 rounded-lg bg-white/[0.04] text-gray-400 hover:text-white text-sm font-bold transition-colors">A+</button>
            <button
              onClick={() => window.print()}
              className="ml-2 w-8 h-8 rounded-lg bg-white/[0.04] text-gray-400 hover:text-white transition-colors flex items-center justify-center"
              title="Print"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m0 0a48.159 48.159 0 0110.5 0m-10.5 0V4.875c0-.621.504-1.125 1.125-1.125h8.25c.621 0 1.125.504 1.125 1.125v3.659" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-12" style={{ fontSize: `${fontSize}px` }}>
        <div className="mb-8">
          <span className="font-mono text-brass-300 font-semibold text-sm">{citation}</span>
          <h1 className="text-2xl font-display font-bold text-white mt-2 mb-4 leading-tight">{title}</h1>
          <div className="flex flex-wrap gap-3 text-sm text-gray-400">
            <span>{formatCourt(court)}</span>
            {year && <span>({year})</span>}
            {judge && <span className="italic">— {judge}</span>}
          </div>
        </div>

        <div className="divider mb-8" />

        {summaryEn && (
          <section className="mb-8">
            <h2 className="text-lg font-display font-semibold text-brass-300 mb-3">Summary</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{summaryEn}</p>
          </section>
        )}

        {summaryUr && (
          <section className="mb-8">
            <h2 className="text-lg font-display font-semibold text-brass-300 mb-3">خلاصہ</h2>
            <p className="font-urdu text-right whitespace-pre-wrap" dir="rtl">{summaryUr}</p>
          </section>
        )}

        {headnotes && (
          <section className="mb-8">
            <h2 className="text-lg font-display font-semibold text-brass-300 mb-3">Headnotes</h2>
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{headnotes}</p>
          </section>
        )}

        {sections && (
          <section className="mb-8">
            <h2 className="text-lg font-display font-semibold text-brass-300 mb-3">Sections Applied</h2>
            <div className="flex flex-wrap gap-2">
              {JSON.parse(sections).map((s: string, i: number) => (
                <span key={i} className="badge-verdict">{s}</span>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
