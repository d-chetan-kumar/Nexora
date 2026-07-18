import React, { useState } from 'react';

export default function TechnicalFormCTA() {
  const [formData, setFormData] = useState({ name: '', email: '', orgSize: '100-999', requirements: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div id="request" className="w-full max-w-[640px] mx-auto bg-paper border border-gridColor/20 p-8 relative rounded-none my-20">
      {/* Corner Markers - Absolute placement slightly offset to overlap border */}
      <div className="absolute -top-[1px] -left-[1px] w-[10px] h-[10px] border-t border-l border-forest" />
      <div className="absolute -top-[1px] -right-[1px] w-[10px] h-[10px] border-t border-r border-forest" />
      <div className="absolute -bottom-[1px] -left-[1px] w-[10px] h-[10px] border-b border-l border-forest" />
      <div className="absolute -bottom-[1px] -right-[1px] w-[10px] h-[10px] border-b border-r border-forest" />

      <div className="text-center mb-8">
        <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-forest mb-2">
          REQUEST GATEWAY ACCESS
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-forest/50">
          SECURE PROVISIONING PROTOCOL // INITIALIZE DEMO
        </p>
      </div>

      {submitted ? (
        <div className="border border-forest/30 bg-mint/10 p-6 text-center font-mono text-xs uppercase tracking-wider text-forest rounded-none">
          <span className="text-forest font-bold">[ACCESS_LOGGED] </span> 
          A security engineer will contact your organization to verify your identity.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-forest/70 mb-1.5 font-bold">
              01 // APPLICANT NAME
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white border border-gridColor/30 px-3 py-2.5 text-xs font-mono rounded-none text-forest focus:outline-none focus:border-forest transition-colors duration-150"
              placeholder="E.G. ALEX CHEN"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-forest/70 mb-1.5 font-bold">
              02 // ENTERPRISE EMAIL
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white border border-gridColor/30 px-3 py-2.5 text-xs font-mono rounded-none text-forest focus:outline-none focus:border-forest transition-colors duration-150"
              placeholder="E.G. CHEN@ENTERPRISE.COM"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-forest/70 mb-1.5 font-bold">
              03 // ORGANIZATION NODE SCALE
            </label>
            <select
              value={formData.orgSize}
              onChange={(e) => setFormData({ ...formData, orgSize: e.target.value })}
              className="w-full bg-white border border-gridColor/30 px-3 py-2.5 text-xs font-mono rounded-none text-forest focus:outline-none focus:border-forest transition-colors duration-150"
            >
              <option value="1-99">&lt; 100 EMPLOYEES</option>
              <option value="100-999">100 - 999 EMPLOYEES</option>
              <option value="1000+">1000+ EMPLOYEES</option>
            </select>
          </div>

          <div>
            <label className="block font-mono text-[10px] uppercase tracking-widest text-forest/70 mb-1.5 font-bold">
              04 // SYSTEM ARCHITECTURE PROFILE
            </label>
            <textarea
              value={formData.requirements}
              onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              className="w-full bg-white border border-gridColor/30 px-3 py-2.5 text-xs font-mono rounded-none text-forest focus:outline-none focus:border-forest h-24 resize-none transition-colors duration-150"
              placeholder="E.G. COMPLIANCE REQ: SOC 2 TYPE II / HIERARCHICAL RBAC DEPTH: 4 / ESTIMATED METADATA CAPACITY"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-forest text-paper border border-forest font-mono text-[10px] uppercase tracking-widest hover:bg-coral hover:text-forest hover:border-coral transition-colors duration-200 rounded-none cursor-pointer font-bold"
          >
            EXECUTE HANDSHAKE
          </button>
        </form>
      )}
    </div>
  );
}
