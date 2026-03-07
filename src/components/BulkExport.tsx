'use client';

import { useState } from 'react';
import { useBookmarks } from '@/components/Bookmarks';

type ExportFormat = 'txt' | 'csv' | 'json';

export function BulkExportPanel() {
  const { bookmarks } = useBookmarks();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [format, setFormat] = useState<ExportFormat>('txt');
  const [selectAll, setSelectAll] = useState(false);

  const toggleAll = () => {
    if (selectAll) {
      setSelected(new Set());
    } else {
      setSelected(new Set(bookmarks.map(b => b.id)));
    }
    setSelectAll(!selectAll);
  };

  const toggle = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    setSelectAll(next.size === bookmarks.length);
  };

  const cases = bookmarks.filter(b => selected.has(b.id));

  const exportTxt = () => {
    const lines = cases.map(c =>
      `Citation: ${c.citation}\nTitle: ${c.title}\nCourt: ${(c.court || '').replace(/_/g, ' ')}\nYear: ${c.year || 'N/A'}\n${c.note ? `Note: ${c.note}\n` : ''}${'─'.repeat(60)}`
    );
    return `BULK EXPORT - ${cases.length} Case(s)\nExported: ${new Date().toLocaleDateString()}\n${'═'.repeat(60)}\n\n${lines.join('\n\n')}`;
  };

  const exportCsv = () => {
    const header = 'Citation,Title,Court,Year,Note';
    const rows = cases.map(c => {
      const esc = (s: string) => `"${(s || '').replace(/"/g, '""')}"`;
      return [esc(c.citation), esc(c.title), esc((c.court || '').replace(/_/g, ' ')), c.year || '', esc(c.note || '')].join(',');
    });
    return [header, ...rows].join('\n');
  };

  const exportJson = () => {
    return JSON.stringify(cases.map(c => ({
      citation: c.citation,
      title: c.title,
      court: (c.court || '').replace(/_/g, ' '),
      year: c.year,
      note: c.note || null,
    })), null, 2);
  };

  const doExport = () => {
    if (cases.length === 0) return;
    let content: string;
    let mime: string;
    let ext: string;
    switch (format) {
      case 'csv': content = exportCsv(); mime = 'text/csv'; ext = 'csv'; break;
      case 'json': content = exportJson(); mime = 'application/json'; ext = 'json'; break;
      default: content = exportTxt(); mime = 'text/plain'; ext = 'txt'; break;
    }
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tvl-export-${cases.length}-cases.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const doPrint = () => {
    if (cases.length === 0) return;
    const content = exportTxt();
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>TVL Export</title><style>body{font-family:Georgia,serif;padding:40px;white-space:pre-wrap;line-height:1.8;color:#222;}</style></head><body>${content}</body></html>`);
    w.document.close();
    w.print();
  };

  if (bookmarks.length === 0) {
    return (
      <div className="court-panel p-6 text-center">
        <p className="text-sm text-gray-500">No bookmarked cases to export. Bookmark cases first.</p>
      </div>
    );
  }

  return (
    <div className="court-panel p-6">
      <h3 className="text-lg font-display font-semibold text-brass-300 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
        Bulk Export
      </h3>

      <div className="flex items-center justify-between mb-3">
        <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={toggleAll}
            className="rounded border-brass-400/30 bg-white/[0.05] text-brass-400 focus:ring-brass-400/30"
          />
          Select All ({bookmarks.length})
        </label>
        <span className="text-xs text-gray-500">{selected.size} selected</span>
      </div>

      <div className="max-h-60 overflow-y-auto space-y-1 mb-4 scrollbar-thin">
        {bookmarks.map(b => (
          <label
            key={b.id}
            className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border ${
              selected.has(b.id)
                ? 'bg-brass-400/5 border-brass-400/15'
                : 'bg-white/[0.01] border-transparent hover:bg-white/[0.03]'
            }`}
          >
            <input
              type="checkbox"
              checked={selected.has(b.id)}
              onChange={() => toggle(b.id)}
              className="rounded border-brass-400/30 bg-white/[0.05] text-brass-400 focus:ring-brass-400/30 flex-shrink-0"
            />
            <div className="min-w-0 flex-1">
              <span className="text-xs font-mono text-brass-300">{b.citation}</span>
              <p className="text-sm text-gray-300 truncate">{b.title}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-xs text-gray-500">Format:</label>
          <div className="flex rounded-lg overflow-hidden border border-white/[0.06]">
            {(['txt', 'csv', 'json'] as ExportFormat[]).map(f => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`px-3 py-1.5 text-xs uppercase font-mono transition-all ${
                  format === f
                    ? 'bg-brass-400/15 text-brass-300'
                    : 'bg-white/[0.02] text-gray-500 hover:text-gray-300'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 ml-auto">
          <button
            onClick={doPrint}
            disabled={selected.size === 0}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs text-gray-400 hover:text-white bg-white/[0.03] border border-white/[0.06] hover:border-brass-400/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m0 0a48.159 48.159 0 0110.5 0m-10.5 0V5.625A2.625 2.625 0 019.375 3h5.25a2.625 2.625 0 012.625 2.625v3.582" />
            </svg>
            Print
          </button>
          <button
            onClick={doExport}
            disabled={selected.size === 0}
            className="btn-primary !py-2 !px-4 text-xs disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Export {selected.size > 0 ? `(${selected.size})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
