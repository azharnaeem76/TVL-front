'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { getCurrentUser, isLoggedIn } from '@/lib/api';
import { ScalesOfJustice, CourtPillars } from '@/components/CourtElements';
import { useBookmarks } from '@/components/Bookmarks';
import { useSavedSearches, SavedSearchesPanel } from '@/components/SavedSearches';
import { BulkExportPanel } from '@/components/BulkExport';

/* ------------------------------------------------------------------ */
/*  Sidebar links per role                                             */
/* ------------------------------------------------------------------ */

interface SidebarLink {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
}

const ICO = {
  dashboard: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>,
  search: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>,
  chat: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>,
  cases: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
  drafting: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  calendar: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>,
  analytics: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
  learn: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>,
  quiz: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>,
  admin: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  statutes: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
  news: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5" /></svg>,
  settings: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.204-.107-.397.165-.71.505-.78.929l-.15.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  users: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  bookmark: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>,
  glossary: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
  profile: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>,
};

function getSidebarLinks(role: string): { section: string; links: SidebarLink[] }[] {
  switch (role) {
    case 'admin':
      return [
        { section: 'Management', links: [
          { href: '/admin', label: 'Admin Panel', icon: ICO.admin },
          { href: '/analytics', label: 'Analytics', icon: ICO.analytics },
        ]},
        { section: 'Research', links: [
          { href: '/search', label: 'Scenario Search', icon: ICO.search },
          { href: '/case-laws', label: 'Case Laws', icon: ICO.cases },
          { href: '/statutes', label: 'Statutes', icon: ICO.statutes },
          { href: '/chat', label: 'AI Chat', icon: ICO.chat },
        ]},
        { section: 'Tools', links: [
          { href: '/drafting', label: 'Drafting', icon: ICO.drafting },
          { href: '/calendar', label: 'Calendar', icon: ICO.calendar },
          { href: '/news', label: 'News', icon: ICO.news },
        ]},
        { section: 'Account', links: [
          { href: '/settings', label: 'Settings', icon: ICO.settings },
        ]},
      ];
    case 'lawyer':
      return [
        { section: 'Practice', links: [
          { href: '/search', label: 'Scenario Search', icon: ICO.search },
          { href: '/case-laws', label: 'Case Laws', icon: ICO.cases },
          { href: '/statutes', label: 'Statutes', icon: ICO.statutes },
          { href: '/chat', label: 'AI Chat', icon: ICO.chat },
        ]},
        { section: 'Workflow', links: [
          { href: '/drafting', label: 'Document Drafting', icon: ICO.drafting },
          { href: '/calendar', label: 'Legal Calendar', icon: ICO.calendar },
          { href: '/analytics', label: 'Analytics', icon: ICO.analytics },
        ]},
        { section: 'Resources', links: [
          { href: '/news', label: 'Legal News', icon: ICO.news },
          { href: '/settings', label: 'Settings', icon: ICO.settings },
        ]},
      ];
    case 'judge':
      return [
        { section: 'Research', links: [
          { href: '/search', label: 'Scenario Search', icon: ICO.search },
          { href: '/case-laws', label: 'Case Laws', icon: ICO.cases },
          { href: '/statutes', label: 'Statutes & Acts', icon: ICO.statutes },
          { href: '/chat', label: 'AI Chat', icon: ICO.chat },
        ]},
        { section: 'Judicial Tools', links: [
          { href: '/calendar', label: 'Court Calendar', icon: ICO.calendar },
          { href: '/analytics', label: 'Analytics', icon: ICO.analytics },
          { href: '/news', label: 'Legal News', icon: ICO.news },
        ]},
        { section: 'Account', links: [
          { href: '/settings', label: 'Settings', icon: ICO.settings },
        ]},
      ];
    case 'law_student':
      return [
        { section: 'Learning', links: [
          { href: '/learn', label: 'Study Topics', icon: ICO.learn },
          { href: '/quiz', label: 'Legal Quiz', icon: ICO.quiz },
        ]},
        { section: 'Research', links: [
          { href: '/search', label: 'Scenario Search', icon: ICO.search },
          { href: '/case-laws', label: 'Case Laws', icon: ICO.cases },
          { href: '/statutes', label: 'Statutes', icon: ICO.statutes },
          { href: '/chat', label: 'AI Chat', icon: ICO.chat },
        ]},
        { section: 'Practice', links: [
          { href: '/drafting', label: 'Draft Documents', icon: ICO.drafting },
          { href: '/settings', label: 'Settings', icon: ICO.settings },
        ]},
      ];
    case 'client':
    default:
      return [
        { section: 'Help', links: [
          { href: '/learn', label: 'Know Your Rights', icon: ICO.learn },
          { href: '/chat', label: 'Ask AI Lawyer', icon: ICO.chat },
          { href: '/search', label: 'Find Cases', icon: ICO.search },
        ]},
        { section: 'Tools', links: [
          { href: '/case-laws', label: 'Case Laws', icon: ICO.cases },
          { href: '/drafting', label: 'Documents', icon: ICO.drafting },
          { href: '/news', label: 'Legal News', icon: ICO.news },
        ]},
        { section: 'Account', links: [
          { href: '/settings', label: 'Settings', icon: ICO.settings },
        ]},
      ];
  }
}

