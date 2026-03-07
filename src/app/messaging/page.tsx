'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { getConversations, getConversationMessages, sendDirectMessage, getLawyerDirectory } from '@/lib/api';
import { useSocket } from '@/lib/socket';

export default function MessagingPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConv, setActiveConv] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const msgEndRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();
  const { on, emit, connected } = useSocket();

  useEffect(() => { loadConversations(); }, []);
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Join/leave conversation rooms for real-time messages
  useEffect(() => {
    if (!activeConv || !connected) return;
    emit('join_conversation', { conversation_id: activeConv.id });
    return () => { emit('leave_conversation', { conversation_id: activeConv.id }); };
  }, [activeConv, connected, emit]);

  // Listen for incoming real-time messages
  useEffect(() => {
    if (!connected) return;

    const unsub1 = on('new_message', (msg: any) => {
      // Only add if we're viewing this conversation and it's not our own message
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });

    const unsub2 = on('unread_update', () => {
      // Refresh conversation list to update unread counts
      loadConversations();
    });

    return () => { unsub1(); unsub2(); };
  }, [connected, on]);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const openConversation = async (conv: any) => {
    setActiveConv(conv);
    try {
      const msgs = await getConversationMessages(conv.id);
      setMessages(msgs);
    } catch (err) { console.error(err); }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    try {
      const msg = await sendDirectMessage(activeConv.other_user.id, newMsg);
      setMessages(prev => [...prev, msg]);
      setNewMsg('');
      loadConversations();
    } catch (err: any) {
      showToast(err.message || 'Send failed', 'error');
    }
    setSending(false);
  };

  const startNewChat = async (userId: number) => {
    setSending(true);
    try {
      const msg = await sendDirectMessage(userId, 'Hello! I would like to connect with you.');
      setShowNewChat(false);
      await loadConversations();
      const convs = await getConversations();
      const conv = convs.find((c: any) => c.id === msg.conversation_id);
      if (conv) openConversation(conv);
    } catch (err: any) {
      showToast(err.message || 'Failed to start chat', 'error');
    }
    setSending(false);
  };

  const searchUsers = async () => {
    try {
      const data = await getLawyerDirectory({ search: userSearch });
      setUsers(data);
    } catch { setUsers([]); }
  };

  useEffect(() => { if (showNewChat) searchUsers(); }, [showNewChat, userSearch]);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Messages</h1>
              <p className="text-gray-400 mt-1">Secure internal messaging</p>
            </div>
            <button onClick={() => setShowNewChat(true)} className="px-4 py-2 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors text-sm">
              New Message
            </button>
          </div>

          <div className="flex gap-4 h-[calc(100vh-200px)]">
            {/* Conversations list */}
            <div className="w-80 bg-white/[0.03] border border-brass-400/10 rounded-xl overflow-y-auto flex-shrink-0">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No conversations yet</div>
              ) : (
                conversations.map(conv => (
                  <button key={conv.id} onClick={() => openConversation(conv)}
                    className={`w-full text-left p-4 border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors ${activeConv?.id === conv.id ? 'bg-brass-400/10' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white truncate">{conv.other_user?.name || 'Unknown'}</p>
                        <p className="text-xs text-gray-500 capitalize">{conv.other_user?.role}</p>
                        {conv.last_message && <p className="text-xs text-gray-400 mt-1 truncate">{conv.last_message}</p>}
                      </div>
                      {conv.unread_count > 0 && (
                        <span className="ml-2 w-5 h-5 bg-brass-400 text-navy-950 text-xs font-bold rounded-full flex items-center justify-center">{conv.unread_count}</span>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>

            {/* Messages area */}
            <div className="flex-1 bg-white/[0.03] border border-brass-400/10 rounded-xl flex flex-col">
              {!activeConv ? (
                <div className="flex-1 flex items-center justify-center text-gray-500">Select a conversation or start a new one</div>
              ) : (
                <>
                  <div className="p-4 border-b border-white/[0.06]">
                    <p className="text-white font-medium">{activeConv.other_user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{activeConv.other_user?.role}</p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map(msg => (
                      <div key={msg.id} className={`flex ${msg.sender_id === activeConv.other_user?.id ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[70%] p-3 rounded-xl text-sm ${msg.sender_id === activeConv.other_user?.id ? 'bg-white/[0.06] text-gray-300' : 'bg-brass-400/20 text-brass-200'}`}>
                          <p>{msg.content}</p>
                          <p className="text-[10px] text-gray-500 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={msgEndRef} />
                  </div>
                  <div className="p-4 border-t border-white/[0.06] flex gap-2">
                    <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Type a message..." className="flex-1 bg-navy-900/50 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brass-400/30 text-sm" />
                    <button onClick={handleSend} disabled={sending || !newMsg.trim()}
                      className="px-4 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50">
                      Send
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* New Chat Modal */}
          {showNewChat && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-navy-900 border border-brass-400/20 rounded-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-white">New Message</h2>
                  <button onClick={() => setShowNewChat(false)} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users..."
                  className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none mb-3 text-sm" />
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {users.map((u: any) => (
                    <button key={u.id} onClick={() => startNewChat(u.id)}
                      className="w-full text-left p-3 rounded-lg hover:bg-white/[0.06] transition-colors">
                      <p className="text-sm text-white">{u.full_name || u.name}</p>
                      <p className="text-xs text-gray-500">{u.city || ''}</p>
                    </button>
                  ))}
                  {users.length === 0 && <p className="text-gray-500 text-sm text-center py-4">No users found</p>}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
