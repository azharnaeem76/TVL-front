'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { GavelSVG } from '@/components/CourtElements';
import { isLoggedIn, getCurrentUser, getFeatureFlags, updateFeatureFlag } from '@/lib/api';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Stats {
  total_case_laws: number;
  total_statutes: number;
  total_sections: number;
  total_users: number;
}

interface CaseLaw {
  id: number;
  citation: string;
  title: string;
  court: string;
  category: string;
  year: number | null;
  judge_name?: string | null;
  summary_en?: string | null;
  summary_ur?: string | null;
  headnotes?: string | null;
  relevant_statutes?: string | null;
  sections_applied?: string | null;
}

interface Statute {
  id: number;
  title: string;
  short_title: string;
  year: number | null;
  category: string;
}

interface Section {
  id: number;
  section_number: string;
  title: string;
  statute_id: number;
  statute_title?: string;
  content?: string;
}

interface User {
  id: number;
  full_name: string;
  email: string;
  role: string;
  city: string | null;
  is_active: boolean;
}

interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  description: string | null;
  category: string;
  enabled: boolean;
}

type Tab = 'case-laws' | 'statutes' | 'sections' | 'users' | 'features';

// ─── Toast Component ─────────────────────────────────────────────────────────

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-2xl border backdrop-blur-sm animate-fade-in flex items-center gap-3 ${
      type === 'success'
        ? 'bg-emerald-900/90 border-emerald-500/40 text-emerald-200'
        : 'bg-red-900/90 border-red-500/40 text-red-200'
    }`}>
      <span className="text-lg">{type === 'success' ? '\u2713' : '\u2717'}</span>
      <span className="text-sm font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 text-white/50 hover:text-white">&times;</button>
    </div>
  );
}

// ─── Confirm Modal ───────────────────────────────────────────────────────────

function ConfirmModal({ title, message, onConfirm, onCancel }: {
  title: string; message: string; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className="court-panel p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-bold text-brass-400 mb-2">{title}</h3>
        <p className="text-gray-300 text-sm mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded-lg text-sm bg-red-600 hover:bg-red-500 text-white transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function getToken() {
  return localStorage.getItem('tvl_token');
}

async function apiCall(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = 'Bearer ' + token;
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch('/api/v1' + path, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(err.detail || 'Request failed');
  }
  return res.json();
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('case-laws');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Stats
  const [stats, setStats] = useState<Stats>({ total_case_laws: 0, total_statutes: 0, total_sections: 0, total_users: 0 });

  // Case Laws
  const [caseLaws, setCaseLaws] = useState<CaseLaw[]>([]);
  const [clLoading, setClLoading] = useState(false);
  const [clSearch, setClSearch] = useState('');
  const [clCategory, setClCategory] = useState('');
  const [clCourt, setClCourt] = useState('');
  const [clPage, setClPage] = useState(0);
  const [clTotal, setClTotal] = useState(0);
  const [clModal, setClModal] = useState<'add' | 'edit' | null>(null);
  const [clEditing, setClEditing] = useState<Partial<CaseLaw>>({});
  const [clDeleting, setClDeleting] = useState<CaseLaw | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Statutes
  const [statutes, setStatutes] = useState<Statute[]>([]);
  const [stLoading, setStLoading] = useState(false);
  const [stPage, setStPage] = useState(0);
  const [stTotal, setStTotal] = useState(0);
  const [stModal, setStModal] = useState<'add' | 'edit' | null>(null);
  const [stEditing, setStEditing] = useState<Partial<Statute>>({});
  const [stDeleting, setStDeleting] = useState<Statute | null>(null);

  // Sections
  const [sections, setSections] = useState<Section[]>([]);
  const [secLoading, setSecLoading] = useState(false);
  const [secPage, setSecPage] = useState(0);
  const [secTotal, setSecTotal] = useState(0);
  const [secStatuteFilter, setSecStatuteFilter] = useState('');
  const [secModal, setSecModal] = useState<'add' | 'edit' | null>(null);
  const [secEditing, setSecEditing] = useState<Partial<Section>>({});
  const [secDeleting, setSecDeleting] = useState<Section | null>(null);

  // Users
  const [users, setUsers] = useState<User[]>([]);
  const [usLoading, setUsLoading] = useState(false);
  const [usPage, setUsPage] = useState(0);
  const [usTotal, setUsTotal] = useState(0);

  // Features
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [featLoading, setFeatLoading] = useState(false);

  const PAGE_SIZE = 20;

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  }, []);

  // ── Auth Check ──

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
    setAuthorized(true);

    // Auto-open tab/modal if navigated with ?tab= and ?action=add
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab') as Tab;
      const action = params.get('action');
      if (tab) setActiveTab(tab);
      if (action === 'add') {
        if (tab === 'case-laws') setTimeout(() => setClModal('add'), 300);
        else if (tab === 'statutes') setTimeout(() => setStModal('add'), 300);
      }
    }
  }, [router]);

  // ── Load Stats ──

  const loadStats = useCallback(async () => {
    try {
      const data = await apiCall('/admin/stats');
      setStats(data);
    } catch {
      // stats may fail silently
    }
  }, []);

  useEffect(() => {
    if (authorized) loadStats();
  }, [authorized, loadStats]);

  // ── Case Laws CRUD ──

  const loadCaseLaws = useCallback(async (page = 0) => {
    setClLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('skip', String(page * PAGE_SIZE));
      if (clSearch) params.set('search', clSearch);
      if (clCategory) params.set('category', clCategory);
      if (clCourt) params.set('court', clCourt);
      const data = await apiCall('/admin/case-laws?' + params.toString());
      setCaseLaws(Array.isArray(data) ? data : data.results || []);
      setClTotal(data.total ?? (Array.isArray(data) ? data.length : 0));
      setClPage(page);
    } catch (err: any) {
      showToast(err.message || 'Failed to load case laws', 'error');
    } finally {
      setClLoading(false);
    }
  }, [clSearch, clCategory, clCourt, showToast]);

  useEffect(() => {
    if (authorized && activeTab === 'case-laws') loadCaseLaws(0);
  }, [authorized, activeTab, loadCaseLaws]);

  const saveCaseLaw = async () => {
    try {
      if (clModal === 'add') {
        await apiCall('/admin/case-laws', { method: 'POST', body: JSON.stringify(clEditing) });
        showToast('Case law created successfully', 'success');
      } else {
        await apiCall(`/admin/case-laws/${clEditing.id}`, { method: 'PUT', body: JSON.stringify(clEditing) });
        showToast('Case law updated successfully', 'success');
      }
      setClModal(null);
      setClEditing({});
      loadCaseLaws(clPage);
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  const deleteCaseLaw = async () => {
    if (!clDeleting) return;
    try {
      await apiCall(`/admin/case-laws/${clDeleting.id}`, { method: 'DELETE' });
      showToast('Case law deleted', 'success');
      setClDeleting(null);
      loadCaseLaws(clPage);
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  const bulkImportCaseLaws = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const items = JSON.parse(text);
      if (!Array.isArray(items)) throw new Error('JSON must be an array');
      await apiCall('/admin/case-laws/bulk', { method: 'POST', body: JSON.stringify(items) });
      showToast(`Imported ${items.length} case laws`, 'success');
      loadCaseLaws(0);
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Import failed', 'error');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ── Statutes CRUD ──

  const loadStatutes = useCallback(async (page = 0) => {
    setStLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('skip', String(page * PAGE_SIZE));
      const data = await apiCall('/admin/statutes?' + params.toString());
      setStatutes(Array.isArray(data) ? data : data.results || []);
      setStTotal(data.total ?? (Array.isArray(data) ? data.length : 0));
      setStPage(page);
    } catch (err: any) {
      showToast(err.message || 'Failed to load statutes', 'error');
    } finally {
      setStLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (authorized && activeTab === 'statutes') loadStatutes(0);
  }, [authorized, activeTab, loadStatutes]);

  const saveStatute = async () => {
    try {
      if (stModal === 'add') {
        await apiCall('/admin/statutes', { method: 'POST', body: JSON.stringify(stEditing) });
        showToast('Statute created', 'success');
      } else {
        await apiCall(`/admin/statutes/${stEditing.id}`, { method: 'PUT', body: JSON.stringify(stEditing) });
        showToast('Statute updated', 'success');
      }
      setStModal(null);
      setStEditing({});
      loadStatutes(stPage);
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  const deleteStatute = async () => {
    if (!stDeleting) return;
    try {
      await apiCall(`/admin/statutes/${stDeleting.id}`, { method: 'DELETE' });
      showToast('Statute deleted', 'success');
      setStDeleting(null);
      loadStatutes(stPage);
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  // ── Sections CRUD ──

  const loadSections = useCallback(async (page = 0) => {
    setSecLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('skip', String(page * PAGE_SIZE));
      if (secStatuteFilter) params.set('statute_id', secStatuteFilter);
      const data = await apiCall('/admin/sections?' + params.toString());
      setSections(Array.isArray(data) ? data : data.results || []);
      setSecTotal(data.total ?? (Array.isArray(data) ? data.length : 0));
      setSecPage(page);
    } catch (err: any) {
      showToast(err.message || 'Failed to load sections', 'error');
    } finally {
      setSecLoading(false);
    }
  }, [secStatuteFilter, showToast]);

  useEffect(() => {
    if (authorized && activeTab === 'sections') loadSections(0);
  }, [authorized, activeTab, loadSections]);

  const saveSection = async () => {
    try {
      if (secModal === 'add') {
        await apiCall('/admin/sections', { method: 'POST', body: JSON.stringify(secEditing) });
        showToast('Section created', 'success');
      } else {
        await apiCall(`/admin/sections/${secEditing.id}`, { method: 'PUT', body: JSON.stringify(secEditing) });
        showToast('Section updated', 'success');
      }
      setSecModal(null);
      setSecEditing({});
      loadSections(secPage);
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Save failed', 'error');
    }
  };

  const deleteSection = async () => {
    if (!secDeleting) return;
    try {
      await apiCall(`/admin/sections/${secDeleting.id}`, { method: 'DELETE' });
      showToast('Section deleted', 'success');
      setSecDeleting(null);
      loadSections(secPage);
      loadStats();
    } catch (err: any) {
      showToast(err.message || 'Delete failed', 'error');
    }
  };

  // ── Users CRUD ──

  const loadUsers = useCallback(async (page = 0) => {
    setUsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', String(PAGE_SIZE));
      params.set('skip', String(page * PAGE_SIZE));
      const data = await apiCall('/admin/users?' + params.toString());
      setUsers(Array.isArray(data) ? data : data.results || []);
      setUsTotal(data.total ?? (Array.isArray(data) ? data.length : 0));
      setUsPage(page);
    } catch (err: any) {
      showToast(err.message || 'Failed to load users', 'error');
    } finally {
      setUsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (authorized && activeTab === 'users') loadUsers(0);
  }, [authorized, activeTab, loadUsers]);

  const updateUserRole = async (userId: number, role: string) => {
    try {
      await apiCall(`/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify({ role }) });
      showToast('Role updated', 'success');
      loadUsers(usPage);
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  const toggleUserStatus = async (user: User) => {
    try {
      await apiCall(`/admin/users/${user.id}`, {
        method: 'PUT',
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      showToast(user.is_active ? 'User deactivated' : 'User activated', 'success');
      loadUsers(usPage);
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  // ── Feature Flags ──

  const loadFeatures = useCallback(async () => {
    setFeatLoading(true);
    try {
      const data = await getFeatureFlags();
      setFeatureFlags(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load features', 'error');
    } finally {
      setFeatLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (authorized && activeTab === 'features') loadFeatures();
  }, [authorized, activeTab, loadFeatures]);

  const toggleFeature = async (key: string, enabled: boolean) => {
    try {
      await updateFeatureFlag(key, { enabled: !enabled });
      showToast(`Feature ${!enabled ? 'enabled' : 'disabled'}`, 'success');
      loadFeatures();
    } catch (err: any) {
      showToast(err.message || 'Update failed', 'error');
    }
  };

  // ── Pagination Helper ──

  const totalPages = (total: number) => Math.max(1, Math.ceil(total / PAGE_SIZE));

  function Pagination({ current, total, onChange }: { current: number; total: number; onChange: (p: number) => void }) {
    const tp = totalPages(total);
    if (tp <= 1) return null;
    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
        <span className="text-xs text-gray-500">
          Page {current + 1} of {tp} ({total} total)
        </span>
        <div className="flex gap-2">
          <button
            disabled={current === 0}
            onClick={() => onChange(current - 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-brass-400/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          <button
            disabled={current >= tp - 1}
            onClick={() => onChange(current + 1)}
            className="px-3 py-1.5 text-xs rounded-lg border border-white/10 text-gray-400 hover:text-white hover:border-brass-400/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  }

  // ── Guard ──

  if (!authorized) return null;

  // ── Tabs Config ──

  const tabs: { key: Tab; label: string; icon: JSX.Element }[] = [
    {
      key: 'case-laws',
      label: 'Case Laws',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    },
    {
      key: 'statutes',
      label: 'Statutes',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
    },
    {
      key: 'sections',
      label: 'Sections',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>,
    },
    {
      key: 'users',
      label: 'Users',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    },
    {
      key: 'features',
      label: 'Features',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>,
    },
  ];

  const categories = ['civil', 'criminal', 'constitutional', 'family', 'tax', 'corporate', 'labour', 'banking', 'property', 'other'];
  const courts = ['supreme_court', 'lahore_high_court', 'sindh_high_court', 'islamabad_high_court', 'peshawar_high_court', 'balochistan_high_court', 'federal_shariat_court', 'district_court', 'tribunal', 'other'];
  const roles = ['admin', 'lawyer', 'judge', 'paralegal', 'law_student', 'client'];

  const formatLabel = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  // ─── RENDER ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Delete Confirms */}
      {clDeleting && (
        <ConfirmModal
          title="Delete Case Law"
          message={`Are you sure you want to delete "${clDeleting.citation || clDeleting.title}"? This action cannot be undone.`}
          onConfirm={deleteCaseLaw}
          onCancel={() => setClDeleting(null)}
        />
      )}
      {stDeleting && (
        <ConfirmModal
          title="Delete Statute"
          message={`Are you sure you want to delete "${stDeleting.title}"? This will also remove associated sections.`}
          onConfirm={deleteStatute}
          onCancel={() => setStDeleting(null)}
        />
      )}
      {secDeleting && (
        <ConfirmModal
          title="Delete Section"
          message={`Are you sure you want to delete Section ${secDeleting.section_number} - "${secDeleting.title}"?`}
          onConfirm={deleteSection}
          onCancel={() => setSecDeleting(null)}
        />
      )}

      {/* Case Law Modal */}
      {clModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm overflow-y-auto" onClick={() => { setClModal(null); setClEditing({}); }}>
          <div className="court-panel p-6 w-full max-w-2xl mx-4 mb-20" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brass-400 mb-4 flex items-center gap-2">
              <GavelSVG size={20} />
              {clModal === 'add' ? 'Add New Case Law' : 'Edit Case Law'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Citation *</label>
                <input className="input-field w-full" value={clEditing.citation || ''} onChange={e => setClEditing(p => ({ ...p, citation: e.target.value }))} placeholder="e.g., PLD 2024 SC 123" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Year</label>
                <input className="input-field w-full" type="number" value={clEditing.year || ''} onChange={e => setClEditing(p => ({ ...p, year: e.target.value ? Number(e.target.value) : null }))} placeholder="2024" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Title *</label>
                <input className="input-field w-full" value={clEditing.title || ''} onChange={e => setClEditing(p => ({ ...p, title: e.target.value }))} placeholder="Case title" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Court</label>
                <select className="input-field w-full" value={clEditing.court || ''} onChange={e => setClEditing(p => ({ ...p, court: e.target.value }))}>
                  <option value="">Select Court</option>
                  {courts.map(c => <option key={c} value={c}>{formatLabel(c)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Category</label>
                <select className="input-field w-full" value={clEditing.category || ''} onChange={e => setClEditing(p => ({ ...p, category: e.target.value }))}>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c} value={c}>{formatLabel(c)}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Judge Name</label>
                <input className="input-field w-full" value={clEditing.judge_name || ''} onChange={e => setClEditing(p => ({ ...p, judge_name: e.target.value }))} placeholder="Judge name" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Summary (English)</label>
                <textarea className="input-field w-full h-24 resize-none" value={clEditing.summary_en || ''} onChange={e => setClEditing(p => ({ ...p, summary_en: e.target.value }))} placeholder="English summary" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Summary (Urdu)</label>
                <textarea className="input-field w-full h-24 resize-none" dir="rtl" value={clEditing.summary_ur || ''} onChange={e => setClEditing(p => ({ ...p, summary_ur: e.target.value }))} placeholder="Urdu summary" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-400 mb-1">Headnotes</label>
                <textarea className="input-field w-full h-20 resize-none" value={clEditing.headnotes || ''} onChange={e => setClEditing(p => ({ ...p, headnotes: e.target.value }))} placeholder="Headnotes" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Relevant Statutes</label>
                <input className="input-field w-full" value={clEditing.relevant_statutes || ''} onChange={e => setClEditing(p => ({ ...p, relevant_statutes: e.target.value }))} placeholder="Comma-separated" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Sections Applied</label>
                <input className="input-field w-full" value={clEditing.sections_applied || ''} onChange={e => setClEditing(p => ({ ...p, sections_applied: e.target.value }))} placeholder="Comma-separated" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
              <button onClick={() => { setClModal(null); setClEditing({}); }} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors">
                Cancel
              </button>
              <button onClick={saveCaseLaw} className="btn-primary !px-5 !py-2 !text-sm">
                {clModal === 'add' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statute Modal */}
      {stModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setStModal(null); setStEditing({}); }}>
          <div className="court-panel p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brass-400 mb-4">
              {stModal === 'add' ? 'Add New Statute' : 'Edit Statute'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title *</label>
                <input className="input-field w-full" value={stEditing.title || ''} onChange={e => setStEditing(p => ({ ...p, title: e.target.value }))} placeholder="Full title" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Short Title</label>
                <input className="input-field w-full" value={stEditing.short_title || ''} onChange={e => setStEditing(p => ({ ...p, short_title: e.target.value }))} placeholder="Short title" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Year</label>
                  <input className="input-field w-full" type="number" value={stEditing.year || ''} onChange={e => setStEditing(p => ({ ...p, year: e.target.value ? Number(e.target.value) : null }))} />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Category</label>
                  <select className="input-field w-full" value={stEditing.category || ''} onChange={e => setStEditing(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select</option>
                    {categories.map(c => <option key={c} value={c}>{formatLabel(c)}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
              <button onClick={() => { setStModal(null); setStEditing({}); }} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors">
                Cancel
              </button>
              <button onClick={saveStatute} className="btn-primary !px-5 !py-2 !text-sm">
                {stModal === 'add' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Section Modal */}
      {secModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { setSecModal(null); setSecEditing({}); }}>
          <div className="court-panel p-6 w-full max-w-lg mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-brass-400 mb-4">
              {secModal === 'add' ? 'Add New Section' : 'Edit Section'}
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Section Number *</label>
                  <input className="input-field w-full" value={secEditing.section_number || ''} onChange={e => setSecEditing(p => ({ ...p, section_number: e.target.value }))} placeholder="e.g., 302" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Statute ID *</label>
                  <input className="input-field w-full" type="number" value={secEditing.statute_id || ''} onChange={e => setSecEditing(p => ({ ...p, statute_id: Number(e.target.value) }))} placeholder="Statute ID" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Title *</label>
                <input className="input-field w-full" value={secEditing.title || ''} onChange={e => setSecEditing(p => ({ ...p, title: e.target.value }))} placeholder="Section title" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Content</label>
                <textarea className="input-field w-full h-32 resize-none" value={secEditing.content || ''} onChange={e => setSecEditing(p => ({ ...p, content: e.target.value }))} placeholder="Section content" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-white/5">
              <button onClick={() => { setSecModal(null); setSecEditing({}); }} className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white border border-white/10 hover:border-white/20 transition-colors">
                Cancel
              </button>
              <button onClick={saveSection} className="btn-primary !px-5 !py-2 !text-sm">
                {secModal === 'add' ? 'Create' : 'Update'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <GavelSVG size={32} />
              Admin Dashboard
            </h1>
            <p className="text-gray-400 text-sm mt-1">Manage case laws, statutes, sections, and users</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Case Laws', value: stats.total_case_laws, color: 'from-brass-400/20 to-brass-400/5', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg> },
            { label: 'Statutes', value: stats.total_statutes, color: 'from-emerald-400/20 to-emerald-400/5', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg> },
            { label: 'Sections', value: stats.total_sections, color: 'from-blue-400/20 to-blue-400/5', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg> },
            { label: 'Users', value: stats.total_users, color: 'from-purple-400/20 to-purple-400/5', icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg> },
          ].map(s => (
            <div key={s.label} className="card-court p-5 cursor-pointer" onClick={() => setActiveTab(s.label.toLowerCase().replace(' ', '-') as Tab)}>
              <div className={`absolute inset-0 bg-gradient-to-br ${s.color} rounded-xl opacity-50`} />
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{s.label}</span>
                  <span className="text-brass-400/60">{s.icon}</span>
                </div>
                <p className="text-2xl font-bold text-brass-300">{s.value.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 mb-6 p-1 court-panel overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? 'bg-brass-400/20 text-brass-300 border border-brass-400/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ════════════════ CASE LAWS TAB ════════════════ */}
        {activeTab === 'case-laws' && (
          <div className="court-panel p-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              {/* Search */}
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                <input
                  className="input-field w-full pl-10"
                  placeholder="Search by citation, title, or keyword..."
                  value={clSearch}
                  onChange={e => setClSearch(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && loadCaseLaws(0)}
                />
              </div>
              {/* Category Filter */}
              <select className="input-field w-full md:w-40" value={clCategory} onChange={e => { setClCategory(e.target.value); }}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c} value={c}>{formatLabel(c)}</option>)}
              </select>
              {/* Court Filter */}
              <select className="input-field w-full md:w-48" value={clCourt} onChange={e => { setClCourt(e.target.value); }}>
                <option value="">All Courts</option>
                {courts.map(c => <option key={c} value={c}>{formatLabel(c)}</option>)}
              </select>
              {/* Search Button */}
              <button onClick={() => loadCaseLaws(0)} className="btn-primary !px-5 !py-2 !text-sm whitespace-nowrap">
                Search
              </button>
            </div>

            {/* Actions Row */}
            <div className="flex gap-3 mb-4">
              <button onClick={() => { setClEditing({}); setClModal('add'); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brass-400/15 text-brass-300 border border-brass-400/30 hover:bg-brass-400/25 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add New
              </button>
              <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-gray-400 border border-white/10 hover:border-brass-400/30 hover:text-brass-300 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" /></svg>
                Bulk Import JSON
              </button>
              <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={bulkImportCaseLaws} />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">ID</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Citation</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Title</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Court</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Category</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Year</th>
                    <th className="text-right py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clLoading ? (
                    <tr><td colSpan={7} className="py-12 text-center text-gray-500">Loading...</td></tr>
                  ) : caseLaws.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-gray-500">No case laws found</td></tr>
                  ) : caseLaws.map(cl => (
                    <tr key={cl.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 text-gray-500 font-mono text-xs">{cl.id}</td>
                      <td className="py-3 px-3 text-brass-300 font-medium max-w-[180px] truncate">{cl.citation}</td>
                      <td className="py-3 px-3 text-gray-300 max-w-[220px] truncate">{cl.title}</td>
                      <td className="py-3 px-3 text-gray-400 text-xs">{formatLabel(cl.court || '')}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-brass-400/10 text-brass-400 border border-brass-400/20">
                          {formatLabel(cl.category || '')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-gray-400">{cl.year || '-'}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setClEditing(cl); setClModal('edit'); }} className="p-1.5 rounded-lg text-gray-400 hover:text-brass-300 hover:bg-brass-400/10 transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                          </button>
                          <button onClick={() => setClDeleting(cl)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination current={clPage} total={clTotal} onChange={loadCaseLaws} />
          </div>
        )}

        {/* ════════════════ STATUTES TAB ════════════════ */}
        {activeTab === 'statutes' && (
          <div className="court-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Statutes Management</h2>
              <button onClick={() => { setStEditing({}); setStModal('add'); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brass-400/15 text-brass-300 border border-brass-400/30 hover:bg-brass-400/25 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                Add New
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">ID</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Title</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Short Title</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Year</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Category</th>
                    <th className="text-right py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stLoading ? (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-500">Loading...</td></tr>
                  ) : statutes.length === 0 ? (
                    <tr><td colSpan={6} className="py-12 text-center text-gray-500">No statutes found</td></tr>
                  ) : statutes.map(st => (
                    <tr key={st.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 text-gray-500 font-mono text-xs">{st.id}</td>
                      <td className="py-3 px-3 text-brass-300 font-medium max-w-[280px] truncate">{st.title}</td>
                      <td className="py-3 px-3 text-gray-300 max-w-[180px] truncate">{st.short_title}</td>
                      <td className="py-3 px-3 text-gray-400">{st.year || '-'}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">
                          {formatLabel(st.category || '')}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setStEditing(st); setStModal('edit'); }} className="p-1.5 rounded-lg text-gray-400 hover:text-brass-300 hover:bg-brass-400/10 transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                          </button>
                          <button onClick={() => setStDeleting(st)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination current={stPage} total={stTotal} onChange={loadStatutes} />
          </div>
        )}

        {/* ════════════════ SECTIONS TAB ════════════════ */}
        {activeTab === 'sections' && (
          <div className="court-panel p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-lg font-semibold text-white">Sections Management</h2>
              <div className="flex gap-3">
                <div className="relative">
                  <input
                    className="input-field w-48"
                    type="number"
                    placeholder="Filter by Statute ID"
                    value={secStatuteFilter}
                    onChange={e => setSecStatuteFilter(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && loadSections(0)}
                  />
                </div>
                <button onClick={() => loadSections(0)} className="px-3 py-2 rounded-lg text-sm text-gray-400 border border-white/10 hover:border-brass-400/30 hover:text-brass-300 transition-colors">
                  Filter
                </button>
                <button onClick={() => { setSecEditing({}); setSecModal('add'); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-brass-400/15 text-brass-300 border border-brass-400/30 hover:bg-brass-400/25 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
                  Add New
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">ID</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Section #</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Title</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Statute</th>
                    <th className="text-right py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {secLoading ? (
                    <tr><td colSpan={5} className="py-12 text-center text-gray-500">Loading...</td></tr>
                  ) : sections.length === 0 ? (
                    <tr><td colSpan={5} className="py-12 text-center text-gray-500">No sections found</td></tr>
                  ) : sections.map(sec => (
                    <tr key={sec.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 text-gray-500 font-mono text-xs">{sec.id}</td>
                      <td className="py-3 px-3 text-brass-300 font-medium">{sec.section_number}</td>
                      <td className="py-3 px-3 text-gray-300 max-w-[280px] truncate">{sec.title}</td>
                      <td className="py-3 px-3 text-gray-400 text-xs max-w-[200px] truncate">{sec.statute_title || `Statute #${sec.statute_id}`}</td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => { setSecEditing(sec); setSecModal('edit'); }} className="p-1.5 rounded-lg text-gray-400 hover:text-brass-300 hover:bg-brass-400/10 transition-colors" title="Edit">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                          </button>
                          <button onClick={() => setSecDeleting(sec)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" title="Delete">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination current={secPage} total={secTotal} onChange={loadSections} />
          </div>
        )}

        {/* ════════════════ USERS TAB ════════════════ */}
        {activeTab === 'users' && (
          <div className="court-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Users Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">ID</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Name</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Email</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Role</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">City</th>
                    <th className="text-left py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Status</th>
                    <th className="text-right py-3 px-3 text-xs text-gray-500 uppercase tracking-wider font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usLoading ? (
                    <tr><td colSpan={7} className="py-12 text-center text-gray-500">Loading...</td></tr>
                  ) : users.length === 0 ? (
                    <tr><td colSpan={7} className="py-12 text-center text-gray-500">No users found</td></tr>
                  ) : users.map(u => (
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-3 text-gray-500 font-mono text-xs">{u.id}</td>
                      <td className="py-3 px-3 text-white font-medium">{u.full_name}</td>
                      <td className="py-3 px-3 text-gray-400 text-xs">{u.email}</td>
                      <td className="py-3 px-3">
                        <select
                          className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-xs text-brass-300 focus:border-brass-400/40 focus:outline-none transition-colors cursor-pointer"
                          value={u.role}
                          onChange={e => updateUserRole(u.id, e.target.value)}
                        >
                          {roles.map(r => <option key={r} value={r} className="bg-navy-950">{formatLabel(r)}</option>)}
                        </select>
                      </td>
                      <td className="py-3 px-3 text-gray-400 text-xs">{u.city || '-'}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs border ${
                          u.is_active
                            ? 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20'
                            : 'bg-red-400/10 text-red-400 border-red-400/20'
                        }`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => toggleUserStatus(u)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                            u.is_active
                              ? 'text-red-400 border-red-400/20 hover:bg-red-400/10'
                              : 'text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/10'
                          }`}
                        >
                          {u.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination current={usPage} total={usTotal} onChange={loadUsers} />
          </div>
        )}
        {/* ════════════════ FEATURES TAB ════════════════ */}
        {activeTab === 'features' && (
          <div className="court-panel p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Feature Toggles</h2>
              <p className="text-xs text-gray-500">Enable or disable modules across the platform</p>
            </div>

            {featLoading ? (
              <div className="py-12 text-center text-gray-500">Loading features...</div>
            ) : (
              <div className="space-y-8">
                {['core', 'ai', 'collaboration', 'business', 'student', 'notifications'].map(category => {
                  const catFeatures = featureFlags.filter(f => f.category === category);
                  if (catFeatures.length === 0) return null;
                  return (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-brass-400 uppercase tracking-wider mb-3">
                        {category === 'ai' ? 'AI Tools' : category.charAt(0).toUpperCase() + category.slice(1)}
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {catFeatures.map(feat => (
                          <div
                            key={feat.key}
                            className={`p-4 rounded-xl border transition-all ${
                              feat.enabled
                                ? 'border-emerald-500/20 bg-emerald-500/5'
                                : 'border-white/5 bg-white/[0.02]'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-white truncate">{feat.name}</h4>
                                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{feat.description}</p>
                              </div>
                              <button
                                onClick={() => toggleFeature(feat.key, feat.enabled)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                                  feat.enabled ? 'bg-emerald-500' : 'bg-gray-600'
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                    feat.enabled ? 'translate-x-5' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            </div>
                            <div className="mt-2">
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                feat.enabled
                                  ? 'bg-emerald-400/10 text-emerald-400'
                                  : 'bg-gray-500/10 text-gray-500'
                              }`}>
                                {feat.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
