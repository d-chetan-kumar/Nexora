import React from 'react';
import StatusBadge from './StatusBadge';
import heroGraphic from '../assets/hero-tech.png';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      {/* Left Column */}
      <div className="flex flex-col items-start gap-6">
        <StatusBadge text="● SYSTEM STATUS: ONLINE / LEAST PRIVILEGE REINFORCED" />
        
        <h1 className="font-display text-5xl md:text-8xl font-bold uppercase tracking-tighter text-forest leading-[0.85] select-none">
          SECURE
          <br />
          ENTERPRISE
          <br />
          GATEWAY.
        </h1>

        <div className="pl-6 border-l border-forest/50 flex flex-col gap-4">
          <p className="font-mono text-sm uppercase tracking-wider text-forest/80 leading-relaxed max-w-md">
            Nexora compiles dynamic RBAC policies, registers immutable audit logs, and deploys autonomous AI access governance. Built for zero trust structures.
          </p>
          <div className="flex flex-wrap gap-4 mt-2">
            <a
              href="#request"
              className="px-6 py-3 bg-forest text-paper hover:bg-coral hover:text-forest text-xs uppercase tracking-widest font-mono transition-colors duration-150 rounded-none font-bold"
            >
              Initialize Node
            </a>
            <a
              href="#features"
              className="px-6 py-3 border border-forest/20 text-forest hover:bg-forest/5 text-xs uppercase tracking-widest font-mono transition-colors duration-150 rounded-none font-bold"
            >
              Inspect Schema
            </a>
          </div>
        </div>
      </div>

      {/* Right Column: Interactive Wireframe */}
      <div className="flex items-center justify-center">
        <div className="w-full max-w-[420px] aspect-square border border-gridColor/20 relative bg-paper flex items-center justify-center overflow-hidden rounded-none p-6">
          {/* Static design grid lines */}
          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-gridColor/10" />
          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-gridColor/10" />

          {/* Corner highlights inside */}
          <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-forest/30" />
          <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-forest/30" />
          <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-forest/30" />
          <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-forest/30" />

          {/* Dashed circular orbit path */}
          <div className="absolute w-[85%] h-[85%] rounded-full border border-dashed border-forest/30 animate-[spin_30s_linear_infinite]" />

          {/* Core Image container */}
          <div className="w-[60%] h-[60%] border border-forest/40 relative z-10 bg-white">
            <img
              src={heroGraphic}
              alt="Nexora Blueprint Schematic"
              className="w-full h-full object-cover opacity-90 mix-blend-luminosity hover:mix-blend-normal hover:opacity-100 transition-all duration-300 select-none cursor-crosshair"
            />
            {/* Small info tag inside graphic box */}
            <div className="absolute bottom-1 right-1 bg-paper px-1.5 py-0.5 border border-forest/20 font-mono text-[8px] text-forest/70 uppercase select-none">
              NEX_V1.0
            </div>
          </div>

          {/* Small aesthetic corner coordinates */}
          <span className="absolute top-2 left-12 font-mono text-[8px] text-forest/40">[LAT_0.00]</span>
          <span className="absolute bottom-2 right-12 font-mono text-[8px] text-forest/40">[LNG_0.00]</span>
        </div>
      </div>
    </section>
  );
}
