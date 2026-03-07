'use client';

export function ScalesOfJustice({ size = 80, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="3" x2="12" y2="21" />
      <line x1="8" y1="21" x2="16" y2="21" />
      <line x1="4" y1="7" x2="20" y2="7" />
      <path d="M4 7l2 6h0a3 3 0 0 0 4 0h0L12 7" />
      <path d="M12 7l2 6h0a3 3 0 0 0 4 0h0l2-6" />
      <circle cx="12" cy="3" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function GavelSVG({ size = 24, className = '' }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/gavel.svg"
      alt=""
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  );
}

export function CourtPillars({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`} aria-hidden="true">
      <div className="absolute left-8 top-0 bottom-0 w-px opacity-20">
        <div className="w-full h-full courtroom-pillar" />
      </div>
      <div className="absolute right-8 top-0 bottom-0 w-px opacity-20">
        <div className="w-full h-full courtroom-pillar" />
      </div>
    </div>
  );
}

export function CourtBanner({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div className="h-px w-8 bg-gradient-to-r from-transparent to-gold-400/30" />
      <div className="px-4 py-1.5">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-400/70">{text}</span>
      </div>
      <div className="h-px w-8 bg-gradient-to-l from-transparent to-gold-400/30" />
    </div>
  );
}
