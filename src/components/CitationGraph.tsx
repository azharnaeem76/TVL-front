'use client';

import { useRef, useEffect, useState } from 'react';

interface CaseNode {
  id: number;
  citation: string;
  title: string;
  court: string;
  year: number | null;
  x?: number;
  y?: number;
}

interface CaseLink {
  source: number;
  target: number;
}

export function CitationGraph({
  cases,
  onCaseClick,
  onClose,
}: {
  cases: CaseNode[];
  onCaseClick?: (id: number) => void;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredNode, setHoveredNode] = useState<CaseNode | null>(null);
  const [nodes, setNodes] = useState<CaseNode[]>([]);

  useEffect(() => {
    if (cases.length === 0) return;

    const cx = 400;
    const cy = 300;
    const radius = Math.min(250, cases.length * 30);

    const positioned = cases.map((c, i) => {
      const angle = (i / cases.length) * Math.PI * 2 - Math.PI / 2;
      return {
        ...c,
        x: cx + Math.cos(angle) * radius,
        y: cy + Math.sin(angle) * radius,
      };
    });
    setNodes(positioned);
  }, [cases]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = 800 * dpr;
    canvas.height = 600 * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, 800, 600);

    // Draw links (connect sequential cases as a simplified graph)
    ctx.strokeStyle = 'rgba(250, 195, 17, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < Math.min(i + 3, nodes.length); j++) {
        const a = nodes[i];
        const b = nodes[j];
        if (a.x && a.y && b.x && b.y) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(node => {
      if (!node.x || !node.y) return;
      const isHovered = hoveredNode?.id === node.id;
      const r = isHovered ? 8 : 6;

      ctx.beginPath();
      ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isHovered ? '#fac311' : 'rgba(250, 195, 17, 0.6)';
      ctx.fill();

      if (isHovered) {
        ctx.strokeStyle = 'rgba(250, 195, 17, 0.3)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Label
      ctx.font = '10px Inter, sans-serif';
      ctx.fillStyle = isHovered ? '#fac311' : 'rgba(255,255,255,0.5)';
      ctx.textAlign = 'center';
      ctx.fillText(node.citation.slice(0, 20), node.x, node.y + 20);
    });
  }, [nodes, hoveredNode]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const found = nodes.find(n => {
      if (!n.x || !n.y) return false;
      const dx = n.x - x;
      const dy = n.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });
    setHoveredNode(found || null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (hoveredNode && onCaseClick) {
      onCaseClick(hoveredNode.id);
    }
  };

  return (
    <div className="fixed inset-0 z-[95] bg-navy-950/98 backdrop-blur-xl overflow-hidden">
      <div className="sticky top-0 z-10 bg-navy-950/90 backdrop-blur-lg border-b border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs text-brass-400/50 uppercase tracking-wider font-semibold">Citation Graph</span>
            <span className="text-xs text-gray-500">{cases.length} cases</span>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center h-[calc(100vh-48px)]">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          style={{ width: '800px', height: '600px' }}
          className="cursor-crosshair"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        />
      </div>

      {hoveredNode && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 court-panel p-4 min-w-[300px] animate-fade-in">
          <span className="font-mono text-sm font-bold text-brass-300">{hoveredNode.citation}</span>
          <p className="text-sm text-white mt-1">{hoveredNode.title}</p>
          <p className="text-xs text-gray-500 mt-1">{hoveredNode.court?.replace(/_/g, ' ')} {hoveredNode.year && `(${hoveredNode.year})`}</p>
        </div>
      )}
    </div>
  );
}
