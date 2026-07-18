import React from 'react';

export default function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-paper/90 backdrop-blur-sm border-b border-gridColor/20 z-50 flex items-center justify-between px-6 md:px-12 font-mono">
      <div className="flex items-center gap-8">
        {/* Left: Logo */}
        <a href="#" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-forest flex items-center justify-center rounded-none transition-colors duration-200 group-hover:bg-coral">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-forest">NEXORA</span>
        </a>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#features" className="text-[10px] text-forest/70 hover:text-forest transition-colors duration-150 uppercase tracking-widest">
            <span className="text-coral mr-1">01.</span> Product
          </a>
          <a href="#topology" className="text-[10px] text-forest/70 hover:text-forest transition-colors duration-150 uppercase tracking-widest">
            <span className="text-mint mr-1">02.</span> Security
          </a>
          <a href="#testimonials" className="text-[10px] text-forest/70 hover:text-forest transition-colors duration-150 uppercase tracking-widest">
            <span className="text-gold mr-1">03.</span> Feedback
          </a>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <a
          href="#request"
          className="px-4 py-2 border border-gridColor/30 bg-transparent text-forest text-[10px] uppercase tracking-widest hover:bg-forest/5 transition-colors duration-150 rounded-none font-bold"
        >
          Console
        </a>
        <a
          href="#request"
          className="px-4 py-2 bg-forest text-paper hover:bg-coral hover:text-forest text-[10px] uppercase tracking-widest transition-colors duration-150 rounded-none font-bold"
        >
          Request Access
        </a>
      </div>
    </nav>
  );
}
