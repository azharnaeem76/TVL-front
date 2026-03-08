'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/api';
import { LegalGlossaryPanel } from '@/components/LegalGlossary';
import { useFeatureFlags, ROUTE_FEATURE_MAP } from '@/lib/features';

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
  caseTracker: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>,
  clients: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
  directory: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg>,
  notifications: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" /></svg>,
  features: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" /></svg>,
  bookmarks: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" /></svg>,
  documents: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>,
  aiTool: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" /></svg>,
  contract: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>,
  citation: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" /></svg>,
  messaging: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>,
  team: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
  consultation: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>,
  payment: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" /></svg>,
  subscription: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>,
  mootCourt: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.971zm-16.5.52c.99-.203 1.99-.377 3-.52m0 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.971z" /></svg>,
  examPrep: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.26 10.147a60.438 60.438 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.636 50.636 0 00-2.658-.813A59.906 59.906 0 0112 3.493a59.903 59.903 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
  auditLog: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" /></svg>,
  forum: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" /></svg>,
  support: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.712 4.33a9.027 9.027 0 011.652 1.306c.51.51.944 1.064 1.306 1.652M16.712 4.33l-3.448 4.138m3.448-4.138a9.014 9.014 0 00-9.424 0M19.67 7.288l-4.138 3.448m4.138-3.448a9.014 9.014 0 010 9.424m-4.138-5.976a3.736 3.736 0 00-.88-1.388 3.737 3.737 0 00-1.388-.88m2.268 2.268a3.765 3.765 0 010 2.528m-2.268-4.796l-3.448 4.138m5.716-.37l-4.138 3.448M7.288 4.33l3.448 4.138m0 0a3.765 3.765 0 00-2.528 0m0 0l-4.138-3.448M4.33 7.288l4.138 3.448m-4.138-3.448A9.027 9.027 0 003 12a9.014 9.014 0 001.33 4.712m0-9.424a9.014 9.014 0 000 9.424m4.138-5.976a3.736 3.736 0 00-.88 1.388 3.765 3.765 0 000 2.528m.88 1.388l-4.138 3.448m4.138-3.448a3.736 3.736 0 001.388.88m-5.526 2.568a9.027 9.027 0 004.382 2.652M7.288 19.67l3.448-4.138m-3.448 4.138a9.014 9.014 0 009.424 0m-9.424 0A9.027 9.027 0 013 12a9.027 9.027 0 014.288-7.67m5.976 15.34l-3.448-4.138m3.448 4.138a9.027 9.027 0 004.382-2.652M12 3a9.027 9.027 0 014.712 1.33m-1.976 14.34l3.448-4.138m0 0a3.736 3.736 0 00.88-1.388 3.765 3.765 0 000-2.528m-.88-1.388l4.138-3.448m-4.138 8.804l4.138 3.448m-4.138-3.448a3.737 3.737 0 01-1.388.88m5.526 2.568A9.027 9.027 0 0021 12a9.027 9.027 0 00-1.33-4.712" /></svg>,
};

const ROLE_LABELS: Record<string, string> = {
  lawyer: 'Advocate', judge: 'Honorable Judge', paralegal: 'Legal Professional',
  law_student: 'Law Student', client: 'Litigant', admin: 'Administrator',
  support: 'Support Staff',
};

