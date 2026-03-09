'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { scenarioSearch } from '@/lib/api';
import GavelStrike from '@/components/GavelStrike';
import VoiceSearch from '@/components/VoiceSearch';
import { BookmarkButton, useBookmarks } from '@/components/Bookmarks';
import { GavelSVG } from '@/components/CourtElements';
import { useSearchHistory, SearchHistoryDropdown } from '@/components/SearchHistory';
import { SearchResultsSkeleton } from '@/components/Skeleton';
import { ShareButton } from '@/components/ShareLink';
import { ExportButton } from '@/components/PDFExport';
import ReadingMode from '@/components/ReadingMode';
import { useComparison, ComparisonBar, ComparisonModal } from '@/components/ComparisonView';
import { SearchSuggestions } from '@/components/SearchSuggestions';
import { useSavedSearches, SavedSearchesPanel } from '@/components/SavedSearches';
import { CitationGraph } from '@/components/CitationGraph';
import { useToast } from '@/components/Toast';

interface CaseLawResult {
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
  similarity_score: number | null;
}

interface SearchResult {
  query: string;
  detected_language: string;
  normalized_query: string;
  results: CaseLawResult[];
  ai_analysis: string;
  total_results: number;
}

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  { value: 'criminal', label: 'Criminal' },
  { value: 'civil', label: 'Civil' },
  { value: 'constitutional', label: 'Constitutional' },
  { value: 'family', label: 'Family' },
  { value: 'property', label: 'Property' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'taxation', label: 'Taxation' },
  { value: 'labor', label: 'Labor' },
  { value: 'cyber', label: 'Cyber Crime' },
  { value: 'banking', label: 'Banking' },
  { value: 'islamic', label: 'Islamic Law' },
  { value: 'human_rights', label: 'Human Rights' },
];

const COURTS = [
  { value: '', label: 'All Courts' },
  { value: 'supreme_court', label: 'Supreme Court' },
  { value: 'federal_shariat_court', label: 'Federal Shariat Court' },
  { value: 'lahore_high_court', label: 'Lahore High Court' },
  { value: 'sindh_high_court', label: 'Sindh High Court' },
  { value: 'peshawar_high_court', label: 'Peshawar High Court' },
  { value: 'balochistan_high_court', label: 'Balochistan High Court' },
  { value: 'islamabad_high_court', label: 'Islamabad High Court' },
];

export default function SearchPageWrapper() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-950" />}>
      <SearchPage />
    </Suspense>
  );
}

