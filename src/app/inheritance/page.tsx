'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { isLoggedIn } from '@/lib/api';

/* ─── Types ────────────────────────────────────────────────────────── */

interface HeirInput {
  id: string;
  name: string;
  relationship: string;
  gender: string;
  count: number;
}

interface PropertyInput {
  id: string;
  name: string;
  property_type: string;
  value: number;
}

interface HeirResult {
  name: string;
  relationship: string;
  gender: string;
  count: number;
  share_fraction: string;
  share_percentage: number;
  share_amount: number;
  blocked: boolean;
  blocked_by: string;
  basis: string;
}

interface InheritanceResult {
  law_system: string;
  total_estate: number;
  debts: number;
  bequests: number;
  distributable_estate: number;
  total_distributed: number;
  undistributed: number;
  awl_applied: boolean;
  radd_applied: boolean;
  heirs: HeirResult[];
  blocked_heirs: HeirResult[];
  summary: { total_heirs: number; total_blocked: number };
}

interface PropertyBreakdown {
  property_name: string;
  property_type: string;
  property_value: number;
  shares: { heir_name: string; relationship: string; share_percentage: number; share_amount: number }[];
}

const RELATIONSHIPS = [
  { value: 'husband', label: 'Husband', gender: 'male', info: 'Must be legally married. Secret or undocumented marriages are not eligible.' },
  { value: 'wife', label: 'Wife', gender: 'female', info: 'Multiple wives are eligible. Secret or undocumented marriages are not eligible. A divorced wife is eligible if iddah period has not yet completed.' },
  { value: 'son', label: 'Son', gender: 'male', info: 'Adopted son, step-son, or illegitimate son is not eligible.' },
  { value: 'daughter', label: 'Daughter', gender: 'female', info: 'Adopted daughter, step-daughter, or illegitimate daughter is not eligible.' },
  { value: 'father', label: 'Father', gender: 'male', info: 'Illegitimate father or step-father is not eligible.' },
  { value: 'mother', label: 'Mother', gender: 'female', info: 'Illegitimate mother or step-mother is not eligible.' },
  { value: 'sons_son', label: 'Grandson (Son\'s Son)', gender: 'male', info: 'Only son\'s sons are eligible. Daughter\'s sons are not eligible.' },
  { value: 'sons_daughter', label: 'Granddaughter (Son\'s Daughter)', gender: 'female', info: 'Only son\'s daughters are eligible. Daughter\'s daughters are not eligible.' },
  { value: 'paternal_grandfather', label: 'Paternal Grandfather', gender: 'male', info: 'Only father\'s father is eligible. Mother\'s father is not eligible.' },
  { value: 'paternal_grandmother', label: 'Paternal Grandmother', gender: 'female', info: 'Father\'s mother is eligible.' },
  { value: 'maternal_grandmother', label: 'Maternal Grandmother', gender: 'female', info: 'Mother\'s mother is eligible.' },
  { value: 'full_brother', label: 'Full Brother', gender: 'male', info: 'Brothers who share the same father and the mother with the deceased.' },
  { value: 'full_sister', label: 'Full Sister', gender: 'female', info: 'Sisters who share the same father and the mother with the deceased.' },
  { value: 'paternal_half_brother', label: 'Paternal Half Brother', gender: 'male', info: 'Brothers who share the same father, but a different mother.' },
  { value: 'paternal_half_sister', label: 'Paternal Half Sister', gender: 'female', info: 'Sisters who share the same father, but a different mother.' },
  { value: 'maternal_half_brother', label: 'Maternal Half Brother', gender: 'male', info: 'Brothers who share the same mother, but a different father.' },
  { value: 'maternal_half_sister', label: 'Maternal Half Sister', gender: 'female', info: 'Sisters who share the same mother, but a different father.' },
  { value: 'full_nephew', label: 'Full Nephew', gender: 'male', info: 'Only full brother\'s son is eligible. Sister\'s son is not eligible.' },
  { value: 'paternal_nephew', label: 'Paternal Nephew', gender: 'male', info: 'Only paternal brother\'s son is eligible. Paternal sister\'s son is not eligible.' },
  { value: 'full_nephews_son', label: 'Full Nephew\'s Son', gender: 'male', info: 'Full brother\'s son\'s son.' },
  { value: 'paternal_nephews_son', label: 'Paternal Nephew\'s Son', gender: 'male', info: 'Paternal brother\'s son\'s son.' },
  { value: 'full_paternal_uncle', label: 'Full Paternal Uncle', gender: 'male', info: 'Father\'s full brother (shares same father and mother as your father).' },
  { value: 'paternal_paternal_uncle', label: 'Paternal Paternal Uncle', gender: 'male', info: 'Father\'s paternal brother (shares same father but different mother).' },
  { value: 'full_cousin', label: 'Full Cousin', gender: 'male', info: 'Father\'s full brother\'s son.' },
  { value: 'paternal_cousin', label: 'Paternal Cousin', gender: 'male', info: 'Father\'s paternal brother\'s son.' },
  { value: 'full_cousins_son', label: 'Full Cousin\'s Son', gender: 'male', info: 'Father\'s full brother\'s son\'s son.' },
  { value: 'paternal_cousins_son', label: 'Paternal Cousin\'s Son', gender: 'male', info: 'Father\'s paternal brother\'s son\'s son.' },
  { value: 'full_cousins_grandson', label: 'Full Cousin\'s Grandson', gender: 'male', info: 'Father\'s full brother\'s son\'s son\'s son.' },
  { value: 'paternal_cousins_grandson', label: 'Paternal Cousin\'s Grandson', gender: 'male', info: 'Father\'s paternal brother\'s son\'s son\'s son.' },
];

