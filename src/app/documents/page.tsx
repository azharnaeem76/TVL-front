'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { GavelSVG } from '@/components/CourtElements';
import { isLoggedIn, getDocuments, uploadDocument, analyzeDocument, deleteDocument } from '@/lib/api';

interface Doc {
  id: number;
  filename: string;
  original_name: string;
  file_type: string;
  file_size: number;
  status: string;
  title: string | null;
  summary: string | null;
  extracted_parties: string | null;
  extracted_sections: string | null;
  extracted_court: string | null;
  extracted_judge: string | null;
  extracted_date: string | null;
  key_points: string | null;
  created_at: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  uploaded: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  analyzing: 'bg-yellow-400/10 text-yellow-400 border-yellow-400/20',
  completed: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  failed: 'bg-red-400/10 text-red-400 border-red-400/20',
};

export default function DocumentsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Doc | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    loadDocs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDocs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDocuments();
      setDocs(data.items || []);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      await uploadDocument(file);
      loadDocs();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleAnalyze = async (doc: Doc) => {
    try {
      const result = await analyzeDocument(doc.id);
      setDocs(prev => prev.map(d => d.id === doc.id ? result : d));
      if (selected?.id === doc.id) setSelected(result);
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this document?')) return;
    try {
      await deleteDocument(id);
      setDocs(prev => prev.filter(d => d.id !== id));
      if (selected?.id === id) setSelected(null);
    } catch (err: any) {
      setError(err.message || 'Delete failed');
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const fileIcon = (type: string) => {
    if (type === 'pdf') return <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 24 24"><path d="M7 18H17V16H7V18ZM7 14H17V12H7V14ZM5 22C4.45 22 3.979 21.804 3.588 21.413C3.196 21.021 3 20.55 3 20V4C3 3.45 3.196 2.979 3.588 2.588C3.979 2.196 4.45 2 5 2H14L20 8V20C20 20.55 19.804 21.021 19.413 21.413C19.021 21.804 18.55 22 18 22H5ZM13 9V4H5V20H18V9H13Z"/></svg>;
    return <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z"/></svg>;
  };

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="w-full px-4 pt-24 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-brass-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              Document Analysis
            </h1>
            <p className="text-gray-400 text-sm mt-1">Upload legal documents for AI-powered analysis</p>
          </div>
          <div>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.txt" className="hidden" onChange={handleUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-brass-400/15 text-brass-300 border border-brass-400/30 hover:bg-brass-400/25 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
              {uploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>
        </div>

        {error && (
          <div className="glass p-3 mb-4 !border-red-500/30 !bg-red-500/10">
            <p className="text-red-300 text-sm">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 text-xs mt-1 hover:text-red-300">Dismiss</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document List */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="court-panel p-12 text-center text-gray-500">Loading documents...</div>
            ) : docs.length === 0 ? (
              <div className="court-panel p-12 text-center">
                <GavelSVG size={50} className="mx-auto mb-4 opacity-15" />
                <p className="text-gray-500 mb-2">No documents uploaded yet.</p>
                <p className="text-gray-600 text-sm">Upload a PDF, DOC, or TXT file to get started with AI analysis.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {docs.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelected(doc)}
                    className={`court-panel p-4 cursor-pointer transition-all ${selected?.id === doc.id ? 'border-brass-400/40 bg-brass-400/5' : 'hover:border-brass-400/20'}`}
                  >
                    <div className="flex items-center gap-4">
                      {fileIcon(doc.file_type)}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium text-sm truncate">{doc.title || doc.original_name}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 uppercase">{doc.file_type}</span>
                          <span className="text-xs text-gray-600">{formatSize(doc.file_size)}</span>
                          {doc.created_at && (
                            <span className="text-xs text-gray-600">
                              {new Date(doc.created_at).toLocaleDateString('en-PK', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] border ${STATUS_COLORS[doc.status] || STATUS_COLORS.uploaded}`}>
                        {doc.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selected ? (
              <div className="court-panel p-5 sticky top-24">
                <h3 className="text-lg font-semibold text-white mb-1">{selected.title || selected.original_name}</h3>
                <p className="text-xs text-gray-500 mb-4">{selected.original_name} &middot; {formatSize(selected.file_size)}</p>

                {selected.status === 'uploaded' && (
                  <button
                    onClick={() => handleAnalyze(selected)}
                    className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-brass-400/15 text-brass-300 border border-brass-400/30 hover:bg-brass-400/25 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" /></svg>
                    Analyze with AI
                  </button>
                )}

                {selected.status === 'analyzing' && (
                  <div className="mb-4 p-3 rounded-lg bg-yellow-400/5 border border-yellow-400/20 text-center">
                    <svg className="w-5 h-5 animate-spin mx-auto mb-2 text-yellow-400" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-yellow-400 text-xs">Analyzing document...</p>
                  </div>
                )}

                {selected.status === 'completed' && (
                  <div className="space-y-3">
                    {selected.summary && (
                      <div>
                        <h4 className="text-xs text-brass-400/60 font-semibold uppercase tracking-wider mb-1">Summary</h4>
                        <p className="text-sm text-gray-300 leading-relaxed">{selected.summary}</p>
                      </div>
                    )}
                    {selected.extracted_parties && (
                      <div>
                        <h4 className="text-xs text-brass-400/60 font-semibold uppercase tracking-wider mb-1">Parties</h4>
                        <p className="text-sm text-gray-300">{selected.extracted_parties}</p>
                      </div>
                    )}
                    {selected.extracted_sections && (
                      <div>
                        <h4 className="text-xs text-brass-400/60 font-semibold uppercase tracking-wider mb-1">Sections Cited</h4>
                        <div className="flex flex-wrap gap-1">
                          {selected.extracted_sections.split(',').map((s, i) => (
                            <span key={i} className="badge-verdict text-[10px]">{s.trim()}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selected.extracted_court && (
                      <div>
                        <h4 className="text-xs text-brass-400/60 font-semibold uppercase tracking-wider mb-1">Court</h4>
                        <p className="text-sm text-gray-300">{selected.extracted_court}</p>
                      </div>
                    )}
                    {selected.extracted_judge && (
                      <div>
                        <h4 className="text-xs text-brass-400/60 font-semibold uppercase tracking-wider mb-1">Judge</h4>
                        <p className="text-sm text-gray-300">{selected.extracted_judge}</p>
                      </div>
                    )}
                    {selected.key_points && (
                      <div>
                        <h4 className="text-xs text-brass-400/60 font-semibold uppercase tracking-wider mb-1">Key Points</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {selected.key_points.split(';').map((p, i) => (
                            <li key={i} className="flex gap-2">
                              <span className="text-brass-400 mt-0.5">•</span>
                              <span>{p.trim()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                  <button onClick={() => handleDelete(selected.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div className="court-panel p-8 text-center text-gray-500 text-sm">
                Select a document to view details
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