function getSidebarLinks(role: string): { section: string; links: SidebarLink[] }[] {
  switch (role) {
    case 'admin':
      return [
        { section: 'Management', links: [
          { href: '/dashboard', label: 'Dashboard', icon: ICO.dashboard },
          { href: '/admin', label: 'Admin Panel', icon: ICO.admin },
          { href: '/admin/features', label: 'Feature Toggles', icon: ICO.features },
          { href: '/admin/study-content', label: 'Study Content', icon: ICO.learn },
          { href: '/analytics', label: 'Analytics', icon: ICO.analytics },
          { href: '/audit-logs', label: 'Audit Logs', icon: ICO.auditLog },
        ]},
        { section: 'Research', links: [
          { href: '/search', label: 'Scenario Search', icon: ICO.search },
          { href: '/case-laws', label: 'Case Laws', icon: ICO.cases },
          { href: '/statutes', label: 'Statutes', icon: ICO.statutes },
          { href: '/chat', label: 'AI Chat', icon: ICO.chat },
        ]},
        { section: 'AI Tools', links: [
          { href: '/ai-summarizer', label: 'AI Summarizer', icon: ICO.aiTool },
          { href: '/ai-opinion', label: 'AI Opinion', icon: ICO.aiTool },
          { href: '/ai-predictor', label: 'Case Predictor', icon: ICO.aiTool },
          { href: '/ai-contract', label: 'Contract Analyzer', icon: ICO.contract },
          { href: '/citations', label: 'Citation Finder', icon: ICO.citation },
        ]},
        { section: 'Tools', links: [
          { href: '/drafting', label: 'Drafting', icon: ICO.drafting },
          { href: '/documents', label: 'Document Analysis', icon: ICO.documents },
          { href: '/bookmarks', label: 'Bookmarks', icon: ICO.bookmarks },
          { href: '/messaging', label: 'Messages', icon: ICO.messaging },
          { href: '/calendar', label: 'Calendar', icon: ICO.calendar },
          { href: '/news', label: 'News', icon: ICO.news },
          { href: '/directory', label: 'Lawyer Directory', icon: ICO.directory },
          { href: '/forum', label: 'Community Forum', icon: ICO.forum },
          { href: '/team-workspaces', label: 'Team Workspaces', icon: ICO.team },
        ]},
        { section: 'Business', links: [
          { href: '/consultations', label: 'Consultations', icon: ICO.consultation },
          { href: '/payments', label: 'Payments', icon: ICO.payment },
          { href: '/subscriptions', label: 'Subscriptions', icon: ICO.subscription },
        ]},
        { section: 'Account', links: [
          { href: '/notifications', label: 'Notifications', icon: ICO.notifications },
          { href: '/push-notifications', label: 'Push Notifications', icon: ICO.notifications },
          { href: '/support', label: 'Help & Support', icon: ICO.support },
          { href: '/settings', label: 'Settings', icon: ICO.settings },
        ]},
      ];
    case 'lawyer':
      return [
        { section: 'Practice', links: [
          { href: '/dashboard', label: 'Dashboard', icon: ICO.dashboard },
          { href: '/search', label: 'Scenario Search', icon: ICO.search },
          { href: '/case-laws', label: 'Case Laws', icon: ICO.cases },
          { href: '/statutes', label: 'Statutes', icon: ICO.statutes },
          { href: '/chat', label: 'AI Chat', icon: ICO.chat },
        ]},
        { section: 'AI Tools', links: [
          { href: '/ai-summarizer', label: 'AI Summarizer', icon: ICO.aiTool },
          { href: '/ai-opinion', label: 'AI Opinion', icon: ICO.aiTool },
          { href: '/ai-predictor', label: 'Case Predictor', icon: ICO.aiTool },
          { href: '/ai-contract', label: 'Contract Analyzer', icon: ICO.contract },
          { href: '/citations', label: 'Citation Finder', icon: ICO.citation },
        ]},
        { section: 'Workflow', links: [
          { href: '/case-tracker', label: 'Case Tracker', icon: ICO.caseTracker },
          { href: '/clients', label: 'Client CRM', icon: ICO.clients },
          { href: '/drafting', label: 'Document Drafting', icon: ICO.drafting },
          { href: '/consultations', label: 'Consultations', icon: ICO.consultation },
          { href: '/messaging', label: 'Messages', icon: ICO.messaging },
          { href: '/calendar', label: 'Legal Calendar', icon: ICO.calendar },
          { href: '/analytics', label: 'Analytics', icon: ICO.analytics },
          { href: '/team-workspaces', label: 'Team Workspaces', icon: ICO.team },
        ]},
        { section: 'Resources', links: [
          { href: '/documents', label: 'Document Analysis', icon: ICO.documents },
          { href: '/bookmarks', label: 'Bookmarks', icon: ICO.bookmarks },
          { href: '/directory', label: 'Lawyer Directory', icon: ICO.directory },
          { href: '/forum', label: 'Community Forum', icon: ICO.forum },
          { href: '/news', label: 'Legal News', icon: ICO.news },
          { href: '/payments', label: 'Payments', icon: ICO.payment },
          { href: '/subscriptions', label: 'Plans', icon: ICO.subscription },
          { href: '/notifications', label: 'Notifications', icon: ICO.notifications },
          { href: '/push-notifications', label: 'Push Notifications', icon: ICO.notifications },
          { href: '/support', label: 'Help & Support', icon: ICO.support },
          { href: '/settings', label: 'Settings', icon: ICO.settings },
        ]},
      ];
    case 'judge':
      return [
        { section: 'Research', links: [
          { href: '/dashboard', label: 'Dashboard', icon: ICO.dashboard },
          { href: '/search', label: 'Scenario Search', icon: ICO.search },
          { href: '/case-laws', label: 'Case Laws', icon: ICO.cases },
          { href: '/statutes', label: 'Statutes & Acts', icon: ICO.statutes },
          { href: '/chat', label: 'AI Chat', icon: ICO.chat },
        ]},
        { section: 'AI Tools', links: [
          { href: '/ai-summarizer', label: 'AI Summarizer', icon: ICO.aiTool },
          { href: '/ai-opinion', label: 'AI Opinion', icon: ICO.aiTool },
          { href: '/citations', label: 'Citation Finder', icon: ICO.citation },
        ]},
        { section: 'Judicial Tools', links: [
          { href: '/case-tracker', label: 'Case Tracker', icon: ICO.caseTracker },
          { href: '/calendar', label: 'Court Calendar', icon: ICO.calendar },
          { href: '/analytics', label: 'Analytics', icon: ICO.analytics },
          { href: '/news', label: 'Legal News', icon: ICO.news },
          { href: '/directory', label: 'Directory', icon: ICO.directory },
          { href: '/forum', label: 'Community Forum', icon: ICO.forum },
          { href: '/team-workspaces', label: 'Team Workspaces', icon: ICO.team },
        ]},
        { section: 'Account', links: [
          { href: '/documents', label: 'Document Analysis', icon: ICO.documents },
          { href: '/bookmarks', label: 'Bookmarks', icon: ICO.bookmarks },
          { href: '/messaging', label: 'Messages', icon: ICO.messaging },
          { href: '/notifications', label: 'Notifications', icon: ICO.notifications },
          { href: '/push-notifications', label: 'Push Notifications', icon: ICO.notifications },
          { href: '/support', label: 'Help & Support', icon: ICO.support },
          { href: '/settings', label: 'Settings', icon: ICO.settings },
        ]},
      ];
    case 'law_student':
      return [
        { section: 'Learning', links: [
          { href: '/dashboard', label: 'Dashboard', icon: ICO.dashboard },
          { href: '/learn', label: 'Study Topics', icon: ICO.learn },
          { href: '/quiz', label: 'Legal Quiz', icon: ICO.quiz },
          { href: '/moot-court', label: 'Moot Court', icon: ICO.mootCourt },
          { href: '/exam-prep', label: 'Exam Prep', icon: ICO.examPrep },
        ]},
        { section: 'Research', links: [
          { href: '/search', label: 'Scenario Search', icon: ICO.search },
          { href: '/case-laws', label: 'Case Laws', icon: ICO.cases },
          { href: '/statutes', label: 'Statutes', icon: ICO.statutes },
          { href: '/chat', label: 'AI Chat', icon: ICO.chat },
          { href: '/citations', label: 'Citation Finder', icon: ICO.citation },
        ]},
        { section: 'Practice', links: [
          { href: '/ai-summarizer', label: 'AI Summarizer', icon: ICO.aiTool },
          { href: '/drafting', label: 'Draft Documents', icon: ICO.drafting },
          { href: '/forum', label: 'Community Forum', icon: ICO.forum },
          { href: '/team-workspaces', label: 'Team Workspaces', icon: ICO.team },
          { href: '/bookmarks', label: 'Bookmarks', icon: ICO.bookmarks },
          { href: '/notifications', label: 'Notifications', icon: ICO.notifications },
          { href: '/support', label: 'Help & Support', icon: ICO.support },
          { href: '/settings', label: 'Settings', icon: ICO.settings },
        ]},
      ];
    case 'support':
      return [
        { section: 'Support', links: [
          { href: '/dashboard', label: 'Dashboard', icon: ICO.dashboard },
          { href: '/support', label: 'Support Tickets', icon: ICO.support },
        ]},
        { section: 'Research', links: [
          { href: '/search', label: 'Scenario Search', icon: ICO.search },
          { href: '/case-laws', label: 'Case Laws', icon: ICO.cases },
          { href: '/statutes', label: 'Statutes', icon: ICO.statutes },
          { href: '/chat', label: 'AI Chat', icon: ICO.chat },
        ]},
        { section: 'AI Tools', links: [
          { href: '/ai-summarizer', label: 'AI Summarizer', icon: ICO.aiTool },
          { href: '/ai-opinion', label: 'AI Opinion', icon: ICO.aiTool },
          { href: '/ai-predictor', label: 'Case Predictor', icon: ICO.aiTool },
          { href: '/ai-contract', label: 'Contract Analyzer', icon: ICO.contract },
          { href: '/citations', label: 'Citation Finder', icon: ICO.citation },
        ]},
        { section: 'Tools', links: [
          { href: '/case-tracker', label: 'Case Tracker', icon: ICO.caseTracker },
          { href: '/drafting', label: 'Drafting', icon: ICO.drafting },
          { href: '/documents', label: 'Document Analysis', icon: ICO.documents },
          { href: '/bookmarks', label: 'Bookmarks', icon: ICO.bookmarks },
          { href: '/messaging', label: 'Messages', icon: ICO.messaging },
          { href: '/calendar', label: 'Calendar', icon: ICO.calendar },
          { href: '/news', label: 'News', icon: ICO.news },
          { href: '/directory', label: 'Lawyer Directory', icon: ICO.directory },
          { href: '/forum', label: 'Community Forum', icon: ICO.forum },
          { href: '/team-workspaces', label: 'Team Workspaces', icon: ICO.team },
        ]},
        { section: 'Business', links: [
          { href: '/consultations', label: 'Consultations', icon: ICO.consultation },
          { href: '/payments', label: 'Payments', icon: ICO.payment },
          { href: '/subscriptions', label: 'Subscriptions', icon: ICO.subscription },
        ]},
        { section: 'Account', links: [
          { href: '/notifications', label: 'Notifications', icon: ICO.notifications },
          { href: '/settings', label: 'Settings', icon: ICO.settings },
        ]},
      ];
    case 'client':
    default:
      return [
        { section: 'Help', links: [
          { href: '/dashboard', label: 'Dashboard', icon: ICO.dashboard },
          { href: '/learn', label: 'Know Your Rights', icon: ICO.learn },
          { href: '/chat', label: 'Ask AI Lawyer', icon: ICO.chat },
          { href: '/search', label: 'Find Cases', icon: ICO.search },
        ]},
        { section: 'Tools', links: [
          { href: '/case-laws', label: 'Case Laws', icon: ICO.cases },
          { href: '/drafting', label: 'Documents', icon: ICO.drafting },
          { href: '/consultations', label: 'Book Consultation', icon: ICO.consultation },
          { href: '/messaging', label: 'Messages', icon: ICO.messaging },
          { href: '/forum', label: 'Community Forum', icon: ICO.forum },
          { href: '/news', label: 'Legal News', icon: ICO.news },
        ]},
        { section: 'Account', links: [
          { href: '/bookmarks', label: 'Bookmarks', icon: ICO.bookmarks },
          { href: '/payments', label: 'Payments', icon: ICO.payment },
          { href: '/subscriptions', label: 'Plans', icon: ICO.subscription },
          { href: '/push-notifications', label: 'Push Notifications', icon: ICO.notifications },
          { href: '/support', label: 'Help & Support', icon: ICO.support },
          { href: '/settings', label: 'Settings', icon: ICO.settings },
        ]},
      ];
  }
}

