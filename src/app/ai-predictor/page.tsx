'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { aiPredict } from '@/lib/api';

const AREAS = ['General', 'Criminal', 'Civil', 'Family', 'Property', 'Constitutional', 'Corporate', 'Labour'];

export default function AIPredictorPage() {
  const [description, setDescription] = useState('');
  const [area, setArea] = useState('General');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!description.trim()) return showToast('Please describe your case', 'error');
    setLoading(true);
    try {
      const data = await aiPredict(description, area);
      setResult(data);
    } catch (err: any) {
      showToast(err.message || 'Prediction failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confidenceColor = (c: string) => {
    if (c === 'High') return 'text-green-400 bg-green-500/10';
    if (c === 'Medium') return 'text-yellow-400 bg-yellow-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">Case Outcome Predictor</h1>
            <p className="text-gray-400 mt-1">Predict likely case outcomes based on Pakistani legal precedents</p>
          </div>

          <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6 mb-6">
            <div className="mb-4">
              <label className="text-sm text-gray-400 mb-1 block">Area of Law</label>
              <select value={area} onChange={(e) => setArea(e.target.value)}
                className="w-full bg-navy-900/50 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-brass-400/30">
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the case facts, legal issues, and any relevant circumstances..."
              className="w-full h-48 bg-navy-900/50 border border-brass-400/10 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-brass-400/30" />
            <div className="flex justify-end mt-4">
              <button onClick={handleSubmit} disabled={loading || !description.trim()}
                className="px-6 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50">
                {loading ? <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Predicting...</span> : 'Predict Outcome'}
              </button>
            </div>
          </div>

          {result && (
            <div className="space-y-4">
              {result.confidence && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">Confidence:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${confidenceColor(result.confidence)}`}>{result.confidence}</span>
                </div>
              )}

              <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-brass-300 mb-3">Prediction Analysis</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.prediction}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.factors_for?.length > 0 && (
                  <div className="bg-white/[0.03] border border-green-500/20 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-green-400 mb-3">Factors in Favor</h2>
                    <ul className="space-y-2">{result.factors_for.map((f: string, i: number) => (
                      <li key={i} className="flex gap-2 text-gray-300 text-sm"><span className="text-green-400">+</span><span>{f}</span></li>
                    ))}</ul>
                  </div>
                )}
                {result.factors_against?.length > 0 && (
                  <div className="bg-white/[0.03] border border-red-500/20 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-red-400 mb-3">Factors Against</h2>
                    <ul className="space-y-2">{result.factors_against.map((f: string, i: number) => (
                      <li key={i} className="flex gap-2 text-gray-300 text-sm"><span className="text-red-400">-</span><span>{f}</span></li>
                    ))}</ul>
                  </div>
                )}
              </div>

              {result.similar_cases?.length > 0 && (
                <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                  <h2 className="text-lg font-semibold text-brass-300 mb-3">Similar Cases</h2>
                  <ul className="space-y-2">{result.similar_cases.map((c: string, i: number) => (
                    <li key={i} className="text-gray-300 text-sm border-l-2 border-brass-400/30 pl-3">{c}</li>
                  ))}</ul>
                </div>
              )}

              <p className="text-xs text-gray-500 italic">Disclaimer: AI predictions are based on pattern analysis and do not guarantee outcomes.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
