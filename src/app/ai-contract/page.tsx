'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { aiAnalyzeContract } from '@/lib/api';

export default function AIContractPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!text.trim()) return showToast('Please paste contract text', 'error');
    setLoading(true);
    try {
      const data = await aiAnalyzeContract(text);
      setResult(data);
    } catch (err: any) {
      showToast(err.message || 'Analysis failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const riskColor = (risk: string) => {
    if (risk === 'High') return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (risk === 'Medium') return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-green-400 bg-green-500/10 border-green-500/20';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">Contract Analyzer</h1>
            <p className="text-gray-400 mt-1">AI analysis of contracts for risky clauses under Pakistani law</p>
          </div>

          <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6 mb-6">
            <textarea value={text} onChange={(e) => setText(e.target.value)}
              placeholder="Paste the contract text here for analysis..."
              className="w-full h-64 bg-navy-900/50 border border-brass-400/10 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-brass-400/30" />
            <div className="flex justify-between items-center mt-4">
              <span className="text-xs text-gray-500">{text.length} characters</span>
              <button onClick={handleSubmit} disabled={loading || !text.trim()}
                className="px-6 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50">
                {loading ? <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Analyzing...</span> : 'Analyze Contract'}
              </button>
            </div>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm">Overall Risk:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${riskColor(result.overall_risk)}`}>{result.overall_risk}</span>
              </div>

              <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-brass-300 mb-3">Summary</h2>
                <p className="text-gray-300 leading-relaxed">{result.summary}</p>
              </div>

              {result.risky_clauses?.length > 0 && (
                <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-red-400 mb-3">Risky Clauses</h2>
                  <div className="space-y-3">
                    {result.risky_clauses.map((c: any, i: number) => (
                      <div key={i} className={`p-4 rounded-lg border ${riskColor(c.severity || 'Medium')}`}>
                        <div className="flex justify-between items-start mb-2">
                          <p className="text-gray-200 text-sm font-medium">&ldquo;{c.clause}&rdquo;</p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-current/10">{c.severity || 'Medium'}</span>
                        </div>
                        <p className="text-gray-400 text-sm">{c.risk}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.missing_clauses?.length > 0 && (
                <div className="bg-white/[0.03] border border-yellow-500/20 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-yellow-400 mb-3">Missing Clauses</h2>
                  <ul className="space-y-2">{result.missing_clauses.map((c: string, i: number) => (
                    <li key={i} className="flex gap-2 text-gray-300 text-sm"><span className="text-yellow-400">!</span><span>{c}</span></li>
                  ))}</ul>
                </div>
              )}

              {result.recommendations?.length > 0 && (
                <div className="bg-white/[0.03] border border-green-500/20 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-green-400 mb-3">Recommendations</h2>
                  <ul className="space-y-2">{result.recommendations.map((r: string, i: number) => (
                    <li key={i} className="flex gap-2 text-gray-300 text-sm"><span className="text-green-400">&#10003;</span><span>{r}</span></li>
                  ))}</ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
