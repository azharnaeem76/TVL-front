'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { getCurrentUser, isLoggedIn, getConversations, getConversationMessages, sendDirectMessage, sendFileMessage, getMessagingContacts, deleteConversation, deleteMessage } from '@/lib/api';
import { useSocket } from '@/lib/socket';

const EMOJI_LIST = [
  '😀','😂','😊','😍','🥰','😎','🤔','😅','😢','😡',
  '👍','👎','👏','🙏','💪','🤝','❤️','🔥','⭐','✅',
  '📄','📎','⚖️','🏛️','📚','🔍','💼','📝','🗂️','📋',
  '✨','💡','⚠️','🚫','🎯','🏆','📞','💬','📧','🔔',
];

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
  const [showEmoji, setShowEmoji] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newChatMsg, setNewChatMsg] = useState('');
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const msgEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimeRef = useRef(0);
  const activeConvRef = useRef<any>(null);
  const { showToast } = useToast();
  const { on, emit, connected } = useSocket();
  const currentUser = getCurrentUser();

  useEffect(() => { if (isLoggedIn()) loadConversations(); }, []);
  useEffect(() => { msgEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  useEffect(() => {
    if (!activeConv || !connected) return;
    emit('join_conversation', { conversation_id: activeConv.id });
    return () => { emit('leave_conversation', { conversation_id: activeConv.id }); };
  }, [activeConv, connected, emit]);

  useEffect(() => {
    if (!connected) return;
    const unsub1 = on('new_message', (msg: any) => {
      setMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
    });
    const unsub2 = on('unread_update', () => { loadConversations(); });
    const unsub3 = on('message_deleted', (data: { message_id: number }) => {
      setMessages(prev => prev.filter(m => m.id !== data.message_id));
    });
    return () => { unsub1(); unsub2(); unsub3(); };
  }, [connected, on]);

  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const openConversation = async (conv: any) => {
    setActiveConv(conv);
    activeConvRef.current = conv;
    setShowEmoji(false);
    try {
      const msgs = await getConversationMessages(conv.id);
      setMessages(Array.isArray(msgs) ? msgs : []);
    } catch (err) { console.error(err); }
  };

  const handleSend = async () => {
    if (!newMsg.trim() || !activeConv) return;
    setSending(true);
    try {
      const msg = await sendDirectMessage(activeConv.other_user.id, newMsg);
      setMessages(prev => [...prev, msg]);
      setNewMsg('');
      setShowEmoji(false);
      loadConversations();
    } catch (err: any) {
      showToast(err.message || 'Send failed', 'error');
    }
    setSending(false);
  };

  const startNewChat = async (userId: number, message: string) => {
    if (userId === currentUser?.id) {
      showToast('Cannot message yourself', 'error');
      return;
    }
    if (!message.trim()) {
      showToast('Please type a message', 'error');
      return;
    }
    setSending(true);
    try {
      const msg = await sendDirectMessage(userId, message.trim());
      setShowNewChat(false);
      setUserSearch('');
      setSelectedUser(null);
      setNewChatMsg('');
      await loadConversations();
      const convs = await getConversations();
      const conv = (Array.isArray(convs) ? convs : []).find((c: any) => c.id === msg.conversation_id);
      if (conv) openConversation(conv);
    } catch (err: any) {
      showToast(err.message || 'Failed to start chat', 'error');
    }
    setSending(false);
  };

  const searchUsers = async () => {
    try {
      const data = await getMessagingContacts(userSearch);
      setUsers(Array.isArray(data) ? data : []);
    } catch { setUsers([]); }
  };

  useEffect(() => { if (showNewChat) searchUsers(); }, [showNewChat, userSearch]);

  if (!isLoggedIn()) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-navy-950 pt-20 px-4">
          <div className="w-full max-w-md mx-auto text-center pt-32">
            <h1 className="text-2xl font-display font-bold text-white mb-3">Messages</h1>
            <p className="text-gray-400 mb-6">Please sign in to access messaging.</p>
            <a href="/login" className="px-6 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors">Sign In</a>
          </div>
        </div>
      </>
    );
  }

  // ─── File Upload ────────────────────────────────────────────────
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeConv) return;
    e.target.value = '';

    let msgType = 'file';
    if (file.type.startsWith('image/')) msgType = 'image';
    else if (file.type.startsWith('video/')) msgType = 'video';

    if (file.size > 25 * 1024 * 1024) {
      showToast('File too large. Max 25MB', 'error');
      return;
    }

    setSending(true);
    try {
      const msg = await sendFileMessage(activeConv.other_user.id, file, msgType);
      setMessages(prev => [...prev, msg]);
      loadConversations();
    } catch (err: any) {
      showToast(err.message || 'Upload failed', 'error');
    }
    setSending(false);
  };

  // ─── Voice Recording ───────────────────────────────────────────
  const startRecording = async () => {
    if (!activeConv) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];
      setRecordingTime(0);
      recordingTimeRef.current = 0;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        const conv = activeConvRef.current;
        if (!conv) return;
        const mimeType = mediaRecorder.mimeType;
        const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        const file = new File([blob], `voice-message.${ext}`, { type: mimeType });
        const duration = recordingTimeRef.current;

        setSending(true);
        try {
          const msg = await sendFileMessage(conv.other_user.id, file, 'voice', duration);
          setMessages(prev => [...prev, msg]);
          loadConversations();
        } catch (err: any) {
          showToast(err.message || 'Failed to send voice message', 'error');
        }
        setSending(false);
      };

      mediaRecorder.start(250);
      setRecording(true);

      recordTimerRef.current = setInterval(() => {
        recordingTimeRef.current += 1;
        setRecordingTime(recordingTimeRef.current);
      }, 1000);
    } catch {
      showToast('Microphone access denied', 'error');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      mediaRecorderRef.current = null;
      audioChunksRef.current = [];
      setRecording(false);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
      if (recordTimerRef.current) {
        clearInterval(recordTimerRef.current);
        recordTimerRef.current = null;
      }
    }
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  // ─── Delete Handlers ──────────────────────────────────────────
  const handleDeleteConversation = async (convId: number) => {
    if (!confirm('Delete this entire conversation? This cannot be undone.')) return;
    try {
      await deleteConversation(convId);
      setConversations(prev => prev.filter(c => c.id !== convId));
      if (activeConv?.id === convId) {
        setActiveConv(null);
        setMessages([]);
      }
      showToast('Conversation deleted', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  const handleDeleteMessage = async (msgId: number, forEveryone: boolean) => {
    const label = forEveryone ? 'Delete this message for everyone?' : 'Delete this message?';
    if (!confirm(label)) return;
    try {
      await deleteMessage(msgId, forEveryone);
      if (forEveryone) {
        setMessages(prev => prev.filter(m => m.id !== msgId));
      } else {
        setMessages(prev => prev.map(m => m.id === msgId ? { ...m, content: 'This message was deleted', message_type: 'deleted', file_url: null } : m));
      }
      showToast(forEveryone ? 'Message deleted for everyone' : 'Message deleted', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete', 'error');
    }
  };

  // ─── Message Renderer ──────────────────────────────────────────
  const renderMessage = (msg: any) => {
    const isMe = msg.sender_id === currentUser?.id;
    const type = msg.message_type || 'text';

    return (
      <div key={msg.id} className={`flex group ${isMe ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[70%] rounded-xl text-sm overflow-hidden relative ${
          isMe ? 'bg-brass-400/20 text-brass-200' : 'bg-white/[0.06] text-gray-300'
        }`}>
          {isMe && msg.message_type !== 'deleted' && (
            <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity flex gap-0.5">
              <button
                onClick={() => handleDeleteMessage(msg.id, false)}
                className="w-5 h-5 rounded-full bg-gray-500/20 text-gray-400 flex items-center justify-center hover:bg-gray-500/40"
                title="Delete for me"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
              <button
                onClick={() => handleDeleteMessage(msg.id, true)}
                className="w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center hover:bg-red-500/40"
                title="Delete for everyone"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
              </button>
            </div>
          )}
          {type === 'deleted' && (
            <div className="p-3">
              <p className="italic text-gray-500 text-xs">This message was deleted</p>
            </div>
          )}

          {type === 'text' && (
            <div className="p-3">
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          )}

          {type === 'image' && (
            <div>
              <img
                src={msg.file_url}
                alt={msg.file_name || 'Image'}
                className="max-w-full max-h-64 rounded-t-xl cursor-pointer object-cover"
                onClick={() => setPreviewFile(msg)}
              />
              {msg.content && <p className="p-2 text-xs">{msg.content}</p>}
            </div>
          )}

          {type === 'video' && (
            <div>
              <video
                src={msg.file_url}
                controls
                className="max-w-full max-h-64 rounded-t-xl"
                preload="metadata"
              />
              {msg.content && <p className="p-2 text-xs">{msg.content}</p>}
            </div>
          )}

          {type === 'voice' && (
            <div className="p-3 flex items-center gap-3">
              <audio src={msg.file_url} controls className="h-8 max-w-[200px]" preload="metadata" />
              {msg.duration && <span className="text-[10px] text-gray-500">{formatDuration(msg.duration)}</span>}
            </div>
          )}

          {type === 'file' && (
            <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className="p-3 flex items-center gap-2 hover:bg-white/[0.04]">
              <svg className="w-5 h-5 flex-shrink-0 text-brass-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{msg.file_name || 'File'}</p>
                {msg.file_size && <p className="text-[10px] text-gray-500">{(msg.file_size / 1024).toFixed(0)} KB</p>}
              </div>
            </a>
          )}

          <div className="flex items-center gap-1 px-3 pb-2">
            <p className="text-[10px] text-gray-500">{new Date(msg.created_at).toLocaleTimeString()}</p>
            {isMe && (
              <span className="text-[10px]">
                {msg.status === 'seen' ? (
                  <svg className="w-3.5 h-3.5 text-blue-400 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M1 12l5 5L17 6M7 12l5 5L23 6" /></svg>
                ) : msg.status === 'delivered' ? (
                  <svg className="w-3.5 h-3.5 text-gray-400 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M1 12l5 5L17 6M7 12l5 5L23 6" /></svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-gray-500 inline" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 12l5 5L20 6" /></svg>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Messages</h1>
              <p className="text-gray-400 mt-1">Secure internal messaging</p>
            </div>
            <button onClick={() => setShowNewChat(true)} className="px-4 py-2 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors text-sm">
              ✨ New Message
            </button>
          </div>

          <div className="flex gap-4 h-[calc(100vh-200px)]">
            {/* Conversations list */}
            <div className="w-80 bg-white/[0.03] border border-brass-400/10 rounded-xl overflow-y-auto flex-shrink-0">
              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <p>No conversations yet</p>
                  <button onClick={() => setShowNewChat(true)} className="text-brass-400 text-sm mt-2 hover:text-brass-300">Start a chat</button>
                </div>
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
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-3">
                  <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
                  <p>Select a conversation or start a new one</p>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{activeConv.other_user?.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{activeConv.other_user?.role}</p>
                    </div>
                    <button
                      onClick={() => handleDeleteConversation(activeConv.id)}
                      className="p-2 text-gray-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                      title="Delete conversation"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map(renderMessage)}
                    <div ref={msgEndRef} />
                  </div>

                  {/* Input bar */}
                  <div className="p-4 border-t border-white/[0.06]">
                    {/* Emoji picker */}
                    {showEmoji && (
                      <div className="mb-2 p-2 bg-navy-900/80 border border-brass-400/10 rounded-lg">
                        <div className="flex flex-wrap gap-1">
                          {EMOJI_LIST.map(e => (
                            <button key={e} onClick={() => { setNewMsg(prev => prev + e); setShowEmoji(false); }}
                              className="w-8 h-8 flex items-center justify-center text-lg hover:bg-white/[0.1] rounded transition-colors">
                              {e}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {recording ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 flex-1">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-red-400 text-sm font-medium">Recording {formatDuration(recordingTime)}</span>
                          <div className="voice-bars ml-2">
                            <span /><span /><span /><span /><span />
                          </div>
                        </div>
                        <button onClick={cancelRecording} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Cancel">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <button onClick={stopRecording} className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors text-sm">
                          ✅ Send
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2 items-end">
                        {/* Emoji button */}
                        <button onClick={() => setShowEmoji(!showEmoji)} className="p-2 text-gray-400 hover:text-brass-300 transition-colors" title="Emoji">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" /></svg>
                        </button>

                        {/* File upload button */}
                        <button onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-400 hover:text-brass-300 transition-colors" title="Attach file">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
                        </button>
                        <input ref={fileInputRef} type="file" className="hidden" accept="image/*,video/*,.pdf,.doc,.docx,.txt" onChange={handleFileSelect} />

                        {/* Voice record button */}
                        <button onClick={startRecording} className="p-2 text-gray-400 hover:text-red-400 transition-colors" title="Voice message">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" /></svg>
                        </button>

                        {/* Text input */}
                        <input value={newMsg} onChange={(e) => setNewMsg(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                          placeholder="Type a message..."
                          className="flex-1 bg-navy-900/50 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brass-400/30 text-sm" />

                        {/* Send button */}
                        <button onClick={handleSend} disabled={sending || !newMsg.trim()}
                          className="px-4 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50 text-sm">
                          Send
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Image Preview Modal */}
          {previewFile && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setPreviewFile(null)}>
              <div className="max-w-4xl max-h-[90vh] p-4" onClick={e => e.stopPropagation()}>
                <button onClick={() => setPreviewFile(null)} className="absolute top-4 right-4 text-white/60 hover:text-white text-2xl">&times;</button>
                <img src={previewFile.file_url} alt={previewFile.file_name || 'Preview'} className="max-w-full max-h-[85vh] object-contain rounded-lg" />
              </div>
            </div>
          )}

          {/* New Chat Modal */}
          {showNewChat && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-navy-900 border border-brass-400/20 rounded-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-white">New Message</h2>
                  <button onClick={() => { setShowNewChat(false); setUserSearch(''); setSelectedUser(null); setNewChatMsg(''); }} className="text-gray-400 hover:text-white text-xl">&times;</button>
                </div>

                {selectedUser ? (
                  <div>
                    <div className="flex items-center gap-3 p-3 bg-white/[0.04] rounded-lg mb-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brass-500 to-wood-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                        {(selectedUser.full_name || '?').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white truncate">{selectedUser.full_name}</p>
                        <p className="text-xs text-gray-500">{selectedUser.role?.replace('_', ' ')}</p>
                      </div>
                      <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white text-xs">Change</button>
                    </div>
                    <textarea
                      value={newChatMsg}
                      onChange={(e) => setNewChatMsg(e.target.value)}
                      placeholder="Type your message..."
                      rows={3}
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-brass-400/30 text-sm mb-3 resize-none"
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); startNewChat(selectedUser.id, newChatMsg); } }}
                      autoFocus
                    />
                    <button
                      onClick={() => startNewChat(selectedUser.id, newChatMsg)}
                      disabled={sending || !newChatMsg.trim()}
                      className="w-full py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50 text-sm font-medium"
                    >
                      {sending ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                ) : (
                  <>
                    <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Search users..."
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none mb-3 text-sm" />
                    <div className="max-h-60 overflow-y-auto space-y-1">
                      {users.length > 0 ? (
                        users.map((u: any) => (
                          <button key={u.id} onClick={() => setSelectedUser(u)}
                            className="w-full text-left p-3 rounded-lg hover:bg-white/[0.06] transition-colors flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brass-500 to-wood-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                              {(u.full_name || u.name || '?').charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm text-white truncate">{u.full_name || u.name}</p>
                              <p className="text-xs text-gray-500">{u.role?.replace('_', ' ') || ''} {u.city ? `· ${u.city}` : ''}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm text-center py-4">No users found</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