function getRoleWelcome(role: string): { subtitle: string } {
  switch (role) {
    case 'admin': return { subtitle: 'Manage platform, users, case laws, and system settings' };
    case 'lawyer': return { subtitle: 'Search cases, draft documents, and manage your legal calendar' };
    case 'judge': return { subtitle: 'Research case laws, review statutes, and access legal analysis' };
    case 'law_student': return { subtitle: 'Study case laws, take quizzes, and practice legal drafting' };
    case 'client': return { subtitle: 'Search for relevant cases and understand your legal rights' };
    default: return { subtitle: 'Your legal research platform' };
  }
}

/* ------------------------------------------------------------------ */
/*  Admin stats (inline)                                               */
/* ------------------------------------------------------------------ */

function AdminStatsPanel() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {[
        { label: 'Total Users', value: '5', sub: 'Demo accounts', color: 'text-blue-400' },
        { label: 'Case Laws', value: '15+', sub: 'In database', color: 'text-green-400' },
        { label: 'Statutes', value: '10+', sub: 'With sections', color: 'text-purple-400' },
        { label: 'Status', value: 'Active', sub: 'All services up', color: 'text-brass-400' },
      ].map((s, i) => (
        <div key={i} className="court-panel p-3 sm:p-4">
          <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-1">{s.label}</p>
          <p className={`text-lg sm:text-2xl font-display font-bold ${s.color}`}>{s.value}</p>
          <p className="text-[10px] sm:text-xs text-gray-600 mt-1">{s.sub}</p>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Dashboard                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const { bookmarks, removeBookmark, updateNote } = useBookmarks();
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const { savedSearches, removeSearch: removeSaved } = useSavedSearches();

  useEffect(() => {
    if (!isLoggedIn()) { router.push('/login'); return; }
    setUser(getCurrentUser());
  }, [router]);

  if (!user) return null;

  const roleLabels: Record<string, string> = {
    lawyer: 'Advocate', judge: 'Honorable Judge', paralegal: 'Legal Professional',
    law_student: 'Law Student', client: 'Litigant', admin: 'Administrator',
  };

  const quickActionLinks = getSidebarLinks(user.role).flatMap(s => s.links).filter(l => l.href !== '/settings' && l.href !== '/dashboard').slice(0, 8);
  const roleWelcome = getRoleWelcome(user.role);

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />

      <main className="px-4 sm:px-6 pt-24 pb-16">
          <div className="max-w-5xl mx-auto">
            {/* Welcome Banner */}
            <div className="court-panel p-5 sm:p-8 mb-6 sm:mb-8 relative overflow-hidden">
              <CourtPillars />
              <div className="orb-gold w-[300px] h-[300px] -top-20 -right-20 opacity-10" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-brass-400/60 text-[10px] sm:text-xs uppercase tracking-widest font-semibold mb-1 sm:mb-2">
                    {roleLabels[user.role] || user.role}
                  </p>
                  <h1 className="text-xl sm:text-3xl font-display font-bold text-white mb-1 sm:mb-2">
                    Welcome, {user.full_name}
                  </h1>
                  <p className="text-gray-400 text-xs sm:text-sm mb-1">{roleWelcome.subtitle}</p>
                  <p className="text-brass-400/40 italic font-serif text-[10px] sm:text-xs mt-1 sm:mt-2">
                    &ldquo;According to Spirit Of Law&rdquo;
                  </p>
                </div>
                <ScalesOfJustice size={60} className="hidden sm:block opacity-30 animate-scales-tip flex-shrink-0" />
              </div>
            </div>

            {/* Admin Stats */}
            {user.role === 'admin' && <AdminStatsPanel />}

            {/* Quick Actions */}
            <div className="mb-6 sm:mb-8">
              <h2 className="text-base sm:text-lg font-display font-semibold text-white mb-3 sm:mb-4">
                {user.role === 'admin' ? 'Quick Access' : user.role === 'law_student' ? 'Start Here' : 'Quick Actions'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {quickActionLinks.map((a, i) => (
                  <Link key={i} href={a.href} className="card-court group !p-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-brass-400/10 border border-brass-400/20 flex items-center justify-center text-brass-400 mb-3 transition-transform duration-300 group-hover:scale-110">
                      {a.icon}
                    </div>
                    <h3 className="font-display font-semibold text-sm text-white group-hover:text-brass-300 transition-colors">{a.label}</h3>
                  </Link>
                ))}
              </div>
            </div>

            {/* Bookmarks + Profile row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bookmarked Cases */}
              {user.role !== 'client' && (
                <div>
                  <h2 className="text-base sm:text-lg font-display font-semibold text-white mb-3 sm:mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-brass-400" fill="currentColor" viewBox="0 0 24 24"><path d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                    Bookmarked Cases
                  </h2>
                  {bookmarks.length > 0 ? (
                    <div className="space-y-2">
                      {bookmarks.slice(0, 5).map(b => (
                        <div key={b.id} className="card-court !p-3 sm:!p-4 group">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <span className="font-mono text-xs text-brass-300 font-semibold">{b.citation}</span>
                              <p className="text-sm text-gray-300 truncate">{b.title}</p>
                              <p className="text-xs text-gray-500">{b.court?.replace(/_/g, ' ')} {b.year && `(${b.year})`}</p>
                            </div>
                            <div className="flex items-center gap-2 ml-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                              <button onClick={() => setEditingNote(editingNote === b.id ? null : b.id)} className="text-gray-600 hover:text-brass-300 transition-colors" title="Note">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" /></svg>
                              </button>
                              <button onClick={() => removeBookmark(b.id)} className="text-gray-600 hover:text-red-400 transition-colors" title="Remove">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                              </button>
                            </div>
                          </div>
                          {b.note && editingNote !== b.id && (
                            <p className="mt-2 text-xs text-gray-400 italic border-t border-brass-400/10 pt-2">{b.note}</p>
                          )}
                          {editingNote === b.id && (
                            <div className="mt-2 border-t border-brass-400/10 pt-2">
                              <textarea
                                defaultValue={b.note || ''}
                                placeholder="Add a note..."
                                className="input-field !py-2 !text-xs w-full resize-none"
                                rows={2}
                                onBlur={(e) => { updateNote(b.id, e.target.value); setEditingNote(null); }}
                                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); (e.target as HTMLTextAreaElement).blur(); } }}
                                autoFocus
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card-court !p-6 sm:!p-8 text-center">
                      <svg className="w-8 h-8 mx-auto text-brass-400/20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>
                      <p className="text-sm text-gray-500">No bookmarked cases yet</p>
                      <p className="text-xs text-gray-600 mt-1">Bookmark cases from search results</p>
                    </div>
                  )}
                </div>
              )}

              {/* Profile */}
              <div className="glass-strong p-4 sm:p-6">
                <h2 className="text-base sm:text-lg font-display font-semibold text-white mb-3 sm:mb-4">Your Profile</h2>
                <div className="grid grid-cols-1 gap-2 sm:gap-3 text-sm">
                  {[
                    { label: 'Name', value: user.full_name },
                    { label: 'Email', value: user.email },
                    { label: 'Role', value: roleLabels[user.role] },
                    ...(user.specialization ? [{ label: 'Specialization', value: user.specialization }] : []),
                    ...(user.city ? [{ label: 'City', value: user.city }] : []),
                    ...(user.bar_number ? [{ label: 'Bar #', value: user.bar_number }] : []),
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 sm:p-3 bg-white/[0.02] rounded-xl border border-brass-400/5">
                      <span className="text-brass-400/50 min-w-[60px] sm:min-w-[80px] text-[10px] sm:text-xs uppercase tracking-wider">{item.label}</span>
                      <span className="font-medium text-gray-200 text-xs sm:text-sm truncate">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Saved searches + Export */}
            <div className="mt-6 space-y-4">
              {savedSearches.length > 0 && (
                <SavedSearchesPanel
                  searches={savedSearches}
                  onSelect={(q) => router.push(`/search?q=${encodeURIComponent(q)}`)}
                  onRemove={removeSaved}
                />
              )}
              <BulkExportPanel />
            </div>
          </div>
        </main>
    </div>
  );
}
