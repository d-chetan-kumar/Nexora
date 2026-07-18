import React from 'react';

export default function TestimonialCard({ quote, author, role, company, rating = 5 }) {
  return (
    <div className="border border-gridColor/20 bg-paper p-6 flex flex-col justify-between h-full rounded-none">
      <div>
        {/* Top: Star icons + quote mark */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-0.5">
            {[...Array(rating)].map((_, i) => (
              <svg key={i} className="w-2.5 h-2.5 fill-gold text-gold" viewBox="0 0 24 24">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
              </svg>
            ))}
          </div>
          {/* Quote Icon */}
          <svg className="w-4 h-4 text-forest/35" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.75-2-2-2H4c-1.25 0-2 .75-2 2v4c0 1.25.75 2 2 2h4c0 3-2 4-5 5v3zm12 0c3 0 7-1 7-8V5c0-1.25-.75-2-2-2h-4c-1.25 0-2 .75-2 2v4c0 1.25.75 2 2 2h4c0 3-2 4-5 5v3z" />
          </svg>
        </div>

        {/* Body */}
        <p className="font-mono text-xs text-forest/80 leading-relaxed uppercase tracking-wider mb-8">
          "{quote}"
        </p>
      </div>

      {/* Bottom: Divider + Avatar info */}
      <div className="border-t border-gridColor/20 pt-4 flex items-center gap-3">
        {/* Square avatar */}
        <div className="w-8 h-8 bg-forest flex-shrink-0 flex items-center justify-center text-[10px] text-paper font-mono uppercase font-bold rounded-none">
          {author.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex flex-col">
          <span className="font-mono text-[10px] font-bold text-forest uppercase tracking-wider">{author}</span>
          <span className="font-mono text-[9px] text-forest/50 uppercase tracking-widest">{role} @ {company}</span>
        </div>
      </div>
    </div>
  );
}
