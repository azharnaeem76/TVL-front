'use client';

import { useState, useEffect } from 'react';

interface GavelStrikeProps {
  trigger: boolean;
  onComplete?: () => void;
}

export default function GavelStrike({ trigger, onComplete }: GavelStrikeProps) {
  const [striking, setStriking] = useState(false);
  const [showRipple, setShowRipple] = useState(false);

  useEffect(() => {
    if (trigger) {
      setStriking(true);
      setTimeout(() => setShowRipple(true), 300);
      setTimeout(() => {
        setStriking(false);
        setShowRipple(false);
        onComplete?.();
      }, 1200);
    }
  }, [trigger, onComplete]);

  if (!striking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {showRipple && (
        <>
          <div className="absolute w-24 h-24 rounded-full border border-gold-400/30 animate-ping" />
          <div className="absolute w-40 h-40 rounded-full border border-gold-400/10 animate-ping" style={{ animationDelay: '0.15s' }} />
        </>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/gavel.svg"
        alt=""
        width={96}
        height={96}
        className="animate-gavel-strike"
        style={{ filter: 'drop-shadow(0 0 20px rgba(218, 165, 32, 0.5))' }}
        draggable={false}
      />
    </div>
  );
}

export function GavelIcon({ size = 24, className = '' }: { size?: number; className?: string }) {
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
