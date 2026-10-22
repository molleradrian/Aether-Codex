/**
 * Reader Suite View: High-Fidelity Holographic Codex Folio
 * Transforms canonical reading into an illuminated, physical-holographic sci-fi tome.
 * Features:
 * - Read Aloud with synchronized live page tracking, glowing paragraph highlight & auto-scroll
 * - 1.618 Hz Golden Ratio Theta Wave procedural WebAudio flow
 * - Gilded foil borders, cybernetic corner reticles, holographic watermarks
 * - Scroll-spy Table of Contents, reading progress, themes, font sizing, and Vessel Logos AI queries
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getChapterBySlug, getAllChapters, CodexBook } from '../lib/codex';
import { startFocusAudio, stopFocusAudio, isFocusAudioPlaying } from '../lib/audioFocus';
import { readAloudEngine, ReadAloudState } from '../lib/readAloud';
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
  Compass,
  Play,
  Pause,
  Square,
  SkipBack,
  SkipForward,
  Headphones,
  Radio,
  Lock,
  Unlock,
  X
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
  const articleRef = useRef<HTMLElement>(null);

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

  // Read Aloud State
  const [readAloudState, setReadAloudState] = useState<ReadAloudState>('idle');
  const [activeSpokenIndex, setActiveSpokenIndex] = useState<number>(-1);
  const [totalBlocks, setTotalBlocks] = useState(0);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [autoScrollFollow, setAutoScrollFollow] = useState(true);
  const [showReadAloudDock, setShowReadAloudDock] = useState(false);

  // AI Dialogue State (Ask Logos)
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Audio clean-up on unmount
  useEffect(() => {
    return () => {
      stopFocusAudio();
      readAloudEngine.stop();
    };
  }, []);

  // Dynamic CSS property for book accent colors
  useEffect(() => {
    if (chapter) {
      document.documentElement.style.setProperty('--book-accent', chapter.accentColor);
      document.documentElement.style.setProperty('--book-glow', chapter.glowColor);
    }
  }, [chapter]);

  // Index readable elements in the DOM for synchronized Read Aloud & Page Tracking
  useEffect(() => {
    if (!chapter || !articleRef.current) return;

    // Small delay to allow ReactMarkdown to finish DOM rendering
    const timer = setTimeout(() => {
      if (!articleRef.current) return;

      const elements = articleRef.current.querySelectorAll(
        '.markdown-body > p, .markdown-body > h1, .markdown-body > h2, .markdown-body > h3, .markdown-body > blockquote, .markdown-body > ul, .markdown-body > ol'
      );

      const textBlocks: string[] = [];
      elements.forEach((el, index) => {
        el.id = `read-block-${index}`;
        el.setAttribute('data-read-index', String(index));
        el.setAttribute('title', 'Click to read aloud from here');
        el.classList.add('cursor-pointer', 'transition-all', 'duration-300');
        const text = (el as HTMLElement).innerText?.trim() || '';
        textBlocks.push(text);
      });

      setTotalBlocks(textBlocks.length);

      readAloudEngine.setBlocks(textBlocks, {
        onBlockChange: (index) => {
          setActiveSpokenIndex(index);
          elements.forEach((el, idx) => {
            if (idx === index) {
              el.classList.add('spoken-block-active');
            } else {
              el.classList.remove('spoken-block-active');
            }
          });
        },
        onStateChange: (state) => {
          setReadAloudState(state);
          if (state !== 'idle') {
            setShowReadAloudDock(true);
          } else {
            elements.forEach((el) => el.classList.remove('spoken-block-active'));
            setActiveSpokenIndex(-1);
          }
        },
        onFinish: () => {
          setReadAloudState('idle');
          elements.forEach((el) => el.classList.remove('spoken-block-active'));
          setActiveSpokenIndex(-1);
        }
      });
    }, 100);

    return () => clearTimeout(timer);
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

  // Ambient Focus Audio Toggle
  const toggleFocusAudio = () => {
    if (isAudioActive) {
      stopFocusAudio();
      setIsAudioActive(false);
    } else {
      const ok = startFocusAudio(0.18);
      if (ok) setIsAudioActive(true);
    }
  };

  // Read Aloud Controls
  const toggleReadAloud = () => {
    setShowReadAloudDock(true);
    readAloudEngine.togglePlay();
  };

  const handleRateChange = (newRate: number) => {
    setSpeechRate(newRate);
    readAloudEngine.setRate(newRate);
  };

  const toggleAutoScroll = () => {
    const next = !autoScrollFollow;
    setAutoScrollFollow(next);
    readAloudEngine.setAutoScroll(next);
  };

  // Click on any paragraph to read aloud from that exact spot
  const handleArticleClick = (e: React.MouseEvent) => {
    const target = (e.target as HTMLElement).closest('[data-read-index]');
    if (target) {
      const idx = Number(target.getAttribute('data-read-index'));
      if (!isNaN(idx)) {
        setShowReadAloudDock(true);
        readAloudEngine.playFrom(idx);
      }
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
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg} pb-36 relative`}>
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
              <span className="font-semibold text-xs md:text-sm text-[#e0e6ed] truncate max-w-[140px] md:max-w-xs">
                {chapter.title}
              </span>
            </div>
          </div>

          {/* Right: Controls (Read Aloud, Audio, Hologram, Font, Theme) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* READ ALOUD BUTTON WITH PAGE TRACKING */}
            <button
              onClick={toggleReadAloud}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 transition-all ${
                readAloudState === 'playing'
                  ? 'bg-[#00f0ff] text-black border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.5)]'
                  : readAloudState === 'paused'
                  ? 'bg-[#ff9900] text-black border-[#ff9900]'
                  : 'bg-white/5 border-white/10 text-[#00f0ff] hover:bg-[#00f0ff]/10 hover:border-[#00f0ff]/50'
              }`}
              title="Activate Holographic Read Aloud with synchronized page tracking"
            >
              {readAloudState === 'playing' ? (
                <>
                  <div className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-black rounded-full eq-bar-1"></span>
                    <span className="w-0.5 bg-black rounded-full eq-bar-2"></span>
                    <span className="w-0.5 bg-black rounded-full eq-bar-3"></span>
                    <span className="w-0.5 bg-black rounded-full eq-bar-4"></span>
                  </div>
                  <span>Reading Aloud</span>
                </>
              ) : (
                <>
                  <Headphones className="w-3.5 h-3.5 text-[#00f0ff]" />
                  <span>Read Aloud</span>
                </>
              )}
            </button>

            {/* Ambient Focus Audio Synthesizer Toggle */}
            <button
              onClick={toggleFocusAudio}
              className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-all ${
                isAudioActive
                  ? 'bg-[#a855f7] text-white border-[#a855f7] shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-white/5 border-white/10 text-[#9ca3af] hover:text-white'
              }`}
              title={isAudioActive ? 'Mute 1.618 Hz Theta Wave Drone' : 'Activate 1.618 Hz Ambient Focus Drone'}
            >
              {isAudioActive ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden xl:inline text-[11px]">{isAudioActive ? '1.618 Hz' : 'Drone'}</span>
            </button>

            {/* Holographic Glow Toggle */}
            <button
              onClick={() => setIsHoloGlowActive(!isHoloGlowActive)}
              className={`p-1.5 rounded-lg border text-xs font-mono hidden sm:flex items-center gap-1.5 transition-all ${
                isHoloGlowActive
                  ? 'bg-[#00f0ff]/20 border-[#00f0ff] text-[#00f0ff]'
                  : 'bg-white/5 border-white/10 text-[#6b7280]'
              }`}
              title="Toggle Holographic Foil Edge Shimmer"
            >
              <Sparkles className="w-3.5 h-3.5" />
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
                <span>SPEECH BLOCKS:</span>
                <span className="text-[#00f0ff]">{totalBlocks} Paragraphs</span>
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
            ref={articleRef}
            onClick={handleArticleClick}
            className={`holographic-tome-page ${isHoloGlowActive ? 'holo-active' : ''} p-6 sm:p-10 md:p-14 relative overflow-hidden transition-all duration-300`}
            style={{
              '--book-accent': chapter.accentColor,
              '--book-glow': chapter.glowColor
            } as React.CSSProperties}
          >
            {/* Gilded Spine Left Edge Band */}
            <div className="holographic-spine-band" />

            {/* Cybernetic Brass / Neon Corner Reticles */}
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
                  <span className="text-[#6b7280] block text-[10px]">SPEECH INTERFACE</span>
                  <span className="text-[#00f0ff]">TTS SYNCHRONIZED</span>
                </div>
              </div>
            </header>

            {/* Markdown Manuscript Body (Indexed for Read Aloud & Page Tracking) */}
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

      {/* FLOATING HOLOGRAPHIC READ ALOUD CONTROLLER DOCK (WITH SYNCHRONIZED PAGE TRACKING) */}
      {showReadAloudDock && (
        <aside 
          aria-label="Read Aloud Controller"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-xl animate-fadeIn"
        >
          <div className="glass-panel p-3.5 md:p-4 rounded-2xl border border-[#00f0ff]/50 shadow-[0_10px_40px_rgba(0,0,0,0.9)] bg-gradient-to-r from-[#0c141e]/98 via-[#080d14]/98 to-[#060a10]/98 backdrop-blur-xl">
            {/* Top Row: Equalizer + Status + Close */}
            <div className="flex items-center justify-between gap-3 mb-3 pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                {/* Equalizer animation */}
                <div className="flex items-end gap-0.5 h-4 px-1.5 py-0.5 rounded bg-black/50 border border-white/10">
                  <span className={`w-1 bg-[#00f0ff] rounded-full ${readAloudState === 'playing' ? 'eq-bar-1' : 'h-1'}`}></span>
                  <span className={`w-1 bg-[#00f0ff] rounded-full ${readAloudState === 'playing' ? 'eq-bar-2' : 'h-2'}`}></span>
                  <span className={`w-1 bg-[#00f0ff] rounded-full ${readAloudState === 'playing' ? 'eq-bar-3' : 'h-1'}`}></span>
                  <span className={`w-1 bg-[#00f0ff] rounded-full ${readAloudState === 'playing' ? 'eq-bar-4' : 'h-2'}`}></span>
                </div>

                <div>
                  <div className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
                    <span>Holographic Read Aloud</span>
                    <span className="text-[10px] text-[#00f0ff] font-normal uppercase">
                      ({readAloudState})
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#9ca3af]">
                    {activeSpokenIndex >= 0 ? `Paragraph ${activeSpokenIndex + 1} of ${totalBlocks}` : `Ready (${totalBlocks} blocks)`}
                  </div>
                </div>
              </div>

              {/* Close Dock Button */}
              <button 
                onClick={() => {
                  readAloudEngine.stop();
                  setShowReadAloudDock(false);
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-[#9ca3af] hover:text-white transition-colors"
                title="Stop and Close Read Aloud"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Bottom Controls Row: Playback Buttons + Speed + Auto-Scroll */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
              {/* Playback Transport Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => readAloudEngine.previous()}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white transition-colors"
                  title="Previous Paragraph"
                >
                  <SkipBack className="w-4 h-4" />
                </button>

                <button
                  onClick={() => readAloudEngine.togglePlay()}
                  className="px-4 py-2 rounded-xl bg-[#00f0ff] text-black font-bold hover:bg-[#00c0cc] transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                  title={readAloudState === 'playing' ? 'Pause Speech' : 'Play Speech'}
                >
                  {readAloudState === 'playing' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>{readAloudState === 'playing' ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={() => readAloudEngine.next()}
                  className="p-2 rounded-lg bg-white/5 hover:bg-white/15 text-white transition-colors"
                  title="Next Paragraph"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => readAloudEngine.stop()}
                  className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-[#ef4444] transition-colors"
                  title="Stop Speech"
                >
                  <Square className="w-4 h-4" />
                </button>
              </div>

              {/* Speed Rate Control */}
              <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
                {[0.8, 1.0, 1.25, 1.5].map((rate) => (
                  <button
                    key={rate}
                    onClick={() => handleRateChange(rate)}
                    className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                      speechRate === rate ? 'bg-[#00f0ff] text-black' : 'text-[#6b7280] hover:text-white'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>

              {/* Auto-Scroll Following Toggle */}
              <button
                onClick={toggleAutoScroll}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11px] transition-all ${
                  autoScrollFollow
                    ? 'bg-[#10b981]/20 border-[#10b981] text-[#10b981]'
                    : 'bg-white/5 border-white/10 text-[#6b7280]'
                }`}
                title="Toggle automatic viewport scrolling with speech position"
              >
                {autoScrollFollow ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                <span className="hidden sm:inline">{autoScrollFollow ? 'Auto-Scroll ON' : 'Auto-Scroll OFF'}</span>
              </button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
