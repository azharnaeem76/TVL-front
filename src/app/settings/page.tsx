'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getCurrentUser, isLoggedIn, logout, updateProfile, changePassword } from '@/lib/api';
import { useBookmarks } from '@/components/Bookmarks';

const LANGUAGES = [
  { value: 'english', label: 'English' },
  { value: 'urdu', label: 'Urdu (اردو)' },
  { value: 'roman_urdu', label: 'Roman Urdu' },
];

const THEMES = [
  { value: 'dark', label: 'Dark (Default)' },
  { value: 'light', label: 'Light (Coming Soon)', disabled: true },
];

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const { bookmarks, clearAll } = useBookmarks();
  const [preferredLang, setPreferredLang] = useState('english');
  const [resultsPerPage, setResultsPerPage] = useState('10');
  const [saved, setSaved] = useState(false);

  // Profile edit
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileSpec, setProfileSpec] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Password change
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState('');

  useEffect(() => {
    if (!isLoggedIn()) {
      router.replace('/login');
      return;
    }
    const u = getCurrentUser();
    setUser(u);
    if (u) {
      setProfileName(u.full_name || '');
      setProfilePhone(u.phone || '');
      setProfileCity(u.city || '');
      setProfileSpec(u.specialization || '');
    }
    const settings = localStorage.getItem('tvl_settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      setPreferredLang(parsed.preferredLang || 'english');
      setResultsPerPage(parsed.resultsPerPage || '10');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveSettings = () => {
    localStorage.setItem('tvl_settings', JSON.stringify({ preferredLang, resultsPerPage }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    setProfileMsg('');
    try {
      const updated = await updateProfile({
        full_name: profileName,
        phone: profilePhone || null,
        city: profileCity || null,
        specialization: profileSpec || null,
      });
      setUser(updated);
      setProfileMsg('Profile updated!');
      setTimeout(() => setProfileMsg(''), 2000);
    } catch (err: any) {
      setProfileMsg(err.message || 'Update failed');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPwdMsg('');
    if (newPwd !== confirmPwd) { setPwdMsg('Passwords do not match'); return; }
    if (newPwd.length < 6) { setPwdMsg('Password must be at least 6 characters'); return; }
    setPwdSaving(true);
    try {
      await changePassword(currentPwd, newPwd);
      setPwdMsg('Password changed!');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setTimeout(() => setPwdMsg(''), 2000);
    } catch (err: any) {
      setPwdMsg(err.message || 'Change failed');
    } finally {
      setPwdSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 mb-8 text-sm">Manage your profile, preferences, and account</p>

        <div className="space-y-6">
          {/* Profile */}
          <div className="court-panel p-6">
            <h2 className="text-lg font-display font-semibold text-white mb-4">Profile</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brass-400/60 mb-1">Full Name</label>
                <input className="input-field !py-2.5 w-full sm:max-w-sm" value={profileName} onChange={e => setProfileName(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">Phone</label>
                  <input className="input-field !py-2.5 w-full" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} placeholder="Phone number" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">City</label>
                  <input className="input-field !py-2.5 w-full" value={profileCity} onChange={e => setProfileCity(e.target.value)} placeholder="City" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-brass-400/60 mb-1">Specialization</label>
                <input className="input-field !py-2.5 w-full sm:max-w-sm" value={profileSpec} onChange={e => setProfileSpec(e.target.value)} placeholder="e.g., Criminal Law, Family Law" />
              </div>
              <div className="flex items-center gap-3">
                <button onClick={saveProfile} disabled={profileSaving} className="btn-primary !py-2.5 text-sm">
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </button>
                {profileMsg && <span className={`text-sm ${profileMsg.includes('!') ? 'text-emerald-400' : 'text-red-400'}`}>{profileMsg}</span>}
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="court-panel p-6">
            <h2 className="text-lg font-display font-semibold text-white mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brass-400/60 mb-1">Current Password</label>
                <input type="password" className="input-field !py-2.5 w-full sm:max-w-sm" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">New Password</label>
                  <input type="password" className="input-field !py-2.5 w-full" value={newPwd} onChange={e => setNewPwd(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">Confirm New Password</label>
                  <input type="password" className="input-field !py-2.5 w-full" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleChangePassword} disabled={pwdSaving || !currentPwd || !newPwd} className="btn-primary !py-2.5 text-sm">
                  {pwdSaving ? 'Changing...' : 'Change Password'}
                </button>
                {pwdMsg && <span className={`text-sm ${pwdMsg.includes('changed') ? 'text-emerald-400' : 'text-red-400'}`}>{pwdMsg}</span>}
              </div>
            </div>
          </div>

          {/* Search Preferences */}
          <div className="court-panel p-6">
            <h2 className="text-lg font-display font-semibold text-white mb-4">Search Preferences</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-brass-400/60 mb-1">Preferred Language</label>
                <select value={preferredLang} onChange={(e) => setPreferredLang(e.target.value)} className="input-field !py-2.5 max-w-xs">
                  {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-brass-400/60 mb-1">Results Per Page</label>
                <select value={resultsPerPage} onChange={(e) => setResultsPerPage(e.target.value)} className="input-field !py-2.5 max-w-xs">
                  {['5', '10', '20', '50'].map(v => <option key={v} value={v}>{v} results</option>)}
                </select>
              </div>
              <button onClick={saveSettings} className="btn-primary !py-2.5 text-sm">
                {saved ? 'Saved!' : 'Save Preferences'}
              </button>
            </div>
          </div>

          {/* Appearance */}
          <div className="court-panel p-6">
            <h2 className="text-lg font-display font-semibold text-white mb-4">Appearance</h2>
            <div>
              <label className="block text-sm font-medium text-brass-400/60 mb-1">Theme</label>
              <select className="input-field !py-2.5 max-w-xs" defaultValue="dark">
                {THEMES.map(t => <option key={t.value} value={t.value} disabled={t.disabled}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Data Management */}
          <div className="court-panel p-6">
            <h2 className="text-lg font-display font-semibold text-white mb-4">Data Management</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-brass-400/5">
                <div>
                  <p className="text-sm text-gray-200">Bookmarks</p>
                  <p className="text-xs text-gray-500">{bookmarks.length} bookmarked case{bookmarks.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => { if (confirm('Clear all bookmarks?')) clearAll(); }} className="text-xs text-red-400/70 hover:text-red-400 transition-colors">
                  Clear All
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-brass-400/5">
                <div>
                  <p className="text-sm text-gray-200">Search History</p>
                  <p className="text-xs text-gray-500">Stored locally in your browser</p>
                </div>
                <button onClick={() => { if (confirm('Clear search history?')) { localStorage.removeItem('tvl_search_history'); location.reload(); } }} className="text-xs text-red-400/70 hover:text-red-400 transition-colors">
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="court-panel p-6">
            <h2 className="text-lg font-display font-semibold text-white mb-4">Account</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-brass-400/5">
                <span className="text-brass-400/50 min-w-[80px] text-xs uppercase tracking-wider">Email</span>
                <span className="text-gray-200">{user.email}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-brass-400/5">
                <span className="text-brass-400/50 min-w-[80px] text-xs uppercase tracking-wider">Role</span>
                <span className="text-gray-200 capitalize">{user.role?.replace(/_/g, ' ')}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="mt-6 text-sm text-red-400 hover:text-red-300 transition-colors">
              Sign Out
            </button>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="court-panel p-6">
            <h2 className="text-lg font-display font-semibold text-white mb-4">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {[
                { keys: 'Ctrl + K', desc: 'Open command palette' },
                { keys: 'Escape', desc: 'Close overlays' },
                { keys: 'Enter', desc: 'Submit search' },
                { keys: 'Shift + Enter', desc: 'New line in search' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl border border-brass-400/5">
                  <span className="text-gray-400">{s.desc}</span>
                  <kbd className="text-[10px] text-gray-500 bg-white/[0.06] px-2 py-1 rounded border border-white/[0.08] font-mono">{s.keys}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
