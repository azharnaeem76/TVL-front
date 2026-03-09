'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useToast } from '@/components/Toast';
import {
  isLoggedIn, getCurrentUser,
  getWorkspaces, createWorkspace, getWorkspace, deleteWorkspace,
  inviteToWorkspace, cancelWorkspaceInvite,
  getMyPendingInvites, acceptWorkspaceInvite, declineWorkspaceInvite,
  removeWorkspaceMember, leaveWorkspace, changeWorkspaceMemberRole,
  getWorkspaceTasks, createWorkspaceTask, updateWorkspaceTask, deleteWorkspaceTask,
  getWorkspaceNotes, createWorkspaceNote, updateWorkspaceNote, deleteWorkspaceNote,
} from '@/lib/api';
import { Suspense } from 'react';

const PRIORITIES = [
  { key: 'low', label: 'Low', color: 'text-gray-400 bg-gray-400/10' },
  { key: 'medium', label: 'Medium', color: 'text-amber-400 bg-amber-400/10' },
  { key: 'high', label: 'High', color: 'text-orange-400 bg-orange-400/10' },
  { key: 'urgent', label: 'Urgent', color: 'text-red-400 bg-red-400/10' },
];

const STATUS_COLS = [
  { key: 'todo', label: 'To Do', color: 'border-gray-500/30' },
  { key: 'in_progress', label: 'In Progress', color: 'border-blue-500/30' },
  { key: 'done', label: 'Done', color: 'border-green-500/30' },
];

function TeamWorkspacesInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const user = getCurrentUser();

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [activeWs, setActiveWs] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'tasks' | 'notes' | 'members'>('tasks');

  // Modals
  const [showCreateWs, setShowCreateWs] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);

  // Form state
  const [wsName, setWsName] = useState('');
  const [wsDesc, setWsDesc] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskAssignee, setTaskAssignee] = useState<number | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const loadWorkspaces = useCallback(async () => {
    try {
      const data = await getWorkspaces();
      setWorkspaces(data.items || []);
    } catch (err: any) {
      if (err.message !== 'Session expired') showToast(err.message || 'Failed to load', 'error');
    }
  }, [showToast]);

  const loadInvites = useCallback(async () => {
    try {
      const data = await getMyPendingInvites();
      setPendingInvites(data || []);
    } catch { /* ignore */ }
  }, []);

  const loadWsDetails = useCallback(async (id: number) => {
    try {
      const data = await getWorkspace(id);
      setActiveWs(data);
      const t = await getWorkspaceTasks(id);
      setTasks(t || []);
      const n = await getWorkspaceNotes(id);
      setNotes(n || []);
    } catch (err: any) {
      showToast(err.message || 'Failed', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    setLoading(true);
    Promise.all([loadWorkspaces(), loadInvites()]).then(() => setLoading(false));
  }, [router, loadWorkspaces, loadInvites]);

  // Handle invite token from URL
  useEffect(() => {
    const token = searchParams.get('invite');
    if (token) {
      acceptWorkspaceInvite(token).then((res) => {
        showToast('Invitation accepted!', 'success');
        loadWorkspaces();
        if (res.workspace_id) loadWsDetails(res.workspace_id);
        router.replace('/team-workspaces');
      }).catch((err) => {
        showToast(err.message || 'Could not accept invite', 'error');
        router.replace('/team-workspaces');
      });
    }
  }, [searchParams, showToast, loadWorkspaces, loadWsDetails, router]);

  const handleCreateWs = async () => {
    if (!wsName.trim()) return;
    try {
      const ws = await createWorkspace({ name: wsName, description: wsDesc });
      showToast('Workspace created!', 'success');
      setShowCreateWs(false);
      setWsName(''); setWsDesc('');
      await loadWorkspaces();
      loadWsDetails(ws.id);
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleDeleteWs = async (id: number) => {
    if (!confirm('Delete this workspace? This cannot be undone.')) return;
    try {
      await deleteWorkspace(id);
      showToast('Workspace deleted', 'success');
      setActiveWs(null);
      loadWorkspaces();
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim() || !activeWs) return;
    try {
      const res = await inviteToWorkspace(activeWs.id, inviteEmail, inviteRole);
      showToast(`Invite sent to ${inviteEmail}`, 'success');
      setInviteEmail(''); setShowInvite(false);
      // Copy invite link
      const link = `${window.location.origin}/team-workspaces?invite=${res.token}`;
      try { await navigator.clipboard.writeText(link); showToast('Invite link copied to clipboard!', 'success'); } catch { /* ignore */ }
      loadWsDetails(activeWs.id);
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleAcceptInvite = async (token: string) => {
    try {
      const res = await acceptWorkspaceInvite(token);
      showToast('Invitation accepted!', 'success');
      loadWorkspaces(); loadInvites();
      if (res.workspace_id) loadWsDetails(res.workspace_id);
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleDeclineInvite = async (token: string) => {
    try {
      await declineWorkspaceInvite(token);
      showToast('Invitation declined', 'success');
      loadInvites();
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Remove this member?') || !activeWs) return;
    try {
      await removeWorkspaceMember(activeWs.id, memberId);
      showToast('Member removed', 'success');
      loadWsDetails(activeWs.id);
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleLeave = async () => {
    if (!confirm('Leave this workspace?') || !activeWs) return;
    try {
      await leaveWorkspace(activeWs.id);
      showToast('Left workspace', 'success');
      setActiveWs(null);
      loadWorkspaces();
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !activeWs) return;
    try {
      await createWorkspaceTask(activeWs.id, {
        title: taskTitle, description: taskDesc, priority: taskPriority,
        assigned_to: taskAssignee || undefined,
      });
      showToast('Task created', 'success');
      setTaskTitle(''); setTaskDesc(''); setTaskPriority('medium'); setTaskAssignee(null);
      setShowTaskForm(false);
      const t = await getWorkspaceTasks(activeWs.id);
      setTasks(t || []);
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleUpdateTaskStatus = async (taskId: number, status: string) => {
    if (!activeWs) return;
    try {
      await updateWorkspaceTask(activeWs.id, taskId, { status });
      const t = await getWorkspaceTasks(activeWs.id);
      setTasks(t || []);
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!activeWs) return;
    try {
      await deleteWorkspaceTask(activeWs.id, taskId);
      const t = await getWorkspaceTasks(activeWs.id);
      setTasks(t || []);
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !activeWs) return;
    try {
      if (editingNote) {
        await updateWorkspaceNote(activeWs.id, editingNote.id, { title: noteTitle, content: noteContent });
        showToast('Note updated', 'success');
      } else {
        await createWorkspaceNote(activeWs.id, { title: noteTitle, content: noteContent });
        showToast('Note created', 'success');
      }
      setNoteTitle(''); setNoteContent(''); setEditingNote(null); setShowNoteForm(false);
      const n = await getWorkspaceNotes(activeWs.id);
      setNotes(n || []);
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const handleDeleteNote = async (noteId: number) => {
    if (!activeWs) return;
    try {
      await deleteWorkspaceNote(activeWs.id, noteId);
      const n = await getWorkspaceNotes(activeWs.id);
      setNotes(n || []);
    } catch (err: any) { showToast(err.message || 'Failed', 'error'); }
  };

  const isAdmin = activeWs?.my_role === 'owner' || activeWs?.my_role === 'admin';

  if (loading) return (<><Navbar /><div className="min-h-screen bg-navy-950 pt-20 flex items-center justify-center"><p className="text-gray-500">Loading...</p></div></>);

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-navy-950 pt-20 px-4 pb-12">
        <div className="w-full">

          {/* Pending Invitations Banner */}
          {pendingInvites.length > 0 && (
            <div className="mb-6 space-y-2">
              {pendingInvites.map(inv => (
                <div key={inv.id} className="bg-brass-400/5 border border-brass-400/20 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm font-medium">You&apos;re invited to join <span className="text-brass-300">{inv.workspace_name}</span></p>
                    <p className="text-gray-500 text-xs">Role: {inv.role}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleAcceptInvite(inv.token)} className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs hover:bg-emerald-500/30">Accept</button>
                    <button onClick={() => handleDeclineInvite(inv.token)} className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-xs hover:bg-red-500/20">Decline</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!activeWs ? (
            /* ── Workspace List ── */
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h1 className="text-2xl font-display font-bold text-white">Team Workspaces</h1>
                  <p className="text-gray-400 mt-1">Collaborate with your team on cases, tasks, and research</p>
                </div>
                <button onClick={() => setShowCreateWs(true)} className="px-4 py-2 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 transition-colors text-sm">
                  + New Workspace
                </button>
              </div>

              {workspaces.length === 0 ? (
                <div className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-12 text-center">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
                  <p className="text-gray-400 mb-2">No workspaces yet</p>
                  <p className="text-gray-600 text-sm">Create a workspace to collaborate with your team on cases, tasks, and findings.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {workspaces.map(ws => (
                    <button key={ws.id} onClick={() => loadWsDetails(ws.id)}
                      className="text-left bg-white/[0.03] border border-brass-400/10 rounded-xl p-5 hover:border-brass-400/25 transition-all hover:-translate-y-0.5">
                      <h3 className="text-white font-medium mb-1">{ws.name}</h3>
                      {ws.description && <p className="text-gray-500 text-sm mb-3 line-clamp-2">{ws.description}</p>}
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{ws.member_count} member{ws.member_count !== 1 ? 's' : ''}</span>
                        <span>{ws.task_count} task{ws.task_count !== 1 ? 's' : ''}</span>
                        <span className="ml-auto text-brass-400/60 capitalize">{ws.my_role}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* ── Active Workspace Detail ── */
            <>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setActiveWs(null)} className="text-gray-500 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex-1">
                  <h1 className="text-xl font-display font-bold text-white">{activeWs.name}</h1>
                  {activeWs.description && <p className="text-gray-500 text-sm">{activeWs.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <button onClick={() => setShowInvite(true)} className="px-3 py-1.5 bg-brass-400/20 text-brass-300 rounded-lg text-xs hover:bg-brass-400/30">
                      Invite Member
                    </button>
                  )}
                  {activeWs.my_role !== 'owner' && (
                    <button onClick={handleLeave} className="px-3 py-1.5 text-gray-500 hover:text-red-400 text-xs">Leave</button>
                  )}
                  {activeWs.my_role === 'owner' && (
                    <button onClick={() => handleDeleteWs(activeWs.id)} className="px-3 py-1.5 text-gray-500 hover:text-red-400 text-xs">Delete</button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 mb-6 border-b border-white/[0.06] pb-2">
                {(['tasks', 'notes', 'members'] as const).map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${tab === t ? 'bg-brass-400/15 text-brass-300' : 'text-gray-500 hover:text-gray-300'}`}>
                    {t} {t === 'tasks' && `(${tasks.length})`}{t === 'notes' && `(${notes.length})`}{t === 'members' && `(${activeWs.members?.length || 0})`}
                  </button>
                ))}
              </div>

              {/* ── Tasks Tab ── */}
              {tab === 'tasks' && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button onClick={() => setShowTaskForm(true)} className="px-3 py-1.5 bg-brass-400/20 text-brass-300 rounded-lg text-xs hover:bg-brass-400/30">+ Add Task</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {STATUS_COLS.map(col => (
                      <div key={col.key} className={`border-t-2 ${col.color} pt-3`}>
                        <h3 className="text-sm font-medium text-gray-400 mb-3">{col.label} ({tasks.filter(t => t.status === col.key).length})</h3>
                        <div className="space-y-2">
                          {tasks.filter(t => t.status === col.key).map(task => (
                            <div key={task.id} className="bg-white/[0.03] border border-brass-400/10 rounded-lg p-3">
                              <div className="flex items-start justify-between mb-1.5">
                                <p className="text-white text-sm font-medium">{task.title}</p>
                                <button onClick={() => handleDeleteTask(task.id)} className="text-gray-600 hover:text-red-400 text-xs ml-2">&times;</button>
                              </div>
                              {task.description && <p className="text-gray-500 text-xs mb-2">{task.description}</p>}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${PRIORITIES.find(p => p.key === task.priority)?.color || ''}`}>
                                  {task.priority}
                                </span>
                                {task.assigned_name && (
                                  <span className="text-[10px] text-gray-500">{task.assigned_name}</span>
                                )}
                                {task.due_date && (
                                  <span className="text-[10px] text-gray-600">{task.due_date.split('T')[0]}</span>
                                )}
                              </div>
                              <div className="flex gap-1 mt-2">
                                {STATUS_COLS.filter(s => s.key !== task.status).map(s => (
                                  <button key={s.key} onClick={() => handleUpdateTaskStatus(task.id, s.key)}
                                    className="text-[10px] px-2 py-0.5 rounded bg-white/[0.03] text-gray-500 hover:text-brass-300">
                                    {s.key === 'done' ? 'Done' : s.key === 'in_progress' ? 'Start' : 'Reset'}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Notes Tab ── */}
              {tab === 'notes' && (
                <div>
                  <div className="flex justify-end mb-4">
                    <button onClick={() => { setEditingNote(null); setNoteTitle(''); setNoteContent(''); setShowNoteForm(true); }}
                      className="px-3 py-1.5 bg-brass-400/20 text-brass-300 rounded-lg text-xs hover:bg-brass-400/30">+ Add Note</button>
                  </div>
                  {notes.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No notes yet. Create one to share findings with your team.</p>
                  ) : (
                    <div className="space-y-3">
                      {notes.map(note => (
                        <div key={note.id} className="bg-white/[0.03] border border-brass-400/10 rounded-xl p-5">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-white font-medium">{note.title}</h3>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditingNote(note); setNoteTitle(note.title); setNoteContent(note.content || ''); setShowNoteForm(true); }}
                                className="text-xs text-brass-400 hover:text-brass-300">Edit</button>
                              <button onClick={() => handleDeleteNote(note.id)} className="text-xs text-gray-500 hover:text-red-400">Delete</button>
                            </div>
                          </div>
                          {note.content && (
                            <div className="prose text-sm text-gray-300 max-h-40 overflow-hidden" dangerouslySetInnerHTML={{ __html: note.content }} />
                          )}
                          <p className="text-xs text-gray-600 mt-2">By {note.author_name} &middot; {note.updated_at?.split('T')[0]}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ── Members Tab ── */}
              {tab === 'members' && (
                <div>
                  {/* Pending Invites */}
                  {activeWs.pending_invites?.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm text-gray-400 font-medium mb-2">Pending Invitations</h3>
                      <div className="space-y-2">
                        {activeWs.pending_invites.map((inv: any) => (
                          <div key={inv.id} className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 flex items-center justify-between">
                            <div>
                              <p className="text-gray-300 text-sm">{inv.email}</p>
                              <p className="text-gray-600 text-xs capitalize">{inv.role}</p>
                            </div>
                            {isAdmin && (
                              <button onClick={async () => { await cancelWorkspaceInvite(activeWs.id, inv.id); loadWsDetails(activeWs.id); }}
                                className="text-xs text-gray-500 hover:text-red-400">Cancel</button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <h3 className="text-sm text-gray-400 font-medium mb-2">Members</h3>
                  <div className="space-y-2">
                    {activeWs.members?.map((mem: any) => (
                      <div key={mem.id} className="bg-white/[0.03] border border-brass-400/10 rounded-lg p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brass-400/20 flex items-center justify-center text-brass-300 font-medium flex-shrink-0">
                          {mem.profile_picture ? (
                            <img src={mem.profile_picture} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            mem.full_name?.charAt(0)?.toUpperCase()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm font-medium truncate">{mem.full_name}</p>
                          <p className="text-gray-500 text-xs truncate">{mem.email}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                          mem.role === 'owner' ? 'bg-brass-400/15 text-brass-300' :
                          mem.role === 'admin' ? 'bg-blue-400/10 text-blue-400' :
                          'bg-white/[0.05] text-gray-400'
                        }`}>{mem.role}</span>
                        {isAdmin && mem.role !== 'owner' && mem.user_id !== user?.id && (
                          <button onClick={() => handleRemoveMember(mem.id)} className="text-xs text-gray-500 hover:text-red-400">Remove</button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ── Create Workspace Modal ── */}
          {showCreateWs && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-navy-900 border border-brass-400/20 rounded-xl p-6 w-full max-w-md mx-4">
                <h2 className="text-lg font-semibold text-white mb-4">Create Workspace</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Name</label>
                    <input value={wsName} onChange={e => setWsName(e.target.value)} placeholder="E.g., Khan & Associates 2024"
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Description</label>
                    <textarea value={wsDesc} onChange={e => setWsDesc(e.target.value)} placeholder="Brief description..."
                      className="w-full h-20 bg-navy-950 border border-brass-400/10 rounded-lg p-3 text-gray-200 placeholder-gray-500 resize-none focus:outline-none text-sm" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowCreateWs(false)} className="flex-1 px-4 py-2.5 border border-brass-400/10 text-gray-400 rounded-lg hover:text-white text-sm">Cancel</button>
                    <button onClick={handleCreateWs} className="flex-1 px-4 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 text-sm">Create</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Invite Modal ── */}
          {showInvite && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-navy-900 border border-brass-400/20 rounded-xl p-6 w-full max-w-md mx-4">
                <h2 className="text-lg font-semibold text-white mb-2">Invite Member</h2>
                <p className="text-gray-500 text-sm mb-4">Send an invite by email. They&apos;ll get a notification and invite link.</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Email Address</label>
                    <input value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@example.com" type="email"
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Role</label>
                    <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 focus:outline-none text-sm">
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                      <option value="viewer">Viewer</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowInvite(false)} className="flex-1 px-4 py-2.5 border border-brass-400/10 text-gray-400 rounded-lg hover:text-white text-sm">Cancel</button>
                    <button onClick={handleInvite} className="flex-1 px-4 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 text-sm">Send Invite</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Task Form Modal ── */}
          {showTaskForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-navy-900 border border-brass-400/20 rounded-xl p-6 w-full max-w-md mx-4">
                <h2 className="text-lg font-semibold text-white mb-4">Add Task</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Title</label>
                    <input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="E.g., Review bail application"
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Description</label>
                    <textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Details..."
                      className="w-full h-16 bg-navy-950 border border-brass-400/10 rounded-lg p-3 text-gray-200 placeholder-gray-500 resize-none focus:outline-none text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Priority</label>
                      <select value={taskPriority} onChange={e => setTaskPriority(e.target.value)}
                        className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none text-sm">
                        {PRIORITIES.map(p => <option key={p.key} value={p.key}>{p.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 block mb-1">Assign To</label>
                      <select value={taskAssignee || ''} onChange={e => setTaskAssignee(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-3 py-2 text-gray-200 focus:outline-none text-sm">
                        <option value="">Unassigned</option>
                        {activeWs?.members?.map((m: any) => <option key={m.user_id} value={m.user_id}>{m.full_name}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowTaskForm(false)} className="flex-1 px-4 py-2.5 border border-brass-400/10 text-gray-400 rounded-lg hover:text-white text-sm">Cancel</button>
                    <button onClick={handleCreateTask} className="flex-1 px-4 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 text-sm">Create Task</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Note Form Modal ── */}
          {showNoteForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="bg-navy-900 border border-brass-400/20 rounded-xl p-6 w-full max-w-lg mx-4">
                <h2 className="text-lg font-semibold text-white mb-4">{editingNote ? 'Edit Note' : 'Add Note'}</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Title</label>
                    <input value={noteTitle} onChange={e => setNoteTitle(e.target.value)} placeholder="E.g., Case research findings"
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg px-4 py-2.5 text-gray-200 placeholder-gray-500 focus:outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Content</label>
                    <textarea value={noteContent} onChange={e => setNoteContent(e.target.value)} placeholder="Write your notes, findings, research..."
                      rows={8}
                      className="w-full bg-navy-950 border border-brass-400/10 rounded-lg p-3 text-gray-200 placeholder-gray-500 resize-none focus:outline-none text-sm" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => { setShowNoteForm(false); setEditingNote(null); }} className="flex-1 px-4 py-2.5 border border-brass-400/10 text-gray-400 rounded-lg hover:text-white text-sm">Cancel</button>
                    <button onClick={handleSaveNote} className="flex-1 px-4 py-2.5 bg-brass-400/20 text-brass-300 rounded-lg hover:bg-brass-400/30 text-sm">{editingNote ? 'Update' : 'Create'}</button>
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

export default function TeamWorkspacesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-950" />}>
      <TeamWorkspacesInner />
    </Suspense>
  );
}
