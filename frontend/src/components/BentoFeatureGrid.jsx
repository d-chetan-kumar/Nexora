import React from 'react';

export default function BentoFeatureGrid() {
  const features = [
    {
      title: 'FILE STORAGE & SHIELDING',
      accentColor: 'border-coral',
      textColor: 'text-coral',
      desc: 'Secure object repository engineered with AES-256 at-rest envelope encryption. File paths are dynamically structured and isolated based on cryptographic keys.',
      mockup: (
        <div className="bg-white border border-gridColor/20 p-4 font-mono text-[10px] text-forest/80 uppercase space-y-1.5 select-none">
          <div className="flex justify-between border-b border-gridColor/10 pb-1 mb-2">
            <span className="text-coral font-bold">[FS_STREAM: OPEN]</span>
            <span className="text-forest/40">AES-GCM-256</span>
          </div>
          <div>&gt; INITIATING UPLOAD: nexora://org_root/finance/q4_audit.xlsx</div>
          <div>&gt; HASH: f1d2e3b4a5c6d7e8f901a2b3c4d5e6f7</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-coral/10 text-coral border border-coral/30 px-1 py-0.5 text-[8px] font-bold">ENCRYPTED</span>
            <span className="bg-forest/5 text-forest/60 border border-forest/20 px-1 py-0.5 text-[8px]">14.8 MB</span>
          </div>
        </div>
      )
    },
    {
      title: 'HIERARCHICAL RBAC COMPILER',
      accentColor: 'border-mint',
      textColor: 'text-mint',
      desc: 'Evaluate complex inheritance permissions instantly (Org → Dept → Team → Project → Resource). Declarative policies are compiled down to sub-millisecond execution graphs.',
      mockup: (
        <div className="bg-white border border-gridColor/20 p-4 font-mono text-[10px] text-forest/80 space-y-1 select-none">
          <div className="flex justify-between border-b border-gridColor/10 pb-1 mb-2">
            <span className="text-mint font-bold uppercase">[POLICY_SPEC]</span>
            <span className="text-forest/40">JSON-RBAC</span>
          </div>
          <div className="text-forest/50">{"{"}</div>
          <div className="pl-3">"resource": "finance/q4_audit.xlsx",</div>
          <div className="pl-3">"action": "READ_REDACTED",</div>
          <div className="pl-3">"principal": "role:finance-analyst",</div>
          <div className="pl-3">"context": {"{"} "mfa_verified": true {"}"}</div>
          <div className="text-forest/50">{"}"}</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-mint/10 text-forest border border-mint/40 px-1.5 py-0.5 text-[8px] font-bold">ALLOW</span>
          </div>
        </div>
      )
    },
    {
      title: 'IMMUTABLE AUDIT CHRONICLE',
      accentColor: 'border-gold',
      textColor: 'text-gold',
      desc: 'Cryptographically linked, tamper-evident ledger logs. Each system access, permission change, or file read generates an epoch hash, ensuring logs cannot be modified post-facto.',
      mockup: (
        <div className="bg-white border border-gridColor/20 p-4 font-mono text-[10px] text-forest/80 uppercase space-y-1.5 select-none">
          <div className="flex justify-between border-b border-gridColor/10 pb-1 mb-2">
            <span className="text-gold font-bold">[LEDGER_CHAIN: SYNCED]</span>
            <span className="text-forest/40">EPOCH_1472</span>
          </div>
          <div className="truncate">&gt; REF_01: READ /finance/report - USR_921 [OK]</div>
          <div className="truncate">&gt; REF_02: UPD_PERM /user/202 - ADMIN_01 [OK]</div>
          <div className="truncate text-forest/40">SIG: 9e32a..f48c [VERIFIED]</div>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-gold/10 text-forest border border-gold/40 px-1 py-0.5 text-[8px] font-bold">INTEGRITY: 100%</span>
          </div>
        </div>
      )
    },
    {
      title: 'AI ACCESS GOVERNANCE',
      accentColor: 'border-coral',
      textColor: 'text-coral',
      desc: 'Real-time telemetry feeds trace access pathways. ML models analyze structural usage, flag anomalous bulk file pulls, and recommend pruning rules to maintain least-privilege.',
      mockup: (
        <div className="bg-white border border-gridColor/20 p-4 font-mono text-[10px] text-forest/80 uppercase space-y-1.5 select-none">
          <div className="flex justify-between border-b border-gridColor/10 pb-1 mb-2">
            <span className="text-coral font-bold">[GOVERNANCE_MODEL]</span>
            <span className="text-forest/40">RISK_DETECTED</span>
          </div>
          <div className="text-coral font-bold">&gt; ALERT: DEPT CROSSING det_928</div>
          <div className="text-forest/60">&gt; RECOM: REVOKE READ access TO /marketing/* FOR USR_218</div>
          <div className="flex items-center gap-2 mt-2">
            <span className="bg-coral text-paper px-1 py-0.5 text-[8px] font-bold">QUARANTINED</span>
            <span className="bg-forest/5 text-forest/50 border border-forest/20 px-1 py-0.5 text-[8px]">REASON: MULTI_DEPT_PULL</span>
          </div>
        </div>
      )
    }
  ];

  return (
    <section id="features" className="py-20 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="mb-12 text-left">
        <h2 className="font-display text-4xl lg:text-5xl font-bold uppercase tracking-tight text-forest mb-2">
          CORE CAPABILITY MATRIX
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-widest text-forest/50">
          SYSTEM PILLARS // CRYPTOGRAPHIC SPECIFICATIONS
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-[1px] bg-gridColor/20 border border-gridColor/20 rounded-none">
        {features.map((feat, index) => (
          <div key={index} className="bg-paper p-8 flex flex-col justify-between gap-8 group hover:bg-[#F3F3F0] transition-colors duration-150">
            <div className="space-y-4">
              <div className={`pl-4 border-l-2 ${feat.accentColor}`}>
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-forest">
                  {feat.title}
                </h3>
              </div>
              <p className="font-body text-sm text-forest/80 leading-relaxed">
                {feat.desc}
              </p>
            </div>
            {feat.mockup}
          </div>
        ))}
      </div>
    </section>
  );
}
