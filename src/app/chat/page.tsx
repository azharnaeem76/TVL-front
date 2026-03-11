'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import { sendChatMessageStream, getChatSessions, getSessionMessages, deleteChatSession, isLoggedIn } from '@/lib/api';
import VoiceSearch from '@/components/VoiceSearch';
import { GavelSVG } from '@/components/CourtElements';

interface Message {
  id: number;
  role: string;
  content: string;
  language?: string;
}

interface CitedCase {
  id: number;
  citation: string;
  title: string;
  court: string;
  year: number | null;
  summary_en: string | null;
  summary_ur: string | null;
  headnotes: string | null;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [citedCases, setCitedCases] = useState<CitedCase[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const streamingContentRef = useRef('');
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const placeholderIdRef = useRef<number>(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const userScrolledUpRef = useRef(false);

  useEffect(() => {
    if (isLoggedIn()) {
      getChatSessions().then(setSessions).catch(() => {});
    }
  }, []);

  // Smart auto-scroll: only scroll to bottom if user hasn't scrolled up
  const scrollToBottom = useCallback(() => {
    if (!userScrolledUpRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Detect if user has scrolled up
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const threshold = 100; // px from bottom
    const isAtBottom = container.scrollHeight - container.scrollTop - container.clientHeight < threshold;
    userScrolledUpRef.current = !isAtBottom;
  }, []);

  // Stop streaming
  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }
    // Flush whatever content we have so far
    const pid = placeholderIdRef.current;
    const content = streamingContentRef.current;
    if (content) {
      setMessages(prev =>
        prev.map(m => m.id === pid ? { ...m, content } : m)
      );
    }
    setLoading(false);
    setStreaming(false);
  }, []);

  if (!isLoggedIn()) {
    return (
      <div className="min-h-screen bg-navy-950 noise">
        <Navbar />
        <div className="w-full px-4 pt-32 text-center">
          <div className="court-panel p-12">
            <GavelSVG size={50} className="mx-auto mb-4 opacity-30" />
            <h1 className="text-2xl font-display font-bold text-white mb-3">AI Legal Assistant</h1>
            <p className="text-gray-400 mb-6">Please sign in to access the AI Chat.</p>
            <a href="/login" className="btn-gavel">Sign In</a>
          </div>
        </div>
      </div>
    );
  }

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;

    // If currently streaming, stop it first then send new message
    if (streaming || loading) {
      handleStop();
    }

    const userMessage = input.trim();
    setInput('');
    const userMsgId = Date.now();
    const placeholderId = userMsgId + 1;
    setMessages(prev => [
      ...prev,
      { id: userMsgId, role: 'user', content: userMessage },
      { id: placeholderId, role: 'assistant', content: '' },
    ]);
    setLoading(true);
    setStreaming(true);
    streamingContentRef.current = '';
    placeholderIdRef.current = placeholderId;
    userScrolledUpRef.current = false; // Reset scroll lock on new message

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const flushContent = () => {
      const pid = placeholderIdRef.current;
      const content = streamingContentRef.current;
      setMessages(prev =>
        prev.map(m => m.id === pid ? { ...m, content } : m)
      );
    };

    try {
      await sendChatMessageStream(
        userMessage,
        sessionId || undefined,
        // onToken — batched: accumulate tokens and flush every 50ms
        (token) => {
          setLoading(false);
          streamingContentRef.current += token;
          if (!flushTimerRef.current) {
            flushTimerRef.current = setTimeout(() => {
              flushTimerRef.current = null;
              flushContent();
            }, 50);
          }
        },
        // onCitations
        (cases) => {
          if (cases?.length) {
            setCitedCases(prev => {
              const existing = new Set(prev.map(c => c.id));
              const newCases = cases.filter((c: CitedCase) => !existing.has(c.id));
              return [...prev, ...newCases];
            });
          }
        },
        // onDone — flush any remaining batched content
        (data) => {
          if (flushTimerRef.current) {
            clearTimeout(flushTimerRef.current);
            flushTimerRef.current = null;
          }
          const finalContent = streamingContentRef.current;
          setSessionId(data.session_id);
          setMessages(prev =>
            prev.map(m => m.id === placeholderId
              ? { ...m, id: data.message_id, content: finalContent }
              : m
            )
          );
          getChatSessions().then(setSessions).catch(() => {});
        },
        controller.signal,
      );
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setMessages(prev =>
          prev.map(m => m.id === placeholderId
            ? { ...m, content: `Error: ${err.message}. Make sure the backend server is running.` }
            : m
          )
        );
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const loadSession = async (id: number) => {
    try {
      if (streaming) handleStop();
      const msgs = await getSessionMessages(id);
      setMessages(msgs);
      setSessionId(id);
      setCitedCases([]);
      setSidebarOpen(false);
    } catch (err) {
      console.error('Failed to load session');
    }
  };

  const handleDeleteSession = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this chat session?')) return;
    try {
      await deleteChatSession(id);
      setSessions(prev => prev.filter(s => s.id !== id));
      if (sessionId === id) {
        setMessages([]);
        setSessionId(null);
        setCitedCases([]);
      }
    } catch (err) {
      console.error('Failed to delete session');
    }
  };

  const newChat = () => {
    if (streaming) handleStop();
    setMessages([]);
    setSessionId(null);
    setCitedCases([]);
  };

