import React from 'react';

export default function StatusBadge({ text }) {
  return (
    <div className="inline-flex items-center gap-2 border border-forest/20 px-3 py-1 bg-paper/50 select-none rounded-none font-mono text-[10px] uppercase tracking-[0.15em] text-forest">
      <span className="w-2 h-2 bg-forest flex-shrink-0 animate-pulse" />
      <span>{text}</span>
    </div>
  );
}
