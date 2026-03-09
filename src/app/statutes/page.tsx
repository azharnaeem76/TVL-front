'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getStatutes, getStatuteDetail, getStatuteSections, getCurrentUser } from '@/lib/api';
import { GavelSVG } from '@/components/CourtElements';

interface Statute {
  id: number;
  title: string;
  short_title?: string;
  year?: number;
  category?: string;
  description?: string;
  full_text?: string;
  summary_en?: string;
}

interface Section {
  id: number;
  section_number: string;
  title: string;
  content: string;
}

export default function StatutesPage() {
  const [statutes, setStatutes] = useState<Statute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedStatute, setSelectedStatute] = useState<Statute | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [sectionSearch, setSectionSearch] = useState('');
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadStatutes();
  }, [category]);

  const loadStatutes = async () => {
    setLoading(true);
    try {
      const data = await getStatutes({ category: category || undefined, search: search || undefined });
      const list = Array.isArray(data) ? data : data.results || [];
      setStatutes(list);
      setHasMore(list.length >= 100);
    } catch {
      setStatutes([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const query = new URLSearchParams();
      query.set('limit', '100');
      query.set('skip', String(statutes.length));
      if (category) query.set('category', category);
      if (search) query.set('search', search);
      const res = await fetch(`/api/v1/legal/statutes?${query}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('tvl_token')}` },
      });
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.results || [];
      setStatutes(prev => [...prev, ...list]);
      setHasMore(list.length >= 100);
    } catch { /* ignore */ }
    setLoadingMore(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadStatutes();
  };

  const openStatute = async (statute: Statute) => {
    setSelectedStatute(statute);
    setLoadingSections(true);
    setSectionSearch('');
    try {
      const [sectionsData, detail] = await Promise.all([
        getStatuteSections(statute.id),
        getStatuteDetail(statute.id),
      ]);
      setSections(Array.isArray(sectionsData) ? sectionsData : sectionsData.sections || []);
      // Update statute with full details (including full_text)
      setSelectedStatute(detail);
    } catch {
      setSections([]);
    } finally {
      setLoadingSections(false);
    }
  };

  const filteredSections = sectionSearch
    ? sections.filter(s =>
        s.title.toLowerCase().includes(sectionSearch.toLowerCase()) ||
        s.section_number.toLowerCase().includes(sectionSearch.toLowerCase()) ||
        s.content.toLowerCase().includes(sectionSearch.toLowerCase())
      )
    : sections;

  if (selectedStatute) {
    return (
      <div className="min-h-screen bg-navy-950 noise">
        <Navbar />
        <main className="w-full px-4 pt-24 pb-16">
          <button
            onClick={() => { setSelectedStatute(null); setSections([]); }}
            className="flex items-center gap-2 text-sm text-brass-400/70 hover:text-brass-300 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Statutes
          </button>

          <div className="court-panel p-4 sm:p-8 mb-8">
            <h1 className="text-2xl font-display font-bold text-white mb-2">{selectedStatute.title}</h1>
            <div className="flex flex-wrap gap-2 text-xs mb-4">
              {selectedStatute.year && <span className="badge-court">{selectedStatute.year}</span>}
              {selectedStatute.category && <span className="badge bg-white/[0.04] text-gray-400 border-white/[0.06]">{selectedStatute.category}</span>}
            </div>
            {selectedStatute.description && (
              <p className="text-sm text-gray-400 leading-relaxed">{selectedStatute.description}</p>
            )}
          </div>

          <div className="mb-6">
            <input
              type="text"
              placeholder="Search within sections..."
              value={sectionSearch}
              onChange={(e) => setSectionSearch(e.target.value)}
              className="input-field !py-2.5 max-w-md"
            />
          </div>

          {loadingSections ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="court-panel p-6 animate-pulse">
                  <div className="h-4 bg-white/[0.06] rounded w-24 mb-3" />
                  <div className="h-3 bg-white/[0.04] rounded w-full mb-2" />
                  <div className="h-3 bg-white/[0.04] rounded w-3/4" />
                </div>
              ))}
            </div>
          ) : sections.length === 0 ? (
            selectedStatute.full_text || selectedStatute.summary_en ? (
              <div className="court-panel p-6">
                {selectedStatute.summary_en && (
                  <div className="mb-6">
                    <h3 className="text-sm font-semibold text-brass-400/60 uppercase tracking-wider mb-3">Summary</h3>
                    <p className="text-sm text-gray-300 leading-relaxed">{selectedStatute.summary_en}</p>
                  </div>
                )}
                {selectedStatute.full_text && (
                  <div>
                    <h3 className="text-sm font-semibold text-brass-400/60 uppercase tracking-wider mb-3">Full Text</h3>
                    <div className="prose text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{selectedStatute.full_text}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16">
                <p className="text-gray-400">No content available for this statute yet.</p>
              </div>
            )
          ) : filteredSections.length > 0 ? (
            <div className="space-y-3">
              {filteredSections.map((s) => (
                <details key={s.id} className="court-panel group">
                  <summary className="p-5 cursor-pointer flex items-center justify-between hover:bg-white/[0.02] transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-brass-300">S. {s.section_number}</span>
                      <span className="text-sm text-white font-medium">{s.title}</span>
                    </div>
                    <svg className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-5 pb-5 border-t border-brass-400/10">
                    <div className="prose text-sm text-gray-300 leading-relaxed pt-4 whitespace-pre-wrap">{s.content}</div>
                  </div>
                </details>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-500">No sections found</p>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="w-full px-4 pt-24 pb-16">
        <div className="court-panel p-4 sm:p-8 mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <GavelSVG size={28} className="opacity-40" />
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Statute Browser</h1>
            </div>
            {getCurrentUser()?.role === 'admin' && (
              <Link href="/admin?tab=statutes" className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                <span className="hidden sm:inline">Add Statute</span>
              </Link>
            )}
          </div>
          <p className="text-gray-400 text-sm mb-6">Browse Pakistani statutes and their sections</p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Search statutes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field !py-2.5 flex-1"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field !py-2.5 sm:w-48"
            >
              <option value="">All Categories</option>
              <option value="criminal">Criminal</option>
              <option value="civil">Civil</option>
              <option value="constitutional">Constitutional</option>
              <option value="family">Family</option>
              <option value="property">Property</option>
              <option value="corporate">Corporate</option>
              <option value="taxation">Taxation</option>
            </select>
            <button type="submit" className="btn-gavel !py-2.5">Search</button>
          </form>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="court-panel p-6 animate-pulse">
                <div className="h-5 bg-white/[0.06] rounded w-3/4 mb-3" />
                <div className="h-3 bg-white/[0.04] rounded w-1/2 mb-2" />
                <div className="h-3 bg-white/[0.04] rounded w-full" />
              </div>
            ))}
          </div>
        ) : statutes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {statutes.map((statute) => (
              <button
                key={statute.id}
                onClick={() => openStatute(statute)}
                className="card-court text-left group"
              >
                <h3 className="font-display font-semibold text-white group-hover:text-brass-300 transition-colors mb-2 line-clamp-2">
                  {statute.title}
                </h3>
                <div className="flex flex-wrap gap-2 text-xs mb-3">
                  {statute.year && <span className="badge-court">{statute.year}</span>}
                  {statute.category && <span className="badge bg-white/[0.04] text-gray-400 border-white/[0.06]">{statute.category}</span>}
                </div>
                {statute.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">{statute.description}</p>
                )}
                <div className="mt-3 flex items-center gap-1 text-xs text-brass-400/50 group-hover:text-brass-400/80 transition-colors">
                  <span>View Sections</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-24">
            <GavelSVG size={60} className="mx-auto mb-6 opacity-20" />
            <p className="text-lg text-gray-400 font-display">No Statutes Found</p>
            <p className="text-sm mt-2 text-gray-600">Try a different search or category</p>
          </div>
        )}

        {hasMore && !loading && statutes.length > 0 && (
          <div className="text-center mt-8">
            <button onClick={loadMore} disabled={loadingMore}
              className="px-8 py-3 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50">
              {loadingMore ? 'Loading...' : `Load More (showing ${statutes.length})`}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
