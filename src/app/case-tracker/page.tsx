'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { isLoggedIn, getCurrentUser, getTrackedCases, createTrackedCase, updateTrackedCase, deleteTrackedCase } from '@/lib/api';

interface TrackedCase {
  id: number;
  title: string;
  case_number: string | null;
  court: string | null;
  judge_name: string | null;
  opposing_counsel: string | null;
  client_name: string | null;
  status: string;
  next_hearing: string | null;
  notes: string | null;
}

const STATUS_OPTIONS = ['active', 'pending', 'adjourned', 'decided', 'appealed', 'withdrawn'];
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  pending: 'bg-amber-400/10 text-amber-400 border-amber-400/20',
  adjourned: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  decided: 'bg-gray-400/10 text-gray-400 border-gray-400/20',
  appealed: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  withdrawn: 'bg-red-400/10 text-red-400 border-red-400/20',
};

export default function CaseTrackerPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [cases, setCases] = useState<TrackedCase[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<TrackedCase>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && !isLoggedIn()) {
      router.replace('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCases = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTrackedCases({ status: statusFilter || undefined, search: search || undefined });
      setCases(Array.isArray(data) ? data : data.items || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search]);

  useEffect(() => {
    if (mounted && isLoggedIn()) loadCases();
  }, [mounted, loadCases]);

  const handleSave = async () => {
    if (!editing.title) return;
    setSaving(true);
    try {
      if (editing.id) {
        await updateTrackedCase(editing.id, editing);
      } else {
        await createTrackedCase(editing);
      }
      setModalOpen(false);
      setEditing({});
      loadCases();
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this case?')) return;
    try {
      await deleteTrackedCase(id);
      loadCases();
    } catch {
      // handle error
    }
  };

  const openAdd = () => {
    setEditing({ status: 'active' });
    setModalOpen(true);
  };

  const openEdit = (c: TrackedCase) => {
    setEditing({ ...c });
    setModalOpen(true);
  };

  if (!mounted) return null;

  const user = getCurrentUser();
  const formatLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="px-4 sm:px-6 pt-24 pb-16 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Case Tracker</h1>
            <p className="text-gray-500 text-sm mt-1">Track your active court cases and hearing dates</p>
          </div>
          <button onClick={openAdd} className="btn-gavel !py-2.5 !px-5 text-sm">
            + Add Case
          </button>
        </div>

        {/* Filters */}
        <div className="court-panel p-4 mb-6 flex flex-col sm:flex-row gap-3">
          <input
            className="input-field flex-1"
            placeholder="Search cases..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            className="input-field w-full sm:w-48"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{formatLabel(s)}</option>
            ))}
          </select>
        </div>

        {/* Cases Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading cases...</div>
        ) : cases.length === 0 ? (
          <div className="court-panel p-12 text-center">
            <p className="text-gray-500 mb-4">No cases found. Start tracking your first case!</p>
            <button onClick={openAdd} className="btn-gavel !py-2 !px-4 text-sm">+ Add Case</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cases.map(c => (
              <div key={c.id} className="court-panel p-5 hover:border-brass-400/20 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-semibold text-sm line-clamp-2 flex-1 mr-2">{c.title}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] border whitespace-nowrap ${STATUS_COLORS[c.status] || STATUS_COLORS.active}`}>
                    {formatLabel(c.status)}
                  </span>
                </div>

                {c.case_number && (
                  <p className="text-xs text-brass-400 font-mono mb-2">{c.case_number}</p>
                )}

                <div className="space-y-1.5 text-xs text-gray-400">
                  {c.court && <p>Court: <span className="text-gray-300">{formatLabel(c.court)}</span></p>}
                  {c.judge_name && <p>Judge: <span className="text-gray-300">{c.judge_name}</span></p>}
                  {c.client_name && <p>Client: <span className="text-gray-300">{c.client_name}</span></p>}
                  {c.opposing_counsel && <p>Opposing: <span className="text-gray-300">{c.opposing_counsel}</span></p>}
                  {c.next_hearing && (
                    <p className="text-brass-400 font-medium">
                      Next Hearing: {new Date(c.next_hearing).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>

                {c.notes && (
                  <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">{c.notes}</p>
                )}

                <div className="flex gap-2 mt-4 pt-3 border-t border-white/5">
                  <button onClick={() => openEdit(c)} className="text-xs text-brass-400 hover:text-brass-300 transition-colors">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
            <div className="court-panel p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-brass-400 mb-4">
                {editing.id ? 'Edit Case' : 'Add New Case'}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Case Title *</label>
                  <input className="input-field w-full" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Case Number</label>
                    <input className="input-field w-full" value={editing.case_number || ''} onChange={e => setEditing({ ...editing, case_number: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Status</label>
                    <select className="input-field w-full" value={editing.status || 'active'} onChange={e => setEditing({ ...editing, status: e.target.value })}>
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{formatLabel(s)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Court</label>
                  <input className="input-field w-full" value={editing.court || ''} onChange={e => setEditing({ ...editing, court: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Judge Name</label>
                    <input className="input-field w-full" value={editing.judge_name || ''} onChange={e => setEditing({ ...editing, judge_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Client Name</label>
                    <input className="input-field w-full" value={editing.client_name || ''} onChange={e => setEditing({ ...editing, client_name: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Opposing Counsel</label>
                  <input className="input-field w-full" value={editing.opposing_counsel || ''} onChange={e => setEditing({ ...editing, opposing_counsel: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Next Hearing Date</label>
                  <input type="date" className="input-field w-full" value={editing.next_hearing?.split('T')[0] || ''} onChange={e => setEditing({ ...editing, next_hearing: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Notes</label>
                  <textarea className="input-field w-full" rows={3} value={editing.notes || ''} onChange={e => setEditing({ ...editing, notes: e.target.value })} />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-white/10">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving || !editing.title} className="btn-gavel !py-2 !px-5 text-sm disabled:opacity-50">
                  {saving ? 'Saving...' : editing.id ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
