export default function Logo({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Shield */}
      <path
        d="M24 2L6 10V22C6 34.36 13.68 45.68 24 48C34.32 45.68 42 34.36 42 22V10L24 2Z"
        fill="url(#shield-fill)"
        stroke="url(#shield-stroke)"
        strokeWidth="1"
      />
      {/* Scales of justice — minimal line art */}
      <g stroke="#fac311" strokeWidth="1.3" strokeLinecap="round" fill="none">
        {/* Pillar */}
        <line x1="24" y1="14" x2="24" y2="36" />
        {/* Base */}
        <line x1="19" y1="36" x2="29" y2="36" />
        {/* Beam */}
        <line x1="14" y1="18" x2="34" y2="18" />
        {/* Left pan */}
        <path d="M14 18l1.5 5a2.5 2.5 0 0 0 3 0L20 18" />
        {/* Right pan */}
        <path d="M28 18l1.5 5a2.5 2.5 0 0 0 3 0L34 18" />
      </g>
      {/* Top dot */}
      <circle cx="24" cy="14" r="1.8" fill="#fac311" />
      <defs>
        <linearGradient id="shield-fill" x1="6" y1="2" x2="42" y2="48">
          <stop offset="0%" stopColor="#192340" />
          <stop offset="100%" stopColor="#0e1527" />
        </linearGradient>
        <linearGradient id="shield-stroke" x1="6" y1="2" x2="42" y2="48">
          <stop offset="0%" stopColor="#fac311" stopOpacity="0.5" />
          <stop offset="50%" stopColor="#eaab04" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#fac311" stopOpacity="0.4" />
        </linearGradient>
      </defs>
    </svg>
  );
}
