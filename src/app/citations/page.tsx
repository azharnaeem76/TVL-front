'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { aiFindCitations } from '@/lib/api';

const AREAS = ['General', 'Criminal', 'Civil', 'Family', 'Property', 'Constitutional', 'Corporate', 'Labour', 'Cyber Crime'];

export default function CitationFinderPage() {
  const [principle, setPrinciple] = useState('');
  const [area, setArea] = useState('General');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!principle.trim()) return showToast('Please enter a legal principle', 'error');
    setLoading(true);
    try {
      const data = await aiFindCitations(principle, area);
      setResult(data);
    } catch (err: any) {
      showToast(err.message || 'Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">Citation Finder</h1>
            <p className="text-gray-400 mt-1">Find relevant case citations and statutes from legal principles</p>
          </div>

          <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6 mb-6">
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-1 block">Area of Law</label>
              <select value={area} onChange={(e) => setArea(e.target.value)}
                className="w-full bg-navy-900/50 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-brass-400/30">
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <textarea value={principle} onChange={(e) => setPrinciple(e.target.value)}
              placeholder="Enter a legal principle, e.g., 'Right to bail in non-bailable offences when investigation is complete'..."
              className="w-full h-32 bg-navy-900/50 border border-brass-400/10 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-brass-400/30" />
            <div className="flex justify-end mt-4">
              <button onClick={handleSubmit} disabled={loading || !principle.trim()}
                className="px-6 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50">
                {loading ? <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Searching...</span> : 'Find Citations'}
              </button>
            </div>
          </div>

          {result && (
            <div className="space-y-4">
              {result.citations?.length > 0 && (
                <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-brass-300 mb-3">Case Citations</h2>
                  <div className="space-y-3">
                    {result.citations.map((c: any, i: number) => (
                      <div key={i} className="p-4 bg-navy-900/30 rounded-lg border border-brass-400/5">
                        <p className="text-brass-300 font-medium text-sm">{c.citation}</p>
                        {c.title && <p className="text-gray-300 text-sm mt-1">{c.title}</p>}
                        {c.relevance && <p className="text-gray-400 text-xs mt-2">{c.relevance}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.statutes?.length > 0 && (
                <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-brass-300 mb-3">Relevant Statutes</h2>
                  <div className="flex flex-wrap gap-2">
                    {result.statutes.map((s: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-brass-400/10 text-brass-300 rounded-lg text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.explanation && (
                <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-brass-300 mb-3">Explanation</h2>
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.explanation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
