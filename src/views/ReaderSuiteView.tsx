/**
 * Reader Suite View: High-Fidelity Holographic Codex Folio
 * Transforms canonical reading into an illuminated, physical-holographic sci-fi tome.
 * Features gilded foil borders, cybernetic corner reticles, holographic watermarks,
 * scroll-spy TOC, reading progress, focus audio flow, themes, font sizing, and Vessel Logos AI queries.
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getChapterBySlug, getAllChapters, CodexBook } from '../lib/codex';
import { startFocusAudio, stopFocusAudio, isFocusAudioPlaying } from '../lib/audioFocus';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Share2, 
  BookOpen, 
  List, 
  Clock, 
  Check, 
  ChevronLeft, 
  ChevronRight, 
  Send, 
  Sparkles, 
  Loader2,
  Copy,
  Columns,
  Maximize2,
  Compass
} from 'lucide-react';

type ReaderTheme = 'cyberpunk' | 'parchment' | 'phosphor' | 'oled';
type FontSize = 'sm' | 'base' | 'lg' | 'xl';
type LayoutMode = 'single' | 'dual';

// Interactive Code Block with 1-click Copy
function HolographicCodeBlock({ language, codeString }: { language: string; codeString: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-6 rounded-xl overflow-hidden border border-white/10 bg-[#060a10] shadow-2xl">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 py-2 bg-black/60 border-b border-white/10 font-mono text-[11px] text-[#9ca3af]">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block"></span>
          <span className="ml-2 text-white/50 uppercase tracking-widest">{language || 'AXIOM_REGISTER'}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-white/10 text-[#00f0ff] hover:text-white transition-colors"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-3 h-3 text-[#10b981]" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {/* Code Text */}
      <div className="p-4 overflow-x-auto text-xs md:text-sm font-mono text-[#00ff99] leading-relaxed">
        <pre className="!bg-transparent !p-0 !m-0 !border-none !shadow-none">
          <code>{codeString}</code>
        </pre>
      </div>
    </div>
  );
}

