'use client';

interface RelatedCase {
  id: number;
  citation: string;
  title: string;
  court: string;
  year: number | null;
}

export function RelatedCasesSection({
  cases,
  currentId,
}: {
  cases: RelatedCase[];
  currentId: number;
}) {
  const filtered = cases.filter(c => c.id !== currentId).slice(0, 5);
  if (filtered.length === 0) return null;

  const formatCourt = (c: string) => c.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  return (
    <div className="court-panel p-6">
      <h2 className="text-lg font-display font-semibold text-brass-300 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.07a4.5 4.5 0 00-6.364-6.364L4.5 8.257a4.5 4.5 0 006.364 6.364" />
        </svg>
        Related Cases
      </h2>
      <div className="space-y-3">
        {filtered.map(c => (
          <a
            key={c.id}
            href={`/case-laws/${c.id}`}
            className="block p-3 bg-white/[0.02] rounded-xl border border-brass-400/5 hover:border-brass-400/20 hover:bg-white/[0.04] transition-all group"
          >
            <span className="font-mono text-xs font-semibold text-brass-300">{c.citation}</span>
            <p className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">{c.title}</p>
            <p className="text-xs text-gray-500 mt-1">
              {formatCourt(c.court)} {c.year && `(${c.year})`}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
