'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { isLoggedIn, getCurrentUser, getClients, createClient, updateClient, deleteClient } from '@/lib/api';

interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  cnic: string | null;
  address: string | null;
  notes: string | null;
  is_active: boolean;
}

export default function ClientsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Client>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined' && !isLoggedIn()) {
      router.replace('/login');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadClients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getClients({ search: search || undefined });
      setClients(Array.isArray(data) ? data : data.items || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    if (mounted && isLoggedIn()) loadClients();
  }, [mounted, loadClients]);

  const handleSave = async () => {
    if (!editing.name) return;
    setSaving(true);
    try {
      if (editing.id) {
        await updateClient(editing.id, editing);
      } else {
        await createClient(editing);
      }
      setModalOpen(false);
      setEditing({});
      loadClients();
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this client?')) return;
    try {
      await deleteClient(id);
      loadClients();
    } catch {
      // handle error
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="px-4 sm:px-6 pt-24 pb-16 w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Client Management</h1>
            <p className="text-gray-500 text-sm mt-1">Manage your clients and their information</p>
          </div>
          <button onClick={() => { setEditing({ is_active: true }); setModalOpen(true); }} className="btn-gavel !py-2.5 !px-5 text-sm">
            + Add Client
          </button>
        </div>

        {/* Search */}
        <div className="court-panel p-4 mb-6">
          <input
            className="input-field w-full"
            placeholder="Search clients by name, email, phone..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Clients Table */}
        {loading ? (
          <div className="text-center py-16 text-gray-500">Loading clients...</div>
        ) : clients.length === 0 ? (
          <div className="court-panel p-12 text-center">
            <p className="text-gray-500 mb-4">No clients found. Add your first client!</p>
            <button onClick={() => { setEditing({ is_active: true }); setModalOpen(true); }} className="btn-gavel !py-2 !px-4 text-sm">
              + Add Client
            </button>
          </div>
        ) : (
          <div className="court-panel overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-wider font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-wider font-semibold hidden md:table-cell">Email</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-wider font-semibold hidden sm:table-cell">Phone</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-wider font-semibold hidden lg:table-cell">CNIC</th>
                  <th className="text-left py-3 px-4 text-xs text-gray-500 uppercase tracking-wider font-semibold">Status</th>
                  <th className="text-right py-3 px-4 text-xs text-gray-500 uppercase tracking-wider font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map(c => (
                  <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 text-white font-medium">{c.name}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs hidden md:table-cell">{c.email || '-'}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs hidden sm:table-cell">{c.phone || '-'}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs hidden lg:table-cell">{c.cnic || '-'}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${
                        c.is_active
                          ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                          : 'bg-red-400/10 text-red-400 border-red-400/20'
                      }`}>
                        {c.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button onClick={() => { setEditing({ ...c }); setModalOpen(true); }} className="text-xs text-brass-400 hover:text-brass-300 mr-3">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="text-xs text-red-400 hover:text-red-300">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add/Edit Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setModalOpen(false)}>
            <div className="court-panel p-5 sm:p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-brass-400 mb-4">
                {editing.id ? 'Edit Client' : 'Add New Client'}
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Name *</label>
                  <input className="input-field w-full" value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Email</label>
                    <input type="email" className="input-field w-full" value={editing.email || ''} onChange={e => setEditing({ ...editing, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Phone</label>
                    <input className="input-field w-full" value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">CNIC</label>
                  <input className="input-field w-full" placeholder="XXXXX-XXXXXXX-X" value={editing.cnic || ''} onChange={e => setEditing({ ...editing, cnic: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Address</label>
                  <input className="input-field w-full" value={editing.address || ''} onChange={e => setEditing({ ...editing, address: e.target.value })} />
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
                <button onClick={handleSave} disabled={saving || !editing.name} className="btn-gavel !py-2 !px-5 text-sm disabled:opacity-50">
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