const RELIGIONS = [
  { value: 'sunni_hanafi', label: 'Islamic (Sunni - Hanafi)', desc: 'Predominant in Pakistan' },
  { value: 'shia', label: 'Islamic (Shia - Jafari)', desc: 'Ithna Ashari school' },
  { value: 'christian', label: 'Christian', desc: 'Succession Act 1925' },
  { value: 'hindu', label: 'Hindu', desc: 'Hindu Succession Law' },
  { value: 'sikh', label: 'Sikh', desc: 'Customary / Succession Act 1925' },
];

const PROPERTY_TYPES = [
  { value: 'real_estate', label: 'Real Estate / Land' },
  { value: 'cash', label: 'Cash / Bank Balance' },
  { value: 'gold', label: 'Gold / Jewelry' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'shares', label: 'Shares / Investments' },
  { value: 'business', label: 'Business Assets' },
  { value: 'other', label: 'Other' },
];

const COLORS = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6366F1',
  '#14B8A6', '#E11D48', '#7C3AED', '#0EA5E9', '#D946EF',
];

const uid = () => Math.random().toString(36).slice(2, 9);
const fmt = (n: number) => n.toLocaleString('en-PK', { maximumFractionDigits: 2 });

type ViewMode = 'tree' | 'table' | 'pie' | 'sunburst' | 'cards';

/* ─── PIE CHART (pure SVG) ─────────────────────────────────────────── */