function SearchPage() {
  const searchParams = useSearchParams();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [court, setCourt] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);
  const [error, setError] = useState('');
  const [expandedCase, setExpandedCase] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [gavelTrigger, setGavelTrigger] = useState(false);
  const [readingCase, setReadingCase] = useState<CaseLawResult | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [judgeName, setJudgeName] = useState('');
  const [showComparison, setShowComparison] = useState(false);
  const [showCitationGraph, setShowCitationGraph] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showOperators, setShowOperators] = useState(false);
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { history, addSearch, removeSearch, clearHistory } = useSearchHistory();
  const { comparisonCases, addToComparison, removeFromComparison, isInComparison, clearComparison } = useComparison();
  const { savedSearches, saveSearch, removeSearch: removeSaved } = useSavedSearches();
  const { toast } = useToast();

  const doSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError('');
    addSearch(searchQuery);
    try {
      const data = await scenarioSearch(searchQuery, {
        category: category || undefined,
        court: court || undefined,
      });
      if (yearFrom || yearTo || judgeName) {
        data.results = data.results.filter((cl: CaseLawResult) => {
          if (yearFrom && cl.year && cl.year < parseInt(yearFrom)) return false;
          if (yearTo && cl.year && cl.year > parseInt(yearTo)) return false;
          if (judgeName && cl.judge_name && !cl.judge_name.toLowerCase().includes(judgeName.toLowerCase())) return false;
          return true;
        });
        data.total_results = data.results.length;
      }
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [category, court, yearFrom, yearTo, judgeName, addSearch]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      doSearch(q);
    }
  }, [searchParams, doSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setGavelTrigger(true);
      setTimeout(() => doSearch(query), 600);
    }
  };

  const getLangBadge = (lang: string) => {
    const config: Record<string, { cls: string; label: string }> = {
      english: { cls: 'badge-primary', label: 'English' },
      urdu: { cls: 'badge-gold', label: 'اردو' },
      roman_urdu: { cls: 'badge-emerald', label: 'Roman Urdu' },
    };
    const c = config[lang] || { cls: 'badge-gold', label: lang };
    return <span className={c.cls}>{c.label}</span>;
  };

  const formatCourt = (c: string) => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <GavelStrike trigger={gavelTrigger} onComplete={() => setGavelTrigger(false)} />

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

      <main className="w-full px-4 pt-24 pb-16">
        {/* Search Form */}
        <div className="court-panel p-4 sm:p-8 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <GavelSVG size={28} className="opacity-40" />
            <h1 className="text-3xl font-display font-bold text-white">Legal Scenario Search</h1>
          </div>
          <p className="text-gray-400 mb-6 text-sm">
            Apna legal masla English, اردو, ya Roman Urdu mein likhein
          </p>

          <form onSubmit={handleSearch} role="search" aria-label="Legal scenario search">
            <div className="relative">
              <textarea
                value={query}
                onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowHistory(true)}
                onBlur={() => setTimeout(() => { setShowHistory(false); setShowSuggestions(false); }, 200)}
                placeholder="Describe your legal scenario here..."
                aria-label="Describe your legal scenario"
                className="input-field text-base sm:text-lg resize-none !rounded-xl !bg-white/[0.03] !border-brass-400/10 focus:!border-brass-400/30"
                rows={3}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSearch(e); } }}
              />
              {showHistory && !query && history.length > 0 && (
                <SearchHistoryDropdown
                  history={history}
                  onSelect={(q) => { setQuery(q); setShowHistory(false); }}
                  onRemove={removeSearch}
                  onClear={clearHistory}
                />
              )}
              <SearchSuggestions
                query={query}
                onSelect={(s) => { setQuery(s); setShowSuggestions(false); }}
                visible={showSuggestions && query.length >= 2}
              />
            </div>

            <div className="mt-4 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-sm text-brass-400/70 hover:text-brass-300 transition-colors flex items-center gap-1"
                >
                  <svg className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                  {showFilters ? 'Hide' : 'Show'} Filters
                </button>
                <VoiceSearch onResult={(text) => setQuery(prev => prev ? prev + ' ' + text : text)} />
                <button
                  type="button"
                  onClick={() => setShowOperators(!showOperators)}
                  className="text-sm text-brass-400/70 hover:text-brass-300 transition-colors flex items-center gap-1"
                  title="Search operators help"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                  </svg>
                  Operators
                </button>
              </div>
              <button type="submit" disabled={loading || !query.trim()} className="btn-gavel">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Searching...
                  </span>
                ) : 'Search'}
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 p-4 bg-white/[0.02] rounded-xl border border-brass-400/10">
                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">Law Category</label>
                  <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field !py-2.5">
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">Court</label>
                  <select value={court} onChange={(e) => setCourt(e.target.value)} className="input-field !py-2.5">
                    {COURTS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">Year Range</label>
                  <div className="flex gap-2">
                    <input type="number" placeholder="From" value={yearFrom} onChange={(e) => setYearFrom(e.target.value)} className="input-field !py-2.5 w-1/2" min="1947" max="2026" />
                    <input type="number" placeholder="To" value={yearTo} onChange={(e) => setYearTo(e.target.value)} className="input-field !py-2.5 w-1/2" min="1947" max="2026" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">Judge Name</label>
                  <input type="text" placeholder="Search by judge..." value={judgeName} onChange={(e) => setJudgeName(e.target.value)} className="input-field !py-2.5" />
                </div>
              </div>
            )}
            {showOperators && (
              <div className="mt-4 p-4 bg-white/[0.02] rounded-xl border border-brass-400/10">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-brass-300">Search Operators & Tips</h4>
                  <button onClick={() => setShowOperators(false)} className="text-gray-600 hover:text-gray-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {[
                    { op: '"exact phrase"', desc: 'Search for exact phrase match', example: '"fundamental rights"' },
                    { op: 'term1 AND term2', desc: 'Both terms must appear', example: 'murder AND self-defense' },
                    { op: 'term1 OR term2', desc: 'Either term can appear', example: 'bail OR surety' },
                    { op: 'NOT term', desc: 'Exclude results with term', example: 'property NOT commercial' },
                    { op: 'section:PPC 302', desc: 'Search by specific section', example: 'section:CrPC 497' },
                    { op: 'court:supreme', desc: 'Filter by court in query', example: 'court:lahore rent dispute' },
                    { op: 'year:2020', desc: 'Filter by specific year', example: 'year:2023 cyber crime' },
                    { op: 'judge:"Justice Name"', desc: 'Filter by judge name', example: 'judge:"Isa" Article 184' },
                  ].map((item, i) => (
                    <div key={i} className="p-2.5 bg-white/[0.02] rounded-lg border border-white/[0.04]">
                      <code className="text-brass-300 font-mono text-[11px]">{item.op}</code>
                      <p className="text-gray-500 mt-0.5">{item.desc}</p>
                      <button
                        type="button"
                        onClick={() => { setQuery(item.example); setShowOperators(false); }}
                        className="text-brass-400/50 hover:text-brass-300 mt-1 transition-colors"
                      >
                        Try: <span className="italic">{item.example}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>

        {error && (
          <div className="glass p-4 mb-6 !border-red-500/30 !bg-red-500/10">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && !result && <SearchResultsSkeleton count={3} />}

        {/* Results */}
        {result && !loading && (
          <div className="space-y-6 animate-verdict-in">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-display font-semibold text-white">
                  {result.total_results} Judgment{result.total_results !== 1 ? 's' : ''} Found
                </h2>
                {getLangBadge(result.detected_language)}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { saveSearch(query, category, court); toast('Search saved', 'success'); }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-brass-300 bg-white/[0.03] border border-white/[0.06] hover:border-brass-400/20 transition-all"
                  title="Save this search"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  Save
                </button>
                {result.results.length > 1 && (
                  <button
                    onClick={() => setShowCitationGraph(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-brass-300 bg-white/[0.03] border border-white/[0.06] hover:border-brass-400/20 transition-all"
                    title="View citation graph"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                    </svg>
                    Graph
                  </button>
                )}
                <ShareButton query={query} />
                {result.normalized_query !== result.query && (
                  <p className="text-sm text-gray-500">
                    Interpreted as: <span className="italic text-brass-400/70">{result.normalized_query}</span>
                  </p>
                )}
              </div>
            </div>

            {/* AI Analysis — The Verdict */}
            <div className="court-panel p-6 border-l-2 border-l-brass-400">
              <h3 className="text-lg font-display font-semibold text-white mb-3 flex items-center gap-3">
                <span className="w-8 h-8 bg-brass-400/20 rounded-lg flex items-center justify-center text-brass-300 text-sm font-bold border border-brass-400/30">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                  </svg>
                </span>
                AI Analysis
              </h3>
              <div className="prose text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{result.ai_analysis}</div>
            </div>

            {/* Case Laws */}
            <div>
              <h3 className="text-lg font-display font-semibold text-white mb-4">Cited Precedents</h3>
              <div className="space-y-4">
                {result.results.map((cl) => (
                  <div
                    key={cl.id}
                    className="card-court cursor-pointer"
                    onClick={() => setExpandedCase(expandedCase === cl.id ? null : cl.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-mono text-sm font-semibold text-brass-300">{cl.citation}</span>
                          {cl.similarity_score && (
                            <span className="badge-verdict text-[10px]">
                              {(cl.similarity_score * 100).toFixed(0)}% relevant
                            </span>
                          )}
                        </div>
                        <h4 className="font-semibold text-white mb-2">{cl.title}</h4>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <span className="badge-court">{formatCourt(cl.court)}</span>
                          <span className="badge bg-white/[0.04] text-gray-400 border-white/[0.06]">{cl.category.replace(/_/g, ' ')}</span>
                          {cl.year && <span className="badge bg-white/[0.04] text-gray-400 border-white/[0.06]">{cl.year}</span>}
                          {cl.judge_name && <span className="text-gray-500 text-xs italic">{cl.judge_name}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => { e.stopPropagation(); isInComparison(cl.id) ? removeFromComparison(cl.id) : addToComparison(cl); }}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition-all border ${
                            isInComparison(cl.id)
                              ? 'bg-brass-400/15 border-brass-400/30 text-brass-300'
                              : 'bg-white/[0.03] border-white/[0.06] text-gray-500 hover:text-brass-300 hover:border-brass-400/20'
                          }`}
                          title={isInComparison(cl.id) ? 'Remove from comparison' : 'Add to comparison'}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                          </svg>
                        </button>
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
                          className={`w-5 h-5 text-gray-500 transition-transform duration-300 ${expandedCase === cl.id ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <div className={`overflow-hidden transition-all duration-500 ${expandedCase === cl.id ? 'max-h-[2000px] opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                      <div className="pt-4 border-t border-brass-400/10 space-y-4">
                        {cl.summary_en && (
                          <div>
                            <h5 className="text-sm font-semibold text-brass-400/60 mb-1">Summary (English)</h5>
                            <p className="text-sm text-gray-300 leading-relaxed">{cl.summary_en}</p>
                          </div>
                        )}
                        {cl.summary_ur && (
                          <div className="p-3 rounded-lg bg-white/[0.02] border border-brass-400/10">
                            <h5 className="text-sm font-semibold text-brass-400/60 mb-1">خلاصہ (Urdu)</h5>
                            <p className="font-urdu text-right whitespace-pre-wrap" dir="rtl">{cl.summary_ur}</p>
                          </div>
                        )}
                        {cl.headnotes && (
                          <div>
                            <h5 className="text-sm font-semibold text-brass-400/60 mb-1">Headnotes</h5>
                            <p className="text-sm text-gray-300 leading-relaxed">{cl.headnotes}</p>
                          </div>
                        )}
                        {cl.sections_applied && (
                          <div>
                            <h5 className="text-sm font-semibold text-brass-400/60 mb-1">Sections Applied</h5>
                            <div className="flex flex-wrap gap-1">
                              {(() => { try { return JSON.parse(cl.sections_applied); } catch { return []; } })().map((s: string, i: number) => (
                                <span key={i} className="badge-verdict text-[10px]">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Saved Searches */}
        {!result && !loading && savedSearches.length > 0 && (
          <div className="mb-8">
            <SavedSearchesPanel
              searches={savedSearches}
              onSelect={(q) => { setQuery(q); doSearch(q); }}
              onRemove={removeSaved}
            />
          </div>
        )}

        {/* Empty State */}
        {!result && !loading && !error && (
          <div className="text-center py-24">
            <GavelSVG size={60} className="mx-auto mb-6 opacity-20 animate-gavel-idle" />
            <p className="text-lg text-gray-400 font-display">Describe Your Legal Scenario</p>
            <p className="text-sm mt-2 text-gray-600">Search in English, Urdu, or Roman Urdu above</p>
          </div>
        )}
      </main>

      <ComparisonBar
        cases={comparisonCases}
        onOpen={() => setShowComparison(true)}
        onRemove={removeFromComparison}
        onClear={clearComparison}
      />

      {showComparison && (
        <ComparisonModal
          cases={comparisonCases}
          onClose={() => setShowComparison(false)}
        />
      )}

      {showCitationGraph && result && (
        <CitationGraph
          cases={result.results.map(r => ({ id: r.id, citation: r.citation, title: r.title, court: r.court, year: r.year }))}
          onCaseClick={(id) => { setShowCitationGraph(false); setExpandedCase(id); }}
          onClose={() => setShowCitationGraph(false)}
        />
      )}
    </div>
  );
}
