'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { isLoggedIn, getCurrentUser, getFeatureFlags, updateFeatureFlag } from '@/lib/api';

interface FeatureFlag {
  id: number;
  key: string;
  name: string;
  description: string | null;
  category: string;
  enabled: boolean;
}

const CATEGORIES = ['core', 'ai', 'collaboration', 'business', 'student', 'notifications'];
const CATEGORY_LABELS: Record<string, string> = {
  core: 'Core Features',
  ai: 'AI Tools',
  collaboration: 'Collaboration',
  business: 'Business',
  student: 'Student Tools',
  notifications: 'Notifications',
};
const CATEGORY_COLORS: Record<string, string> = {
  core: 'from-brass-400/20 to-brass-400/5',
  ai: 'from-purple-400/20 to-purple-400/5',
  collaboration: 'from-blue-400/20 to-blue-400/5',
  business: 'from-emerald-400/20 to-emerald-400/5',
  student: 'from-orange-400/20 to-orange-400/5',
  notifications: 'from-pink-400/20 to-pink-400/5',
};

function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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

export default function FeaturesPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    if (!isLoggedIn()) { router.replace('/login'); return; }
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') { router.replace('/dashboard'); return; }
    setAuthorized(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadFeatures = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getFeatureFlags();
      setFeatureFlags(Array.isArray(data) ? data : data.items || []);
    } catch (err: any) {
      setToast({ message: err.message || 'Failed to load features', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authorized) loadFeatures();
  }, [authorized, loadFeatures]);

  const toggleFeature = async (key: string, enabled: boolean) => {
    try {
      await updateFeatureFlag(key, { enabled: !enabled });
      setToast({ message: `Feature ${!enabled ? 'enabled' : 'disabled'}`, type: 'success' });
      loadFeatures();
    } catch (err: any) {
      setToast({ message: err.message || 'Update failed', type: 'error' });
    }
  };

  const enableAll = async (category: string) => {
    const cats = featureFlags.filter(f => f.category === category && !f.enabled);
    for (const f of cats) {
      try { await updateFeatureFlag(f.key, { enabled: true }); } catch {}
    }
    setToast({ message: `All ${CATEGORY_LABELS[category] || category} features enabled`, type: 'success' });
    loadFeatures();
  };

  const disableAll = async (category: string) => {
    const cats = featureFlags.filter(f => f.category === category && f.enabled);
    for (const f of cats) {
      try { await updateFeatureFlag(f.key, { enabled: false }); } catch {}
    }
    setToast({ message: `All ${CATEGORY_LABELS[category] || category} features disabled`, type: 'success' });
    loadFeatures();
  };

  if (!authorized) return null;

  const filtered = filter === 'all' ? featureFlags
    : filter === 'enabled' ? featureFlags.filter(f => f.enabled)
    : filter === 'disabled' ? featureFlags.filter(f => !f.enabled)
    : featureFlags.filter(f => f.category === filter);

  const enabledCount = featureFlags.filter(f => f.enabled).length;
  const totalCount = featureFlags.length;

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <main className="max-w-7xl mx-auto px-4 pt-24 pb-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-white flex items-center gap-3">
              <svg className="w-8 h-8 text-brass-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>
              Feature Toggles
            </h1>
            <p className="text-gray-400 text-sm mt-1">Enable or disable platform modules and services</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              <span className="text-emerald-400 font-bold">{enabledCount}</span> / {totalCount} enabled
            </span>
            <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: totalCount ? `${(enabledCount / totalCount) * 100}%` : '0%' }} />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="court-panel p-2 mb-6 flex flex-wrap gap-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'enabled', label: 'Enabled' },
            { key: 'disabled', label: 'Disabled' },
            ...CATEGORIES.map(c => ({ key: c, label: CATEGORY_LABELS[c] || c })),
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                filter === f.key
                  ? 'bg-brass-400/20 text-brass-300 border border-brass-400/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Features Grid */}
        {loading ? (
          <div className="court-panel p-12 text-center text-gray-500">Loading features...</div>
        ) : featureFlags.length === 0 ? (
          <div className="court-panel p-12 text-center text-gray-500">No features found. Make sure the backend has seeded feature flags.</div>
        ) : (
          <div className="space-y-8">
            {CATEGORIES.map(category => {
              const catFeatures = filtered.filter(f => f.category === category);
              if (catFeatures.length === 0) return null;
              const allEnabled = catFeatures.every(f => f.enabled);
              const noneEnabled = catFeatures.every(f => !f.enabled);
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-brass-400 uppercase tracking-wider">
                      {CATEGORY_LABELS[category] || category}
                      <span className="text-gray-600 font-normal ml-2">
                        ({catFeatures.filter(f => f.enabled).length}/{catFeatures.length})
                      </span>
                    </h3>
                    <div className="flex gap-2">
                      {!allEnabled && (
                        <button onClick={() => enableAll(category)} className="text-[10px] px-2 py-1 rounded-lg text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/10 transition-colors">
                          Enable All
                        </button>
                      )}
                      {!noneEnabled && (
                        <button onClick={() => disableAll(category)} className="text-[10px] px-2 py-1 rounded-lg text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors">
                          Disable All
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {catFeatures.map(feat => (
                      <div
                        key={feat.key}
                        className={`relative overflow-hidden p-4 rounded-xl border transition-all ${
                          feat.enabled
                            ? 'border-emerald-500/20 bg-emerald-500/5'
                            : 'border-white/5 bg-white/[0.02]'
                        }`}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${CATEGORY_COLORS[category] || ''} opacity-30 pointer-events-none`} />
                        <div className="relative z-10">
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
                          <div className="mt-2 flex items-center gap-2">
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                              feat.enabled
                                ? 'bg-emerald-400/10 text-emerald-400'
                                : 'bg-gray-500/10 text-gray-500'
                            }`}>
                              {feat.enabled ? 'Enabled' : 'Disabled'}
                            </span>
                            <span className="text-[10px] text-gray-600">{feat.key}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
