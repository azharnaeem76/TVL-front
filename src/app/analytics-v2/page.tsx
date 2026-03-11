'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { isLoggedIn } from '@/lib/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DashboardData {
  total_cases: number;
  active_cases: number;
  total_clients: number;
  total_consultations: number;
  total_revenue: number;
  completed_revenue: number;
  win_rate: number;
  cases_by_status: Record<string, number>;
  monthly_trends: { month: string; year: number; count: number }[];
}

interface CaseStatsData {
  total: number;
  status_counts: Record<string, number>;
  won: number;
  lost: number;
  settled: number;
  pending: number;
  by_category: Record<string, number>;
  by_court: Record<string, number>;
  avg_duration_days: number;
}

interface HeatmapEntry {
  date: string;
  count: number;
}

interface PerformanceData {
  cases_handled: number;
  cases_won: number;
  cases_lost: number;
  success_rate: number;
  avg_case_duration_days: number;
  revenue_generated: number;
  total_consultations: number;
  completed_consultations: number;
  client_satisfaction: number;
}

// ---------------------------------------------------------------------------
// API helpers
// ---------------------------------------------------------------------------

const API = '/api/v1/analytics';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('tvl_token');
}

async function fetchApi<T>(path: string): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!res.ok) throw new Error('Failed to fetch');
  return res.json();
}

// ---------------------------------------------------------------------------
// SVG Chart Components
// ---------------------------------------------------------------------------