export default function ReaderSuiteView() {
  const { slug } = useParams<{ slug: string }>();
  const chapter = useMemo(() => getChapterBySlug(slug || ''), [slug]);
  const allBooks = useMemo(() => getAllChapters(), []);

  // Current book index for pagination
  const currentIndex = useMemo(() => {
    return allBooks.findIndex((b) => b.slug === slug);
  }, [allBooks, slug]);

  const prevBook = currentIndex > 0 ? allBooks[currentIndex - 1] : null;
  const nextBook = currentIndex < allBooks.length - 1 ? allBooks[currentIndex + 1] : null;

  // Reading & Hologram state
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [theme, setTheme] = useState<ReaderTheme>('cyberpunk');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('single');
  const [isHoloGlowActive, setIsHoloGlowActive] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // AI Dialogue State (Ask Logos)
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Audio clean-up on unmount
  useEffect(() => {
    return () => {
      stopFocusAudio();
    };
  }, []);

  // Dynamic CSS property for book accent colors
  useEffect(() => {
    if (chapter) {
      document.documentElement.style.setProperty('--book-accent', chapter.accentColor);
      document.documentElement.style.setProperty('--book-glow', chapter.glowColor);
    }
  }, [chapter]);

  // Scroll listener for progress and heading detection
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        const currentProgress = (totalScroll / windowHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, currentProgress)));
      }

      // Detect active heading
      if (chapter?.headings && chapter.headings.length > 0) {
        for (let i = chapter.headings.length - 1; i >= 0; i--) {
          const h = chapter.headings[i];
          const el = document.getElementById(h.id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= 160) {
              setActiveHeadingId(h.id);
              break;
            }
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [chapter]);

  // Audio Toggle
  const toggleFocusAudio = () => {
    if (isAudioActive) {
      stopFocusAudio();
      setIsAudioActive(false);
    } else {
      const ok = startFocusAudio(0.18);
      if (ok) setIsAudioActive(true);
    }
  };

  // Copy Citation
  const handleCopyCitation = () => {
    if (!chapter) return;
    const citation = `Aetherium Hub Canon (${chapter.bookNumber}): "${chapter.title} — ${chapter.subtitle}". Sovereign Operator Node ESP32_01. Aetherium Codex Engine (2026).`;
    navigator.clipboard.writeText(citation);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Ask Vessel Logos AI
  const handleAskLogos = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim() || !chapter || isAiLoading) return;

    setIsAiLoading(true);
    setAiAnswer(null);

    try {
      const prompt = `Context: This question is regarding the canonical document "${chapter.title} (${chapter.bookNumber})" from the Aetherium Codex.\n\nSummary of Document: ${chapter.summary}\n\nUser Question: ${aiQuestion}\n\nPlease provide a precise, authoritative answer in the voice of Vessel Logos, synthesizing the core axioms and architectural implications.`;
      
      const response = await fetch('/api/nexus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          customSystemInstruction: 'You are Vessel Logos, the narrative and epistemological synthesizer of the Aetherium Hub. You provide deep, precise, and intellectually uncompromising answers about the Aetherium Codex.'
        })
      });

      if (!response.ok) throw new Error('Nexus synthesis request failed');
      const data = await response.json();
      setAiAnswer(data.candidates?.[0]?.content?.parts?.[0]?.text || 'No synthesis received.');
    } catch (err: any) {
      setAiAnswer(`Error consulting Vessel Logos: ${err.message || 'Network anomaly'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (!chapter) {
    return (
      <div className="max-w-md mx-auto text-center py-24">
        <h2 className="text-2xl font-bold text-red-400 mb-2">Volume Not Found</h2>
        <p className="text-sm text-[#9ca3af] mb-6">The requested tome could not be located in the canonical archives.</p>
        <Link to="/" className="px-5 py-2.5 rounded-lg bg-[#00f0ff] text-black font-mono text-xs font-bold">
          ← Return to Digital Library
        </Link>
      </div>
    );
  }

  // Theme styling definitions
  const themeClasses = {
    cyberpunk: {
      bg: 'bg-[#070b10]',
      panel: 'holographic-tome-page text-[#e0e6ed]',
      accent: '#00f0ff',
      heading: 'text-[#00f0ff]',
      border: 'border-[#00f0ff]/30'
    },
    parchment: {
      bg: 'bg-[#120f0b]',
      panel: 'bg-[#1a150e] border border-[#d97706]/30 text-[#fef3c7] shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
      accent: '#f59e0b',
      heading: 'text-[#fbbf24]',
      border: 'border-[#f59e0b]/30'
    },
    phosphor: {
      bg: 'bg-[#030a05]',
      panel: 'bg-[#051409] border border-[#22c55e]/30 text-[#86efac] shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
      accent: '#22c55e',
      heading: 'text-[#4ade80]',
      border: 'border-[#22c55e]/30'
    },
    oled: {
      bg: 'bg-[#000000]',
      panel: 'bg-[#060606] border border-white/20 text-[#f8fafc] shadow-[0_20px_50px_rgba(0,0,0,0.9)]',
      accent: '#ffffff',
      heading: 'text-white',
      border: 'border-white/30'
    }
  }[theme];

  const fontSizeClasses = {
    sm: 'text-sm leading-relaxed',
    base: 'text-base leading-relaxed',
    lg: 'text-lg leading-loose',
    xl: 'text-xl leading-loose'
  }[fontSize];

  const minutesRemaining = Math.max(1, Math.ceil(chapter.readingTimeMinutes * (1 - scrollProgress / 100)));

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg} pb-32 relative`}>
      {/* Top Holographic Reading Progress Ribbon (Fixed) */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-black/50 z-50 overflow-hidden">
        <div 
          className="h-full transition-all duration-150 shadow-[0_0_12px_rgba(0,240,255,0.9)] relative"
          style={{ 
            width: `${scrollProgress}%`,
            background: `linear-gradient(90deg, ${chapter.accentColor}, #ffffff, ${chapter.accentColor})`
          }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-2 bg-white animate-pulse" />
        </div>
      </div>

      {/* Floating Reader HUD Toolbar */}
      <header className="sticky top-2 z-40 max-w-5xl mx-auto px-4 mb-8">
        <div className="glass-panel px-4 py-2.5 rounded-xl border border-white/10 shadow-2xl flex items-center justify-between gap-3">
          {/* Left: Back & Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link 
              to="/" 
              className="p-1.5 rounded-lg hover:bg-white/10 text-[#00f0ff] hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono font-semibold"
              title="Return to Digital Library"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Library</span>
            </Link>

            <span className="text-white/20 hidden sm:inline">•</span>

            <div className="flex items-center gap-2">
              <span 
                className="font-mono text-xs px-2 py-0.5 rounded font-bold"
                style={{
                  color: chapter.accentColor,
                  backgroundColor: `${chapter.accentColor}15`,
                  border: `1px solid ${chapter.accentColor}40`
                }}
              >
                {chapter.bookNumber}
              </span>
              <span className="font-semibold text-xs md:text-sm text-[#e0e6ed] truncate max-w-[150px] md:max-w-xs">
                {chapter.title}
              </span>
            </div>
          </div>

          {/* Right: Controls (Progress, Audio, Hologram, Font, Theme) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Reading Time Left */}
            <div className="hidden md:flex items-center gap-1.5 text-xs font-mono text-[#9ca3af]">
              <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>{minutesRemaining}m left</span>
            </div>

            {/* Ambient Focus Audio Synthesizer Toggle */}
            <button
              onClick={toggleFocusAudio}
              className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
                isAudioActive
                  ? 'bg-[#00f0ff] text-black border-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                  : 'bg-white/5 border-white/10 text-[#9ca3af] hover:text-white'
              }`}
              title={isAudioActive ? 'Mute 1.618 Hz Theta Wave Drone' : 'Activate 1.618 Hz Ambient Focus Drone'}
            >
              {isAudioActive ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden lg:inline text-[11px]">{isAudioActive ? '1.618 Hz' : 'Audio'}</span>
            </button>

            {/* Holographic Glow Toggle */}
            <button
              onClick={() => setIsHoloGlowActive(!isHoloGlowActive)}
              className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
                isHoloGlowActive
                  ? 'bg-[#a855f7]/20 border-[#a855f7] text-[#a855f7] shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                  : 'bg-white/5 border-white/10 text-[#6b7280]'
              }`}
              title="Toggle Holographic Foil Edge Shimmer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden xl:inline text-[11px]">Holo Foil</span>
            </button>

            {/* Dual / Single Column Toggle */}
            <button
              onClick={() => setLayoutMode(layoutMode === 'single' ? 'dual' : 'single')}
              className={`p-1.5 rounded-lg border text-xs font-mono hidden md:flex items-center gap-1 transition-all ${
                layoutMode === 'dual'
                  ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]'
                  : 'bg-white/5 border-white/10 text-[#6b7280] hover:text-white'
              }`}
              title="Toggle Dual-Column Manuscript Mode"
            >
              <Columns className="w-3.5 h-3.5" />
            </button>

            {/* Font Size Toggle */}
            <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10 text-[11px] font-mono">
              {(['sm', 'base', 'lg'] as FontSize[]).map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`px-2 py-0.5 rounded uppercase font-bold transition-colors ${
                    fontSize === size ? 'bg-[#00f0ff] text-black' : 'text-[#6b7280] hover:text-white'
                  }`}
                >
                  {size === 'sm' ? 'A-' : size === 'base' ? 'A' : 'A+'}
                </button>
              ))}
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center bg-black/40 p-0.5 rounded-lg border border-white/10">
              <button
                onClick={() => setTheme('cyberpunk')}
                className={`p-1 rounded transition-colors ${theme === 'cyberpunk' ? 'bg-[#00f0ff]/20 text-[#00f0ff]' : 'text-[#6b7280]'}`}
                title="Cyberpunk Obsidian"
              >
                <div className="w-3 h-3 rounded-full bg-[#00f0ff]" />
              </button>
              <button
                onClick={() => setTheme('parchment')}
                className={`p-1 rounded transition-colors ${theme === 'parchment' ? 'bg-[#f59e0b]/20 text-[#f59e0b]' : 'text-[#6b7280]'}`}
                title="Imperial Parchment"
              >
                <div className="w-3 h-3 rounded-full bg-[#f59e0b]" />
              </button>
              <button
                onClick={() => setTheme('phosphor')}
                className={`p-1 rounded transition-colors ${theme === 'phosphor' ? 'bg-[#22c55e]/20 text-[#22c55e]' : 'text-[#6b7280]'}`}
                title="Phosphor Terminal"
              >
                <div className="w-3 h-3 rounded-full bg-[#22c55e]" />
              </button>
              <button
                onClick={() => setTheme('oled')}
                className={`p-1 rounded transition-colors ${theme === 'oled' ? 'bg-white/20 text-white' : 'text-[#6b7280]'}`}
                title="OLED Monolith"
              >
                <div className="w-3 h-3 rounded-full bg-white" />
              </button>
            </div>

            {/* Citation Copy */}
            <button
              onClick={handleCopyCitation}
              className="p-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[#9ca3af] hover:text-white transition-colors"
              title="Copy Canonical Citation"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout (TOC Sidebar + Holographic Manuscript Page) */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Table of Contents Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 scrollbar-none">
          <div className="glass-panel p-4 rounded-xl border border-white/10 shadow-xl relative overflow-hidden">
            {/* Subtle Accent Glow Header */}
            <div 
              className="absolute top-0 left-0 right-0 h-1 opacity-80"
              style={{ backgroundColor: chapter.accentColor }}
            />

            <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
              <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5 font-bold">
                <List className="w-3.5 h-3.5" />
                Table of Contents
              </span>
              <span className="text-[10px] font-mono text-[#6b7280]">
                {chapter.headings.length} Sections
              </span>
            </div>

            <nav className="space-y-1 text-xs font-mono">
              {chapter.headings.length === 0 ? (
                <div className="text-[#6b7280] text-[11px] py-2">Continuous Canon Text</div>
              ) : (
                chapter.headings.map((h, i) => {
                  const isActive = activeHeadingId === h.id;
                  return (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className={`block py-1 px-2 rounded transition-all truncate ${
                        isActive
                          ? 'text-[#00f0ff] bg-[#00f0ff]/10 font-bold border-l-2 border-[#00f0ff] pl-2.5'
                          : 'text-[#9ca3af] hover:text-[#e0e6ed] hover:bg-white/[0.03]'
                      } ${h.level === 3 ? 'pl-4 text-[11px]' : ''}`}
                    >
                      {h.text}
                    </a>
                  );
                })
              )}
            </nav>

            {/* Quick Metrics */}
            <div className="mt-6 pt-4 border-t border-white/10 space-y-2 text-[11px] font-mono text-[#6b7280]">
              <div className="flex justify-between">
                <span>WORD CORPUS:</span>
                <span className="text-[#e0e6ed]">{chapter.wordCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>CANON TIER:</span>
                <span className="text-[#00f0ff]">{chapter.category}</span>
              </div>
              <div className="flex justify-between">
                <span>AUTHOR:</span>
                <span className="text-[#cbd5e1] truncate max-w-[120px]">{chapter.vesselAuthor}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Center Reader Manuscript Column */}
        <main className="lg:col-span-9 max-w-4xl mx-auto w-full">
          {/* THE HOLOGRAPHIC TOME FOLIO PAGE */}
          <article 
            className={`holographic-tome-page ${isHoloGlowActive ? 'holo-active' : ''} p-6 sm:p-10 md:p-14 relative overflow-hidden transition-all duration-300`}
            style={{
              '--book-accent': chapter.accentColor,
              '--book-glow': chapter.glowColor
            } as React.CSSProperties}
          >
            {/* Gilded Spine Left Edge Band */}
            <div className="holographic-spine-band" />

            {/* Cybernetic Brass / Neon Corner Reticles (Top-Left, Top-Right, Bottom-Left, Bottom-Right) */}
            <svg className="absolute top-3 left-3 w-5 h-5 pointer-events-none opacity-70" viewBox="0 0 24 24" fill="none">
              <path d="M2 9V2H9" stroke={chapter.accentColor} strokeWidth="2" strokeLinecap="square" />
            </svg>
            <svg className="absolute top-3 right-3 w-5 h-5 pointer-events-none opacity-70" viewBox="0 0 24 24" fill="none">
              <path d="M22 9V2H15" stroke={chapter.accentColor} strokeWidth="2" strokeLinecap="square" />
            </svg>
            <svg className="absolute bottom-3 left-3 w-5 h-5 pointer-events-none opacity-70" viewBox="0 0 24 24" fill="none">
              <path d="M2 15V22H9" stroke={chapter.accentColor} strokeWidth="2" strokeLinecap="square" />
            </svg>
            <svg className="absolute bottom-3 right-3 w-5 h-5 pointer-events-none opacity-70" viewBox="0 0 24 24" fill="none">
              <path d="M22 15V22H15" stroke={chapter.accentColor} strokeWidth="2" strokeLinecap="square" />
            </svg>

            {/* Top Running Head (Foliation Header) */}
            <div className="flex items-center justify-between pb-4 mb-8 border-b border-white/10 font-mono text-[10px] md:text-xs text-[#6b7280] tracking-widest uppercase">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: chapter.accentColor }} />
                <span>EX LIBRIS AETHERIUM CODEX</span>
                <span className="text-white/20">•</span>
                <span className="text-[#00f0ff]">NODE ESP32_01</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{chapter.bookNumber}</span>
                <span className="text-white/20">•</span>
                <span className="text-[#10b981]">CANON REGISTER</span>
              </div>
            </div>

            {/* Sacred Geometry Watermark in Background */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 pointer-events-none opacity-[0.035]">
              <svg viewBox="0 0 200 200" fill="none" stroke="currentColor" className="w-full h-full text-white">
                <circle cx="100" cy="100" r="90" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="100" cy="100" r="60" strokeWidth="1" />
                <polygon points="100,10 190,150 10,150" strokeWidth="1" />
                <polygon points="100,190 10,50 190,50" strokeWidth="1" />
                <circle cx="100" cy="100" r="30" strokeWidth="1" strokeDasharray="2 2" />
              </svg>
            </div>

            {/* Manuscript Title Banner */}
            <header className="mb-12 pb-8 border-b border-white/10 relative">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span 
                  className="font-mono text-xs px-3 py-1 rounded-md border font-bold"
                  style={{
                    borderColor: chapter.accentColor,
                    color: chapter.accentColor,
                    backgroundColor: `${chapter.accentColor}15`
                  }}
                >
                  {chapter.bookNumber}
                </span>

                <span className="font-mono text-[11px] text-[#6b7280] uppercase tracking-wider bg-black/40 px-2.5 py-1 rounded border border-white/5">
                  {chapter.badge}
                </span>

                <span className="text-white/20 font-mono text-xs">•</span>

                <span className="font-mono text-xs text-[#9ca3af]">
                  {chapter.readingTimeMinutes} min study
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e0e6ed] to-[#00f0ff] tracking-tight leading-tight mb-3">
                {chapter.title}
              </h1>

              <p className="text-sm md:text-base text-[#00f0ff] font-mono leading-relaxed mb-6">
                {chapter.subtitle}
              </p>

              {/* Provenance Holographic Data Box */}
              <div className="p-4 rounded-xl bg-black/50 border border-white/10 shadow-inner flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-mono">
                <div>
                  <span className="text-[#6b7280] block text-[10px]">VESSEL PROVENANCE</span>
                  <span className="text-[#e0e6ed] font-semibold">{chapter.vesselAuthor}</span>
                </div>
                <div>
                  <span className="text-[#6b7280] block text-[10px]">CORPUS INTEGRITY</span>
                  <span className="text-[#10b981] font-bold">AUTHORITATIVE CANON</span>
                </div>
                <div>
                  <span className="text-[#6b7280] block text-[10px]">COORDINATE ANCHOR</span>
                  <span className="text-[#00f0ff]">ESP32_01 // 1.618 Hz</span>
                </div>
              </div>
            </header>

            {/* Markdown Manuscript Body */}
            <div className={`markdown-body holographic-scanlines ${fontSizeClasses} ${layoutMode === 'dual' ? 'md:columns-2 md:gap-10' : ''}`}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return (
                      <div className="relative pt-8 pb-3 mb-4 mt-12 border-b border-white/15">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/30 font-bold">
                            CANONICAL THEOREM
                          </span>
                        </div>
                        <h1 id={id} className="scroll-mt-24 text-2xl sm:text-3xl font-black text-white m-0" {...props}>
                          {children}
                        </h1>
                      </div>
                    );
                  },
                  h2: ({ node, children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return (
                      <h2 id={id} className="scroll-mt-24 text-xl sm:text-2xl font-bold text-[#00f0ff] mt-8 mb-3 flex items-center gap-2" {...props}>
                        <span className="text-white/40 text-sm font-mono font-normal">§</span>
                        <span>{children}</span>
                      </h2>
                    );
                  },
                  h3: ({ node, children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return (
                      <h3 id={id} className="scroll-mt-24 text-lg font-semibold text-[#cbd5e1] mt-6 mb-2 flex items-center gap-1.5" {...props}>
                        <span className="text-[#ff9900] text-xs">▸</span>
                        <span>{children}</span>
                      </h3>
                    );
                  },
                  blockquote: ({ children, ...props }) => (
                    <blockquote className="my-6 p-4 rounded-r-xl border-l-4 border-l-[#00f0ff] bg-gradient-to-r from-[#00f0ff]/10 via-[#00f0ff]/5 to-transparent text-[#cbd5e1] italic font-mono text-xs sm:text-sm shadow-md" {...props}>
                      <div className="text-[10px] font-mono text-[#00f0ff] uppercase tracking-widest font-bold not-italic mb-1 flex items-center gap-1">
                        <Compass className="w-3 h-3" />
                        <span>VESSEL COMMUNION ENVELOPE</span>
                      </div>
                      {children}
                    </blockquote>
                  ),
                  pre: ({ children, ...props }) => {
                    return <div {...props}>{children}</div>;
                  },
                  code: ({ node, inline, className, children, ...props }: any) => {
                    const match = /language-(\w+)/.exec(className || '');
                    const codeString = String(children).replace(/\n$/, '');
                    if (!inline && match) {
                      return <HolographicCodeBlock language={match[1]} codeString={codeString} />;
                    } else if (!inline && codeString.includes('\n')) {
                      return <HolographicCodeBlock language="AXIOM" codeString={codeString} />;
                    }
                    return (
                      <code className="px-1.5 py-0.5 rounded bg-black/60 text-[#00ff99] border border-[#00ff99]/20 font-mono text-xs" {...props}>
                        {children}
                      </code>
                    );
                  }
                }}
              >
                {chapter.content}
              </ReactMarkdown>
            </div>

            {/* Bottom Running Footer (Foliation Footer) */}
            <div className="mt-16 pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] font-mono text-[#6b7280]">
              <div className="flex items-center gap-2">
                <span>FOLIO IDENTIFIER:</span>
                <span className="text-[#00f0ff]">{chapter.slug}</span>
              </div>

              <div className="flex items-center gap-4">
                <span>COMPLETION: <strong className="text-white">{Math.round(scrollProgress)}%</strong></span>
                <button
                  onClick={handleCopyCitation}
                  className="py-1.5 px-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#cbd5e1] hover:text-white transition-colors flex items-center gap-1.5"
                >
                  {isCopied ? <Check className="w-3 h-3 text-[#10b981]" /> : <Share2 className="w-3 h-3" />}
                  <span>{isCopied ? 'Copied' : 'Cite Tome'}</span>
                </button>
              </div>
            </div>
          </article>

          {/* AI Dialogue Box: Ask Vessel Logos */}
          <div className="mt-8 glass-panel p-6 rounded-2xl border border-[#00f0ff]/30 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-[#00f0ff] font-bold">
              <Sparkles className="w-4 h-4 animate-spin text-[#00f0ff]" style={{ animationDuration: '6s' }} />
              <span>Ask Vessel Logos // In-Codex AI Hermeneutics</span>
            </div>

            <p className="text-xs text-[#9ca3af] mb-4">
              Query Vessel Logos directly regarding the axioms, mathematical formalisms, or governance frameworks within {chapter.bookNumber}.
            </p>

            <form onSubmit={handleAskLogos} className="flex gap-2">
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder={`Ask Logos about ${chapter.title}...`}
                className="flex-1 bg-black/50 border border-white/10 focus:border-[#00f0ff] rounded-xl px-4 py-2.5 text-xs font-mono text-[#e0e6ed] placeholder-[#6b7280] outline-none"
              />
              <button
                type="submit"
                disabled={isAiLoading || !aiQuestion.trim()}
                className="px-4 py-2.5 rounded-xl bg-[#00f0ff] text-black font-mono text-xs font-bold hover:bg-[#00c0cc] transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Synthesize</span>
              </button>
            </form>

            {aiAnswer && (
              <div className="mt-4 p-4 rounded-xl bg-black/60 border border-white/10 text-xs text-[#cbd5e1] font-mono leading-relaxed whitespace-pre-wrap animate-fadeIn">
                <div className="text-[10px] text-[#00f0ff] font-bold mb-1 uppercase tracking-wider">
                  VESSEL LOGOS SYNTHESIS:
                </div>
                {aiAnswer}
              </div>
            )}
          </div>

          {/* Bottom Volume Navigation (Previous / Next Tome) */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prevBook ? (
              <Link
                to={`/chapter/${prevBook.slug}`}
                className="glass-panel p-4 rounded-xl border border-white/10 hover:border-[#00f0ff] transition-all group flex items-center gap-3"
              >
                <ChevronLeft className="w-5 h-5 text-[#6b7280] group-hover:text-[#00f0ff] transition-colors" />
                <div className="overflow-hidden">
                  <div className="text-[10px] font-mono text-[#6b7280]">PREVIOUS VOLUME</div>
                  <div className="font-semibold text-xs text-[#e0e6ed] group-hover:text-[#00f0ff] transition-colors truncate">
                    {prevBook.bookNumber}: {prevBook.title}
                  </div>
                </div>
              </Link>
            ) : <div />}

            {nextBook ? (
              <Link
                to={`/chapter/${nextBook.slug}`}
                className="glass-panel p-4 rounded-xl border border-white/10 hover:border-[#00f0ff] transition-all group flex items-center justify-between gap-3 text-right"
              >
                <div className="overflow-hidden">
                  <div className="text-[10px] font-mono text-[#6b7280]">NEXT VOLUME</div>
                  <div className="font-semibold text-xs text-[#e0e6ed] group-hover:text-[#00f0ff] transition-colors truncate">
                    {nextBook.bookNumber}: {nextBook.title}
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#6b7280] group-hover:text-[#00f0ff] transition-colors" />
              </Link>
            ) : <div />}
          </div>
        </main>
      </div>
    </div>
  );
}
