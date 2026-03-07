'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import { getCurrentUser } from '@/lib/api';

interface Workspace {
  id: number;
  name: string;
  description: string;
  members: { name: string; role: string }[];
  cases: number;
  created: string;
}

export default function TeamWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([
    {
      id: 1, name: 'Firm Cases 2024', description: 'Shared workspace for all active firm cases',
      members: [{ name: 'You', role: 'Admin' }, { name: 'Ahmed Ali', role: 'Member' }],
      cases: 5, created: '2024-01-15',
    },
  ]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const { showToast } = useToast();
  const user = getCurrentUser();

  const handleCreate = () => {
    if (!form.name.trim()) return showToast('Enter workspace name', 'error');
    const ws: Workspace = {
      id: Date.now(), name: form.name, description: form.description,
      members: [{ name: user?.full_name || 'You', role: 'Admin' }], cases: 0, created: new Date().toISOString().split('T')[0],
    };
    setWorkspaces([ws, ...workspaces]);
    setForm({ name: '', description: '' });
    setShowForm(false);
    showToast('Workspace created', 'success');
  };

  const handleDelete = (id: number) => {
    if (!confirm('Delete this workspace?')) return;
    setWorkspaces(workspaces.filter(w => w.id !== id));
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-display font-bold text-white">Team Workspaces</h1>
              <p className="text-gray-400 mt-1">Collaborate with your law firm team</p>
            </div>
            <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors text-sm">
              New Workspace
            </button>
          </div>

          {workspaces.length === 0 ? (
            <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-12 text-center">
              <p className="text-gray-400">No workspaces yet. Create one to start collaborating.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workspaces.map(ws => (
                <div key={ws.id} className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-5 hover:border-brass-400/20 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-white font-medium">{ws.name}</h3>
                      <p className="text-gray-500 text-sm mt-1">{ws.description}</p>
                    </div>
                    <button onClick={() => handleDelete(ws.id)} className="text-gray-500 hover:text-red-400 text-xs">Delete</button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400 mt-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                      {ws.members.length} members
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                      {ws.cases} cases
                    </span>
                  </div>
                  <div className="flex -space-x-2 mt-3">
                    {ws.members.map((m, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-brass-400/20 border-2 border-navy-950 flex items-center justify-center text-xs text-brass-300 font-medium" title={m.name}>
                        {m.name.charAt(0)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-navy-900 border border-brass-400/20 rounded-xl p-6 w-full max-w-md">
                <h2 className="text-lg font-semibold text-white mb-4">Create Workspace</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Workspace Name</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="E.g., Firm Cases 2024"
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Description</label>
                    <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief description..."
                      className="w-full h-20 bg-navy-950 border border-brass-400/10 rounded-lg p-4 text-gray-200 placeholder-gray-500 resize-none focus:outline-none text-sm" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowForm(false)} className="flex-1 px-4 py-2.5 border border-brass-400/10 text-gray-400 rounded-lg hover:text-white text-sm">Cancel</button>
                    <button onClick={handleCreate} className="flex-1 px-4 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 text-sm">Create</button>
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