  return (
    <div className="h-screen bg-navy-950 noise flex flex-col overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden pt-16 w-full">
        {/* Sessions Sidebar */}
        <div className={`fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-navy-950/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-r border-brass-400/10 p-4 pt-20 lg:pt-4 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button onClick={newChat} className="btn-primary w-full mb-4 text-sm !py-2.5">
            + New Session
          </button>

          <h3 className="text-xs font-display font-semibold text-brass-400/50 uppercase tracking-wider mb-3">Chat History</h3>
          <div className="space-y-1">
            {sessions.map(s => (
              <div
                key={s.id}
                onClick={() => loadSession(s.id)}
                className={`group w-full text-left p-3 rounded-xl text-sm truncate transition-all duration-300 cursor-pointer flex items-center justify-between ${
                  sessionId === s.id
                    ? 'bg-brass-400/10 text-brass-300 border border-brass-400/20'
                    : 'text-gray-400 hover:bg-white/[0.04] hover:text-brass-300'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-brass-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="truncate">{s.title || 'Untitled Session'}</span>
                </div>
                <button
                  onClick={(e) => handleDeleteSession(s.id, e)}
                  className="flex-shrink-0 p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all lg:opacity-0 lg:group-hover:opacity-100"
                  title="Delete session"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-xs text-gray-600 px-3 italic">No chat history yet</p>
            )}
          </div>
        </div>

        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile header */}
          <div className="lg:hidden p-2 border-b border-brass-400/10">
            <button onClick={() => setSidebarOpen(true)} className="btn-ghost text-sm">
              <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
              </svg>
              Chat History
            </button>
          </div>

          {/* Messages */}
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.length === 0 && (
              <div className="text-center py-20">
                <GavelSVG size={50} className="mx-auto mb-4 opacity-15 animate-gavel-idle" />
                <h2 className="text-xl font-display font-semibold text-gray-300 mb-2">AI Legal Assistant</h2>
                <p className="text-sm text-gray-500 mb-1">Ask any legal question in English, Urdu, or Roman Urdu</p>
                <p className="text-xs text-brass-400/40 italic font-serif mb-8">&ldquo;According to Spirit Of Law&rdquo;</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
                  {[
                    'Mujhe bail ka procedure batao',
                    'What is Section 302 PPC?',
                    'Khula ka tareeqa kya hai?',
                    'How to file an FIR?',
                  ].map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(q)}
                      className="text-left p-4 card-court !rounded-xl text-sm text-gray-400 hover:text-brass-300 transition-all duration-300"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <div key={`${msg.role}-${msg.id}-${idx}`} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
                  msg.role === 'user'
                    ? 'bg-brass-600/30 text-white rounded-br-md border border-brass-400/20'
                    : 'court-panel text-gray-200 rounded-bl-md'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center justify-between mb-2 pb-2 border-b border-brass-400/10">
                      <div className="flex items-center gap-2">
                        <GavelSVG size={14} className="opacity-40" />
                        <span className="text-[10px] text-brass-400/50 uppercase tracking-wider font-semibold">AI Response</span>
                      </div>
                      {msg.content && !streaming && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            setCopiedId(msg.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="p-1 rounded hover:bg-white/10 text-gray-500 hover:text-brass-300 transition-all"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <svg className="w-3.5 h-3.5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                  <div className="prose text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  {msg.role === 'assistant' && streaming && msg.content && msg.id === messages[messages.length - 1]?.id && (
                    <span className="inline-block w-2 h-4 bg-brass-400 animate-pulse ml-0.5" />
                  )}
                </div>
              </div>
            ))}

            {loading && !messages[messages.length - 1]?.content && (
              <div className="flex justify-start">
                <div className="court-panel rounded-2xl rounded-bl-md px-5 py-4">
                  <div className="flex items-center gap-3">
                    <GavelSVG size={16} className="opacity-30 animate-gavel-idle" />
                    <div className="flex space-x-1.5">
                      <div className="w-2 h-2 bg-brass-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-brass-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-brass-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs text-gray-500 italic">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-brass-400/10 bg-navy-950/80 backdrop-blur-xl p-4">
            <form onSubmit={handleSend} className="flex gap-3 w-full">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a legal question... (English, Urdu, Roman Urdu)"
                className="input-field flex-1 !border-brass-400/10 focus:!border-brass-400/30"
              />
              <VoiceSearch onResult={(text) => setInput(prev => prev ? prev + ' ' + text : text)} />
              {streaming ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="btn-primary !px-6 !bg-red-600/80 hover:!bg-red-600"
                  title="Stop generating"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                </button>
              ) : (
                <button type="submit" disabled={!input.trim()} className="btn-primary !px-6">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              )}
            </form>
          </div>
        </div>

        {/* Cited Cases Sidebar */}
        {citedCases.length > 0 && (
          <div className="w-72 border-l border-brass-400/10 p-4 hidden xl:block overflow-y-auto">
            <h3 className="text-xs font-display font-semibold text-brass-400/50 uppercase tracking-wider mb-3">Cited Precedents</h3>
            <div className="space-y-3">
              {citedCases.map(c => {
                const summary = c.summary_ur || c.summary_en;
                return (
                  <div key={c.id} className="card-court !p-3 text-xs">
                    <p className="font-mono font-semibold text-brass-300 mb-1">{c.citation}</p>
                    <p className="text-gray-300 font-medium">{c.title}</p>
                    <p className="text-gray-500 mt-1">{c.court?.replace(/_/g, ' ')} {c.year && `(${c.year})`}</p>
                    {summary && summary !== '.' && (
                      <p className={`text-gray-400 mt-2 line-clamp-4 leading-relaxed ${c.summary_ur ? 'text-right' : ''}`} dir={c.summary_ur ? 'rtl' : 'ltr'}>
                        {summary.slice(0, 200)}{summary.length > 200 ? '…' : ''}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
