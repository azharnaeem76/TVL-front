'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getCaseLaws, getCurrentUser } from '@/lib/api';
import { BookmarkButton, useBookmarks } from '@/components/Bookmarks';
import VoiceSearch from '@/components/VoiceSearch';
import { GavelSVG } from '@/components/CourtElements';
import { CaseLawsGridSkeleton } from '@/components/Skeleton';
import { ExportButton } from '@/components/PDFExport';
import ReadingMode from '@/components/ReadingMode';

interface CaseLaw {
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

export default function CaseLawsPage() {
  const [caseLaws, setCaseLaws] = useState<CaseLaw[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [readingCase, setReadingCase] = useState<CaseLaw | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();

  useEffect(() => {
    setCaseLaws([]);
    setPage(0);
    setHasMore(true);
    loadCaseLaws(0, true);
  }, [category]);

  const loadCaseLaws = async (pageNum: number, reset = false) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const data = await getCaseLaws({
        category: category || undefined,
        search: search || undefined,
        limit: PAGE_SIZE,
        skip: pageNum * PAGE_SIZE,
      });
      const results = Array.isArray(data) ? data : data.results || [];
      if (reset) {
        setCaseLaws(results);
      } else {
        setCaseLaws(prev => [...prev, ...results]);
      }
      setHasMore(results.length >= PAGE_SIZE);
      setPage(pageNum);
    } catch (err) {
      console.error('Failed to load case laws');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadCaseLaws(page + 1);
    }
  };

  const formatCourt = (c: string) => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />

      {readingCase && (
        <ReadingMode
          title={readingCase.title}
          citation={readingCase.citation}
          court={readingCase.court}
          year={readingCase.year}
          judge={readingCase.judge_name}
          summaryEn={readingCase.summary_en}
          summaryUr={readingCase.summary_ur}
          headnotes={readingCase.headnotes}
          sections={readingCase.sections_applied}
          onClose={() => setReadingCase(null)}
        />
      )}

      <main className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <GavelSVG size={28} className="opacity-30" />
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Case Laws Library</h1>
          </div>
          {getCurrentUser()?.role === 'admin' && (
            <Link href="/admin?tab=case-laws" className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
              <span className="hidden sm:inline">Add Case Law</span>
            </Link>
          )}
        </div>
        <p className="text-gray-400 mb-8 text-sm">Browse Pakistani case laws from all superior courts</p>

        {/* Filters */}
        <div className="court-panel p-4 sm:p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Search by title or citation..."
                className="input-field flex-1 !border-brass-400/10 focus:!border-brass-400/30"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { setCaseLaws([]); setPage(0); setHasMore(true); loadCaseLaws(0, true); } }}
              />
              <VoiceSearch onResult={(text) => setSearch(text)} />
            </div>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field sm:w-48 !border-brass-400/10">
              <option value="">All Categories</option>
              <option value="criminal">Criminal</option>
              <option value="family">Family</option>
              <option value="property">Property</option>
              <option value="constitutional">Constitutional</option>
              <option value="cyber">Cyber Crime</option>
              <option value="banking">Banking</option>
              <option value="taxation">Taxation</option>
              <option value="islamic">Islamic Law</option>
              <option value="labor">Labor</option>
              <option value="human_rights">Human Rights</option>
            </select>
            <button onClick={() => { setCaseLaws([]); setPage(0); setHasMore(true); loadCaseLaws(0, true); }} className="btn-primary !py-2.5">Search</button>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <CaseLawsGridSkeleton count={6} />
        ) : (
          <div className="space-y-4">
            {caseLaws.map(cl => (
              <div
                key={cl.id}
                className="card-court cursor-pointer"
                onClick={() => setExpanded(expanded === cl.id ? null : cl.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <span className="font-mono text-sm font-semibold text-brass-300">{cl.citation}</span>
                    <h3 className="font-semibold text-white mt-1">{cl.title}</h3>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs">
                      <span className="badge-court">{formatCourt(cl.court)}</span>
                      <span className="badge bg-white/[0.04] text-gray-400 border-white/[0.06]">{cl.category.replace(/_/g, ' ')}</span>
                      {cl.year && <span className="badge bg-white/[0.04] text-gray-400 border-white/[0.06]">{cl.year}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                    <ExportButton caseData={cl} />
                    <button
                      onClick={(e) => { e.stopPropagation(); setReadingCase(cl); }}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:text-brass-300 bg-white/[0.03] border border-white/[0.06] hover:border-brass-400/20 transition-all"
                      title="Reading Mode"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </button>
                    <BookmarkButton
                      caseData={{ id: cl.id, citation: cl.citation, title: cl.title, court: cl.court, year: cl.year }}
                      isBookmarked={isBookmarked(cl.id)}
                      onToggle={() => isBookmarked(cl.id) ? removeBookmark(cl.id) : addBookmark({ id: cl.id, citation: cl.citation, title: cl.title, court: cl.court, year: cl.year })}
                    />
                    <svg
                      className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${expanded === cl.id ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                <div className={`overflow-hidden transition-all duration-500 ${expanded === cl.id ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                  <div className="pt-4 border-t border-brass-400/10 space-y-3 text-sm">
                    {cl.judge_name && (
                      <p className="text-gray-300"><strong className="text-brass-400/60">Presiding Judge:</strong> {cl.judge_name}</p>
                    )}
                    {cl.summary_en && (
                      <div>
                        <strong className="text-brass-400/60">Summary:</strong>
                        <p className="mt-1 text-gray-300 leading-relaxed">{cl.summary_en}</p>
                      </div>
                    )}
                    {cl.summary_ur && (
                      <div>
                        <strong className="text-brass-400/60">Summary (Urdu):</strong>
                        <p className="mt-1 text-gray-300 font-urdu text-right leading-relaxed" dir="rtl">{cl.summary_ur}</p>
                      </div>
                    )}
                    {cl.headnotes && (
                      <div>
                        <strong className="text-brass-400/60">Headnotes:</strong>
                        <p className="mt-1 text-gray-300 leading-relaxed">{cl.headnotes}</p>
                      </div>
                    )}
                    {cl.sections_applied && (
                      <div>
                        <strong className="text-brass-400/60">Sections Applied:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {JSON.parse(cl.sections_applied).map((s: string, i: number) => (
                            <span key={i} className="badge-verdict text-[10px]">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {caseLaws.length === 0 && (
              <div className="text-center py-20">
                <GavelSVG size={50} className="mx-auto mb-4 opacity-15" />
                <p className="text-gray-400 font-display">No case laws found in the archives.</p>
              </div>
            )}

            {hasMore && caseLaws.length > 0 && (
              <div className="text-center pt-8">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="btn-outline !py-3 !px-8"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading...
                    </span>
                  ) : 'Load More Cases'}
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
