'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getCaseLaw } from '@/lib/api';
import { BookmarkButton, useBookmarks } from '@/components/Bookmarks';
import { GavelSVG } from '@/components/CourtElements';
import { ExportButton } from '@/components/PDFExport';
import { CopyLinkButton } from '@/components/ShareLink';
import { CardSkeleton, Skeleton } from '@/components/Skeleton';
import ReadingMode from '@/components/ReadingMode';
import { useAnnotations, AnnotationPanel } from '@/components/Annotations';

interface CaseLawDetail {
  id: number;
  citation: string;
  title: string;
  court: string;
  category: string;
  year: number | null;
  judge_name: string | null;
  summary_en: string | null;
  summary_ur: string | null;
  headnotes: string | null;
  relevant_statutes: string | null;
  sections_applied: string | null;
}

export default function CaseLawDetailPage() {
  const params = useParams();
  const id = Number(params.id);
  const [caseLaw, setCaseLaw] = useState<CaseLawDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showReading, setShowReading] = useState(false);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { annotations, addAnnotation, removeAnnotation, updateAnnotation } = useAnnotations(id);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCaseLaw(id)
      .then(setCaseLaw)
      .catch((err) => setError(err.message || 'Failed to load case law'))
      .finally(() => setLoading(false));
  }, [id]);

  const formatCourt = (c: string) => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950 noise">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-24 pb-16 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-12 w-3/4" />
          <div className="flex gap-3"><Skeleton className="h-6 w-24 !rounded-full" /><Skeleton className="h-6 w-20 !rounded-full" /></div>
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  if (error || !caseLaw) {
    return (
      <div className="min-h-screen bg-navy-950 noise">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 pt-24 pb-16 text-center">
          <GavelSVG size={50} className="mx-auto mb-4 opacity-20" />
          <h1 className="text-xl font-display font-bold text-white mb-2">Case Not Found</h1>
          <p className="text-gray-400">{error || 'The requested case law could not be found.'}</p>
          <a href="/case-laws" className="btn-primary mt-6 inline-block">Back to Library</a>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />

      {showReading && (
        <ReadingMode
          title={caseLaw.title}
          citation={caseLaw.citation}
          court={caseLaw.court}
          year={caseLaw.year}
          judge={caseLaw.judge_name}
          summaryEn={caseLaw.summary_en}
          summaryUr={caseLaw.summary_ur}
          headnotes={caseLaw.headnotes}
          sections={caseLaw.sections_applied}
          onClose={() => setShowReading(false)}
        />
      )}

      <main className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        {/* Back link */}
        <a href="/case-laws" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brass-300 transition-colors mb-6">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Library
        </a>

        {/* Header */}
        <div className="court-panel p-4 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <CopyLinkButton text={caseLaw.citation} />
                <span className="font-mono text-lg font-bold text-brass-300">{caseLaw.citation}</span>
              </div>
              <h1 className="text-2xl font-display font-bold text-white mb-4">{caseLaw.title}</h1>
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="badge-court">{formatCourt(caseLaw.court)}</span>
                <span className="badge bg-white/[0.04] text-gray-400 border-white/[0.06]">{caseLaw.category.replace(/_/g, ' ')}</span>
                {caseLaw.year && <span className="badge bg-white/[0.04] text-gray-400 border-white/[0.06]">{caseLaw.year}</span>}
                {caseLaw.judge_name && <span className="text-gray-500 italic">Presiding: {caseLaw.judge_name}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setShowReading(true)} className="btn-ghost text-xs">Reading Mode</button>
              <ExportButton caseData={caseLaw} />
              <BookmarkButton
                caseData={{ id: caseLaw.id, citation: caseLaw.citation, title: caseLaw.title, court: caseLaw.court, year: caseLaw.year }}
                isBookmarked={isBookmarked(caseLaw.id)}
                onToggle={() => isBookmarked(caseLaw.id) ? removeBookmark(caseLaw.id) : addBookmark({ id: caseLaw.id, citation: caseLaw.citation, title: caseLaw.title, court: caseLaw.court, year: caseLaw.year })}
              />
            </div>
          </div>
        </div>

        {/* Content Sections */}
        <div className="space-y-6">
          {caseLaw.summary_en && (
            <div className="court-panel p-6">
              <h2 className="text-lg font-display font-semibold text-brass-300 mb-3">Summary (English)</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{caseLaw.summary_en}</p>
            </div>
          )}

          {caseLaw.summary_ur && (
            <div className="court-panel p-6">
              <h2 className="text-lg font-display font-semibold text-brass-300 mb-3">خلاصہ (Urdu)</h2>
              <p className="font-urdu text-right whitespace-pre-wrap" dir="rtl">{caseLaw.summary_ur}</p>
            </div>
          )}

          {caseLaw.headnotes && (
            <div className="court-panel p-6">
              <h2 className="text-lg font-display font-semibold text-brass-300 mb-3">Headnotes</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{caseLaw.headnotes}</p>
            </div>
          )}

          {caseLaw.sections_applied && (
            <div className="court-panel p-6">
              <h2 className="text-lg font-display font-semibold text-brass-300 mb-3">Sections Applied</h2>
              <div className="flex flex-wrap gap-2">
                {(() => { try { return JSON.parse(caseLaw.sections_applied); } catch { return []; } })().map((s: string, i: number) => (
                  <span key={i} className="badge-verdict">{s}</span>
                ))}
              </div>
            </div>
          )}

          {caseLaw.relevant_statutes && (
            <div className="court-panel p-6">
              <h2 className="text-lg font-display font-semibold text-brass-300 mb-3">Relevant Statutes</h2>
              <div className="flex flex-wrap gap-2">
                {caseLaw.relevant_statutes.split(/[,;\n]/).filter(Boolean).map((s, i) => (
                  <span key={i} className="badge bg-brass-400/10 text-brass-300 border-brass-400/20 text-sm px-3 py-1">{s.trim()}</span>
                ))}
              </div>
            </div>
          )}

          <AnnotationPanel
            caseId={id}
            annotations={annotations}
            onAdd={addAnnotation}
            onRemove={removeAnnotation}
            onUpdate={updateAnnotation}
          />
        </div>
      </main>
    </div>
  );
}