function PieChart({ heirs, size = 340 }: { heirs: HeirResult[]; size?: number }) {
  const r = size / 2 - 20;
  const cx = size / 2;
  const cy = size / 2;
  let cumAngle = -90;
  const [hovered, setHovered] = useState<number | null>(null);

  const slices = heirs.filter(h => h.share_percentage > 0).map((h, i) => {
    const angle = (h.share_percentage / 100) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const largeArc = angle > 180 ? 1 : 0;
    const rad = (a: number) => (a * Math.PI) / 180;
    const x1 = cx + r * Math.cos(rad(startAngle));
    const y1 = cy + r * Math.sin(rad(startAngle));
    const x2 = cx + r * Math.cos(rad(endAngle));
    const y2 = cy + r * Math.sin(rad(endAngle));
    const midAngle = startAngle + angle / 2;
    const labelR = r * 0.65;
    const lx = cx + labelR * Math.cos(rad(midAngle));
    const ly = cy + labelR * Math.sin(rad(midAngle));
    return { ...h, x1, y1, x2, y2, largeArc, lx, ly, angle, color: COLORS[i % COLORS.length], idx: i };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {slices.map((s) => (
          <g key={s.idx} onMouseEnter={() => setHovered(s.idx)} onMouseLeave={() => setHovered(null)}>
            {s.angle >= 359.99 ? (
              <circle cx={cx} cy={cy} r={r} fill={s.color} opacity={hovered === s.idx ? 1 : 0.85}
                stroke="#1F2937" strokeWidth={hovered === s.idx ? 3 : 1} />
            ) : (
              <path
                d={`M ${cx} ${cy} L ${s.x1} ${s.y1} A ${r} ${r} 0 ${s.largeArc} 1 ${s.x2} ${s.y2} Z`}
                fill={s.color}
                opacity={hovered === s.idx ? 1 : 0.85}
                stroke="#1F2937" strokeWidth={hovered === s.idx ? 3 : 1}
                style={{ transition: 'opacity 0.2s' }}
              />
            )}
            {s.angle > 15 && (
              <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize={11} fontWeight="bold" pointerEvents="none">
                {s.share_percentage.toFixed(1)}%
              </text>
            )}
          </g>
        ))}
      </svg>
      {hovered !== null && slices[hovered] && (
        <div className="mt-2 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm">
          {slices[hovered].name}: {slices[hovered].share_percentage.toFixed(2)}% — PKR {fmt(slices[hovered].share_amount)}
        </div>
      )}
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {slices.map(s => (
          <div key={s.idx} className="flex items-center gap-1.5 text-xs text-gray-300">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── TREE VIEW (custom SVG tree) ──────────────────────────────────── */

function TreeView({ heirs, blocked, deceasedName, distributable }: {
  heirs: HeirResult[]; blocked: HeirResult[]; deceasedName: string; distributable: number;
}) {
  const [expandedHeir, setExpandedHeir] = useState<string | null>(null);
  const allHeirs = [...heirs, ...blocked];

  // Group by category
  const categories: Record<string, HeirResult[]> = {};
  const catOrder = ['Spouse', 'Children', 'Grandchildren', 'Parents', 'Grandparents', 'Siblings', 'Nephews', 'Uncles', 'Cousins'];
  const catMap: Record<string, string> = {
    husband: 'Spouse', wife: 'Spouse',
    son: 'Children', daughter: 'Children',
    sons_son: 'Grandchildren', sons_daughter: 'Grandchildren',
    father: 'Parents', mother: 'Parents',
    paternal_grandfather: 'Grandparents', paternal_grandmother: 'Grandparents', maternal_grandmother: 'Grandparents',
    full_brother: 'Siblings', full_sister: 'Siblings',
    paternal_half_brother: 'Siblings', paternal_half_sister: 'Siblings',
    maternal_half_brother: 'Siblings', maternal_half_sister: 'Siblings',
    full_nephew: 'Nephews', paternal_nephew: 'Nephews',
    full_nephews_son: 'Nephews', paternal_nephews_son: 'Nephews',
    full_paternal_uncle: 'Uncles', paternal_paternal_uncle: 'Uncles',
    full_cousin: 'Cousins', paternal_cousin: 'Cousins',
    full_cousins_son: 'Cousins', paternal_cousins_son: 'Cousins',
    full_cousins_grandson: 'Cousins', paternal_cousins_grandson: 'Cousins',
  };

  for (const h of allHeirs) {
    const cat = catMap[h.relationship] || 'Other';
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(h);
  }

  const orderedCats = [...catOrder, ...Object.keys(categories)].filter((c, i, a) => categories[c] && a.indexOf(c) === i);
  const catIcons: Record<string, string> = {
    Spouse: '💍', Children: '👶', Grandchildren: '👧', Parents: '👨‍👩‍👦', Grandparents: '👴', Siblings: '👫',
    Nephews: '👦', Uncles: '👨', Cousins: '🤝',
  };

  return (
    <div className="flex flex-col items-center w-full overflow-x-auto">
      {/* Root node */}
      <div className="flex flex-col items-center mb-2">
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 px-6 py-3 rounded-xl shadow-lg border border-amber-500/30">
          <div className="text-white font-bold text-lg">{deceasedName}</div>
          <div className="text-amber-200 text-xs text-center">Estate: PKR {fmt(distributable)}</div>
        </div>
        <div className="w-0.5 h-6 bg-gray-600" />
      </div>

      {/* Connector line */}
      <div className="flex items-start justify-center w-full">
        <div className="relative flex justify-center" style={{ minWidth: orderedCats.length * 220 }}>
          {/* Horizontal line */}
          {orderedCats.length > 1 && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2" style={{
              width: `${((orderedCats.length - 1) / orderedCats.length) * 100}%`,
              height: 2, backgroundColor: '#4B5563',
            }} />
          )}

          <div className="flex justify-center gap-4 w-full">
            {orderedCats.map((cat) => (
              <div key={cat} className="flex flex-col items-center flex-1 min-w-[200px]">
                {/* Vertical connector */}
                <div className="w-0.5 h-4 bg-gray-600" />
                {/* Category node */}
                <div className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 mb-2 shadow">
                  <div className="text-gray-200 font-semibold text-sm flex items-center gap-2">
                    <span>{catIcons[cat] || '👤'}</span> {cat}
                  </div>
                </div>
                <div className="w-0.5 h-3 bg-gray-600" />

                {/* Heir nodes */}
                <div className="flex flex-col gap-2 w-full">
                  {categories[cat].map((h, hi) => {
                    const rel = RELATIONSHIPS.find(r => r.value === h.relationship);
                    const isBlocked = h.blocked;
                    const heirKey = `${h.name}-${h.relationship}-${hi}`;
                    const isExpanded = expandedHeir === heirKey;
                    return (
                      <div key={hi}
                        className={`mx-auto w-full max-w-[260px] rounded-lg border p-3 shadow-sm transition-all cursor-pointer
                        ${isBlocked
                          ? 'bg-red-950/30 border-red-800/40 opacity-80'
                          : 'bg-gray-800/80 border-gray-600/50 hover:border-emerald-500/50 hover:shadow-emerald-500/10'
                        }`}
                        onClick={() => setExpandedHeir(isExpanded ? null : heirKey)}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`font-medium text-sm ${isBlocked ? 'text-red-400 line-through' : 'text-white'}`}>
                            {h.name}
                          </span>
                          <div className="flex items-center gap-1">
                            {h.count > 1 && (
                              <span className="bg-gray-700 text-gray-300 text-xs px-1.5 py-0.5 rounded">×{h.count}</span>
                            )}
                            <span className="text-gray-500 text-xs">{isExpanded ? '▲' : '▼'}</span>
                          </div>
                        </div>
                        <div className="text-gray-400 text-xs mt-0.5">{rel?.label || h.relationship}</div>
                        {isBlocked ? (
                          <>
                            <div className="flex items-center gap-1.5 mt-2">
                              <span className="text-red-500 text-xs">✕</span>
                              <span className="text-red-400 text-xs font-medium">Blocked by: {h.blocked_by}</span>
                            </div>
                            {isExpanded && h.basis && (
                              <div className="mt-2 pt-2 border-t border-red-800/30">
                                <div className="text-red-300/70 text-[11px] leading-relaxed">{h.basis}</div>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-emerald-400 font-bold text-sm">{h.share_percentage.toFixed(2)}%</span>
                              <span className="text-gray-300 text-xs">PKR {fmt(h.share_amount)}</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                              <div className="bg-emerald-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min(h.share_percentage, 100)}%` }} />
                            </div>
                            <div className="text-gray-500 text-[10px] mt-1 leading-tight">{h.share_fraction}</div>
                            {isExpanded && h.basis && (
                              <div className="mt-2 pt-2 border-t border-gray-700">
                                <div className="text-emerald-300/60 text-[11px] leading-relaxed">
                                  <span className="text-emerald-400 font-medium">Legal Basis: </span>{h.basis}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── CARDS VIEW ───────────────────────────────────────────────────── */

function CardsView({ heirs, distributable }: { heirs: HeirResult[]; distributable: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {heirs.map((h, i) => {
        const rel = RELATIONSHIPS.find(r => r.value === h.relationship);
        const color = COLORS[i % COLORS.length];
        return (
          <div key={i} className="bg-gray-800/80 border border-gray-700 rounded-xl p-5 hover:border-gray-500 transition-all shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg"
                style={{ backgroundColor: color + '30', color }}>
                {h.gender === 'female' ? '♀' : '♂'}
              </div>
              <div>
                <div className="text-white font-semibold">{h.name}</div>
                <div className="text-gray-400 text-xs">{rel?.label || h.relationship}</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Share</span>
                <span className="font-bold" style={{ color }}>{h.share_percentage.toFixed(2)}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="h-2 rounded-full transition-all" style={{ width: `${Math.min(h.share_percentage, 100)}%`, backgroundColor: color }} />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Amount</span>
                <span className="text-white font-medium">PKR {fmt(h.share_amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Fraction</span>
                <span className="text-gray-300 font-mono text-xs">{h.share_fraction}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-gray-700">
              <p className="text-gray-500 text-xs leading-relaxed">{h.basis}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── TABLE VIEW ───────────────────────────────────────────────────── */

function TableView({ heirs, blocked }: { heirs: HeirResult[]; blocked: HeirResult[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Heir</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Relationship</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Fraction</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Share %</th>
            <th className="text-right py-3 px-4 text-gray-400 font-medium">Amount (PKR)</th>
            <th className="text-left py-3 px-4 text-gray-400 font-medium">Legal Basis</th>
          </tr>
        </thead>
        <tbody>
          {heirs.map((h, i) => {
            const rel = RELATIONSHIPS.find(r => r.value === h.relationship);
            return (
              <tr key={i} className="border-b border-gray-800 hover:bg-gray-800/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs ${h.gender === 'female' ? 'text-pink-400' : 'text-blue-400'}`}>
                      {h.gender === 'female' ? '♀' : '♂'}
                    </span>
                    <span className="text-white font-medium">{h.name}</span>
                    {h.count > 1 && <span className="text-gray-500 text-xs">(×{h.count})</span>}
                  </div>
                </td>
                <td className="py-3 px-4 text-gray-300">{rel?.label || h.relationship}</td>
                <td className="py-3 px-4 text-right font-mono text-gray-300 text-xs">{h.share_fraction}</td>
                <td className="py-3 px-4 text-right">
                  <span className="text-emerald-400 font-bold">{h.share_percentage.toFixed(2)}%</span>
                </td>
                <td className="py-3 px-4 text-right text-white font-medium">{fmt(h.share_amount)}</td>
                <td className="py-3 px-4 text-gray-500 text-xs max-w-[300px]">{h.basis}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-600">
            <td colSpan={3} className="py-3 px-4 text-gray-300 font-bold">Total</td>
            <td className="py-3 px-4 text-right text-emerald-400 font-bold">
              {heirs.reduce((s, h) => s + h.share_percentage, 0).toFixed(2)}%
            </td>
            <td className="py-3 px-4 text-right text-white font-bold">
              {fmt(heirs.reduce((s, h) => s + h.share_amount, 0))}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>

      {blocked.length > 0 && (
        <div className="mt-6">
          <h4 className="text-red-400 font-semibold mb-2 text-sm">Blocked Heirs</h4>
          <table className="w-full text-sm">
            <tbody>
              {blocked.map((h, i) => {
                const rel = RELATIONSHIPS.find(r => r.value === h.relationship);
                return (
                  <tr key={i} className="border-b border-gray-800/50 text-red-400/70">
                    <td className="py-2 px-4 line-through">{h.name}</td>
                    <td className="py-2 px-4">{rel?.label || h.relationship}</td>
                    <td className="py-2 px-4" colSpan={4}>Blocked by: {h.blocked_by}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── SUNBURST VIEW ────────────────────────────────────────────────── */

function SunburstView({ heirs, distributable, deceasedName }: {
  heirs: HeirResult[]; distributable: number; deceasedName: string;
}) {
  const size = 400;
  const cx = size / 2;
  const cy = size / 2;
  const innerR = 50;
  const outerR = size / 2 - 30;
  const [hovered, setHovered] = useState<number | null>(null);

  let cumAngle = -90;
  const segments = heirs.filter(h => h.share_percentage > 0).map((h, i) => {
    const angle = (h.share_percentage / 100) * 360;
    const startAngle = cumAngle;
    cumAngle += angle;
    const endAngle = cumAngle;
    const largeArc = angle > 180 ? 1 : 0;
    const rad = (a: number) => (a * Math.PI) / 180;

    const ix1 = cx + innerR * Math.cos(rad(startAngle));
    const iy1 = cy + innerR * Math.sin(rad(startAngle));
    const ix2 = cx + innerR * Math.cos(rad(endAngle));
    const iy2 = cy + innerR * Math.sin(rad(endAngle));
    const ox1 = cx + outerR * Math.cos(rad(startAngle));
    const oy1 = cy + outerR * Math.sin(rad(startAngle));
    const ox2 = cx + outerR * Math.cos(rad(endAngle));
    const oy2 = cy + outerR * Math.sin(rad(endAngle));

    const midAngle = startAngle + angle / 2;
    const labelR = (innerR + outerR) / 2;
    const lx = cx + labelR * Math.cos(rad(midAngle));
    const ly = cy + labelR * Math.sin(rad(midAngle));

    const path = angle >= 359.99
      ? `M ${cx + innerR} ${cy} A ${innerR} ${innerR} 0 1 1 ${cx - innerR} ${cy} A ${innerR} ${innerR} 0 1 1 ${cx + innerR} ${cy}
         M ${cx + outerR} ${cy} A ${outerR} ${outerR} 0 1 0 ${cx - outerR} ${cy} A ${outerR} ${outerR} 0 1 0 ${cx + outerR} ${cy} Z`
      : `M ${ix1} ${iy1} L ${ox1} ${oy1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${ox2} ${oy2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`;

    return { ...h, path, lx, ly, angle, color: COLORS[i % COLORS.length], idx: i };
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map(s => (
          <g key={s.idx} onMouseEnter={() => setHovered(s.idx)} onMouseLeave={() => setHovered(null)}>
            <path d={s.path} fill={s.color} opacity={hovered === s.idx ? 1 : 0.8}
              stroke="#1F2937" strokeWidth={hovered === s.idx ? 2 : 1}
              style={{ transition: 'opacity 0.2s' }} />
            {s.angle > 20 && (
              <text x={s.lx} y={s.ly} textAnchor="middle" dominantBaseline="middle"
                fill="white" fontSize={10} fontWeight="bold" pointerEvents="none">
                {s.share_percentage.toFixed(1)}%
              </text>
            )}
          </g>
        ))}
        {/* Center label */}
        <circle cx={cx} cy={cy} r={innerR - 2} fill="#111827" />
        <text x={cx} y={cy - 8} textAnchor="middle" fill="white" fontSize={11} fontWeight="bold">{deceasedName}</text>
        <text x={cx} y={cy + 8} textAnchor="middle" fill="#9CA3AF" fontSize={9}>Estate</text>
      </svg>
      {hovered !== null && segments[hovered] && (
        <div className="mt-2 bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm">
          {segments[hovered].name}: {segments[hovered].share_percentage.toFixed(2)}% — PKR {fmt(segments[hovered].share_amount)}
        </div>
      )}
      <div className="flex flex-wrap gap-3 mt-4 justify-center">
        {segments.map(s => (
          <div key={s.idx} className="flex items-center gap-1.5 text-xs text-gray-300">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: s.color }} />
            {s.name}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── PROPERTY BREAKDOWN TABLE ─────────────────────────────────────── */

function PropertyBreakdownView({ breakdown }: { breakdown: PropertyBreakdown[] }) {
  if (!breakdown.length) return null;
  const typeLabel = (t: string) => PROPERTY_TYPES.find(p => p.value === t)?.label || t;

  return (
    <div className="space-y-6">
      {breakdown.map((prop, pi) => (
        <div key={pi} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="text-white font-semibold">{prop.property_name}</h4>
              <span className="text-gray-400 text-xs">{typeLabel(prop.property_type)}</span>
            </div>
            <div className="text-emerald-400 font-bold">PKR {fmt(prop.property_value)}</div>
          </div>
          <div className="space-y-2">
            {prop.shares.map((s, si) => (
              <div key={si} className="flex items-center justify-between text-sm">
                <span className="text-gray-300">{s.heir_name}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-400">{s.share_percentage.toFixed(2)}%</span>
                  <span className="text-white font-medium w-28 text-right">PKR {fmt(s.share_amount)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── MAIN PAGE ────────────────────────────────────────────────────── */

export default function InheritancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [religion, setReligion] = useState('sunni_hanafi');
  const [deceasedName, setDeceasedName] = useState('');
  const [debts, setDebts] = useState(0);
  const [bequests, setBequests] = useState(0);
  const [heirs, setHeirs] = useState<HeirInput[]>([]);
  const [properties, setProperties] = useState<PropertyInput[]>([]);
  const [totalEstateManual, setTotalEstateManual] = useState<number | ''>('');
  const [useProperties, setUseProperties] = useState(true);

  // Result state
  const [result, setResult] = useState<InheritanceResult | null>(null);
  const [propBreakdown, setPropBreakdown] = useState<PropertyBreakdown[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('tree');
  const [showInput, setShowInput] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) router.push('/login');
  }, [router]);

  const addHeir = () => {
    setHeirs([...heirs, { id: uid(), name: '', relationship: 'son', gender: 'male', count: 1 }]);
  };

  const updateHeir = (id: string, field: string, value: string | number) => {
    setHeirs(heirs.map(h => {
      if (h.id !== id) return h;
      const updated = { ...h, [field]: value };
      // Auto-set gender from relationship
      if (field === 'relationship') {
        const rel = RELATIONSHIPS.find(r => r.value === value);
        if (rel) updated.gender = rel.gender;
      }
      return updated;
    }));
  };

  const removeHeir = (id: string) => setHeirs(heirs.filter(h => h.id !== id));

  const addProperty = () => {
    setProperties([...properties, { id: uid(), name: '', property_type: 'real_estate', value: 0 }]);
  };

  const updateProperty = (id: string, field: string, value: string | number) => {
    setProperties(properties.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const removeProperty = (id: string) => setProperties(properties.filter(p => p.id !== id));

  const totalFromProperties = properties.reduce((s, p) => s + (p.value || 0), 0);
  const effectiveTotal = useProperties ? totalFromProperties : (totalEstateManual || 0);

  const calculate = async () => {
    setError('');
    if (heirs.length === 0) { setError('Add at least one heir'); return; }
    if (effectiveTotal <= 0) { setError('Estate value must be greater than 0'); return; }
    if (heirs.some(h => !h.name.trim())) { setError('All heirs must have names'); return; }

    setLoading(true);
    try {
      const token = localStorage.getItem('tvl_token');
      const body: Record<string, unknown> = {
        religion,
        deceased_name: deceasedName || 'Deceased',
        heirs: heirs.map(h => ({ name: h.name, relationship: h.relationship, gender: h.gender, count: h.count })),
        debts,
        bequests,
      };
      if (useProperties && properties.length > 0) {
        body.properties = properties.filter(p => p.value > 0).map(p => ({
          name: p.name || 'Property',
          property_type: p.property_type,
          value: p.value,
        }));
      } else {
        body.total_estate = effectiveTotal;
      }

      const res = await fetch('/api/v1/inheritance/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'Calculation failed');
      }

      const data = await res.json();
      setResult(data.data);
      setPropBreakdown(data.properties_breakdown || []);
      setShowInput(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setPropBreakdown([]);
    setShowInput(true);
  };

  // Quick presets
  const applyPreset = (preset: string) => {
    setHeirs([]);
    switch (preset) {
      case 'basic_family':
        setHeirs([
          { id: uid(), name: 'Wife', relationship: 'wife', gender: 'female', count: 1 },
          { id: uid(), name: 'Son 1', relationship: 'son', gender: 'male', count: 1 },
          { id: uid(), name: 'Daughter 1', relationship: 'daughter', gender: 'female', count: 1 },
        ]);
        break;
      case 'extended':
        setHeirs([
          { id: uid(), name: 'Wife', relationship: 'wife', gender: 'female', count: 1 },
          { id: uid(), name: 'Son', relationship: 'son', gender: 'male', count: 1 },
          { id: uid(), name: 'Daughter', relationship: 'daughter', gender: 'female', count: 1 },
          { id: uid(), name: 'Father', relationship: 'father', gender: 'male', count: 1 },
          { id: uid(), name: 'Mother', relationship: 'mother', gender: 'female', count: 1 },
        ]);
        break;
      case 'no_children':
        setHeirs([
          { id: uid(), name: 'Wife', relationship: 'wife', gender: 'female', count: 1 },
          { id: uid(), name: 'Father', relationship: 'father', gender: 'male', count: 1 },
          { id: uid(), name: 'Mother', relationship: 'mother', gender: 'female', count: 1 },
          { id: uid(), name: 'Brother', relationship: 'full_brother', gender: 'male', count: 1 },
        ]);
        break;
      case 'daughters_only':
        setHeirs([
          { id: uid(), name: 'Husband', relationship: 'husband', gender: 'male', count: 1 },
          { id: uid(), name: 'Daughter 1', relationship: 'daughter', gender: 'female', count: 1 },
          { id: uid(), name: 'Daughter 2', relationship: 'daughter', gender: 'female', count: 1 },
          { id: uid(), name: 'Father', relationship: 'father', gender: 'male', count: 1 },
          { id: uid(), name: 'Mother', relationship: 'mother', gender: 'female', count: 1 },
        ]);
        break;
    }
  };

  const viewButtons: { mode: ViewMode; label: string; icon: string }[] = [
    { mode: 'tree', label: 'Family Tree', icon: '🌳' },
    { mode: 'pie', label: 'Pie Chart', icon: '🥧' },
    { mode: 'sunburst', label: 'Sunburst', icon: '☀️' },
    { mode: 'table', label: 'Table', icon: '📊' },
    { mode: 'cards', label: 'Cards', icon: '🃏' },
  ];

  const handlePrint = () => {
    if (!result) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const heirsRows = result.heirs.map(h => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #ddd;">${h.name}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;">${RELATIONSHIPS.find(r => r.value === h.relationship)?.label || h.relationship}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;">${h.share_fraction}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;">${h.share_percentage.toFixed(2)}%</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;text-align:right;font-weight:bold;">PKR ${fmt(h.share_amount)}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;font-size:11px;color:#555;">${h.basis}</td>
      </tr>
    `).join('');

    const blockedRows = result.blocked_heirs.map(h => `
      <tr style="background:#fff5f5;">
        <td style="padding:8px;border-bottom:1px solid #ddd;text-decoration:line-through;color:#c00;">${h.name}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;">${RELATIONSHIPS.find(r => r.value === h.relationship)?.label || h.relationship}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;" colspan="3">Blocked by: ${h.blocked_by}</td>
        <td style="padding:8px;border-bottom:1px solid #ddd;font-size:11px;color:#888;">${h.basis || ''}</td>
      </tr>
    `).join('');

    const propRows = propBreakdown.length > 0 ? `
      <h2 style="margin-top:24px;color:#333;">Per-Property Breakdown</h2>
      ${propBreakdown.map(p => `
        <h3 style="margin-top:16px;color:#555;">${p.property_name} (${p.property_type}) — PKR ${fmt(p.property_value)}</h3>
        <table style="width:100%;border-collapse:collapse;margin-top:8px;">
          <thead><tr style="background:#f0f0f0;">
            <th style="padding:6px;text-align:left;">Heir</th>
            <th style="padding:6px;text-align:right;">Share %</th>
            <th style="padding:6px;text-align:right;">Amount</th>
          </tr></thead>
          <tbody>
            ${p.shares.map(s => `
              <tr><td style="padding:6px;border-bottom:1px solid #eee;">${s.heir_name}</td>
              <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">${s.share_percentage.toFixed(2)}%</td>
              <td style="padding:6px;border-bottom:1px solid #eee;text-align:right;">PKR ${fmt(s.share_amount)}</td></tr>
            `).join('')}
          </tbody>
        </table>
      `).join('')}
    ` : '';

    printWindow.document.write(`
      <!DOCTYPE html>
      <html><head><title>Inheritance Certificate — ${deceasedName || 'Deceased'}</title>
      <style>
        body { font-family: 'Georgia', serif; padding: 40px; color: #222; max-width: 900px; margin: 0 auto; }
        h1 { text-align: center; color: #1a5; border-bottom: 3px double #1a5; padding-bottom: 12px; }
        .subtitle { text-align: center; color: #666; margin-bottom: 24px; }
        .stats { display: flex; gap: 16px; margin-bottom: 24px; }
        .stat { flex: 1; background: #f8f8f8; padding: 12px; border-radius: 8px; text-align: center; }
        .stat-label { font-size: 12px; color: #888; }
        .stat-value { font-size: 18px; font-weight: bold; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        th { background: #f0f0f0; padding: 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #555; }
        .notice { background: #fffde7; border: 1px solid #ffd54f; padding: 8px 12px; border-radius: 6px; font-size: 13px; margin: 12px 0; }
        .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #aaa; border-top: 1px solid #ddd; padding-top: 12px; }
        @media print { body { padding: 20px; } }
      </style></head><body>
        <h1>Inheritance Distribution Certificate</h1>
        <p class="subtitle">${result.law_system} | Generated by TVL — The Value of Law</p>

        <div class="stats">
          <div class="stat"><div class="stat-label">Total Estate</div><div class="stat-value">PKR ${fmt(result.total_estate)}</div></div>
          <div class="stat"><div class="stat-label">Debts</div><div class="stat-value" style="color:#c00;">PKR ${fmt(result.debts)}</div></div>
          <div class="stat"><div class="stat-label">Bequests</div><div class="stat-value" style="color:#e65100;">PKR ${fmt(result.bequests)}</div></div>
          <div class="stat"><div class="stat-label">Distributable</div><div class="stat-value" style="color:#1a5;">PKR ${fmt(result.distributable_estate)}</div></div>
        </div>

        <p><strong>Deceased:</strong> ${deceasedName || 'N/A'} &nbsp; | &nbsp; <strong>Heirs:</strong> ${result.summary.total_heirs} receiving, ${result.summary.total_blocked} blocked</p>

        ${result.awl_applied ? '<div class="notice"><strong>Awl Applied:</strong> Fixed shares exceeded estate total; all shares were reduced proportionally.</div>' : ''}
        ${result.radd_applied ? '<div class="notice"><strong>Radd Applied:</strong> Excess estate was returned proportionally to eligible heirs.</div>' : ''}

        <h2 style="color:#333;">Heir Distribution</h2>
        <table>
          <thead><tr>
            <th>Heir Name</th><th>Relationship</th><th>Share Fraction</th><th style="text-align:right;">Share %</th><th style="text-align:right;">Amount (PKR)</th><th>Legal Basis / Reason</th>
          </tr></thead>
          <tbody>
            ${heirsRows}
            ${blockedRows}
          </tbody>
        </table>

        ${propRows}

        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' })} by TVL — The Value of Law | According to Spirit of Law</p>
          <p>This is a computer-generated estimate for informational purposes only. Consult a qualified lawyer for legal advice.</p>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 500);
  };

  return (
    <div className="min-h-screen bg-navy-950 noise text-white">
      <Navbar />
      <main className="px-4 sm:px-6 pt-24 pb-16 w-full">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
            Inheritance Calculator
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Calculate inheritance shares according to Pakistani law — Islamic (Sunni/Shia), Christian, Hindu & Sikh
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ── INPUT PANEL ── */}
          {showInput && (
            <div className="lg:col-span-5 space-y-5">
              {/* Religion Selection */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  Legal System
                </h3>
                <div className="space-y-2">
                  {RELIGIONS.map(r => (
                    <label key={r.value} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all
                      ${religion === r.value ? 'bg-emerald-900/30 border border-emerald-700/50' : 'hover:bg-gray-800 border border-transparent'}`}>
                      <input type="radio" name="religion" value={r.value} checked={religion === r.value}
                        onChange={e => setReligion(e.target.value)}
                        className="text-emerald-500 focus:ring-emerald-500" />
                      <div>
                        <div className="text-white text-sm font-medium">{r.label}</div>
                        <div className="text-gray-500 text-xs">{r.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Deceased Info */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3">Deceased Information</h3>
                <input type="text" placeholder="Name of deceased (optional)"
                  value={deceasedName} onChange={e => setDeceasedName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500" />
              </div>

              {/* Estate / Properties */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
                    Estate
                  </h3>
                  <div className="flex bg-gray-800 rounded-lg p-0.5">
                    <button onClick={() => setUseProperties(true)}
                      className={`px-3 py-1 text-xs rounded-md transition ${useProperties ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}>
                      Properties
                    </button>
                    <button onClick={() => setUseProperties(false)}
                      className={`px-3 py-1 text-xs rounded-md transition ${!useProperties ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}>
                      Total Value
                    </button>
                  </div>
                </div>

                {useProperties ? (
                  <div className="space-y-3">
                    {properties.map(p => (
                      <div key={p.id} className="bg-gray-800 rounded-lg p-3 space-y-2">
                        <div className="flex gap-2">
                          <input type="text" placeholder="Property name" value={p.name}
                            onChange={e => updateProperty(p.id, 'name', e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white" />
                          <button onClick={() => removeProperty(p.id)} className="text-red-400 hover:text-red-300 px-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <select value={p.property_type} onChange={e => updateProperty(p.id, 'property_type', e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white">
                            {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                          </select>
                          <div className="flex items-center gap-1 flex-1">
                            <span className="text-gray-400 text-xs">PKR</span>
                            <input type="number" placeholder="Value" value={p.value || ''}
                              onChange={e => updateProperty(p.id, 'value', parseFloat(e.target.value) || 0)}
                              className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white" />
                          </div>
                        </div>
                      </div>
                    ))}
                    <button onClick={addProperty}
                      className="w-full py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 text-sm hover:border-emerald-500 hover:text-emerald-400 transition">
                      + Add Property
                    </button>
                    {properties.length > 0 && (
                      <div className="text-right text-emerald-400 text-sm font-semibold">
                        Total: PKR {fmt(totalFromProperties)}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm">PKR</span>
                    <input type="number" placeholder="Total estate value" value={totalEstateManual || ''}
                      onChange={e => setTotalEstateManual(parseFloat(e.target.value) || '')}
                      className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">Debts (PKR)</label>
                    <input type="number" value={debts || ''} onChange={e => setDebts(parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs mb-1 block">
                      Bequests {religion.startsWith('s') ? '(max 1/3)' : ''}
                    </label>
                    <input type="number" value={bequests || ''} onChange={e => setBequests(parseFloat(e.target.value) || 0)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm" />
                  </div>
                </div>
              </div>

              {/* Heirs */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-white font-semibold flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                    Heirs ({heirs.length})
                  </h3>
                </div>

                {/* Quick presets */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="text-gray-500 text-xs self-center">Presets:</span>
                  {[
                    { key: 'basic_family', label: 'Wife + Children' },
                    { key: 'extended', label: 'Parents + Children' },
                    { key: 'no_children', label: 'No Children' },
                    { key: 'daughters_only', label: 'Daughters Only' },
                  ].map(p => (
                    <button key={p.key} onClick={() => applyPreset(p.key)}
                      className="px-2 py-1 bg-gray-800 border border-gray-700 rounded text-xs text-gray-300 hover:border-emerald-500 hover:text-emerald-400 transition">
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                  {heirs.map(h => (
                    <div key={h.id} className="bg-gray-800 rounded-lg p-3 space-y-2">
                      <div className="flex gap-2">
                        <input type="text" placeholder="Heir name" value={h.name}
                          onChange={e => updateHeir(h.id, 'name', e.target.value)}
                          className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white" />
                        <button onClick={() => removeHeir(h.id)} className="text-red-400 hover:text-red-300 px-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-1.5">
                          <select value={h.relationship} onChange={e => updateHeir(h.id, 'relationship', e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white">
                            {RELATIONSHIPS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                          </select>
                          <div className="relative group">
                            <svg className="w-4 h-4 text-gray-500 hover:text-blue-400 cursor-help transition-colors flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div className="absolute z-50 bottom-full right-0 mb-2 w-56 p-2.5 bg-gray-900 border border-gray-600 rounded-lg text-xs text-gray-300 leading-relaxed shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none">
                              {RELATIONSHIPS.find(r => r.value === h.relationship)?.info}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <label className="text-gray-400 text-xs">Count:</label>
                          <input type="number" min={1} max={10} value={h.count}
                            onChange={e => updateHeir(h.id, 'count', parseInt(e.target.value) || 1)}
                            className="w-14 bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-sm text-white text-center" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={addHeir}
                  className="w-full mt-3 py-2 border border-dashed border-gray-600 rounded-lg text-gray-400 text-sm hover:border-blue-500 hover:text-blue-400 transition">
                  + Add Heir
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 text-red-400 text-sm">{error}</div>
              )}

              {/* Calculate Button */}
              <button onClick={calculate} disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-emerald-900/30">
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    Calculating...
                  </span>
                ) : 'Calculate Inheritance'}
              </button>
            </div>
          )}

          {/* ── RESULTS PANEL ── */}
          {result && (
            <div className={`${showInput ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-5`}>
              {/* Summary Bar */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">{result.law_system}</h3>
                    <p className="text-gray-400 text-sm">
                      {result.summary.total_heirs} heir(s) receiving shares
                      {result.summary.total_blocked > 0 && `, ${result.summary.total_blocked} blocked`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setShowInput(!showInput)}
                      className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition">
                      {showInput ? 'Expand Results' : 'Show Input'}
                    </button>
                    <button onClick={reset}
                      className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-gray-300 hover:text-white transition">
                      New Calculation
                    </button>
                    <button onClick={() => handlePrint()}
                      className="px-3 py-1.5 bg-emerald-700 border border-emerald-600 rounded-lg text-sm text-white hover:bg-emerald-600 transition flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                      Print
                    </button>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Estate', value: result.total_estate, color: 'text-white' },
                    { label: 'Debts', value: result.debts, color: 'text-red-400' },
                    { label: 'Bequests', value: result.bequests, color: 'text-amber-400' },
                    { label: 'Distributable', value: result.distributable_estate, color: 'text-emerald-400' },
                  ].map((s, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3">
                      <div className="text-gray-400 text-xs">{s.label}</div>
                      <div className={`${s.color} font-bold text-lg`}>PKR {fmt(s.value)}</div>
                    </div>
                  ))}
                </div>

                {/* Special notices */}
                {(result.awl_applied || result.radd_applied) && (
                  <div className="mt-3 flex gap-3">
                    {result.awl_applied && (
                      <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg px-3 py-2 text-amber-400 text-xs">
                        Awl Applied — Fixed shares exceeded estate; all shares reduced proportionally
                      </div>
                    )}
                    {result.radd_applied && (
                      <div className="bg-blue-900/30 border border-blue-700/50 rounded-lg px-3 py-2 text-blue-400 text-xs">
                        Radd Applied — Excess estate returned proportionally to eligible heirs
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* View Mode Toggle */}
              <div className="flex flex-wrap gap-2">
                {viewButtons.map(v => (
                  <button key={v.mode} onClick={() => setViewMode(v.mode)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
                      ${viewMode === v.mode
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                        : 'bg-gray-800 text-gray-400 hover:text-white border border-gray-700'
                      }`}>
                    <span>{v.icon}</span> {v.label}
                  </button>
                ))}
              </div>

              {/* View Content */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 overflow-x-auto">
                {viewMode === 'tree' && (
                  <TreeView heirs={result.heirs} blocked={result.blocked_heirs}
                    deceasedName={deceasedName || 'Deceased'} distributable={result.distributable_estate} />
                )}
                {viewMode === 'pie' && <PieChart heirs={result.heirs} />}
                {viewMode === 'sunburst' && (
                  <SunburstView heirs={result.heirs} distributable={result.distributable_estate}
                    deceasedName={deceasedName || 'Deceased'} />
                )}
                {viewMode === 'table' && <TableView heirs={result.heirs} blocked={result.blocked_heirs} />}
                {viewMode === 'cards' && <CardsView heirs={result.heirs} distributable={result.distributable_estate} />}
              </div>

              {/* Property Breakdown */}
              {propBreakdown.length > 0 && (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    Per-Property Breakdown
                  </h3>
                  <PropertyBreakdownView breakdown={propBreakdown} />
                </div>
              )}

              {/* Legal Basis Details */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Legal Basis & References
                </h3>
                <div className="space-y-2">
                  {result.heirs.map((h, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <span className="text-emerald-400 font-medium min-w-[120px]">{h.name}:</span>
                      <span className="text-gray-400">{h.basis}</span>
                    </div>
                  ))}
                  {result.blocked_heirs.map((h, i) => (
                    <div key={`b-${i}`} className="flex items-start gap-3 text-sm">
                      <span className="text-red-400/70 font-medium min-w-[120px] line-through">{h.name}:</span>
                      <span className="text-gray-500">{h.basis}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Empty state when no result and input is showing */}
          {!result && (
            <div className="lg:col-span-7 flex items-center justify-center">
              <div className="text-center py-20">
                <div className="text-6xl mb-4 opacity-30">⚖️</div>
                <h3 className="text-gray-500 text-xl font-medium mb-2">Inheritance Calculator</h3>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                  Add heirs and property details on the left, then click "Calculate Inheritance"
                  to see the distribution according to the selected legal system.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-3 max-w-sm mx-auto text-left">
                  {[
                    { icon: '🕌', title: 'Islamic (Hanafi/Shia)', desc: 'Faraid-based with Awl & Radd' },
                    { icon: '⛪', title: 'Christian', desc: 'Succession Act 1925' },
                    { icon: '🕉️', title: 'Hindu', desc: 'Hindu Succession Law' },
                    { icon: '🪯', title: 'Sikh', desc: 'Customary / Succession Act' },
                  ].map((l, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-3">
                      <div className="text-lg mb-1">{l.icon}</div>
                      <div className="text-gray-400 text-xs font-medium">{l.title}</div>
                      <div className="text-gray-600 text-[10px]">{l.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
