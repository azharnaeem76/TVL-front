'use client';

import { useEffect, useState } from 'react';

const LEGAL_SYMBOLS = ['⚖', '§', '¶', '⚔', '☆', '✦'];

interface Particle {
  id: number;
  symbol: string;
  x: number;
  size: number;
  duration: number;
  delay: number;
  opacity: number;
}

export default function FloatingSymbols({ count = 12 }: { count?: number }) {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    const items: Particle[] = Array.from({ length: count }, (_, i) => ({
      id: i,
      symbol: LEGAL_SYMBOLS[i % LEGAL_SYMBOLS.length],
      x: Math.random() * 100,
      size: 12 + Math.random() * 16,
      duration: 15 + Math.random() * 20,
      delay: Math.random() * 15,
      opacity: 0.04 + Math.random() * 0.08,
    }));
    setParticles(items);
  }, [count]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map(p => (
        <div
          key={p.id}
          className="absolute text-brass-400"
          style={{
            left: `${p.x}%`,
            fontSize: `${p.size}px`,
            opacity: p.opacity,
            animation: `particleRise ${p.duration}s linear ${p.delay}s infinite`,
          }}
        >
          {p.symbol}
        </div>
      ))}
    </div>
  );
}
