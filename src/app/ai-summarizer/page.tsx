'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { aiSummarize } from '@/lib/api';

export default function AISummarizerPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { showToast } = useToast();

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const handleSubmit = async () => {
    if (!text.trim()) return showToast('Please enter text to summarize', 'error');
    setLoading(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    try {
      const data = await aiSummarize(text);
      setResult(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to summarize', 'error');
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">AI Case Summarizer</h1>
            <p className="text-gray-400 mt-1">Paste a legal judgment or document to get an AI-generated summary</p>
          </div>

          <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6 mb-6">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the legal judgment or document text here..."
              className="w-full h-64 bg-navy-900/50 border border-brass-400/10 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-brass-400/30"
            />
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-500">{text.length} characters</span>
              <button
                onClick={handleSubmit}
                disabled={loading || !text.trim()}
                className="px-6 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Summarizing... ({elapsed}s)
                  </span>
                ) : 'Summarize'}
              </button>
            </div>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-brass-300 mb-3">Summary</h2>
                <p className="text-gray-300 leading-relaxed">{result.summary}</p>
              </div>

              {result.key_points?.length > 0 && (
                <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-brass-300 mb-3">Key Points</h2>
                  <ul className="space-y-2">
                    {result.key_points.map((p: string, i: number) => (
                      <li key={i} className="flex gap-2 text-gray-300">
                        <span className="text-brass-400 mt-1">&#8226;</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {result.sections_cited?.length > 0 && (
                <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-brass-300 mb-3">Sections Cited</h2>
                  <div className="flex flex-wrap gap-2">
                    {result.sections_cited.map((s: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-brass-400/10 text-brass-300 rounded-full text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.court && (
                <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-brass-300 mb-2">Court</h2>
                  <p className="text-gray-300">{result.court}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
