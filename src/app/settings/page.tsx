'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { getCurrentUser, isLoggedIn, logout, updateProfile, changePassword, uploadAvatar } from '@/lib/api';
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

const ROLE_LABELS: Record<string, string> = {
  lawyer: 'Advocate', judge: 'Honorable Judge', paralegal: 'Legal Professional',
  law_student: 'Law Student', client: 'Litigant', admin: 'Administrator',
  support: 'Support Staff',
};

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
  const [profileBarNumber, setProfileBarNumber] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  // Avatar
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);

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
      setProfileBarNumber(u.bar_number || '');
      setProfileBio(u.bio || '');
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
        bar_number: profileBarNumber || null,
        bio: profileBio || null,
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

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    if (file.size > 5 * 1024 * 1024) {
      setProfileMsg('Image too large. Max 5MB');
      return;
    }
    setAvatarUploading(true);
    try {
      const updated = await uploadAvatar(file);
      setUser(updated);
      setProfileMsg('Profile picture updated!');
      setTimeout(() => setProfileMsg(''), 2000);
    } catch (err: any) {
      setProfileMsg(err.message || 'Upload failed');
    } finally {
      setAvatarUploading(false);
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

  const role = user.role || 'client';
  const isLawyer = role === 'lawyer' || role === 'paralegal';
  const isJudge = role === 'judge';
  const isStudent = role === 'law_student';

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-display font-bold text-white mb-2">Settings</h1>
        <p className="text-gray-400 mb-8 text-sm">Manage your profile, preferences, and account</p>

        <div className="space-y-6">
          {/* Profile Card */}
          <div className="court-panel p-6">
            <h2 className="text-lg font-display font-semibold text-white mb-6">Profile</h2>

            {/* Avatar + Name Section */}
            <div className="flex items-start gap-6 mb-6">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-brass-400/30 bg-gradient-to-br from-brass-500 to-wood-700 flex items-center justify-center">
                  {user.profile_picture ? (
                    <img src={user.profile_picture} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-white">{user.full_name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  )}
                </div>
                <button
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={avatarUploading}
                  className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {avatarUploading ? (
                    <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" /></svg>
                  )}
                </button>
                <input ref={avatarInputRef} type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-medium text-lg">{user.full_name}</h3>
                <p className="text-brass-400/60 text-sm">{ROLE_LABELS[role] || role}</p>
                <p className="text-gray-500 text-xs mt-1">{user.email}</p>
                {user.plan && user.plan !== 'free' && (
                  <span className="inline-block mt-2 text-[10px] bg-brass-400/20 text-brass-300 px-2 py-0.5 rounded-full uppercase tracking-wider">{user.plan} Plan</span>
                )}
              </div>
            </div>

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

              {/* Role-specific fields */}
              {(isLawyer || isJudge) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-brass-400/60 mb-1">
                      {isJudge ? 'Court / Bench' : 'Specialization'}
                    </label>
                    <input className="input-field !py-2.5 w-full" value={profileSpec} onChange={e => setProfileSpec(e.target.value)}
                      placeholder={isJudge ? 'e.g., Lahore High Court' : 'e.g., Criminal Law, Family Law'} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-brass-400/60 mb-1">
                      {isJudge ? 'Bench Number' : 'Bar Number'}
                    </label>
                    <input className="input-field !py-2.5 w-full" value={profileBarNumber} onChange={e => setProfileBarNumber(e.target.value)}
                      placeholder={isJudge ? 'Bench/Court ID' : 'Bar license number'} />
                  </div>
                </div>
              )}

              {isStudent && (
                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">University / Institution</label>
                  <input className="input-field !py-2.5 w-full sm:max-w-sm" value={profileSpec} onChange={e => setProfileSpec(e.target.value)}
                    placeholder="e.g., University of Punjab Law College" />
                </div>
              )}

              {!isStudent && (
                <div>
                  <label className="block text-sm font-medium text-brass-400/60 mb-1">Bio</label>
                  <textarea className="input-field !py-2.5 w-full resize-none" rows={3} value={profileBio} onChange={e => setProfileBio(e.target.value)}
                    placeholder={isLawyer ? 'Brief description of your practice and experience...' : isJudge ? 'Professional background...' : 'Tell us about yourself...'} />
                </div>
              )}

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
                <span className="text-gray-200">{ROLE_LABELS[role] || role}</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-brass-400/5">
                <span className="text-brass-400/50 min-w-[80px] text-xs uppercase tracking-wider">Plan</span>
                <span className="text-gray-200 capitalize">{user.plan || 'Free'}</span>
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
