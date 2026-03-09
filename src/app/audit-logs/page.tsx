'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { getAuditLogs, getAuditLogActions } from '@/lib/api';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [actions, setActions] = useState<string[]>([]);
  const [filter, setFilter] = useState('');
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const limit = 30;

  useEffect(() => { loadData(); }, [filter, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, acts] = await Promise.all([
        getAuditLogs({ action: filter || undefined, skip: page * limit, limit }),
        getAuditLogActions(),
      ]);
      setLogs(data.items);
      setTotal(data.total);
      setActions(acts);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold text-white">Audit Logs</h1>
            <p className="text-gray-400 mt-1">Track all admin and user actions</p>
          </div>

          <div className="flex gap-2 mb-4 flex-wrap">
            <button onClick={() => { setFilter(''); setPage(0); }}
              className={`px-3 py-1.5 rounded-lg text-sm ${!filter ? 'bg-brass-400/20 text-brass-300' : 'text-gray-400 hover:text-gray-300'}`}>All</button>
            {actions.map(a => (
              <button key={a} onClick={() => { setFilter(a); setPage(0); }}
                className={`px-3 py-1.5 rounded-lg text-sm ${filter === a ? 'bg-brass-400/20 text-brass-300' : 'text-gray-400 hover:text-gray-300'}`}>{a}</button>
            ))}
          </div>

          <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-3 text-gray-500 font-medium">Time</th>
                  <th className="text-left p-3 text-gray-500 font-medium">User</th>
                  <th className="text-left p-3 text-gray-500 font-medium">Action</th>
                  <th className="text-left p-3 text-gray-500 font-medium">Resource</th>
                  <th className="text-left p-3 text-gray-500 font-medium">Details</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-500">Loading...</td></tr>
                ) : logs.length === 0 ? (
                  <tr><td colSpan={5} className="p-6 text-center text-gray-500">No audit logs found</td></tr>
                ) : (
                  logs.map(log => (
                    <tr key={log.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="p-3 text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
                      <td className="p-3 text-gray-300">{log.user_name || 'System'}</td>
                      <td className="p-3"><span className="px-2 py-0.5 bg-brass-400/10 text-brass-300 rounded text-xs">{log.action}</span></td>
                      <td className="p-3 text-gray-400">{log.resource_type ? `${log.resource_type} #${log.resource_id}` : '-'}</td>
                      <td className="p-3 text-gray-500 text-xs max-w-[200px] truncate">{log.details ? JSON.stringify(log.details) : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {total > limit && (
            <div className="flex justify-center gap-2 mt-4">
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-30">Prev</button>
              <span className="px-3 py-1.5 text-sm text-gray-500">Page {page + 1} of {Math.ceil(total / limit)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={(page + 1) * limit >= total}
                className="px-3 py-1.5 text-sm text-gray-400 hover:text-white disabled:opacity-30">Next</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
