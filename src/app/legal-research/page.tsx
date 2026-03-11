'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { isLoggedIn } from '@/lib/api';

const API_BASE = '/api/v1';

const AREAS = [
  'General', 'Criminal', 'Civil', 'Family', 'Property',
  'Constitutional', 'Corporate', 'Labour', 'Cyber Crime',
  'Tax', 'Banking', 'Environmental', 'Human Rights',
];

const DEPTH_OPTIONS = [
  { value: 'quick', label: 'Quick', desc: '5 cases, fast analysis', icon: '⚡' },
  { value: 'standard', label: 'Standard', desc: '10 cases, detailed analysis', icon: '📋' },
  { value: 'deep', label: 'Deep', desc: '20 cases, comprehensive research', icon: '🔬' },
];

type TabKey = 'analysis' | 'arguments' | 'cases' | 'statutes' | 'strategy';

interface CaseResult {
  citation: string;
  title: string;
  court: string | null;
  year: number | null;
  relevance_score: number | null;
  summary: string | null;
  headnotes: string | null;
  sections_applied: string | null;
}

interface StatuteResult {
  title: string;
  act_number: string | null;
  year: number | null;
  summary: string | null;
}

interface ResearchResult {
  legal_analysis: string;
  arguments_for: string[];
  arguments_against: string[];
  relevant_cases: CaseResult[];
  applicable_statutes: StatuteResult[];
  recommended_strategy: string;
  risk_assessment: string;
  confidence_level: string;
}

interface ArgumentResult {
  argument: string;
  legal_basis: string[];
  cited_cases: string[];
  cited_statutes: string[];
  counter_arguments: string[];
  strength_rating: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tvl_token');
}

async function apiRequest(path: string, body: object) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

function ConfidenceBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    High: 'bg-green-500/20 text-green-400 border-green-500/30',
    Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Low: 'bg-red-500/20 text-red-400 border-red-500/30',
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${colors[level] || colors.Medium}`}>
      {level} Confidence
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-gray-400 hover:text-gray-200 rounded-lg border border-white/10 transition-colors"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

export default function LegalResearchPage() {
  const [scenario, setScenario] = useState('');
  const [area, setArea] = useState('General');
  const [depth, setDepth] = useState('standard');
  const [result, setResult] = useState<ResearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [activeTab, setActiveTab] = useState<TabKey>('analysis');
  const [argMode, setArgMode] = useState(false);
  const [argPosition, setArgPosition] = useState('');
  const [argFacts, setArgFacts] = useState('');
  const [argArea, setArgArea] = useState('General');
  const [argResult, setArgResult] = useState<ArgumentResult | null>(null);
  const [argLoading, setArgLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!isLoggedIn() && typeof window !== 'undefined') {
      window.location.href = '/login';
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleResearch = async () => {
    if (!scenario.trim() || scenario.trim().length < 10) {
      return showToast('Please describe your legal scenario (at least 10 characters)', 'error');
    }
    setLoading(true);
    setResult(null);
    setElapsed(0);
    setActiveTab('analysis');
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    try {
      const data = await apiRequest('/legal-research/research', {
        scenario,
        area_of_law: area,
        research_depth: depth,
        language: 'english',
      });
      setResult(data);
      showToast('Research complete!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Research failed', 'error');
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setLoading(false);
    }
  };

  const handleBuildArgument = async () => {
    if (!argPosition.trim() || argPosition.trim().length < 10) {
      return showToast('Please describe your legal position (at least 10 characters)', 'error');
    }
    const facts = argFacts.split('\n').filter(f => f.trim());
    if (facts.length === 0) {
      return showToast('Please enter at least one supporting fact', 'error');
    }
    setArgLoading(true);
    setArgResult(null);
    try {
      const data = await apiRequest('/legal-research/build-argument', {
        position: argPosition,
        supporting_facts: facts,
        area_of_law: argArea,
      });
      setArgResult(data);
      showToast('Argument built!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to build argument', 'error');
    } finally {
      setArgLoading(false);
    }
  };

  const exportResults = () => {
    if (!result) return;
    const text = [
      '=== LEGAL RESEARCH REPORT ===',
      `Area of Law: ${area}`,
      `Research Depth: ${depth}`,
      `Confidence: ${result.confidence_level}`,
      '',
      '--- LEGAL ANALYSIS ---',
      result.legal_analysis,
      '',
      '--- ARGUMENTS FOR ---',
      ...result.arguments_for.map((a, i) => `${i + 1}. ${a}`),
      '',
      '--- ARGUMENTS AGAINST ---',
      ...result.arguments_against.map((a, i) => `${i + 1}. ${a}`),
      '',
      '--- RELEVANT CASES ---',
      ...result.relevant_cases.map(c =>
        `${c.citation} | ${c.title} | ${c.court || 'N/A'} (${c.year || 'N/A'}) | Relevance: ${((c.relevance_score || 0) * 100).toFixed(0)}%`
      ),
      '',
      '--- APPLICABLE STATUTES ---',
      ...result.applicable_statutes.map(s => `${s.title} (${s.year || 'N/A'})`),
      '',
      '--- RECOMMENDED STRATEGY ---',
      result.recommended_strategy,
      '',
      '--- RISK ASSESSMENT ---',
      result.risk_assessment,
      '',
      'Disclaimer: This is AI-generated research and does not constitute legal advice.',
    ].join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `legal-research-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report exported!', 'success');
  };

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'analysis', label: 'Analysis' },
    { key: 'arguments', label: 'Arguments', count: (result?.arguments_for?.length || 0) + (result?.arguments_against?.length || 0) },
    { key: 'cases', label: 'Case Laws', count: result?.relevant_cases?.length || 0 },
    { key: 'statutes', label: 'Statutes', count: result?.applicable_statutes?.length || 0 },
    { key: 'strategy', label: 'Strategy' },
  ];

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-display font-bold text-white flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-brass-400/20 flex items-center justify-center text-lg">
                  <svg className="w-5 h-5 text-brass-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </span>
                AI Legal Research Agent
              </h1>
              <p className="text-gray-400 mt-1">Deep research tool - find case laws, statutes, and build legal arguments</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => { setArgMode(false); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!argMode ? 'bg-brass-400/20 text-brass-300' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                Research
              </button>
              <button
                onClick={() => { setArgMode(true); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${argMode ? 'bg-brass-400/20 text-brass-300' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
              >
                Build Argument
              </button>
            </div>
          </div>

          {!argMode ? (
            /* ==================== RESEARCH MODE ==================== */
            <>
              {/* Input Form */}
              <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Area of Law</label>
                    <select
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      className="w-full bg-navy-900/50 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-brass-400/30"
                    >
                      {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Research Depth</label>
                    <div className="flex gap-2">
                      {DEPTH_OPTIONS.map(d => (
                        <button
                          key={d.value}
                          onClick={() => setDepth(d.value)}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm border transition-colors ${
                            depth === d.value
                              ? 'bg-brass-400/20 border-brass-400/30 text-brass-300'
                              : 'bg-navy-900/50 border-brass-400/10 text-gray-400 hover:border-brass-400/20'
                          }`}
                        >
                          <div className="font-medium">{d.icon} {d.label}</div>
                          <div className="text-xs opacity-70 mt-0.5">{d.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-1 block">Legal Scenario</label>
                  <textarea
                    value={scenario}
                    onChange={(e) => setScenario(e.target.value)}
                    placeholder="Describe your legal scenario in detail. Include relevant facts, parties involved, and the legal question you need researched..."
                    className="w-full h-48 bg-navy-900/50 border border-brass-400/10 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-brass-400/30"
                  />
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">{scenario.length} characters</span>
                    <span className="text-xs text-gray-500">Min 10 characters</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleResearch}
                    disabled={loading || scenario.trim().length < 10}
                    className="px-6 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Researching... ({elapsed}s)
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        Start Research
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-8 mb-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-brass-400/20 border-t-brass-400 animate-spin" />
                    <div className="text-center">
                      <p className="text-gray-200 font-medium">Conducting {depth} research...</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {elapsed < 5 && 'Analyzing your scenario and finding relevant case laws...'}
                        {elapsed >= 5 && elapsed < 15 && 'Analyzing relevant case laws and statutes...'}
                        {elapsed >= 15 && elapsed < 30 && 'Building legal arguments with AI analysis...'}
                        {elapsed >= 30 && elapsed < 60 && 'Compiling comprehensive research report...'}
                        {elapsed >= 60 && 'Deep analysis in progress - this may take a moment for thorough research...'}
                      </p>
                    </div>
                    <div className="w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brass-400/50 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(elapsed * (depth === 'quick' ? 5 : depth === 'deep' ? 1.5 : 2.5), 95)}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Results */}
              {result && (
                <div>
                  {/* Result Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-white">Research Results</h2>
                      <ConfidenceBadge level={result.confidence_level} />
                    </div>
                    <div className="flex gap-2">
                      <CopyButton text={result.legal_analysis} />
                      <button
                        onClick={exportResults}
                        className="px-3 py-1.5 text-xs bg-brass-400/10 hover:bg-brass-400/20 text-brass-300 rounded-lg border border-brass-400/20 transition-colors"
                      >
                        Export Report
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-1 mb-4 bg-white/[0.02] rounded-lg p-1 border border-white/5">
                    {tabs.map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                          activeTab === tab.key
                            ? 'bg-brass-400/20 text-brass-300'
                            : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                        }`}
                      >
                        {tab.label}
                        {tab.count !== undefined && tab.count > 0 && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-white/10 rounded-full text-[10px]">{tab.count}</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                    {/* Analysis Tab */}
                    {activeTab === 'analysis' && (
                      <div>
                        <h3 className="text-lg font-semibold text-brass-300 mb-4">Legal Analysis</h3>
                        <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.legal_analysis}</div>
                      </div>
                    )}

                    {/* Arguments Tab */}
                    {activeTab === 'arguments' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="text-lg font-semibold text-green-400 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Arguments For
                          </h3>
                          {result.arguments_for.length > 0 ? (
                            <ul className="space-y-3">
                              {result.arguments_for.map((arg, i) => (
                                <li key={i} className="bg-green-500/5 border border-green-500/10 rounded-lg p-3">
                                  <span className="text-green-400 font-medium text-sm">#{i + 1}</span>
                                  <p className="text-gray-300 text-sm mt-1">{arg}</p>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm">No arguments generated</p>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-red-400 mb-3 flex items-center gap-2">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Arguments Against
                          </h3>
                          {result.arguments_against.length > 0 ? (
                            <ul className="space-y-3">
                              {result.arguments_against.map((arg, i) => (
                                <li key={i} className="bg-red-500/5 border border-red-500/10 rounded-lg p-3">
                                  <span className="text-red-400 font-medium text-sm">#{i + 1}</span>
                                  <p className="text-gray-300 text-sm mt-1">{arg}</p>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm">No counter-arguments generated</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cases Tab */}
                    {activeTab === 'cases' && (
                      <div>
                        <h3 className="text-lg font-semibold text-brass-300 mb-4">
                          Relevant Case Laws ({result.relevant_cases.length})
                        </h3>
                        {result.relevant_cases.length > 0 ? (
                          <div className="space-y-3">
                            {result.relevant_cases.map((c, i) => (
                              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-4 hover:border-brass-400/20 transition-colors">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <h4 className="text-white font-medium text-sm">{c.title}</h4>
                                    <p className="text-brass-300 text-xs font-mono mt-0.5">{c.citation}</p>
                                  </div>
                                  {c.relevance_score != null && c.relevance_score > 0 && (
                                    <div className="flex items-center gap-1.5 ml-3">
                                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                        <div
                                          className="h-full rounded-full bg-brass-400/60"
                                          style={{ width: `${(c.relevance_score * 100)}%` }}
                                        />
                                      </div>
                                      <span className="text-xs text-gray-400">{(c.relevance_score * 100).toFixed(0)}%</span>
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-3 text-xs text-gray-400 mb-2">
                                  {c.court && <span className="px-2 py-0.5 bg-white/5 rounded">{c.court}</span>}
                                  {c.year && <span className="px-2 py-0.5 bg-white/5 rounded">{c.year}</span>}
                                  {c.sections_applied && (
                                    <span className="px-2 py-0.5 bg-brass-400/10 text-brass-300/70 rounded truncate max-w-xs">
                                      {c.sections_applied}
                                    </span>
                                  )}
                                </div>
                                {c.summary && (
                                  <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">{c.summary}</p>
                                )}
                                {c.headnotes && (
                                  <details className="mt-2">
                                    <summary className="text-xs text-brass-300/60 cursor-pointer hover:text-brass-300">
                                      View headnotes
                                    </summary>
                                    <p className="text-gray-400 text-xs mt-1 leading-relaxed">{c.headnotes}</p>
                                  </details>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No matching case laws found.</p>
                        )}
                      </div>
                    )}

                    {/* Statutes Tab */}
                    {activeTab === 'statutes' && (
                      <div>
                        <h3 className="text-lg font-semibold text-brass-300 mb-4">
                          Applicable Statutes ({result.applicable_statutes.length})
                        </h3>
                        {result.applicable_statutes.length > 0 ? (
                          <div className="space-y-3">
                            {result.applicable_statutes.map((s, i) => (
                              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-lg p-4 hover:border-brass-400/20 transition-colors">
                                <h4 className="text-white font-medium text-sm">{s.title}</h4>
                                <div className="flex gap-3 text-xs text-gray-400 mt-1 mb-2">
                                  {s.act_number && <span className="px-2 py-0.5 bg-white/5 rounded">Act {s.act_number}</span>}
                                  {s.year && <span className="px-2 py-0.5 bg-white/5 rounded">{s.year}</span>}
                                </div>
                                {s.summary && (
                                  <p className="text-gray-400 text-xs leading-relaxed">{s.summary}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm">No matching statutes found.</p>
                        )}
                      </div>
                    )}

                    {/* Strategy Tab */}
                    {activeTab === 'strategy' && (
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold text-brass-300 mb-3">Recommended Strategy</h3>
                          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.recommended_strategy}</p>
                        </div>
                        <div className="border-t border-white/5 pt-6">
                          <h3 className="text-lg font-semibold text-brass-300 mb-3">Risk Assessment</h3>
                          <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.risk_assessment}</p>
                        </div>
                        <div className="border-t border-white/5 pt-6">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-400">Overall Confidence:</span>
                            <ConfidenceBadge level={result.confidence_level} />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 italic mt-4">
                    Disclaimer: This is AI-generated legal research and does not constitute legal advice.
                    Always consult a qualified lawyer for specific legal matters.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* ==================== BUILD ARGUMENT MODE ==================== */
            <>
              <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6 mb-6">
                <h2 className="text-lg font-semibold text-white mb-4">Build Legal Argument</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Provide your legal position and supporting facts. The AI will build a structured
                  legal argument with citations from Pakistani case law.
                </p>

                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-1 block">Area of Law</label>
                  <select
                    value={argArea}
                    onChange={(e) => setArgArea(e.target.value)}
                    className="w-full bg-navy-900/50 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none focus:border-brass-400/30"
                  >
                    {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-1 block">Legal Position to Argue</label>
                  <textarea
                    value={argPosition}
                    onChange={(e) => setArgPosition(e.target.value)}
                    placeholder="Describe the legal position you want to argue for..."
                    className="w-full h-32 bg-navy-900/50 border border-brass-400/10 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-brass-400/30"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm text-gray-400 mb-1 block">Supporting Facts (one per line)</label>
                  <textarea
                    value={argFacts}
                    onChange={(e) => setArgFacts(e.target.value)}
                    placeholder={"The accused was arrested without a warrant\nNo FIR was registered at the time of arrest\nThe arrest took place at the accused's residence"}
                    className="w-full h-32 bg-navy-900/50 border border-brass-400/10 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-brass-400/30"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleBuildArgument}
                    disabled={argLoading || argPosition.trim().length < 10}
                    className="px-6 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {argLoading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Building Argument...
                      </span>
                    ) : 'Build Argument'}
                  </button>
                </div>
              </div>

              {/* Argument Result */}
              {argResult && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-semibold text-white">Legal Argument</h2>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        argResult.strength_rating === 'Strong'
                          ? 'bg-green-500/20 text-green-400 border-green-500/30'
                          : argResult.strength_rating === 'Weak'
                          ? 'bg-red-500/20 text-red-400 border-red-500/30'
                          : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                      }`}>
                        {argResult.strength_rating} Argument
                      </span>
                    </div>
                    <CopyButton text={argResult.argument} />
                  </div>

                  <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{argResult.argument}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {argResult.legal_basis.length > 0 && (
                      <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-brass-300 mb-2">Legal Basis</h3>
                        <div className="flex flex-wrap gap-2">
                          {argResult.legal_basis.map((l, i) => (
                            <span key={i} className="px-2.5 py-1 bg-brass-400/10 text-brass-300 rounded-full text-xs">{l}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {argResult.cited_cases.length > 0 && (
                      <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-brass-300 mb-2">Cited Cases</h3>
                        <ul className="space-y-1.5">
                          {argResult.cited_cases.map((c, i) => (
                            <li key={i} className="text-xs text-gray-300 font-mono bg-white/5 rounded px-2 py-1">{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {argResult.cited_statutes.length > 0 && (
                      <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-brass-300 mb-2">Cited Statutes</h3>
                        <div className="flex flex-wrap gap-2">
                          {argResult.cited_statutes.map((s, i) => (
                            <span key={i} className="px-2.5 py-1 bg-green-500/10 text-green-400 rounded-full text-xs">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {argResult.counter_arguments.length > 0 && (
                      <div className="bg-white/[0.03] border border-red-500/10 rounded-xl p-6">
                        <h3 className="text-sm font-semibold text-red-400 mb-2">Potential Counter-Arguments</h3>
                        <ul className="space-y-2">
                          {argResult.counter_arguments.map((c, i) => (
                            <li key={i} className="flex gap-2 text-gray-300 text-xs">
                              <span className="text-red-400 mt-0.5">!</span>
                              <span>{c}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 italic">
                    Disclaimer: This is an AI-generated legal argument and does not constitute legal advice.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