// Pages where sidebar should NOT appear
const EXCLUDED_PAGES = ['/', '/login', '/register', '/reset-password'];

// Shared sidebar state via custom events
function emitSidebarChange(open: boolean) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('sidebar-change', { detail: { open } }));
  }
}

export default function AppSidebar() {
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpenState] = useState(true);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  const setSidebarOpen = (open: boolean) => {
    setSidebarOpenState(open);
    emitSidebarChange(open);
  };
  const { isEnabled } = useFeatureFlags();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      setUser(getCurrentUser());
    }
  }, [mounted, pathname]);

  // Close mobile sidebar on navigation
  useEffect(() => {
    setMobileSidebar(false);
  }, [pathname]);

  // Don't render until mounted (prevents hydration mismatch)
  if (!mounted) return null;
  // Don't render on excluded pages or if not logged in
  if (!user || EXCLUDED_PAGES.includes(pathname)) return null;

  const sidebarSections = getSidebarLinks(user.role).map(section => ({
    ...section,
    links: section.links.filter(link => {
      const featureKey = ROUTE_FEATURE_MAP[link.href];
      // If no feature mapping, always show (e.g. dashboard, settings, admin)
      if (!featureKey) return true;
      return isEnabled(featureKey);
    }),
  })).filter(section => section.links.length > 0);
  const isActive = (href: string) => pathname === href;

  const SidebarContent = () => (
    <div className="space-y-5">
      {/* User card */}
      <div className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-brass-400/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brass-500 to-wood-700 flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
          {user.full_name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
          <p className="text-[10px] text-brass-400/60 uppercase tracking-wider">{ROLE_LABELS[user.role] || user.role}</p>
        </div>
      </div>

      {/* Nav sections */}
      {sidebarSections.map((section, si) => (
        <div key={si}>
          <p className="text-[10px] text-brass-400/40 uppercase tracking-widest font-semibold mb-2 px-2">{section.section}</p>
          <div className="space-y-0.5">
            {section.links.map((link, li) => (
              <Link
                key={li}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all group ${
                  isActive(link.href)
                    ? 'text-brass-300 bg-brass-400/10'
                    : 'text-gray-400 hover:text-brass-300 hover:bg-white/[0.04]'
                }`}
              >
                <span className={`transition-colors ${isActive(link.href) ? 'text-brass-400' : 'text-gray-500 group-hover:text-brass-400'}`}>{link.icon}</span>
                <span>{link.label}</span>
                {link.badge && <span className="ml-auto text-[10px] bg-brass-400/20 text-brass-300 px-1.5 py-0.5 rounded-full">{link.badge}</span>}
              </Link>
            ))}
          </div>
        </div>
      ))}

      {/* Glossary */}
      <div className="border-t border-white/[0.06] pt-4">
        <LegalGlossaryPanel />
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile sidebar toggle button */}
      <button
        onClick={() => setMobileSidebar(true)}
        className="lg:hidden fixed bottom-6 left-6 z-40 w-12 h-12 rounded-full bg-brass-400/20 border border-brass-400/30 text-brass-300 flex items-center justify-center shadow-lg hover:bg-brass-400/30 transition-colors"
        aria-label="Open sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
      </button>

      {/* Mobile sidebar overlay */}
      {mobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebar(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[75vw] max-w-[320px] bg-navy-950 border-r border-brass-400/10 p-4 overflow-y-auto animate-slide-in-left">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-display font-semibold text-brass-300">Menu</h3>
              <button onClick={() => setMobileSidebar(false)} className="text-gray-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar (left) */}
      <aside className={`hidden lg:block fixed left-0 top-16 bottom-0 border-r border-brass-400/10 bg-navy-950/80 backdrop-blur-xl transition-all duration-300 z-30 ${sidebarOpen ? 'w-[260px]' : 'w-0 overflow-hidden'}`}>
        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-navy-950 border border-brass-400/20 text-brass-400/60 hover:text-brass-300 flex items-center justify-center transition-colors z-10"
          title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <svg className={`w-3 h-3 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
        </button>
        <div className="h-full overflow-y-auto p-4">
          <SidebarContent />
        </div>
      </aside>

      {/* Desktop expand button when collapsed */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="hidden lg:flex fixed left-0 top-20 z-30 w-10 h-10 bg-navy-950 border border-brass-400/20 border-l-0 rounded-r-xl items-center justify-center text-brass-400 hover:text-brass-300 hover:bg-brass-400/10 transition-all shadow-lg"
          title="Expand sidebar"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
        </button>
      )}
    </>
  );
}

// Export for pages to use for layout margin adjustment
export function useSidebarMargin() {
  const [marginClass, setMarginClass] = useState('');
  const pathname = usePathname();

  useEffect(() => {
    const update = () => {
      const user = getCurrentUser();
      if (!user || EXCLUDED_PAGES.includes(pathname)) {
        setMarginClass('');
        return;
      }
      // Check if sidebar is visually open (default true on first load)
      setMarginClass('lg:ml-[260px]');
    };
    update();

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const user = getCurrentUser();
      if (!user || EXCLUDED_PAGES.includes(pathname)) {
        setMarginClass('');
      } else {
        setMarginClass(detail.open ? 'lg:ml-[260px]' : '');
      }
    };
    window.addEventListener('sidebar-change', handler);
    return () => window.removeEventListener('sidebar-change', handler);
  }, [pathname]);

  return marginClass;
}
