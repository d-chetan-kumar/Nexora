import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-gridColor/20 bg-paper py-12 px-6 md:px-12 font-mono mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        {/* Left Logo */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-forest flex items-center justify-center rounded-none">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-display font-bold text-base tracking-tight text-forest">NEXORA</span>
          </div>
          <span className="text-[9px] text-forest/40 uppercase tracking-wider">
            © 2026 NEXORA SYSTEMS INC. ALL RIGHTS RESERVED.
          </span>
        </div>

        {/* Center Links */}
        <div className="flex flex-wrap justify-center gap-8">
          <a href="#" className="text-[9px] text-forest/60 hover:text-forest uppercase tracking-widest transition-colors duration-150">
            Security Spec
          </a>
          <a href="#" className="text-[9px] text-forest/60 hover:text-forest uppercase tracking-widest transition-colors duration-150">
            API Reference
          </a>
          <a href="#" className="text-[9px] text-forest/60 hover:text-forest uppercase tracking-widest transition-colors duration-150">
            Audit Ledger
          </a>
          <a href="#" className="text-[9px] text-forest/60 hover:text-forest uppercase tracking-widest transition-colors duration-150">
            Uptime SLA
          </a>
        </div>

        {/* Right Uptime status */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-mint rounded-none animate-ping" />
          <span className="text-[9px] text-forest/70 uppercase tracking-widest">
            ALL SYSTEMS STABLE
          </span>
        </div>
      </div>
    </footer>
  );
}
