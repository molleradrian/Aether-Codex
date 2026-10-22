/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, logout, checkRedirectAuth } from './firebase';
import DigitalLibraryView from './views/DigitalLibraryView';
import ReaderSuiteView from './views/ReaderSuiteView';
import ProjectsView from './views/ProjectsView';
import DriveView from './views/DriveView';
import LedgerView from './views/LedgerView';
import AntigravityView from './views/AntigravityView';
import EcosystemView from './views/EcosystemView';
import MediaGalleryView from './views/MediaGalleryView';
import ChatInterface from './components/ChatInterface';
import Footer from './components/Footer';
import { Menu, X, Library } from 'lucide-react';

function ProtectedView({ user, children }: { user: User | null; children: React.ReactNode }) {
  if (!user) {
    return (
      <div className="max-w-md mx-auto mt-16 text-center glass-panel p-8">
        <h2 className="text-2xl font-bold text-[#ff9900] mb-4">Operator Clearance Required</h2>
        <p className="text-[#9ca3af] mb-8 text-sm">This console interfaces directly with live sovereign node infrastructure and requires authenticated credentials.</p>
        <button 
          onClick={loginWithGoogle}
          className="w-full bg-[#00f0ff] text-black px-4 py-3 rounded-xl font-bold hover:bg-[#00c0cc] transition-colors text-sm uppercase tracking-wider"
        >
          Authenticate Sovereign Node
        </button>
      </div>
    );
  }
  return <>{children}</>;
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    checkRedirectAuth();
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  if (!authReady) {
    return <div className="min-h-screen flex items-center justify-center text-[#00f0ff]">Initializing Nexus...</div>;
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <Router>
      <div className="min-h-screen p-4 md:p-8">
        <nav className="max-w-5xl mx-auto mb-8 md:mb-12 glass-panel px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="font-bold text-lg md:text-xl tracking-wider text-[#e0e6ed]">
              <Link to="/" onClick={closeMobileMenu}>AETHERIUM<span className="text-[#00f0ff]">_CODEX</span></Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-4 items-center">
              <Link to="/" className="text-sm text-[#00f0ff] hover:text-[#ff9900] transition-colors flex items-center gap-1.5 font-medium">
                <Library className="w-4 h-4 text-[#00f0ff]" />
                <span>Digital Library</span>
              </Link>
              <Link to="/ecosystem" className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] transition-colors flex items-center gap-1 font-medium">
                <span>Ecosystem Hub</span>
              </Link>
              <Link to="/promo" className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] transition-colors flex items-center gap-1 font-medium">
                <span>Media Kit</span>
              </Link>
              <Link to="/antigravity" className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] transition-colors flex items-center gap-1 font-medium">
                <span>Antigravity SDK</span>
              </Link>
              <Link to="/ledger" className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] transition-colors flex items-center gap-1 font-medium">
                <span>History & Ledger</span>
              </Link>
              <Link to="/projects" className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] transition-colors">Projects</Link>
              <Link to="/drive" className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] transition-colors flex items-center gap-1">
                <span>Drive Vault</span>
              </Link>
              {user ? (
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[#9ca3af] hidden xl:inline-block max-w-[140px] truncate">{user.email}</span>
                  <button 
                    onClick={logout}
                    className="text-xs border border-[#ff9900] text-[#ff9900] px-3 py-1 rounded hover:bg-[#ff9900] hover:text-black transition-colors"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button 
                  onClick={loginWithGoogle}
                  className="text-xs bg-[#00f0ff] text-black px-3 py-1.5 rounded font-medium hover:bg-[#00c0cc] transition-colors"
                >
                  Authenticate
                </button>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <div className="flex items-center gap-3 lg:hidden">
              {user ? (
                <button 
                  onClick={logout}
                  className="text-xs border border-[#ff9900] text-[#ff9900] px-2.5 py-1 rounded hover:bg-[#ff9900] hover:text-black transition-colors"
                >
                  Logout
                </button>
              ) : (
                <button 
                  onClick={loginWithGoogle}
                  className="text-xs bg-[#00f0ff] text-black px-2.5 py-1 rounded font-medium hover:bg-[#00c0cc] transition-colors"
                >
                  Login
                </button>
              )}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-1.5 rounded-lg border border-[rgba(255,255,255,0.1)] text-[#e0e6ed] hover:text-[#00f0ff] hover:border-[#00f0ff]/50 transition-colors"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5 text-[#00f0ff]" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="lg:hidden mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)] flex flex-col gap-2">
              <Link 
                to="/" 
                onClick={closeMobileMenu}
                className="text-sm text-[#00f0ff] hover:text-white py-2 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors flex items-center justify-between font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Library className="w-4 h-4 text-[#00f0ff]" />
                  <span>Digital Library</span>
                </div>
                <span className="text-xs text-[#00f0ff] font-mono">→</span>
              </Link>
              <Link 
                to="/ecosystem" 
                onClick={closeMobileMenu}
                className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] py-2 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors flex items-center justify-between"
              >
                <span>Ecosystem Hub</span>
                <span className="text-xs text-[#00f0ff] font-mono">→</span>
              </Link>
              <Link 
                to="/promo" 
                onClick={closeMobileMenu}
                className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] py-2 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors flex items-center justify-between"
              >
                <span>Media Kit</span>
                <span className="text-xs text-[#00f0ff] font-mono">→</span>
              </Link>
              <Link 
                to="/antigravity" 
                onClick={closeMobileMenu}
                className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] py-2 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors flex items-center justify-between"
              >
                <span>Antigravity SDK</span>
                <span className="text-xs text-[#00f0ff] font-mono">→</span>
              </Link>
              <Link 
                to="/ledger" 
                onClick={closeMobileMenu}
                className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] py-2 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors flex items-center justify-between"
              >
                <span>History & Ledger</span>
                <span className="text-xs text-[#00f0ff] font-mono">→</span>
              </Link>
              <Link 
                to="/projects" 
                onClick={closeMobileMenu}
                className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] py-2 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors flex items-center justify-between"
              >
                <span>Projects</span>
                <span className="text-xs text-[#00f0ff] font-mono">→</span>
              </Link>
              <Link 
                to="/drive" 
                onClick={closeMobileMenu}
                className="text-sm text-[#e0e6ed] hover:text-[#00f0ff] py-2 px-3 rounded-lg hover:bg-[rgba(255,255,255,0.03)] transition-colors flex items-center justify-between"
              >
                <span>Drive Vault</span>
                <span className="text-xs text-[#00f0ff] font-mono">→</span>
              </Link>
              {user && (
                <div className="mt-2 pt-2 border-t border-[rgba(255,255,255,0.05)] px-3 text-xs text-[#9ca3af] font-mono">
                  Active Operator: {user.email}
                </div>
              )}
            </div>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<DigitalLibraryView />} />
          <Route path="/library" element={<DigitalLibraryView />} />
          <Route path="/chapter/:slug" element={<ReaderSuiteView />} />
          <Route path="/library/read/:slug" element={<ReaderSuiteView />} />
          <Route path="/ecosystem" element={<EcosystemView />} />
          <Route path="/promo" element={<MediaGalleryView />} />
          <Route path="/antigravity" element={<ProtectedView user={user}><div className="mb-20"><AntigravityView /></div></ProtectedView>} />
          <Route path="/ledger" element={<ProtectedView user={user}><LedgerView /></ProtectedView>} />
          <Route path="/projects" element={<ProtectedView user={user}><ProjectsView /></ProtectedView>} />
          <Route path="/drive" element={<ProtectedView user={user}><DriveView /></ProtectedView>} />
        </Routes>

        <Footer />
        <ChatInterface />
      </div>
    </Router>
  );
}
