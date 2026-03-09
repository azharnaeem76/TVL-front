'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { getCurrentUser } from '@/lib/api';
import { GavelSVG } from '@/components/CourtElements';

interface NewsItem {
  id: number;
  title: string;
  summary: string;
  category: string;
  date: string;
  source: string;
  important: boolean;
}

const NEWS_CATEGORIES = ['All', 'Legislation', 'Supreme Court', 'High Courts', 'SROs & Notifications', 'Legal Updates', 'Bar Council'];

const NEWS_ITEMS: NewsItem[] = [
  { id: 1, title: 'Supreme Court Issues Landmark Judgment on Digital Rights', summary: 'The Supreme Court of Pakistan in its recent judgment has expanded the scope of fundamental rights to include digital privacy and freedom of expression on social media platforms, setting a new precedent for cyber law cases.', category: 'Supreme Court', date: '2026-03-05', source: 'SC Registry', important: true },
  { id: 2, title: 'National Assembly Passes Amendment to Anti-Terrorism Act', summary: 'The National Assembly has approved amendments to the Anti-Terrorism Act, 1997, introducing stricter penalties for terrorism financing and expanding the definition of cyber terrorism under the existing framework.', category: 'Legislation', date: '2026-03-04', source: 'NA Secretariat', important: true },
  { id: 3, title: 'Lahore High Court Upholds Rent Tribunal Orders', summary: 'The Lahore High Court bench has dismissed multiple revision petitions challenging rent tribunal orders, affirming that commercial rent disputes must first be adjudicated by the Rent Tribunal before approaching the High Court.', category: 'High Courts', date: '2026-03-03', source: 'LHC Registry', important: false },
  { id: 4, title: 'FBR Issues SRO on Revised Tax Filing Deadlines', summary: 'The Federal Board of Revenue has issued a new SRO extending the deadline for annual tax returns filing for the tax year 2025-26 by 30 days, applicable to all categories of taxpayers including salaried individuals.', category: 'SROs & Notifications', date: '2026-03-02', source: 'FBR', important: false },
  { id: 5, title: 'Pakistan Bar Council Elections Announced', summary: 'The Pakistan Bar Council has announced the schedule for the biennial elections. Nominations will be accepted from March 15 to March 25, with voting scheduled for April 10, 2026.', category: 'Bar Council', date: '2026-03-01', source: 'PBC', important: false },
  { id: 6, title: 'SECP Introduces New Regulations for Digital Companies', summary: 'The Securities and Exchange Commission of Pakistan has introduced comprehensive regulations for digital companies operating in Pakistan, requiring registration and compliance with data protection standards.', category: 'SROs & Notifications', date: '2026-02-28', source: 'SECP', important: false },
  { id: 7, title: 'Islamabad High Court Rules on Environmental Protection', summary: 'The Islamabad High Court has issued a significant ruling directing the Capital Development Authority and EPA to ensure strict compliance with environmental protection laws in all new construction projects within the federal capital.', category: 'High Courts', date: '2026-02-27', source: 'IHC Registry', important: true },
  { id: 8, title: 'Ministry of Law Proposes Reforms to Family Courts', summary: 'The Ministry of Law and Justice has proposed comprehensive reforms to the Family Courts system, including establishment of specialized mediation cells and mandatory pre-trial conciliation proceedings for all family disputes.', category: 'Legal Updates', date: '2026-02-26', source: 'MoLJ', important: false },
  { id: 9, title: 'Supreme Court Forms Larger Bench on Property Rights', summary: 'The Chief Justice has constituted a larger bench of five judges to hear and decide on the interpretation of property rights under the Transfer of Property Act, 1882, in relation to customary land rights in tribal areas.', category: 'Supreme Court', date: '2026-02-25', source: 'SC Registry', important: true },
  { id: 10, title: 'New Practice and Procedure Rules for High Courts', summary: 'The Lahore High Court has notified revised Practice and Procedure Rules for 2026, introducing electronic filing of cases, virtual hearing options, and streamlined procedures for urgent applications.', category: 'Legal Updates', date: '2026-02-24', source: 'LHC', important: false },
  { id: 11, title: 'Federal Shariat Court Decision on Islamic Banking', summary: 'The Federal Shariat Court has delivered its judgment on the compliance of current banking practices with Islamic principles, directing financial institutions to transition to Shariah-compliant models within a specified timeline.', category: 'Supreme Court', date: '2026-02-23', source: 'FSC', important: true },
  { id: 12, title: 'Sindh Assembly Passes Domestic Violence Bill', summary: 'The Sindh Assembly has unanimously passed the Domestic Violence (Prevention and Protection) Amendment Bill, strengthening penalties and introducing protection orders that can be obtained within 24 hours.', category: 'Legislation', date: '2026-02-22', source: 'Sindh Assembly', important: false },
];

export default function NewsPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const filtered = selectedCategory === 'All'
    ? NEWS_ITEMS
    : NEWS_ITEMS.filter(n => n.category === selectedCategory);

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="w-full px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <GavelSVG size={28} className="opacity-40" />
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">Legal News & Updates</h1>
          </div>
          {getCurrentUser()?.role === 'admin' && (
            <button className="btn-primary !py-2 !px-4 text-sm flex items-center gap-1.5" onClick={() => alert('News management coming soon')}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" /></svg>
              <span className="hidden sm:inline">Add News</span>
            </button>
          )}
        </div>
        <p className="text-gray-400 text-sm mb-8">Latest developments in Pakistani law and legislation</p>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {NEWS_CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-4 py-2 rounded-lg text-sm transition-all border ${
                selectedCategory === c
                  ? 'bg-brass-400/15 border-brass-400/30 text-brass-300'
                  : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:text-white hover:border-brass-400/20'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* News Items */}
        <div className="space-y-4">
          {filtered.map(news => (
            <article
              key={news.id}
              className={`court-panel p-6 cursor-pointer transition-all hover:border-brass-400/20 ${news.important ? 'border-l-2 border-l-brass-400' : ''}`}
              onClick={() => setExpandedId(expandedId === news.id ? null : news.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-brass-400/10 text-brass-300 border border-brass-400/20">
                      {news.category}
                    </span>
                    {news.important && (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">
                        Important
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{news.source}</span>
                  </div>
                  <h3 className="font-display font-semibold text-white mb-2 leading-relaxed">{news.title}</h3>
                  <div className={`overflow-hidden transition-all duration-300 ${expandedId === news.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <p className="text-sm text-gray-300 leading-relaxed mb-3">{news.summary}</p>
                  </div>
                  {expandedId !== news.id && (
                    <p className="text-sm text-gray-500 line-clamp-1">{news.summary}</p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {new Date(news.date).toLocaleDateString('en-PK', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  <svg
                    className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${expandedId === news.id ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-500">No news in this category</p>
          </div>
        )}
      </main>
    </div>
  );
}
