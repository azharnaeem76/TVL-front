'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { aiOpinion } from '@/lib/api';

const AREAS = ['General', 'Criminal', 'Civil', 'Family', 'Property', 'Constitutional', 'Corporate', 'Labour', 'Cyber Crime'];

export default function AIOpinionPage() {
  const [facts, setFacts] = useState('');
  const [area, setArea] = useState('General');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { showToast } = useToast();

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const handleSubmit = async () => {
    if (!facts.trim()) return showToast('Please enter the facts', 'error');
    setLoading(true);
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    try {
      const data = await aiOpinion(facts, area);
      setResult(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to generate opinion', 'error');
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
            <h1 className="text-2xl font-display font-bold text-white">AI Legal Opinion</h1>
            <p className="text-gray-400 mt-1">Generate a preliminary legal opinion based on your case facts</p>
          </div>

          <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6 mb-6">
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-1 block">Area of Law</label>
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-navy-900/50 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-brass-400/30"
              >
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <textarea
              value={facts}
              onChange={(e) => setFacts(e.target.value)}
              placeholder="Describe the facts of your case in detail..."
              className="w-full h-48 bg-navy-900/50 border border-brass-400/10 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-brass-400/30"
            />
            <div className="flex justify-end mt-4">
              <button
                onClick={handleSubmit}
                disabled={loading || !facts.trim()}
                className="px-6 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    Generating... ({elapsed}s)
                  </span>
                ) : 'Generate Opinion'}
              </button>
            </div>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-brass-300 mb-3">Legal Opinion</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.opinion}</p>
              </div>

              {result.applicable_laws?.length > 0 && (
                <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-brass-300 mb-3">Applicable Laws</h2>
                  <div className="flex flex-wrap gap-2">
                    {result.applicable_laws.map((l: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm">{l}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.strengths?.length > 0 && (
                  <div className="bg-white/[0.03] border border-green-500/20 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-green-400 mb-3">Strengths</h2>
                    <ul className="space-y-2">
                      {result.strengths.map((s: string, i: number) => (
                        <li key={i} className="flex gap-2 text-gray-300 text-sm">
                          <span className="text-green-400">+</span><span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.weaknesses?.length > 0 && (
                  <div className="bg-white/[0.03] border border-red-500/20 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-red-400 mb-3">Weaknesses</h2>
                    <ul className="space-y-2">
                      {result.weaknesses.map((w: string, i: number) => (
                        <li key={i} className="flex gap-2 text-gray-300 text-sm">
                          <span className="text-red-400">-</span><span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {result.recommendation && (
                <div className="bg-brass-400/5 border border-brass-400/20 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-brass-300 mb-2">Recommendation</h2>
                  <p className="text-gray-300">{result.recommendation}</p>
                </div>
              )}

              <p className="text-xs text-gray-500 italic">Disclaimer: This is an AI-generated preliminary opinion and does not constitute legal advice. Please consult a qualified lawyer.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
