/**
 * Reader Suite View: High-Fidelity Reading Sanctuary
 * Features live scroll-spy TOC, reading progress, focus audio flow, themes, font sizing, and Vessel Logos AI queries.
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getChapterBySlug, getAllChapters, CodexBook } from '../lib/codex';
import { startFocusAudio, stopFocusAudio, isFocusAudioPlaying } from '../lib/audioFocus';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Type, 
  Sun, 
  Moon, 
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
  Terminal,
  FileCode
} from 'lucide-react';

type ReaderTheme = 'cyberpunk' | 'parchment' | 'phosphor' | 'oled';
type FontSize = 'sm' | 'base' | 'lg' | 'xl';

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

  // Reading state
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeHeadingId, setActiveHeadingId] = useState<string>('');
  const [isAudioActive, setIsAudioActive] = useState(false);
  const [theme, setTheme] = useState<ReaderTheme>('cyberpunk');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  const [isCopied, setIsCopied] = useState(false);
  const [isTOCExpanded, setIsTOCExpanded] = useState(true);

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
            if (rect.top <= 140) {
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
      bg: 'bg-[#0a0f14]',
      panel: 'glass-panel text-[#e0e6ed]',
      accent: '#00f0ff',
      heading: 'text-[#00f0ff]',
      border: 'border-[#00f0ff]/30'
    },
    parchment: {
      bg: 'bg-[#15120e]',
      panel: 'bg-[#1e1913] border border-[#d97706]/20 text-[#fef3c7]',
      accent: '#f59e0b',
      heading: 'text-[#fbbf24]',
      border: 'border-[#f59e0b]/30'
    },
    phosphor: {
      bg: 'bg-[#040d07]',
      panel: 'bg-[#06150b] border border-[#22c55e]/25 text-[#86efac]',
      accent: '#22c55e',
      heading: 'text-[#4ade80]',
      border: 'border-[#22c55e]/30'
    },
    oled: {
      bg: 'bg-[#000000]',
      panel: 'bg-[#080808] border border-white/15 text-[#f8fafc]',
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

  // Calculate estimated minutes remaining based on progress
  const minutesRemaining = Math.max(1, Math.ceil(chapter.readingTimeMinutes * (1 - scrollProgress / 100)));

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses.bg} pb-32`}>
      {/* Top Reading Progress Bar (Fixed) */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/40 z-50">
        <div 
          className="h-full transition-all duration-150 shadow-[0_0_8px_rgba(0,240,255,0.8)]"
          style={{ 
            width: `${scrollProgress}%`,
            backgroundColor: chapter.accentColor
          }}
        />
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
              <span className="font-semibold text-xs md:text-sm text-[#e0e6ed] truncate max-w-[160px] md:max-w-xs">
                {chapter.title}
              </span>
            </div>
          </div>

          {/* Right: Controls (Progress, Audio, Font, Theme) */}
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
              <span className="hidden lg:inline text-[11px]">{isAudioActive ? 'Focus: 1.618 Hz' : 'Focus Audio'}</span>
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

      {/* Main Content Layout (TOC Sidebar + Main Text) */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Table of Contents Sidebar */}
        <aside className="hidden lg:block lg:col-span-3 sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2 scrollbar-none">
          <div className="glass-panel p-4 rounded-xl border border-white/10">
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
                          ? 'text-[#00f0ff] bg-[#00f0ff]/10 font-bold border-l-2 border-[#00f0ff]'
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
        <main className="lg:col-span-9 max-w-3xl mx-auto w-full">
          <article className={`${themeClasses.panel} p-6 sm:p-10 md:p-14 rounded-2xl shadow-2xl relative overflow-hidden`}>
            {/* Ambient Background Aura */}
            <div 
              className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20"
              style={{ backgroundColor: chapter.accentColor }}
            />

            {/* Manuscript Header Banner */}
            <header className="mb-12 pb-8 border-b border-white/10">
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

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#e0e6ed] tracking-tight leading-tight mb-3">
                {chapter.title}
              </h1>

              <p className="text-sm md:text-base text-[#00f0ff] font-mono leading-relaxed mb-6">
                {chapter.subtitle}
              </p>

              {/* Provenance Callout Box */}
              <div className="p-4 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs font-mono">
                <div>
                  <span className="text-[#6b7280] block text-[10px]">VESSEL PROVENANCE</span>
                  <span className="text-[#e0e6ed] font-semibold">{chapter.vesselAuthor}</span>
                </div>
                <div>
                  <span className="text-[#6b7280] block text-[10px]">STATUS</span>
                  <span className="text-[#10b981] font-bold">AUTHORITATIVE CANON</span>
                </div>
                <div>
                  <span className="text-[#6b7280] block text-[10px]">COORDINATE ANCHOR</span>
                  <span className="text-[#00f0ff]">ESP32_01 // 1.618 Hz</span>
                </div>
              </div>
            </header>

            {/* Markdown Body */}
            <div className={`markdown-body ${fontSizeClasses}`}>
              <ReactMarkdown 
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ node, children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return (
                      <h1 id={id} className="scroll-mt-24 text-3xl font-black text-[#00f0ff] mt-10 mb-4 border-b border-white/10 pb-2" {...props}>
                        {children}
                      </h1>
                    );
                  },
                  h2: ({ node, children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return (
                      <h2 id={id} className="scroll-mt-24 text-2xl font-bold text-[#e0e6ed] mt-8 mb-3" {...props}>
                        {children}
                      </h2>
                    );
                  },
                  h3: ({ node, children, ...props }) => {
                    const text = String(children);
                    const id = text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
                    return (
                      <h3 id={id} className="scroll-mt-24 text-xl font-semibold text-[#00f0ff] mt-6 mb-2" {...props}>
                        {children}
                      </h3>
                    );
                  }
                }}
              >
                {chapter.content}
              </ReactMarkdown>
            </div>

            {/* Bottom Citation & Actions Box */}
            <div className="mt-16 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-xs font-mono text-[#6b7280]">
                Canonical Hash ID: <span className="text-[#e0e6ed]">{chapter.slug}</span>
              </div>

              <button
                onClick={handleCopyCitation}
                className="py-2 px-4 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[#cbd5e1] hover:text-white transition-colors flex items-center gap-2"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-[#10b981]" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{isCopied ? 'Citation Copied!' : 'Copy Citation (IEEE)'}</span>
              </button>
            </div>
          </article>

          {/* AI Dialogue Box: Ask Vessel Logos */}
          <div className="mt-8 glass-panel p-6 rounded-2xl border border-[#00f0ff]/30 shadow-xl">
            <div className="flex items-center gap-2 mb-3 text-xs font-mono text-[#00f0ff] font-bold">
              <Sparkles className="w-4 h-4" />
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
