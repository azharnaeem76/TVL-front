'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { sendChatMessage, getChatSessions, getSessionMessages, isLoggedIn } from '@/lib/api';
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
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [citedCases, setCitedCases] = useState<CitedCase[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isLoggedIn()) {
      getChatSessions().then(setSessions).catch(() => {});
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isLoggedIn()) {
    return (
      <div className="min-h-screen bg-navy-950 noise">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 pt-32 text-center">
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await sendChatMessage(userMessage, sessionId || undefined);
      setSessionId(response.session_id);
      setMessages(prev => [...prev, {
        id: response.message.id,
        role: 'assistant',
        content: response.message.content,
        language: response.message.language,
      }]);
      if (response.cited_cases?.length) {
        setCitedCases(prev => {
          const existing = new Set(prev.map(c => c.id));
          const newCases = response.cited_cases.filter((c: CitedCase) => !existing.has(c.id));
          return [...prev, ...newCases];
        });
      }
      // Refresh sessions list
      getChatSessions().then(setSessions).catch(() => {});
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: Date.now(),
        role: 'assistant',
        content: `Error: ${err.message}. Make sure the backend server is running.`,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const loadSession = async (id: number) => {
    try {
      const msgs = await getSessionMessages(id);
      setMessages(msgs);
      setSessionId(id);
      setCitedCases([]);
      setSidebarOpen(false);
    } catch (err) {
      console.error('Failed to load session');
    }
  };

  const newChat = () => {
    setMessages([]);
    setSessionId(null);
    setCitedCases([]);
  };

  return (
    <div className="min-h-screen bg-navy-950 noise flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden pt-16 max-w-[1400px] mx-auto w-full">
        {/* Sessions Sidebar — History */}
        <div className={`fixed lg:relative inset-y-0 left-0 z-40 w-72 bg-navy-950/95 lg:bg-transparent backdrop-blur-xl lg:backdrop-blur-none border-r border-brass-400/10 p-4 pt-20 lg:pt-4 overflow-y-auto transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button onClick={newChat} className="btn-primary w-full mb-4 text-sm !py-2.5">
            + New Session
          </button>

          <h3 className="text-xs font-display font-semibold text-brass-400/50 uppercase tracking-wider mb-3">Chat History</h3>
          <div className="space-y-1">
            {sessions.map(s => (
              <button
                key={s.id}
                onClick={() => loadSession(s.id)}
                className={`w-full text-left p-3 rounded-xl text-sm truncate transition-all duration-300 ${
                  sessionId === s.id
                    ? 'bg-brass-400/10 text-brass-300 border border-brass-400/20'
                    : 'text-gray-400 hover:bg-white/[0.04] hover:text-brass-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-brass-400/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <span className="truncate">{s.title || 'Untitled Session'}</span>
                </div>
              </button>
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
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
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

            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
                  msg.role === 'user'
                    ? 'bg-brass-600/30 text-white rounded-br-md border border-brass-400/20'
                    : 'court-panel text-gray-200 rounded-bl-md'
                }`}>
                  {msg.role === 'assistant' && (
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-brass-400/10">
                      <GavelSVG size={14} className="opacity-40" />
                      <span className="text-[10px] text-brass-400/50 uppercase tracking-wider font-semibold">AI Response</span>
                    </div>
                  )}
                  <div className="prose text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                </div>
              </div>
            ))}

            {loading && (
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
            <form onSubmit={handleSend} className="flex gap-3 max-w-4xl mx-auto">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a legal question... (English, Urdu, Roman Urdu)"
                className="input-field flex-1 !border-brass-400/10 focus:!border-brass-400/30"
                disabled={loading}
              />
              <VoiceSearch onResult={(text) => setInput(prev => prev ? prev + ' ' + text : text)} />
              <button type="submit" disabled={loading || !input.trim()} className="btn-primary !px-6">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>

        {/* Cited Cases Sidebar */}
        {citedCases.length > 0 && (
          <div className="w-72 border-l border-brass-400/10 p-4 hidden xl:block overflow-y-auto">
            <h3 className="text-xs font-display font-semibold text-brass-400/50 uppercase tracking-wider mb-3">Cited Precedents</h3>
            <div className="space-y-3">
              {citedCases.map(c => (
                <div key={c.id} className="card-court !p-3 text-xs">
                  <p className="font-mono font-semibold text-brass-300 mb-1">{c.citation}</p>
                  <p className="text-gray-300 font-medium">{c.title}</p>
                  <p className="text-gray-500 mt-1">{c.court?.replace(/_/g, ' ')} {c.year && `(${c.year})`}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
