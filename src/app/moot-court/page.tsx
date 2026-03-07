'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { generateMootScenario, evaluateMootArgument } from '@/lib/api';

const TOPICS = [
  'Right to bail in murder case',
  'Custody rights after divorce',
  'Land possession dispute',
  'Fundamental rights violation',
  'Cyber crime defamation',
  'Contract breach recovery',
  'Writ petition against government',
  'Workplace harassment',
];

export default function MootCourtPage() {
  const [topic, setTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [side, setSide] = useState('petitioner');
  const [scenario, setScenario] = useState<any>(null);
  const [argument, setArgument] = useState('');
  const [feedback, setFeedback] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const { showToast } = useToast();

  const handleGenerate = async () => {
    const selectedTopic = customTopic || topic;
    if (!selectedTopic) return showToast('Select or enter a topic', 'error');
    setLoading(true);
    setFeedback(null);
    setArgument('');
    try {
      const data = await generateMootScenario(selectedTopic, side);
      setScenario(data);
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
    setLoading(false);
  };

  const handleEvaluate = async () => {
    if (!argument.trim()) return showToast('Write your argument first', 'error');
    setEvaluating(true);
    try {
      const data = await evaluateMootArgument(scenario.scenario, argument, side);
      setFeedback(data);
    } catch (err: any) { showToast(err.message || 'Evaluation failed', 'error'); }
    setEvaluating(false);
  };

  const scoreColor = (s: number) => s >= 70 ? 'text-green-400' : s >= 50 ? 'text-yellow-400' : 'text-red-400';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">Moot Court Simulator</h1>
            <p className="text-gray-400 mt-1">Practice arguing cases with AI-powered feedback</p>
          </div>

          {!scenario ? (
            <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-brass-300 mb-4">Choose Your Case</h2>

              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-2">Select a topic</label>
                <div className="grid grid-cols-2 gap-2">
                  {TOPICS.map(t => (
                    <button key={t} onClick={() => { setTopic(t); setCustomTopic(''); }}
                      className={`text-left p-3 rounded-lg text-sm transition-colors ${topic === t && !customTopic ? 'bg-brass-400/20 text-brass-300 border border-brass-400/30' : 'bg-white/[0.03] text-gray-400 border border-transparent hover:border-brass-400/10'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-400 block mb-1">Or enter custom topic</label>
                <input value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder="E.g., Inheritance dispute among siblings..."
                  className="w-full bg-navy-900/50 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brass-400/30 text-sm" />
              </div>

              <div className="mb-6">
                <label className="text-sm text-gray-400 block mb-2">Your side</label>
                <div className="flex gap-3">
                  {['petitioner', 'respondent'].map(s => (
                    <button key={s} onClick={() => setSide(s)}
                      className={`px-4 py-2 rounded-lg text-sm capitalize ${side === s ? 'bg-brass-400/20 text-brass-300' : 'text-gray-400 hover:text-gray-300'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={handleGenerate} disabled={loading || (!topic && !customTopic)}
                className="w-full py-3 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50">
                {loading ? 'Generating Scenario...' : 'Start Moot Court'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-semibold text-brass-300">Case Scenario</h2>
                  <button onClick={() => { setScenario(null); setFeedback(null); }} className="text-xs text-gray-500 hover:text-gray-300">New Scenario</button>
                </div>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{scenario.scenario}</p>
              </div>

              {scenario.your_arguments?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/[0.03] border border-green-500/20 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-green-400 mb-2">Suggested Arguments (Your Side)</h3>
                    <ul className="space-y-1.5">{scenario.your_arguments.map((a: string, i: number) => (
                      <li key={i} className="text-gray-300 text-sm">{i + 1}. {a}</li>
                    ))}</ul>
                  </div>
                  <div className="bg-white/[0.03] border border-red-500/20 rounded-xl p-5">
                    <h3 className="text-sm font-semibold text-red-400 mb-2">Opposing Arguments</h3>
                    <ul className="space-y-1.5">{scenario.opposing_arguments?.map((a: string, i: number) => (
                      <li key={i} className="text-gray-300 text-sm">{i + 1}. {a}</li>
                    ))}</ul>
                  </div>
                </div>
              )}

              {scenario.judge_questions?.length > 0 && (
                <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-brass-300 mb-2">Judge&apos;s Questions</h3>
                  <ul className="space-y-1.5">{scenario.judge_questions.map((q: string, i: number) => (
                    <li key={i} className="text-gray-300 text-sm">Q{i + 1}: {q}</li>
                  ))}</ul>
                </div>
              )}

              <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-brass-300 mb-3">Write Your Argument</h2>
                <textarea value={argument} onChange={(e) => setArgument(e.target.value)}
                  placeholder="Present your arguments as if you are in court. Address the facts, cite relevant laws, and respond to potential counterarguments..."
                  className="w-full h-48 bg-navy-900/50 border border-brass-400/10 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-brass-400/30 text-sm" />
                <div className="flex justify-end mt-3">
                  <button onClick={handleEvaluate} disabled={evaluating || !argument.trim()}
                    className="px-6 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50">
                    {evaluating ? 'Evaluating...' : 'Submit for Evaluation'}
                  </button>
                </div>
              </div>

              {feedback && (
                <div className="space-y-4">
                  <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                    <div className="flex items-center gap-4 mb-4">
                      <span className={`text-4xl font-bold ${scoreColor(feedback.score)}`}>{feedback.score}/100</span>
                      <p className="text-gray-300">{feedback.feedback}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {feedback.strengths?.length > 0 && (
                      <div className="bg-white/[0.03] border border-green-500/20 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-green-400 mb-2">Strengths</h3>
                        <ul className="space-y-1.5">{feedback.strengths.map((s: string, i: number) => (
                          <li key={i} className="text-gray-300 text-sm flex gap-2"><span className="text-green-400">+</span>{s}</li>
                        ))}</ul>
                      </div>
                    )}
                    {feedback.improvements?.length > 0 && (
                      <div className="bg-white/[0.03] border border-yellow-500/20 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-yellow-400 mb-2">Areas for Improvement</h3>
                        <ul className="space-y-1.5">{feedback.improvements.map((s: string, i: number) => (
                          <li key={i} className="text-gray-300 text-sm flex gap-2"><span className="text-yellow-400">!</span>{s}</li>
                        ))}</ul>
                      </div>
                    )}
                  </div>
                  {feedback.model_answer && (
                    <div className="bg-brass-400/5 border border-brass-400/20 rounded-xl p-6">
                      <h3 className="text-sm font-semibold text-brass-300 mb-2">Model Answer</h3>
                      <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{feedback.model_answer}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
