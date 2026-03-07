'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { getCurrentUser, createSupportTicket, getSupportTickets, getSupportTicket, replySupportTicket, updateSupportTicket, switchSupportRole } from '@/lib/api';

const CATEGORIES = ['general', 'bug', 'feature_request', 'billing', 'account', 'legal_content', 'other'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];
const STATUSES = ['open', 'in_progress', 'resolved', 'closed'];
const VIEWABLE_ROLES = ['lawyer', 'judge', 'law_student', 'client', 'paralegal'];

export default function SupportPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: '', description: '', category: 'general', priority: 'medium' });
  const [activeTicket, setActiveTicket] = useState<any>(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const { showToast } = useToast();
  const user = getCurrentUser();
  const isStaff = user?.role === 'admin' || user?.role === 'support';

  useEffect(() => { loadTickets(); }, [filter]);

  const loadTickets = async () => {
    setLoading(true);
    try {
      const data = await getSupportTickets({ status_filter: filter || undefined });
      setTickets(data.items || []);
      setTotal(data.total || 0);
    } catch { setTickets([]); }
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!form.subject.trim() || !form.description.trim()) return showToast('Subject and description required', 'error');
    setSending(true);
    try {
      await createSupportTicket(form);
      showToast('Ticket created successfully', 'success');
      setShowForm(false);
      setForm({ subject: '', description: '', category: 'general', priority: 'medium' });
      loadTickets();
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
    setSending(false);
  };

  const openTicket = async (id: number) => {
    try {
      const data = await getSupportTicket(id);
      setActiveTicket(data);
    } catch (err: any) { showToast(err.message || 'Failed to load ticket', 'error'); }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !activeTicket) return;
    setSending(true);
    try {
      await replySupportTicket(activeTicket.id, replyText);
      setReplyText('');
      openTicket(activeTicket.id);
      showToast('Reply sent', 'success');
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
    setSending(false);
  };

  const handleStatusChange = async (ticketId: number, status: string) => {
    try {
      await updateSupportTicket(ticketId, { status });
      showToast('Status updated', 'success');
      loadTickets();
      if (activeTicket?.id === ticketId) openTicket(ticketId);
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleSwitchRole = async (role: string) => {
    try {
      const data = await switchSupportRole(role);
      localStorage.setItem('tvl_token', data.token);
      const currentUser = getCurrentUser();
      if (currentUser) {
        localStorage.setItem('tvl_user', JSON.stringify({ ...currentUser, role }));
      }
      showToast(`Viewing as ${role}. Refresh to see changes.`, 'success');
      window.location.href = '/dashboard';
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const statusColor = (s: string) => {
    const c: Record<string, string> = { open: 'bg-yellow-500/10 text-yellow-400', in_progress: 'bg-blue-500/10 text-blue-400', resolved: 'bg-green-500/10 text-green-400', closed: 'bg-gray-500/10 text-gray-400' };
    return c[s] || c.open;
  };

  const priorityColor = (p: string) => {
    const c: Record<string, string> = { low: 'text-gray-400', medium: 'text-blue-400', high: 'text-orange-400', urgent: 'text-red-400' };
    return c[p] || c.medium;
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Help & Support</h1>
              <p className="text-gray-400 mt-1">{isStaff ? 'Manage support tickets' : 'Get help and raise support tickets'}</p>
            </div>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors text-sm">
              New Ticket
            </button>
          </div>

          {/* Support Role Switcher */}
          {user?.role === 'support' && (
            <div className="bg-white/[0.03] border border-purple-400/20 rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold text-purple-300 mb-2">View System As Role</h3>
              <p className="text-xs text-gray-500 mb-3">Temporarily switch your view to check system functionality as another role</p>
              <div className="flex gap-2 flex-wrap">
                {VIEWABLE_ROLES.map(r => (
                  <button key={r} onClick={() => handleSwitchRole(r)} className="px-3 py-1.5 bg-purple-500/10 text-purple-300 rounded-lg text-xs hover:bg-purple-500/20 transition-colors capitalize">
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {!isStaff && (
            <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-6 mb-6">
              <h2 className="text-lg font-semibold text-white mb-4">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {[
                  { q: 'How do I search for case laws?', a: 'Go to Scenario Search and describe your legal situation in English, Urdu, or Roman Urdu.' },
                  { q: 'How do I upgrade my plan?', a: 'Visit the Subscriptions page and select your desired plan. Admin will process your request.' },
                  { q: 'How does AI Chat work?', a: 'AI Chat uses a local AI model to answer legal questions with case law citations. Free users get 5 chats/day.' },
                  { q: 'Can I use this for real legal advice?', a: 'TVL is an AI-assisted research tool. Always consult a qualified lawyer for legal advice.' },
                ].map((faq, i) => (
                  <details key={i} className="group">
                    <summary className="cursor-pointer text-sm text-gray-300 hover:text-white transition-colors list-none flex items-center gap-2">
                      <svg className="w-4 h-4 text-brass-400 transition-transform group-open:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      {faq.q}
                    </summary>
                    <p className="text-xs text-gray-500 mt-1 ml-6">{faq.a}</p>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!filter ? 'bg-brass-400/20 text-brass-300' : 'text-gray-400 hover:text-gray-300'}`}>All ({total})</button>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${filter === s ? 'bg-brass-400/20 text-brass-300' : 'text-gray-400 hover:text-gray-300'}`}>{s.replace('_', ' ')}</button>
            ))}
          </div>

          {/* Ticket List */}
          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-12 text-center">
              <p className="text-gray-400">No tickets found</p>
              <button onClick={() => setShowForm(true)} className="mt-3 text-brass-400 text-sm hover:text-brass-300">Create your first ticket</button>
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map(t => (
                <button key={t.id} onClick={() => openTicket(t.id)} className="w-full text-left bg-white/[0.03] border border-brass-400/10 rounded-xl p-4 hover:bg-white/[0.05] transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-gray-500">#{t.id}</span>
                        <h3 className="text-sm font-medium text-white truncate">{t.subject}</h3>
                      </div>
                      {isStaff && <p className="text-xs text-gray-500">{t.user_name} &middot; {t.user_email}</p>}
                      <p className="text-xs text-gray-500 mt-1">{t.category} &middot; {new Date(t.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`text-xs ${priorityColor(t.priority)}`}>{t.priority}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusColor(t.status)}`}>{t.status.replace('_', ' ')}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Ticket Detail Modal */}
          {activeTicket && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-navy-900 border border-brass-400/20 rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col">
                <div className="p-5 border-b border-white/[0.06] flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">#{activeTicket.id}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusColor(activeTicket.status)}`}>{activeTicket.status.replace('_', ' ')}</span>
                      <span className={`text-xs ${priorityColor(activeTicket.priority)}`}>{activeTicket.priority}</span>
                    </div>
                    <h2 className="text-lg font-semibold text-white mt-1">{activeTicket.subject}</h2>
                    <p className="text-xs text-gray-500 mt-1">by {activeTicket.user_name} &middot; {new Date(activeTicket.created_at).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => setActiveTicket(null)} className="text-gray-400 hover:text-white text-xl">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-4">
                  {/* Original description */}
                  <div className="bg-white/[0.04] rounded-lg p-4">
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{activeTicket.description}</p>
                  </div>

                  {/* Replies */}
                  {activeTicket.replies?.map((r: any) => (
                    <div key={r.id} className={`p-4 rounded-lg ${r.is_staff ? 'bg-brass-400/5 border border-brass-400/10' : 'bg-white/[0.04]'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-xs font-medium text-white">{r.user_name}</p>
                        {r.is_staff && <span className="text-[10px] bg-brass-400/20 text-brass-300 px-1.5 py-0.5 rounded-full">Staff</span>}
                        <span className="text-[10px] text-gray-500">{new Date(r.created_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">{r.message}</p>
                    </div>
                  ))}

                  {activeTicket.resolution_note && (
                    <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                      <p className="text-xs font-medium text-green-400 mb-1">Resolution</p>
                      <p className="text-sm text-gray-300">{activeTicket.resolution_note}</p>
                    </div>
                  )}
                </div>

                {/* Staff actions */}
                {isStaff && activeTicket.status !== 'closed' && (
                  <div className="px-5 py-3 border-t border-white/[0.06] flex gap-2 flex-wrap">
                    {activeTicket.status === 'open' && (
                      <button onClick={() => handleStatusChange(activeTicket.id, 'in_progress')} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20">Mark In Progress</button>
                    )}
                    <button onClick={() => handleStatusChange(activeTicket.id, 'resolved')} className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs hover:bg-green-500/20">Resolve</button>
                    <button onClick={() => handleStatusChange(activeTicket.id, 'closed')} className="px-3 py-1.5 bg-gray-500/10 text-gray-400 rounded-lg text-xs hover:bg-gray-500/20">Close</button>
                  </div>
                )}

                {/* Reply input */}
                {activeTicket.status !== 'closed' && (
                  <div className="p-5 border-t border-white/[0.06] flex gap-2">
                    <input value={replyText} onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleReply()}
                      placeholder="Type a reply..." className="flex-1 bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none text-sm" />
                    <button onClick={handleReply} disabled={sending || !replyText.trim()} className="px-4 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors disabled:opacity-50 text-sm">
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Create Ticket Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-navy-900 border border-brass-400/20 rounded-xl p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold text-white mb-4">Create Support Ticket</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Subject</label>
                    <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Brief description of your issue"
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none text-sm">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Priority</label>
                    <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none text-sm">
                      {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                      rows={4} placeholder="Describe your issue in detail..."
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none text-sm resize-none" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-brass-400/10 text-gray-400 rounded-lg hover:text-white transition-colors text-sm">Cancel</button>
                    <button onClick={handleCreate} disabled={sending} className="flex-1 px-4 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors text-sm disabled:opacity-50">
                      {sending ? 'Creating...' : 'Submit Ticket'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
