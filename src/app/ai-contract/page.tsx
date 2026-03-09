'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { aiAnalyzeContract, aiAnalyzeContractUpload } from '@/lib/api';

const ACCEPTED_TYPES = '.pdf,.doc,.docx,.png,.jpg,.jpeg,.tiff,.bmp,.webp,.txt';

export default function AIContractPage() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { showToast } = useToast();

  useEffect(() => { return () => { if (timerRef.current) clearInterval(timerRef.current); }; }, []);

  const startTimer = () => { setElapsed(0); timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000); };
  const stopTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };

  const handleSubmit = async () => {
    if (inputMode === 'upload' && uploadedFile) {
      setLoading(true);
      startTimer();
      try {
        const data = await aiAnalyzeContractUpload(uploadedFile);
        setResult(data);
      } catch (err: any) {
        showToast(err.message || 'Analysis failed', 'error');
      } finally {
        stopTimer();
        setLoading(false);
      }
      return;
    }
    if (!text.trim()) return showToast('Please paste contract text', 'error');
    setLoading(true);
    startTimer();
    try {
      const data = await aiAnalyzeContract(text);
      setResult(data);
    } catch (err: any) {
      showToast(err.message || 'Analysis failed', 'error');
    } finally {
      stopTimer();
      setLoading(false);
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) { setUploadedFile(file); setInputMode('upload'); }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { setUploadedFile(file); setInputMode('upload'); }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
        <div className="w-full">
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold text-white">Contract Analyzer</h1>
            <p className="text-gray-400 mt-1">AI analysis of contracts for risky clauses under Pakistani law</p>
          </div>

          <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6 mb-6">
            {/* Input Mode Tabs */}
            <div className="flex gap-2 mb-4">
              <button onClick={() => setInputMode('paste')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${inputMode === 'paste' ? 'bg-brass-400/20 text-brass-300 border border-brass-400/30' : 'bg-white/[0.03] text-gray-400 border border-transparent hover:border-brass-400/10'}`}>
                Paste Text
              </button>
              <button onClick={() => setInputMode('upload')}
                className={`px-4 py-2 rounded-lg text-sm transition-colors ${inputMode === 'upload' ? 'bg-brass-400/20 text-brass-300 border border-brass-400/30' : 'bg-white/[0.03] text-gray-400 border border-transparent hover:border-brass-400/10'}`}>
                Upload Document
              </button>
            </div>

            {inputMode === 'paste' ? (
              <>
                <textarea value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="Paste the contract text here for analysis..."
                  className="w-full h-64 bg-navy-900/50 border border-brass-400/10 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:outline-none focus:border-brass-400/30" />
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs text-gray-500">{text.length} characters</span>
                  <button onClick={handleSubmit} disabled={loading || !text.trim()}
                    className="px-6 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50">
                    {loading ? <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Analyzing... ({elapsed}s)</span> : 'Analyze Contract'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <input ref={fileInputRef} type="file" accept={ACCEPTED_TYPES} onChange={handleFileSelect} className="hidden" />
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-64 bg-navy-900/50 border-2 border-dashed border-brass-400/20 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-brass-400/40 transition-colors"
                >
                  {uploadedFile ? (
                    <div className="text-center">
                      <svg className="w-12 h-12 text-brass-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-white font-medium text-sm">{uploadedFile.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{formatFileSize(uploadedFile.size)}</p>
                      <button onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                        className="text-xs text-red-400 hover:text-red-300 mt-2">Remove</button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <svg className="w-12 h-12 text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-gray-400 text-sm">Drop your document here or <span className="text-brass-400">browse</span></p>
                      <p className="text-gray-600 text-xs mt-2">PDF, Word (.docx), Images (JPG, PNG), Text files</p>
                      <p className="text-gray-600 text-xs">Max 20MB - scanned documents supported via OCR</p>
                    </div>
                  )}
                </div>
                <div className="flex justify-end mt-4">
                  <button onClick={handleSubmit} disabled={loading || !uploadedFile}
                    className="px-6 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50">
                    {loading ? <span className="flex items-center gap-2"><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Analyzing... ({elapsed}s)</span> : 'Analyze Document'}
                  </button>
                </div>
              </>
            )}
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
