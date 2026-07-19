import React, { useState } from 'react';
import MosaicBackground from './components/MosaicBackground';
import Nav from './components/Nav';
import Hero from './components/Hero';
import SectionDivider from './components/SectionDivider';
import BentoFeatureGrid from './components/BentoFeatureGrid';
import NetworkTopologyGraph from './components/NetworkTopologyGraph';
import TestimonialCard from './components/TestimonialCard';
import TechnicalFormCTA from './components/TechnicalFormCTA';
import Footer from './components/Footer';
import StatusBadge from './components/StatusBadge';
import StorageDashboard from './components/StorageDashboard';

export default function App() {
  const [view, setView] = useState('landing'); // 'landing' or 'console'

  return (
    <div className="relative min-h-screen selection:bg-mint selection:text-forest">
      {/* Background SVG mosaic grid */}
      <MosaicBackground />

      {/* Navigation Header */}
      <Nav view={view} setView={setView} />

      {view === 'console' ? (
        <StorageDashboard setView={setView} />
      ) : (
        <>
          {/* Hero Presentation Layer */}
      <Hero />

      <SectionDivider />

      {/* Bento Grid Feature Matrix */}
      <BentoFeatureGrid />

      <SectionDivider />

      {/* Network Topology RBAC Graph Section */}
      <section id="topology" className="py-20 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6 text-left">
          <div className="flex">
            <StatusBadge text="● NETWORK GRAPH: ONLINE" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight text-forest leading-[0.95] select-none">
            HIERARCHICAL
            <br />
            ACCESS GRAPH
          </h2>
          <div className="w-12 h-[2px] bg-mint" />
          <p className="font-mono text-xs uppercase tracking-wider text-forest/80 leading-relaxed max-w-md">
            Nexora compiles security settings dynamically along organizational axes. Permissions inherit logically from parent organizations down to project resources, enforcing structural isolation by design.
          </p>
          <ul className="space-y-3.5 font-mono text-[10px] uppercase tracking-wider text-forest/70">
            <li className="flex items-center gap-3">
              <span className="text-coral font-bold">[01]</span> Direct policy inheritance from parent nodes
            </li>
            <li className="flex items-center gap-3">
              <span className="text-mint font-bold">[02]</span> Least-privilege auto-quarantine upon anomaly discovery
            </li>
            <li className="flex items-center gap-3">
              <span className="text-gold font-bold">[03]</span> Cryptographic validation chain verification
            </li>
          </ul>
        </div>
        
        {/* Right side: Orbiting nodes circular container */}
        <div className="flex justify-center items-center">
          <NetworkTopologyGraph />
        </div>
      </section>

      <SectionDivider />

      {/* Testimonials Ledger Feed */}
      <section id="testimonials" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="mb-12 text-left">
          <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight text-forest mb-2">
            LEDGER EVALUATION
          </h2>
          <p className="font-mono text-[10px] uppercase tracking-widest text-forest/50">
            AUTHENTICATED PROTOCOL FEEDBACK // TRUST INDEX
          </p>
        </div>
        
        {/* Grid layout with 1px border grid dividers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[1px] bg-gridColor/20 border border-gridColor/20 rounded-none">
          <TestimonialCard
            quote="The hierarchical policy engine compiled 40,000 rules in 12ms. Securing our deep-nested files has never been this mathematically sound."
            author="Dr. Elizabeth Vance"
            role="Chief Information Security Officer"
            company="Aegis Defense Systems"
            rating={5}
          />
          <TestimonialCard
            quote="AI Access Governance caught a compromised service account within seconds of it initiating bulk file exports. Outstanding anomaly containment."
            author="Marcus Thorne"
            role="VP of Systems Engineering"
            company="Vector Genomics"
            rating={5}
          />
          <TestimonialCard
            quote="We replaced our legacy Active Directory wrapper with Nexora. Clean, declarative policies and immutable tamper-evident logs made audit prep trivial."
            author="Siddharth Mehta"
            role="Head of Infrastructure"
            company="Fintech Ledger Ltd"
            rating={5}
          />
        </div>
      </section>

      <SectionDivider />

      {/* Form Request Demo CTA */}
      <TechnicalFormCTA />

      {/* Footer Spec */}
      <Footer />
        </>
      )}
    </div>
  );
}
