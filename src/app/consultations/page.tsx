'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { getConsultations, createConsultation, updateConsultation, deleteConsultation, getAvailableLawyers, getCurrentUser } from '@/lib/api';

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'];

export default function ConsultationsPage() {
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [lawyers, setLawyers] = useState<any[]>([]);
  const [filter, setFilter] = useState('');
  const [form, setForm] = useState({ lawyer_user_id: 0, scheduled_at: '', duration_minutes: 30, topic: '', fee: '' });
  const { showToast } = useToast();
  const user = getCurrentUser();
  const isLawyer = user?.role === 'lawyer';

  useEffect(() => { loadData(); }, [filter]);

  const loadData = async () => {
    try {
      const data = await getConsultations(filter || undefined);
      setConsultations(data);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const openForm = async () => {
    setShowForm(true);
    try { const l = await getAvailableLawyers(); setLawyers(l); } catch { setLawyers([]); }
  };

  const handleCreate = async () => {
    if (!form.lawyer_user_id || !form.scheduled_at) return showToast('Select lawyer and date', 'error');
    try {
      await createConsultation({
        ...form,
        fee: form.fee ? parseFloat(form.fee) : null,
      });
      showToast('Consultation booked', 'success');
      setShowForm(false);
      setForm({ lawyer_user_id: 0, scheduled_at: '', duration_minutes: 30, topic: '', fee: '' });
      loadData();
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await updateConsultation(id, { status });
      showToast('Status updated', 'success');
      loadData();
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Cancel this consultation?')) return;
    try { await deleteConsultation(id); loadData(); } catch (err: any) { showToast(err.message, 'error'); }
  };

  const statusColor = (s: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-400',
      confirmed: 'bg-green-500/10 text-green-400',
      completed: 'bg-blue-500/10 text-blue-400',
      cancelled: 'bg-red-500/10 text-red-400',
    };
    return colors[s] || 'bg-gray-500/10 text-gray-400';
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="w-full">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Consultations</h1>
              <p className="text-gray-400 mt-1">Book and manage legal consultations</p>
            </div>
            {!isLawyer && (
              <button onClick={openForm} className="px-4 py-2 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors text-sm">
                Book Consultation
              </button>
            )}
          </div>

          <div className="flex gap-2 mb-6 flex-wrap">
            <button onClick={() => setFilter('')} className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${!filter ? 'bg-brass-400/20 text-brass-300' : 'text-gray-400 hover:text-gray-300'}`}>All</button>
            {STATUSES.map(s => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-sm transition-colors capitalize ${filter === s ? 'bg-brass-400/20 text-brass-300' : 'text-gray-400 hover:text-gray-300'}`}>{s}</button>
            ))}
          </div>

          {loading ? (
            <div className="text-center text-gray-500 py-12">Loading...</div>
          ) : consultations.length === 0 ? (
            <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-12 text-center">
              <p className="text-gray-400">No consultations found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {consultations.map(c => (
                <div key={c.id} className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-medium">{c.topic || 'Legal Consultation'}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs capitalize ${statusColor(c.status)}`}>{c.status}</span>
                      </div>
                      <p className="text-gray-400 text-sm">
                        {isLawyer ? `Client: ${c.client_name}` : `Lawyer: ${c.lawyer_name}`}
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        {new Date(c.scheduled_at).toLocaleDateString()} at {new Date(c.scheduled_at).toLocaleTimeString()} &middot; {c.duration_minutes} min
                      </p>
                      {c.fee && <p className="text-brass-300 text-sm mt-1">Fee: Rs. {c.fee}</p>}
                    </div>
                    <div className="flex gap-2">
                      {c.status === 'pending' && isLawyer && (
                        <button onClick={() => handleStatusChange(c.id, 'confirmed')} className="px-3 py-1.5 bg-green-500/10 text-green-400 rounded-lg text-xs hover:bg-green-500/20">Confirm</button>
                      )}
                      {c.status === 'confirmed' && (
                        <button onClick={() => handleStatusChange(c.id, 'completed')} className="px-3 py-1.5 bg-blue-500/10 text-blue-400 rounded-lg text-xs hover:bg-blue-500/20">Complete</button>
                      )}
                      {(c.status === 'pending' || c.status === 'confirmed') && (
                        <button onClick={() => handleDelete(c.id)} className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20">Cancel</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Booking Modal */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-navy-900 border border-brass-400/20 rounded-xl p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold text-white mb-4">Book Consultation</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Select Lawyer</label>
                    <select value={form.lawyer_user_id} onChange={(e) => setForm({ ...form, lawyer_user_id: parseInt(e.target.value) })}
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none text-sm">
                      <option value={0}>Choose a lawyer...</option>
                      {lawyers.map(l => <option key={l.id} value={l.id}>{l.name} {l.city ? `(${l.city})` : ''}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Date & Time</label>
                    <input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Duration (minutes)</label>
                    <select value={form.duration_minutes} onChange={(e) => setForm({ ...form, duration_minutes: parseInt(e.target.value) })}
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none text-sm">
                      <option value={15}>15 min</option><option value={30}>30 min</option><option value={45}>45 min</option><option value={60}>60 min</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Topic</label>
                    <input value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} placeholder="Brief description..."
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none text-sm" />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-brass-400/10 text-gray-400 rounded-lg hover:text-white transition-colors text-sm">Cancel</button>
                    <button onClick={handleCreate} className="flex-1 px-4 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors text-sm">Book</button>
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
