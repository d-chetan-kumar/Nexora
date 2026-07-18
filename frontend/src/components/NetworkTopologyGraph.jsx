import React from 'react';

export default function NetworkTopologyGraph() {
  return (
    <div className="w-full max-w-[420px] aspect-square mx-auto border border-gridColor/20 rounded-full p-4 relative bg-paper flex items-center justify-center select-none">
      {/* Radar style grid background */}
      <svg viewBox="0 0 400 400" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        {/* Crosshair Background */}
        <line x1="200" y1="0" x2="200" y2="400" stroke="#3A3A38" strokeWidth="0.5" strokeOpacity="0.1" />
        <line x1="0" y1="200" x2="400" y2="200" stroke="#3A3A38" strokeWidth="0.5" strokeOpacity="0.1" />
        
        {/* Concentric reference circles */}
        <circle cx="200" cy="200" r="70" fill="none" stroke="#3A3A38" strokeWidth="0.5" strokeOpacity="0.15" />
        <circle cx="200" cy="200" r="105" fill="none" stroke="#3A3A38" strokeWidth="0.5" strokeOpacity="0.1" strokeDasharray="2 2" />
        
        {/* Orbit track */}
        <circle
          cx="200"
          cy="200"
          r="140"
          fill="none"
          stroke="#1A3C2B"
          strokeWidth="1"
          strokeDasharray="4 4"
          strokeOpacity="0.25"
        />

        {/* Central Policy Engine Node */}
        <circle cx="200" cy="200" r="8" fill="#1A3C2B" />
        <circle cx="200" cy="200" r="14" fill="none" stroke="#1A3C2B" strokeWidth="1" strokeOpacity="0.3" className="animate-ping" />

        {/* Rotating group containing connectors and orbiting nodes */}
        <g style={{ transformOrigin: '200px 200px' }} className="animate-orbit-spin">
          {/* Connector Lines */}
          <line x1="200" y1="200" x2="340" y2="200" stroke="#1A3C2B" strokeWidth="1" strokeOpacity="0.25" />
          <line x1="200" y1="200" x2="130" y2="321" stroke="#1A3C2B" strokeWidth="1" strokeOpacity="0.25" />
          <line x1="200" y1="200" x2="130" y2="79" stroke="#1A3C2B" strokeWidth="1" strokeOpacity="0.25" />

          {/* Orbiting Node 1: Org */}
          <g>
            <circle cx="340" cy="200" r="6" fill="#FF8C69" />
            <circle cx="340" cy="200" r="10" fill="none" stroke="#FF8C69" strokeWidth="1" strokeOpacity="0.4" />
          </g>
          
          {/* Orbiting Node 2: Dept */}
          <g>
            <circle cx="130" cy="321" r="6" fill="#9EFFBF" />
            <circle cx="130" cy="321" r="10" fill="none" stroke="#9EFFBF" strokeWidth="1" strokeOpacity="0.4" />
          </g>

          {/* Orbiting Node 3: Team */}
          <g>
            <circle cx="130" cy="79" r="6" fill="#F4D35E" />
            <circle cx="130" cy="79" r="10" fill="none" stroke="#F4D35E" strokeWidth="1" strokeOpacity="0.4" />
          </g>
        </g>
      </svg>
      
      {/* Static annotations */}
      <span className="absolute top-6 left-1/2 -translate-x-1/2 font-mono text-[8px] uppercase tracking-widest text-forest/40">
        [SYS_MONITOR: ACTIVE]
      </span>
      <span className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[8px] uppercase tracking-widest text-forest/40">
        [HIERARCHY_LEVELS: 4]
      </span>
      <span className="absolute left-6 top-1/2 -translate-y-1/2 font-mono text-[8px] uppercase tracking-widest text-forest/40">
        [NODE_Q: RUN]
      </span>
      <span className="absolute right-6 top-1/2 -translate-y-1/2 font-mono text-[8px] uppercase tracking-widest text-forest/40">
        [SYNC: 100%]
      </span>
    </div>
  );
}