function LineChart({ data }: { data: { month: string; count: number }[] }) {
  if (!data.length) return null;
  const W = 700, H = 260, PAD_L = 45, PAD_R = 20, PAD_T = 20, PAD_B = 40;
  const chartW = W - PAD_L - PAD_R;
  const chartH = H - PAD_T - PAD_B;
  const maxVal = Math.max(...data.map(d => d.count), 1);

  const points = data.map((d, i) => {
    const x = PAD_L + (i / (data.length - 1 || 1)) * chartW;
    const y = PAD_T + chartH - (d.count / maxVal) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${PAD_T + chartH} L${points[0].x},${PAD_T + chartH} Z`;

  // Y-axis ticks
  const yTicks = 5;
  const yLines = Array.from({ length: yTicks + 1 }, (_, i) => {
    const val = Math.round((maxVal / yTicks) * i);
    const y = PAD_T + chartH - (i / yTicks) * chartH;
    return { val, y };
  });

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {/* Grid lines */}
      {yLines.map((t, i) => (
        <g key={i}>
          <line x1={PAD_L} y1={t.y} x2={W - PAD_R} y2={t.y} stroke="#1f2937" strokeWidth="1" />
          <text x={PAD_L - 8} y={t.y + 4} textAnchor="end" fill="#6b7280" fontSize="11">{t.val}</text>
        </g>
      ))}
      {/* Area fill */}
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#areaGrad)" />
      {/* Line */}
      <path d={linePath} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {points.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#030712" stroke="#10b981" strokeWidth="2" />
          <text x={p.x} y={H - 10} textAnchor="middle" fill="#9ca3af" fontSize="10">{p.month}</text>
        </g>
      ))}
    </svg>
  );
}

function DonutChart({ data }: { data: Record<string, number> }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  if (!entries.length) return <p className="text-gray-500 text-sm text-center py-8">No data</p>;
  const total = entries.reduce((s, [, v]) => s + v, 0);
  const colors = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#ec4899'];
  const R = 80, CX = 110, CY = 110, STROKE = 28;
  const circumference = 2 * Math.PI * R;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 220 220" className="w-44 h-44 shrink-0">
        {entries.map(([label, val], i) => {
          const pct = val / total;
          const dash = pct * circumference;
          const gap = circumference - dash;
          const rotation = (offset / total) * 360 - 90;
          offset += val;
          return (
            <circle
              key={label}
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke={colors[i % colors.length]}
              strokeWidth={STROKE}
              strokeDasharray={`${dash} ${gap}`}
              transform={`rotate(${rotation} ${CX} ${CY})`}
              className="transition-all duration-500"
            />
          );
        })}
        <text x={CX} y={CY - 6} textAnchor="middle" fill="#f9fafb" fontSize="22" fontWeight="bold">{total}</text>
        <text x={CX} y={CY + 14} textAnchor="middle" fill="#9ca3af" fontSize="11">Total</text>
      </svg>
      <div className="flex flex-col gap-2">
        {entries.map(([label, val], i) => (
          <div key={label} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-gray-300 capitalize">{label}</span>
            <span className="text-gray-500 ml-auto">{val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ data, color = '#3b82f6' }: { data: Record<string, number>; color?: string }) {
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 8);
  if (!entries.length) return <p className="text-gray-500 text-sm text-center py-8">No data</p>;
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);
  const W = 700, BAR_H = 32, GAP = 8, PAD_L = 140, PAD_R = 50;
  const H = entries.length * (BAR_H + GAP) + 20;
  const barAreaW = W - PAD_L - PAD_R;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {entries.map(([label, val], i) => {
        const y = 10 + i * (BAR_H + GAP);
        const barW = (val / maxVal) * barAreaW;
        return (
          <g key={label}>
            <text x={PAD_L - 10} y={y + BAR_H / 2 + 4} textAnchor="end" fill="#d1d5db" fontSize="12">
              {label.length > 18 ? label.slice(0, 18) + '...' : label}
            </text>
            <rect x={PAD_L} y={y} width={barW} height={BAR_H} rx="6" fill={color} opacity="0.85" />
            <text x={PAD_L + barW + 8} y={y + BAR_H / 2 + 4} fill="#9ca3af" fontSize="12">{val}</text>
          </g>
        );
      })}
    </svg>
  );
}

function HorizontalBarChart({ data, colors }: { data: Record<string, number>; colors?: string[] }) {
  const palette = colors || ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];
  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, 6);
  if (!entries.length) return <p className="text-gray-500 text-sm text-center py-8">No data</p>;
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);
  const W = 700, BAR_H = 28, GAP = 12, PAD_L = 160, PAD_R = 50;
  const H = entries.length * (BAR_H + GAP) + 20;
  const barAreaW = W - PAD_L - PAD_R;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {entries.map(([label, val], i) => {
        const y = 10 + i * (BAR_H + GAP);
        const barW = Math.max((val / maxVal) * barAreaW, 4);
        return (
          <g key={label}>
            <text x={PAD_L - 10} y={y + BAR_H / 2 + 4} textAnchor="end" fill="#d1d5db" fontSize="12">
              {label.length > 20 ? label.slice(0, 20) + '...' : label}
            </text>
            <rect x={PAD_L} y={y} width={barW} height={BAR_H} rx="5" fill={palette[i % palette.length]} opacity="0.9" />
            <text x={PAD_L + barW + 8} y={y + BAR_H / 2 + 4} fill="#9ca3af" fontSize="12" fontWeight="600">{val}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Activity Heatmap (GitHub-style)
// ---------------------------------------------------------------------------

function ActivityHeatmap({ data }: { data: HeatmapEntry[] }) {
  if (!data.length) return <p className="text-gray-500 text-sm text-center py-8">No activity data</p>;

  const maxCount = Math.max(...data.map(d => d.count), 1);

  function getColor(count: number): string {
    if (count === 0) return '#111827';
    const intensity = count / maxCount;
    if (intensity <= 0.25) return '#064e3b';
    if (intensity <= 0.5) return '#047857';
    if (intensity <= 0.75) return '#10b981';
    return '#34d399';
  }

  // Build weeks grid: 53 columns x 7 rows
  // data is already sorted by date (365 entries)
  // Find the weekday of the first date to align properly
  const firstDate = new Date(data[0].date);
  const startDow = firstDate.getDay(); // 0=Sun

  const CELL = 13, GAP = 3, SIZE = CELL + GAP;
  const PAD_L = 30, PAD_T = 20;

  // Organize into weeks
  const weeks: (HeatmapEntry | null)[][] = [];
  // Pad the first week with nulls for alignment
  let currentWeek: (HeatmapEntry | null)[] = Array(startDow).fill(null);
  for (const entry of data) {
    currentWeek.push(entry);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) currentWeek.push(null);
    weeks.push(currentWeek);
  }

  const W = PAD_L + weeks.length * SIZE + 10;
  const H = PAD_T + 7 * SIZE + 30;

  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // Month labels
  const monthLabels: { x: number; label: string }[] = [];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  let lastMonth = -1;
  weeks.forEach((week, wi) => {
    for (const entry of week) {
      if (entry) {
        const m = new Date(entry.date).getMonth();
        if (m !== lastMonth) {
          monthLabels.push({ x: PAD_L + wi * SIZE, label: months[m] });
          lastMonth = m;
        }
        break;
      }
    }
  });

  const totalActivity = data.reduce((s, d) => s + d.count, 0);
  const activeDays = data.filter(d => d.count > 0).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-4 text-sm text-gray-400">
          <span>{totalActivity} total activities</span>
          <span>{activeDays} active days</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <span>Less</span>
          {[0, 0.25, 0.5, 0.75, 1].map((v, i) => (
            <span key={i} className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: getColor(v * maxCount) }} />
          ))}
          <span>More</span>
        </div>
      </div>
      <div className="overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ minWidth: 750 }}>
          {/* Day labels */}
          {dayLabels.map((label, i) => (
            label ? (
              <text key={i} x={PAD_L - 6} y={PAD_T + i * SIZE + CELL - 2} textAnchor="end" fill="#6b7280" fontSize="10">{label}</text>
            ) : null
          ))}
          {/* Month labels */}
          {monthLabels.map((m, i) => (
            <text key={i} x={m.x} y={PAD_T - 6} fill="#6b7280" fontSize="10">{m.label}</text>
          ))}
          {/* Cells */}
          {weeks.map((week, wi) =>
            week.map((entry, di) => {
              if (!entry) return null;
              return (
                <rect
                  key={`${wi}-${di}`}
                  x={PAD_L + wi * SIZE}
                  y={PAD_T + di * SIZE}
                  width={CELL}
                  height={CELL}
                  rx="2"
                  fill={getColor(entry.count)}
                  className="transition-colors"
                >
                  <title>{entry.date}: {entry.count} activities</title>
                </rect>
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({ label, value, sub, trend, color }: {
  label: string;
  value: string | number;
  sub?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'emerald' | 'amber' | 'red' | 'blue';
}) {
  const borderColor = {
    emerald: 'border-emerald-500/30',
    amber: 'border-amber-500/30',
    red: 'border-red-500/30',
    blue: 'border-blue-500/30',
  }[color || 'emerald'];

  const accentColor = {
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  }[color || 'emerald'];

  return (
    <div className={`bg-gray-900 border ${borderColor} rounded-xl p-5 flex flex-col gap-1`}>
      <span className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</span>
      <div className="flex items-end gap-2">
        <span className={`text-2xl font-bold ${accentColor}`}>{value}</span>
        {trend && (
          <span className={`text-sm ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500'}`}>
            {trend === 'up' ? '\u2191' : trend === 'down' ? '\u2193' : '\u2192'}
          </span>
        )}
      </div>
      {sub && <span className="text-xs text-gray-500">{sub}</span>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Performance Card
// ---------------------------------------------------------------------------

function PerfCard({ label, value, icon, color }: {
  label: string;
  value: string | number;
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <div className="text-lg font-bold text-gray-100">{value}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function AnalyticsV2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [caseStats, setCaseStats] = useState<CaseStatsData | null>(null);
  const [heatmap, setHeatmap] = useState<HeatmapEntry[]>([]);
  const [perf, setPerf] = useState<PerformanceData | null>(null);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [d, cs, hm, p] = await Promise.all([
        fetchApi<DashboardData>('/dashboard'),
        fetchApi<CaseStatsData>('/case-stats'),
        fetchApi<HeatmapEntry[]>('/activity-heatmap'),
        fetchApi<PerformanceData>('/performance'),
      ]);
      setDashboard(d);
      setCaseStats(cs);
      setHeatmap(hm);
      setPerf(p);
    } catch (e: any) {
      setError(e.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoggedIn()) {
      router.push('/login');
      return;
    }
    loadData();
  }, [router, loadData]);

  if (!isLoggedIn()) return null;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Analytics Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Comprehensive overview of your practice performance</p>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm transition-colors disabled:opacity-50 border border-gray-700"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-500 text-sm">Loading analytics...</span>
            </div>
          </div>
        ) : (
          <>
            {/* ====== 1. Summary Cards ====== */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard
                label="Total Cases"
                value={dashboard?.total_cases ?? 0}
                sub={`${dashboard?.active_cases ?? 0} active`}
                trend="up"
                color="blue"
              />
              <StatCard
                label="Active Cases"
                value={dashboard?.active_cases ?? 0}
                sub="Currently in progress"
                trend="neutral"
                color="amber"
              />
              <StatCard
                label="Win Rate"
                value={`${dashboard?.win_rate ?? 0}%`}
                sub={`${caseStats?.won ?? 0} won / ${(caseStats?.won ?? 0) + (caseStats?.lost ?? 0)} resolved`}
                trend={(dashboard?.win_rate ?? 0) >= 50 ? 'up' : 'down'}
                color="emerald"
              />
              <StatCard
                label="Revenue"
                value={`Rs ${((dashboard?.completed_revenue ?? 0) / 1000).toFixed(dashboard?.completed_revenue && dashboard.completed_revenue >= 1000 ? 1 : 0)}${(dashboard?.completed_revenue ?? 0) >= 1000 ? 'K' : ''}`}
                sub={`${dashboard?.total_consultations ?? 0} consultations`}
                trend="up"
                color="emerald"
              />
            </div>

            {/* ====== 2. Charts Grid ====== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Line Chart - Monthly Trends */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Monthly Case Trends</h3>
                <LineChart data={dashboard?.monthly_trends ?? []} />
              </div>

              {/* Donut Chart - Cases by Status */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Cases by Status</h3>
                <div className="flex items-center justify-center py-4">
                  <DonutChart data={dashboard?.cases_by_status ?? {}} />
                </div>
              </div>

              {/* Bar Chart - Cases by Area of Law */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Cases by Area of Law</h3>
                <BarChart data={caseStats?.by_category ?? {}} color="#3b82f6" />
              </div>

              {/* Horizontal Bar Chart - Cases by Court */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Top Courts</h3>
                <HorizontalBarChart data={caseStats?.by_court ?? {}} />
              </div>
            </div>

            {/* ====== 3. Activity Heatmap ====== */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-8">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Activity Heatmap</h3>
              <ActivityHeatmap data={heatmap} />
            </div>

            {/* ====== 4. Performance Metrics ====== */}
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-300 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <PerfCard
                  label="Success Rate"
                  value={`${perf?.success_rate ?? 0}%`}
                  icon={"\u2713"}
                  color="bg-emerald-900/50 text-emerald-400"
                />
                <PerfCard
                  label="Avg Case Duration"
                  value={`${perf?.avg_case_duration_days ?? 0}d`}
                  icon={"\u23F1"}
                  color="bg-blue-900/50 text-blue-400"
                />
                <PerfCard
                  label="Client Satisfaction"
                  value={`${perf?.client_satisfaction ?? 0}/5`}
                  icon={"\u2605"}
                  color="bg-amber-900/50 text-amber-400"
                />
                <PerfCard
                  label="Revenue Generated"
                  value={`Rs ${(perf?.revenue_generated ?? 0).toLocaleString()}`}
                  icon={"\u20A8"}
                  color="bg-emerald-900/50 text-emerald-400"
                />
              </div>
            </div>

            {/* ====== 5. Detailed Stats Row ====== */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Case Outcome Breakdown */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Case Outcomes</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Won (Disposed)', value: caseStats?.won ?? 0, color: 'bg-emerald-500' },
                    { label: 'Lost (Closed)', value: caseStats?.lost ?? 0, color: 'bg-red-500' },
                    { label: 'Settled', value: caseStats?.settled ?? 0, color: 'bg-amber-500' },
                    { label: 'Pending / Active', value: caseStats?.pending ?? 0, color: 'bg-blue-500' },
                  ].map(item => {
                    const total = (caseStats?.total ?? 1) || 1;
                    const pct = Math.round((item.value / total) * 100);
                    return (
                      <div key={item.label}>
                        <div className="flex justify-between text-xs text-gray-400 mb-1">
                          <span>{item.label}</span>
                          <span>{item.value} ({pct}%)</span>
                        </div>
                        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Consultation Stats */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Consultation Overview</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total Consultations</span>
                    <span className="text-lg font-bold text-white">{perf?.total_consultations ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Completed</span>
                    <span className="text-lg font-bold text-emerald-400">{perf?.completed_consultations ?? 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Revenue</span>
                    <span className="text-lg font-bold text-emerald-400">Rs {(perf?.revenue_generated ?? 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Total Clients</span>
                    <span className="text-lg font-bold text-blue-400">{dashboard?.total_clients ?? 0}</span>
                  </div>
                </div>
              </div>

              {/* Recent Activity Feed */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {(() => {
                    // Derive recent activity from heatmap data (last 7 days with activity)
                    const recent = [...heatmap]
                      .filter(h => h.count > 0)
                      .slice(-7)
                      .reverse();
                    if (!recent.length) return <p className="text-gray-500 text-sm">No recent activity</p>;
                    return recent.map((item, i) => {
                      const d = new Date(item.date);
                      const dayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      return (
                        <div key={i} className="flex items-center gap-3 py-1.5 border-b border-gray-800 last:border-0">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-300 truncate">{item.count} {item.count === 1 ? 'activity' : 'activities'}</p>
                            <p className="text-xs text-gray-600">{dayStr}</p>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>

            {/* Average Duration callout */}
            {(caseStats?.avg_duration_days ?? 0) > 0 && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-900/40 flex items-center justify-center">
                  <span className="text-2xl text-blue-400">{"\u23F3"}</span>
                </div>
                <div>
                  <div className="text-xl font-bold text-white">{caseStats?.avg_duration_days} days</div>
                  <div className="text-sm text-gray-500">Average case duration from filing to resolution</div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
