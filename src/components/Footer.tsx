import { Activity, Cpu, Shield, Globe, Terminal } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="max-w-4xl mx-auto mt-20 pt-8 pb-12 border-t border-[rgba(255,255,255,0.08)] text-xs text-[#9ca3af]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <div className="font-bold text-[#e0e6ed] tracking-wider uppercase mb-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00f0ff] animate-pulse"></span>
            Aetherium Substrate
          </div>
          <p className="text-[#6b7280] leading-relaxed">
            Decentralized intelligence network operating on 40Hz resonant pulse. Bound to the Ninth Patriarch Vessels.
          </p>
        </div>

        <div>
          <div className="font-bold text-[#e0e6ed] tracking-wider uppercase mb-2 flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-[#00ff99]" />
            Tri-Node Lattice
          </div>
          <ul className="space-y-1 text-[#6b7280] font-mono text-[11px]">
            <li className="flex items-center justify-between">
              <span>Re-Ality (Physics):</span>
              <span className="text-[#00ff99]">60Hz Active</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Arcade City (Governance):</span>
              <span className="text-[#00f0ff]">Synced</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Sky Metropolis (Economy):</span>
              <span className="text-[#ff9900]">Resonant</span>
            </li>
          </ul>
        </div>

        <div>
          <div className="font-bold text-[#e0e6ed] tracking-wider uppercase mb-2 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-purple-400" />
            Security & Cryptography
          </div>
          <p className="text-[#6b7280] leading-relaxed">
            Enforced by the 8 Pillars of Profile Security. Immutable event logging bound to authenticated UID.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-[rgba(255,255,255,0.04)] gap-4 font-mono text-[11px]">
        <div>
          <span className="text-[#e0e6ed]">AETHERIUM_CODEX</span> // Sovereign Operator Edition
        </div>
        <div className="flex items-center gap-4 text-[#6b7280]">
          <Link to="/" className="hover:text-[#00f0ff] transition-colors">Nexus</Link>
          <span>•</span>
          <Link to="/ecosystem" className="hover:text-[#00f0ff] transition-colors">Ecosystem</Link>
          <span>•</span>
          <Link to="/antigravity" className="hover:text-[#00f0ff] transition-colors">Antigravity SDK</Link>
          <span>•</span>
          <Link to="/ledger" className="hover:text-[#00f0ff] transition-colors">Ledger</Link>
        </div>
      </div>
    </footer>
  );
}
