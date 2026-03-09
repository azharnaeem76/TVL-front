'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import { GavelSVG } from '@/components/CourtElements';
import { useSearchHistory } from '@/components/SearchHistory';
import { useBookmarks } from '@/components/Bookmarks';

interface ChartData {
  label: string;
  value: number;
  color: string;
}

function BarChart({ data, title }: { data: ChartData[]; title: string }) {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="court-panel p-6">
      <h3 className="text-sm font-semibold text-brass-400/60 uppercase tracking-wider mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-24 truncate text-right">{d.label}</span>
            <div className="flex-1 bg-white/[0.03] rounded-full h-5 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 flex items-center justify-end pr-2"
                style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color, minWidth: d.value > 0 ? '24px' : '0' }}
              >
                <span className="text-[10px] font-bold text-white/80">{d.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonutChart({ data, title }: { data: ChartData[]; title: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const total = data.reduce((s, d) => s + d.value, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || total === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 200 * dpr;
    canvas.height = 200 * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, 200, 200);

    const cx = 100, cy = 100, r = 80, inner = 50;
    let startAngle = -Math.PI / 2;

    data.forEach(d => {
      const slice = (d.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx, cy, r, startAngle, startAngle + slice);
      ctx.arc(cx, cy, inner, startAngle + slice, startAngle, true);
      ctx.closePath();
      ctx.fillStyle = d.color;
      ctx.fill();
      startAngle += slice;
    });

    ctx.fillStyle = '#0a0e1a';
    ctx.beginPath();
    ctx.arc(cx, cy, inner - 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = 'bold 24px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(total), cx, cy - 6);
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillText('total', cx, cy + 12);
  }, [data, total]);

  return (
    <div className="court-panel p-6">
      <h3 className="text-sm font-semibold text-brass-400/60 uppercase tracking-wider mb-4">{title}</h3>
      <div className="flex items-center gap-6">
        <canvas ref={canvasRef} width={200} height={200} style={{ width: '120px', height: '120px' }} />
        <div className="space-y-2 flex-1">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-xs text-gray-400 flex-1">{d.label}</span>
              <span className="text-xs font-mono text-gray-300">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { history } = useSearchHistory();
  const { bookmarks } = useBookmarks();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const courtColors: Record<string, string> = {
    'supreme_court': '#fac311',
    'lahore_high_court': '#4ade80',
    'sindh_high_court': '#60a5fa',
    'peshawar_high_court': '#f472b6',
    'balochistan_high_court': '#a78bfa',
    'islamabad_high_court': '#fb923c',
    'federal_shariat_court': '#2dd4bf',
  };

  const courtCounts: Record<string, number> = {};
  bookmarks.forEach(b => {
    const c = b.court || 'unknown';
    courtCounts[c] = (courtCounts[c] || 0) + 1;
  });

  const courtData: ChartData[] = Object.entries(courtCounts).map(([k, v]) => ({
    label: k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: v,
    color: courtColors[k] || '#666',
  }));

  // History is string[] - group by count for a simple bar chart
  const searchCounts: Record<string, number> = {};
  history.forEach(h => {
    searchCounts[h] = (searchCounts[h] || 0) + 1;
  });

  const topSearches: ChartData[] = Object.entries(searchCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 6)
    .map(([k, v]) => ({ label: k.length > 30 ? k.slice(0, 30) + '...' : k, value: v, color: '#fac311' }));

  const yearCounts: Record<string, number> = {};
  bookmarks.forEach(b => {
    if (b.year) {
      const decade = `${Math.floor(b.year / 10) * 10}s`;
      yearCounts[decade] = (yearCounts[decade] || 0) + 1;
    }
  });

  const yearData: ChartData[] = Object.entries(yearCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => ({ label: k, value: v, color: '#60a5fa' }));

  return (
    <div className="min-h-screen bg-navy-950 noise">
      <Navbar />
      <main className="w-full px-4 pt-24 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <GavelSVG size={28} className="opacity-40" />
          <h1 className="text-3xl font-display font-bold text-white">Analytics</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Searches', value: history.length, color: 'text-brass-300' },
            { label: 'Bookmarked Cases', value: bookmarks.length, color: 'text-emerald-300' },
            { label: 'Courts Covered', value: Object.keys(courtCounts).length, color: 'text-blue-300' },
            { label: 'Unique Queries', value: new Set(history).size, color: 'text-purple-300' },
          ].map((s, i) => (
            <div key={i} className="court-panel p-5 text-center">
              <div className={`text-3xl font-display font-black mb-1 ${s.color}`}>{s.value}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {courtData.length > 0 && <DonutChart data={courtData} title="Bookmarks by Court" />}
          {topSearches.length > 0 && <BarChart data={topSearches} title="Top Searches" />}
        </div>

        {yearData.length > 0 && (
          <BarChart data={yearData} title="Bookmarks by Decade" />
        )}

        {/* Recent Searches */}
        {history.length > 0 && (
          <div className="court-panel p-6 mt-6">
            <h3 className="text-sm font-semibold text-brass-400/60 uppercase tracking-wider mb-4">Recent Searches</h3>
            <div className="space-y-2">
              {history.slice(0, 10).map((h, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                  <span className="text-sm text-gray-300 truncate flex-1">{h}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {history.length === 0 && bookmarks.length === 0 && (
          <div className="text-center py-24">
            <GavelSVG size={60} className="mx-auto mb-6 opacity-20" />
            <p className="text-lg text-gray-400 font-display">No Data Yet</p>
            <p className="text-sm mt-2 text-gray-600">Start searching and bookmarking cases to see analytics</p>
          </div>
        )}
      </main>
    </div>
  );
}
