import React from 'react';

export default function Nav({ view, setView }) {
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-paper/90 backdrop-blur-sm border-b border-gridColor/20 z-50 flex items-center justify-between px-6 md:px-12 font-mono">
      <div className="flex items-center gap-8">
        {/* Left: Logo */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView('landing');
          }}
          className="flex items-center gap-3 group"
        >
          <div className="w-8 h-8 bg-forest flex items-center justify-center rounded-none transition-colors duration-200 group-hover:bg-coral">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-forest">NEXORA</span>
        </a>

        {/* Center: Nav links */}
        <div className="hidden md:flex items-center gap-6">
          <a
            href="#features"
            onClick={(e) => {
              if (view === 'console') {
                setView('landing');
                // Allow a microtask delay for the page to render features
                setTimeout(() => {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }
            }}
            className="text-[10px] text-forest/70 hover:text-forest transition-colors duration-150 uppercase tracking-widest"
          >
            <span className="text-coral mr-1">01.</span> Product
          </a>
          <a
            href="#topology"
            onClick={(e) => {
              if (view === 'console') {
                setView('landing');
                setTimeout(() => {
                  document.getElementById('topology')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }
            }}
            className="text-[10px] text-forest/70 hover:text-forest transition-colors duration-150 uppercase tracking-widest"
          >
            <span className="text-mint mr-1">02.</span> Security
          </a>
          <a
            href="#testimonials"
            onClick={(e) => {
              if (view === 'console') {
                setView('landing');
                setTimeout(() => {
                  document.getElementById('testimonials')?.scrollIntoView({ behavior: 'smooth' });
                }, 50);
              }
            }}
            className="text-[10px] text-forest/70 hover:text-forest transition-colors duration-150 uppercase tracking-widest"
          >
            <span className="text-gold mr-1">03.</span> Feedback
          </a>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setView('console');
          }}
          className={`px-4 py-2 border text-[10px] uppercase tracking-widest transition-colors duration-150 rounded-none font-bold ${
            view === 'console'
              ? 'bg-forest text-paper border-forest'
              : 'border-gridColor/30 bg-transparent text-forest hover:bg-forest/5'
          }`}
        >
          Console
        </a>
        <a
          href="#request"
          onClick={(e) => {
            if (view === 'console') {
              setView('landing');
              setTimeout(() => {
                document.getElementById('request')?.scrollIntoView({ behavior: 'smooth' });
              }, 50);
            }
          }}
          className="px-4 py-2 bg-forest text-paper hover:bg-coral hover:text-forest text-[10px] uppercase tracking-widest transition-colors duration-150 rounded-none font-bold"
        >
          Request Access
        </a>
      </div>
    </nav>
  );
}
