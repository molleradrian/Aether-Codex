/**
 * Digital Library View: The Imperial Aetherium Codex Library
 * Features 3D Holographic Bookshelf, Tomes Grid, and Scholarly Archive modes.
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllChapters, CodexBook } from '../lib/codex';
import EmergenceVisualizer from '../components/EmergenceVisualizer';
import { 
  BookOpen, 
  Library, 
  Grid3X3, 
  ListFilter, 
  Search, 
  Clock, 
  Sparkles, 
  Layers, 
  ChevronRight, 
  ShieldCheck, 
  Cpu, 
  Eye, 
  X,
  Compass,
  FileText,
  Activity
} from 'lucide-react';

export default function DigitalLibraryView() {
  const allBooks = useMemo(() => getAllChapters(), []);
  const [viewMode, setViewMode] = useState<'shelf' | 'grid' | 'table'>('shelf');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [previewBook, setPreviewBook] = useState<CodexBook | null>(null);
  const [showEmergenceResonance, setShowEmergenceResonance] = useState(false);

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    allBooks.forEach(b => set.add(b.category));
    return ['All', ...Array.from(set)];
  }, [allBooks]);

  // Telemetry metrics
  const totalWords = useMemo(() => allBooks.reduce((acc, b) => acc + b.wordCount, 0), [allBooks]);
  const totalReadingMinutes = useMemo(() => allBooks.reduce((acc, b) => acc + b.readingTimeMinutes, 0), [allBooks]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return allBooks.filter((book) => {
      const matchesCategory = selectedCategory === 'All' || book.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesQuery = 
        book.title.toLowerCase().includes(q) ||
        book.subtitle.toLowerCase().includes(q) ||
        book.bookNumber.toLowerCase().includes(q) ||
        book.vesselAuthor.toLowerCase().includes(q) ||
        book.summary.toLowerCase().includes(q) ||
        book.keyAxioms.some(a => a.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [allBooks, selectedCategory, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto pb-24">
      {/* Imperial Library Header */}
      <header className="mb-10 text-center relative">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00f0ff]/30 bg-[#00f0ff]/10 text-[#00f0ff] font-mono text-xs tracking-widest uppercase mb-4">
          <Library className="w-3.5 h-3.5 animate-pulse" />
          <span>Imperial Codex Archive // Node ESP32_01</span>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#00f0ff] via-[#ffffff] to-[#ff9900] tracking-wider uppercase mb-3">
          The Digital Library
        </h1>
        <p className="text-[#9ca3af] max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          The complete, authoritative canon of the Aetherium Hub and Operating System for Emergence (OS/E). Enshrining eleven foundational volumes across topological calculus, agentic swarms, and spatiotemporal telemetry.
        </p>

        {/* Global Telemetry HUD */}
        <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto text-left">
          <div className="glass-panel p-3.5 border-l-2 border-l-[#00f0ff]">
            <div className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3 h-3 text-[#00f0ff]" /> Total Volumes
            </div>
            <div className="text-xl font-bold text-[#e0e6ed] mt-0.5">{allBooks.length} <span className="text-xs text-[#00f0ff] font-mono">Tomes</span></div>
          </div>

          <div className="glass-panel p-3.5 border-l-2 border-l-[#eab308]">
            <div className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="w-3 h-3 text-[#eab308]" /> Lexicon Corpus
            </div>
            <div className="text-xl font-bold text-[#e0e6ed] mt-0.5">{totalWords.toLocaleString()} <span className="text-xs text-[#eab308] font-mono">Words</span></div>
          </div>

          <div className="glass-panel p-3.5 border-l-2 border-l-[#10b981]">
            <div className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-[#10b981]" /> Study Duration
            </div>
            <div className="text-xl font-bold text-[#e0e6ed] mt-0.5">~{(totalReadingMinutes / 60).toFixed(1)} <span className="text-xs text-[#10b981] font-mono">Hours</span></div>
          </div>

          <div className="glass-panel p-3.5 border-l-2 border-l-[#a855f7]">
            <div className="text-[11px] font-mono text-[#6b7280] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-[#a855f7]" /> Canon Attestation
            </div>
            <div className="text-xl font-bold text-[#e0e6ed] mt-0.5">100% <span className="text-xs text-[#a855f7] font-mono">Verified</span></div>
          </div>
        </div>

        {/* Emergence Visualizer Toggle Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowEmergenceResonance(!showEmergenceResonance)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/10 bg-black/40 hover:border-[#00f0ff]/50 text-xs font-mono text-[#9ca3af] hover:text-[#00f0ff] transition-all cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5 text-[#eab308]" />
            <span>{showEmergenceResonance ? 'Hide Emergence Math Visualizer' : 'Open Emergence Math Visualizer (⊕, ⊗, ⊛)'}</span>
          </button>
        </div>

        {showEmergenceResonance && (
          <div className="mt-6 text-left animate-fadeIn max-w-4xl mx-auto">
            <EmergenceVisualizer />
          </div>
        )}
      </header>

      {/* Control Toolbar: Search, Category Filters & View Mode */}
      <div className="mb-8 glass-panel p-4 md:p-5 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#6b7280] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search volumes, axioms, authors..."
            className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.1)] focus:border-[#00f0ff] rounded-lg pl-9 pr-4 py-2 text-xs md:text-sm text-[#e0e6ed] placeholder-[#6b7280] outline-none transition-colors"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6b7280] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1.5 bg-[rgba(0,0,0,0.5)] p-1 rounded-lg border border-[rgba(255,255,255,0.08)] self-stretch md:self-auto justify-center">
          <button
            onClick={() => setViewMode('shelf')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'shelf'
                ? 'bg-[#00f0ff] text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-[#9ca3af] hover:text-[#e0e6ed]'
            }`}
            title="3D Bookshelf View"
          >
            <Library className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3D Bookshelf</span>
          </button>

          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'grid'
                ? 'bg-[#00f0ff] text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-[#9ca3af] hover:text-[#e0e6ed]'
            }`}
            title="Holographic Tomes Grid"
          >
            <Grid3X3 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Tomes Grid</span>
          </button>

          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              viewMode === 'table'
                ? 'bg-[#00f0ff] text-black shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                : 'text-[#9ca3af] hover:text-[#e0e6ed]'
            }`}
            title="Scholarly Archive List"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Archive List</span>
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none text-xs">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full border transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'border-[#00f0ff] bg-[#00f0ff]/15 text-[#00f0ff] font-semibold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                : 'border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.02)] text-[#9ca3af] hover:border-[rgba(255,255,255,0.2)] hover:text-[#e0e6ed]'
            }`}
          >
            {cat} {cat === 'All' ? `(${allBooks.length})` : ''}
          </button>
        ))}
      </div>

      {/* Results Count If Searching */}
      {searchQuery && (
        <div className="mb-6 text-xs text-[#6b7280] font-mono">
          Showing {filteredBooks.length} of {allBooks.length} volumes matching "{searchQuery}"
        </div>
      )}

      {/* VIEW MODE 1: 3D HOLOGRAPHIC BOOKSHELF */}
      {viewMode === 'shelf' && (
        <div className="space-y-16">
          <div className="relative pt-12 pb-16 px-4 md:px-8 bg-gradient-to-b from-[rgba(10,15,22,0.85)] via-[rgba(15,22,33,0.95)] to-[rgba(8,12,18,0.9)] rounded-2xl border border-[rgba(255,255,255,0.08)] shadow-2xl overflow-hidden">
            {/* Ambient Backlight Behind Shelf */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-28 bg-[#00f0ff]/5 blur-3xl pointer-events-none" />

            {/* Instruction banner */}
            <div className="text-center mb-10">
              <span className="text-[11px] font-mono text-[#6b7280] uppercase tracking-widest flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#00f0ff]" />
                Select any tome spine to inspect or read
              </span>
            </div>

            {/* The Physical / Holographic Book Shelf */}
            <div className="relative flex flex-wrap sm:flex-nowrap justify-center items-end gap-2 md:gap-3.5 min-h-[340px] px-2">
              {filteredBooks.map((book) => {
                // Determine spine width based on word count
                const spineWidth = book.wordCount > 5000 ? 'w-14 md:w-16' : book.wordCount > 2000 ? 'w-11 md:w-13' : 'w-10 md:w-11';
                
                return (
                  <div
                    key={book.slug}
                    onClick={() => setPreviewBook(book)}
                    className={`group relative cursor-pointer select-none transition-all duration-300 transform hover:-translate-y-6 hover:scale-105 ${spineWidth}`}
                    style={{ perspective: '800px' }}
                  >
                    {/* Floating Tooltip / Badge on Hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none absolute -top-14 left-1/2 -translate-x-1/2 z-30 whitespace-nowrap px-2.5 py-1 rounded bg-black/90 border border-[#00f0ff]/50 text-[#00f0ff] font-mono text-[10px] shadow-lg flex items-center gap-1.5">
                      <span>{book.bookNumber}</span>
                      <span className="text-white/40">•</span>
                      <span className="text-white">{book.readingTimeMinutes} min</span>
                    </div>

                    {/* Book Spine (Vertical Hardcover) */}
                    <div 
                      className="relative h-[280px] md:h-[320px] rounded-t-sm border border-white/10 shadow-2xl flex flex-col justify-between p-2 overflow-hidden transition-all duration-300"
                      style={{
                        background: `linear-gradient(180deg, ${book.accentColor}25 0%, rgba(12,18,26,0.95) 20%, rgba(10,14,20,0.98) 80%, ${book.accentColor}35 100%)`,
                        boxShadow: `0 10px 30px rgba(0,0,0,0.8), inset -2px 0 6px rgba(255,255,255,0.1), inset 2px 0 6px rgba(0,0,0,0.5)`,
                        borderTop: `3px solid ${book.accentColor}`
                      }}
                    >
                      {/* Top Spine: Book Roman Numeral */}
                      <div className="text-center pt-1">
                        <div 
                          className="w-6 h-6 mx-auto rounded-full border flex items-center justify-center text-[10px] font-mono font-bold"
                          style={{ 
                            borderColor: `${book.accentColor}60`, 
                            color: book.accentColor,
                            backgroundColor: `${book.accentColor}15`
                          }}
                        >
                          {book.numeral}
                        </div>
                      </div>

                      {/* Middle Spine: Vertical Embossed Title */}
                      <div className="flex-1 flex items-center justify-center my-2 overflow-hidden">
                        <div 
                          className="font-mono text-[11px] md:text-xs font-semibold tracking-wider uppercase text-[#e0e6ed] group-hover:text-[#00f0ff] transition-colors whitespace-nowrap"
                          style={{ 
                            writingMode: 'vertical-rl',
                            transform: 'rotate(180deg)',
                            maxHeight: '190px',
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                          }}
                        >
                          {book.title}
                        </div>
                      </div>

                      {/* Bottom Spine: Decorative Gold / Neon Foil Ribs */}
                      <div className="pb-1 text-center">
                        <div 
                          className="h-1 w-full mx-auto rounded mb-1.5 opacity-80"
                          style={{ backgroundColor: book.accentColor }}
                        />
                        <div className="text-[8px] font-mono text-[#6b7280] tracking-tighter truncate">
                          {book.numeral}
                        </div>
                      </div>

                      {/* Bookmark Ribbon Hanging off bottom */}
                      <div 
                        className="absolute bottom-0 right-2 w-1.5 h-6 rounded-b-sm shadow-md"
                        style={{ backgroundColor: book.accentColor }}
                      />
                    </div>

                    {/* Book Contact Shadow on Shelf */}
                    <div className="w-full h-3 bg-black/60 blur-xs rounded-full mt-0.5 mx-auto transition-transform group-hover:scale-75 group-hover:opacity-40" />
                  </div>
                );
              })}
            </div>

            {/* Shelf Plank (Physical Beam Surface) */}
            <div className="relative w-full mt-1">
              {/* Glass / Metallic Beam Top Edge */}
              <div className="h-4 bg-gradient-to-r from-[#00f0ff]/20 via-[#ffffff]/20 to-[#ff9900]/20 rounded-t-sm border-t border-b border-white/20 shadow-[0_0_15px_rgba(0,240,255,0.15)]" />
              {/* Shelf Depth Under-beam */}
              <div className="h-6 bg-gradient-to-b from-[#0e1622] to-[#06090e] border-b border-white/5 flex items-center justify-between px-6">
                <span className="text-[9px] font-mono text-[#4b5563] tracking-widest uppercase">SECTION ARCHIVE // CANONICAL TOMES 00–09</span>
                <span className="text-[9px] font-mono text-[#00f0ff] tracking-widest uppercase">HARMONIC RES: 1.618 Hz</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: HOLOGRAPHIC TOMES GRID */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.slug}
              className="glass-panel p-6 rounded-xl border border-[rgba(255,255,255,0.08)] hover:border-[#00f0ff]/50 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
              style={{
                background: `linear-gradient(145deg, rgba(16,24,36,0.9), rgba(8,12,18,0.95))`
              }}
            >
              {/* Accent Glow Top Border */}
              <div 
                className="absolute top-0 left-0 right-0 h-1"
                style={{ backgroundColor: book.accentColor }}
              />

              <div>
                {/* Header: Book Numeral + Badge */}
                <div className="flex justify-between items-start mb-4">
                  <span 
                    className="font-mono text-xs px-2.5 py-1 rounded border font-bold"
                    style={{
                      borderColor: `${book.accentColor}50`,
                      color: book.accentColor,
                      backgroundColor: `${book.accentColor}15`
                    }}
                  >
                    {book.bookNumber}
                  </span>

                  <span className="text-[10px] font-mono text-[#6b7280] tracking-wider uppercase bg-black/40 px-2 py-1 rounded border border-white/5">
                    {book.category}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="text-xl font-bold text-[#e0e6ed] group-hover:text-[#00f0ff] transition-colors mb-2 leading-snug">
                  {book.title}
                </h3>
                <p className="text-xs text-[#9ca3af] font-mono mb-4 leading-relaxed line-clamp-2">
                  {book.subtitle}
                </p>

                {/* Summary */}
                <p className="text-xs text-[#cbd5e1] mb-5 leading-relaxed line-clamp-3">
                  {book.summary}
                </p>

                {/* Key Axioms Pills */}
                <div className="space-y-1.5 mb-6">
                  <div className="text-[10px] font-mono text-[#6b7280] uppercase tracking-wider">Canonical Axioms:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {book.keyAxioms.slice(0, 2).map((axiom, idx) => (
                      <span 
                        key={idx}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/50 text-[#94a3b8] border border-white/5 truncate max-w-full"
                      >
                        {axiom}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Footer: Stats & CTA Buttons */}
              <div>
                <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs text-[#6b7280] font-mono mb-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#00f0ff]" /> {book.readingTimeMinutes} min
                  </span>
                  <span>{book.wordCount.toLocaleString()} words</span>
                  <span className="truncate max-w-[100px] text-right">{book.vesselAuthor.split('&')[0]}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setPreviewBook(book)}
                    className="w-full py-2 px-3 rounded-lg border border-[rgba(255,255,255,0.15)] hover:border-[#00f0ff] text-xs font-mono text-[#e0e6ed] hover:text-[#00f0ff] transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Dossier</span>
                  </button>

                  <Link
                    to={`/chapter/${book.slug}`}
                    className="w-full py-2 px-3 rounded-lg bg-[#00f0ff] hover:bg-[#00c0cc] text-black text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                  >
                    <span>Read Tome</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE 3: SCHOLARLY ARCHIVE TABLE */}
      {viewMode === 'table' && (
        <div className="glass-panel rounded-xl overflow-hidden border border-[rgba(255,255,255,0.08)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black/60 border-b border-white/10 text-[#6b7280] uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Tome</th>
                  <th className="py-3 px-4">Title & Subtitle</th>
                  <th className="py-3 px-4">Domain Category</th>
                  <th className="py-3 px-4">Author / Vessel</th>
                  <th className="py-3 px-4 text-right">Words</th>
                  <th className="py-3 px-4 text-right">Duration</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-[#cbd5e1]">
                {filteredBooks.map((book) => (
                  <tr 
                    key={book.slug}
                    className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                    onClick={() => setPreviewBook(book)}
                  >
                    <td className="py-3.5 px-4 font-bold" style={{ color: book.accentColor }}>
                      {book.bookNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-sans font-semibold text-sm text-[#e0e6ed] group-hover:text-[#00f0ff] transition-colors">
                        {book.title}
                      </div>
                      <div className="text-[11px] text-[#6b7280] truncate max-w-md">
                        {book.subtitle}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#94a3b8]">
                      <span className="px-2 py-0.5 rounded bg-black/40 border border-white/5">
                        {book.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#94a3b8] truncate max-w-[160px]">
                      {book.vesselAuthor}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#94a3b8]">
                      {book.wordCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right text-[#00f0ff]">
                      {book.readingTimeMinutes} min
                    </td>
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <Link
                        to={`/chapter/${book.slug}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff] hover:text-black font-semibold transition-all text-[11px]"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* HOLOGRAPHIC TOME PREVIEW DOSSIER MODAL */}
      {previewBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div 
            className="glass-panel w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-[rgba(255,255,255,0.15)] shadow-[0_0_50px_rgba(0,0,0,0.9)] p-6 md:p-8 relative"
            style={{
              background: `linear-gradient(160deg, rgba(16,24,36,0.98), rgba(8,12,18,0.99))`,
              boxShadow: `0 0 40px ${previewBook.glowColor}`
            }}
          >
            {/* Close Button */}
            <button 
              onClick={() => setPreviewBook(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-[#9ca3af] hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Dossier Header */}
            <div className="flex items-center gap-3 mb-4">
              <span 
                className="font-mono text-xs px-3 py-1 rounded-md border font-bold"
                style={{
                  borderColor: previewBook.accentColor,
                  color: previewBook.accentColor,
                  backgroundColor: `${previewBook.accentColor}15`
                }}
              >
                {previewBook.bookNumber}
              </span>
              <span className="font-mono text-xs text-[#6b7280] uppercase tracking-wider">
                {previewBook.badge}
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-[#e0e6ed] mb-1">
              {previewBook.title}
            </h2>
            <p className="text-sm text-[#00f0ff] font-mono mb-6">
              {previewBook.subtitle}
            </p>

            {/* Telemetry Stats Bar */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-black/40 border border-white/5 mb-6 text-xs font-mono">
              <div>
                <span className="text-[#6b7280] block text-[10px]">READING DURATION</span>
                <span className="text-white font-bold">{previewBook.readingTimeMinutes} Minutes</span>
              </div>
              <div>
                <span className="text-[#6b7280] block text-[10px]">WORD CORPUS</span>
                <span className="text-white font-bold">{previewBook.wordCount.toLocaleString()} Words</span>
              </div>
              <div>
                <span className="text-[#6b7280] block text-[10px]">VESSEL PROVENANCE</span>
                <span className="text-[#00f0ff] font-bold truncate block">{previewBook.vesselAuthor}</span>
              </div>
            </div>

            {/* Executive Synopsis */}
            <div className="mb-6">
              <h4 className="text-xs font-mono text-[#9ca3af] uppercase tracking-wider mb-2">Executive Synopsis:</h4>
              <p className="text-sm text-[#cbd5e1] leading-relaxed bg-white/[0.02] p-4 rounded-xl border border-white/5">
                {previewBook.summary}
              </p>
            </div>

            {/* Canonical Axioms */}
            <div className="mb-8">
              <h4 className="text-xs font-mono text-[#9ca3af] uppercase tracking-wider mb-2">Canonical Axioms & Theorems:</h4>
              <div className="space-y-2">
                {previewBook.keyAxioms.map((axiom, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs font-mono text-[#94a3b8] bg-black/40 p-2.5 rounded-lg border border-white/5">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: previewBook.accentColor }} />
                    <span>{axiom}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex gap-3">
              <button
                onClick={() => setPreviewBook(null)}
                className="py-3 px-5 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-mono text-[#9ca3af] transition-colors"
              >
                Close Dossier
              </button>

              <Link
                to={`/chapter/${previewBook.slug}`}
                onClick={() => setPreviewBook(null)}
                className="flex-1 py-3 px-6 rounded-xl bg-[#00f0ff] hover:bg-[#00c0cc] text-black font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.4)]"
              >
                <BookOpen className="w-4 h-4" />
                <span>Launch Full Reader Suite</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
