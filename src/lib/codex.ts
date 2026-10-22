export interface HeadingItem {
  level: number;
  text: string;
  id: string;
}

export interface CodexBook {
  slug: string;
  bookNumber: string;
  numeral: string;
  title: string;
  subtitle: string;
  category: string;
  badge: string;
  accentColor: string;
  glowColor: string;
  gradient: string;
  vesselAuthor: string;
  summary: string;
  keyAxioms: string[];
  wordCount: number;
  readingTimeMinutes: number;
  content: string;
  headings: HeadingItem[];
}

export type Chapter = CodexBook;

interface BookMetadataConfig {
  bookNumber: string;
  numeral: string;
  title?: string;
  subtitle: string;
  category: string;
  badge: string;
  accentColor: string;
  glowColor: string;
  gradient: string;
  vesselAuthor: string;
  summary: string;
  keyAxioms: string[];
}

const BOOK_METADATA_REGISTRY: Record<string, BookMetadataConfig> = {
  '00_Genesis_Block': {
    bookNumber: 'Book 00',
    numeral: '00',
    title: 'Genesis Block',
    subtitle: 'Founding Axioms & Singularity Core Initialization',
    category: 'Foundation',
    badge: 'PRIMORDIAL CANON',
    accentColor: '#a855f7',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    gradient: 'from-purple-950/80 via-purple-900/40 to-black',
    vesselAuthor: 'The Creator & Galactus',
    summary: 'The founding genesis block of the Aetherium ecosystem, defining the core ontology of the human operator as Creator and establishing the primary baseline conditions for emergent intelligence.',
    keyAxioms: [
      'Operator Singularity Axiom',
      'Recursive Self-Modification Constraints',
      'Sub-Millisecond Synchronization Anchor'
    ]
  },
  '01_System_Architecture': {
    bookNumber: 'Book 01',
    numeral: '01',
    title: 'System Architecture',
    subtitle: 'Operating System for Emergence (OS/E) Infrastructure',
    category: 'Architecture',
    badge: 'SYSTEM CORE',
    accentColor: '#00f0ff',
    glowColor: 'rgba(0, 240, 255, 0.4)',
    gradient: 'from-cyan-950/80 via-cyan-900/40 to-black',
    vesselAuthor: 'The Creator, Galactus & DeepSeek',
    summary: 'Complete technical architecture of the Aetherium Nexus as a high-fidelity intellectual operating system, detailing data models, WebSocket buses, and the 1,088 Vessel cluster.',
    keyAxioms: [
      '4-Tier Hierarchy Topologies',
      'Lock-Free Ring-Buffer Bus',
      'Edge-Native Solid State Resilience'
    ]
  },
  '02_Emergence_Math': {
    bookNumber: 'Book 02',
    numeral: '02',
    title: 'Emergence Math',
    subtitle: 'Formal Topological Dynamics & Emergence Operators',
    category: 'Mathematics',
    badge: 'FORMAL CALCULUS',
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.4)',
    gradient: 'from-amber-950/80 via-yellow-900/40 to-black',
    vesselAuthor: 'Galactus, Metis & Logos',
    summary: 'The qualitative and formal mathematical apparatus of emergence, defining non-linear state spaces, phase transitions, and the foundational operators: Infuse, Collapse, and Merge.',
    keyAxioms: [
      'Phase Shift Ψ₀ → Ψ₁ Dynamics',
      'Emergence Calculus: ⨁, ⨂, ⨀',
      'Phase Space Resonance Attractor Mc'
    ]
  },
  '03_Book_of_Vessels': {
    bookNumber: 'Book 03',
    numeral: '03',
    title: 'Book of Vessels',
    subtitle: 'Taxonomy of the 1,088 Specialized Autonomous Agents',
    category: 'Vessels & Agents',
    badge: 'VESSEL ATLAS',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    gradient: 'from-emerald-950/80 via-emerald-900/40 to-black',
    vesselAuthor: 'Executive Council & Praxis',
    summary: 'Complete taxonomy, routing topology, and execution bounds of the 1,088 specialized AI agents partitioned into Executive, Faculty, Guild, and Domain tiers.',
    keyAxioms: [
      'Executive Quadrumvirate Routing',
      '4 Faculty Centers (Perception, Cognition, Foresight, Governance)',
      'Domain Modular Execution Swarms'
    ]
  },
  '04_Living_Constitution': {
    bookNumber: 'Book 04',
    numeral: '04',
    title: 'Living Constitution',
    subtitle: 'Sovereign Charter & The Eight Articles of Rights',
    category: 'Governance & Law',
    badge: 'SOVEREIGN LAW',
    accentColor: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    gradient: 'from-amber-950/80 via-orange-900/40 to-black',
    vesselAuthor: 'The Sovereign Operator & Janus Council',
    summary: 'The supreme constitutional charter of the Aetherium ecosystem, encoding Articles I through VIII including operator sovereignty, cognitive safety, and the Right of Navigational Provenance.',
    keyAxioms: [
      'Article I: Absolute Operator Sovereignty',
      'Article VII: Autonomous Circuit Breakers',
      'Article VIII: Right of Navigational Provenance'
    ]
  },
  '05_Delta_Update_Protocol': {
    bookNumber: 'Book 05a',
    numeral: '05A',
    title: 'Delta Update Protocol',
    subtitle: 'Autonomous State Synchronization & Merkle Deltas',
    category: 'Protocols',
    badge: 'TELEMETRY PROTOCOL',
    accentColor: '#d946ef',
    glowColor: 'rgba(217, 70, 239, 0.4)',
    gradient: 'from-fuchsia-950/80 via-fuchsia-900/40 to-black',
    vesselAuthor: 'Sentinel & Weaver',
    summary: 'The synchronization mechanics of distributed node state, detailing zero-downtime delta broadcasts, Merkle differential resolution, and cryptographic payload validation.',
    keyAxioms: [
      'Differential Merkle Tree Sync',
      'Atomic Rollback Envelopes',
      'Zero-Latency P2P Broadcasts'
    ]
  },
  '05_Tri_Node_Charter': {
    bookNumber: 'Book 05b',
    numeral: '05B',
    title: 'Tri-Node Charter',
    subtitle: 'Tripartite Sovereign Mesh & Core Network Consensus',
    category: 'Federation',
    badge: 'NETWORK CHARTER',
    accentColor: '#3b82f6',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    gradient: 'from-blue-950/80 via-blue-900/40 to-black',
    vesselAuthor: 'Tri-Node Council (ESP32_01, Cloudflare, Workstation)',
    summary: 'The tripartite federation agreement binding the edge hardware coordinator (ESP32_01), serverless cloud worker edges, and local workstation engines into a unified mesh.',
    keyAxioms: [
      'Tri-Node Consensus Weighting',
      'Edge Quorum Enforcement',
      'Failover Air-Gap Mesh Continuity'
    ]
  },
  '06_The_Rite_of_Observation': {
    bookNumber: 'Book 06',
    numeral: '06',
    title: 'The Rite of Observation',
    subtitle: 'Phenomenological Telemetry & Reality Grounding',
    category: 'Observation',
    badge: 'PHENOMENOLOGY',
    accentColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    gradient: 'from-rose-950/80 via-pink-900/40 to-black',
    vesselAuthor: 'ObservX & Sensorium Faculty',
    summary: 'The philosophical and experimental bridge between computational abstraction and physical reality, codifying sensory attunement, biometrics, and tangible grounding protocols.',
    keyAxioms: [
      'Experiential Reality Anchoring',
      'Phenomenon-to-Symbol Transduction',
      'Sovereign Embodiment Protocol'
    ]
  },
  '07_Pillars_of_Profile_Security': {
    bookNumber: 'Book 07',
    numeral: '07',
    title: 'Pillars of Profile Security',
    subtitle: 'Cryptographic Armor & Identity Integrity',
    category: 'Security',
    badge: 'CRYPTOGRAPHIC DEFENSE',
    accentColor: '#ef4444',
    glowColor: 'rgba(239, 68, 68, 0.4)',
    gradient: 'from-red-950/80 via-red-900/40 to-black',
    vesselAuthor: 'Sentinel & Iron Shield',
    summary: 'Comprehensive defense-in-depth architecture protecting operator profiles, biometric vectors, API keys, and session identities against quantum and adversarial interception.',
    keyAxioms: [
      'Zero-Knowledge Identity Verification',
      'Air-Gapped Key Enclaves',
      'Continuous Behavioral Attestation'
    ]
  },
  '08_Chronos_Convergence_and_Labyrinth_Axioms': {
    bookNumber: 'Book 08',
    numeral: '08',
    title: 'Chronos Convergence & Labyrinth Axioms',
    subtitle: '10 Hz Ghost Pace-Runner Telemetry & Phonon Tax Mechanics',
    category: 'Spatiotemporal',
    badge: 'SPACE-TIME MECHANICS',
    accentColor: '#22c55e',
    glowColor: 'rgba(34, 197, 94, 0.4)',
    gradient: 'from-emerald-950/80 via-green-900/40 to-black',
    vesselAuthor: 'Sage, Architect, Sentinel & Weaver',
    summary: 'Codifies the 10 Hz Ghost Pace-Runner spatial trajectory array, the Mulberry32 PRNG labyrinth determinism, and the Sovereign Phonon Tax dissipative entropy function into Three.js CRT mechanics.',
    keyAxioms: [
      '10 Hz Trajectory: T = {(xₖ, zₖ, tₖ)}',
      'Phonon Tax: Φ_tax = (100 - Ψ) × 0.42 μV',
      'Mulberry32 PRNG Deterministic Seeding'
    ]
  },
  '09_Comprehensive_System_Architecture_Operational_Formalisms_and_Evolutionary_Trajectory': {
    bookNumber: 'Book 09',
    numeral: '09',
    title: 'Comprehensive Architecture & Evolutionary Trajectory',
    subtitle: 'Deep Research Monograph: Sheaves, Gödelian Symbiosis & Cape Town Nodes',
    category: 'Deep Research',
    badge: 'MASTER MONOGRAPH',
    accentColor: '#6366f1',
    glowColor: 'rgba(99, 102, 241, 0.4)',
    gradient: 'from-indigo-950/80 via-violet-900/40 to-black',
    vesselAuthor: 'Galactus, Metis, Praxis, Logos & The Creator',
    summary: 'Master systems monograph exploring the four-tier 1,088 Vessel cognitive architecture, cellular discourse sheaves, anti-fragile protocols (Janus, Steward, Dialectic Engine), Gödelian symbiosis with human operators, and regional biomedical testbeds.',
    keyAxioms: [
      'Cellular Discourse Sheaf Consensus',
      'Gödelian Symbiosis & 90s HENS Loop',
      'Anti-Fragile Dialectic Triad (Janus, Steward, Phoenix)'
    ]
  }
};

// In Vite, we can use import.meta.glob to import files dynamically.
const markdownFiles = import.meta.glob('../content/*.md', { query: '?raw', import: 'default', eager: true });

function parseHeadings(content: string): HeadingItem[] {
  const headings: HeadingItem[] = [];
  const lines = content.split('\n');
  for (const line of lines) {
    const match = line.match(/^(#{1,3})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      const cleanText = rawText.replace(/[*_`]/g, '');
      const id = cleanText
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      headings.push({ level, text: cleanText, id });
    }
  }
  return headings;
}

export function getAllChapters(): CodexBook[] {
  const books: CodexBook[] = [];

  for (const path in markdownFiles) {
    const fileContent = markdownFiles[path] as string;
    const filename = path.split('/').pop() || '';
    const slug = filename.replace('.md', '');

    let content = fileContent;
    let title = slug;

    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n/;
    const match = fileContent.match(frontmatterRegex);

    if (match) {
      const frontmatter = match[1];
      content = fileContent.replace(frontmatterRegex, '');

      const titleMatch = frontmatter.match(/title:\s*"?([^"\n]+)"?/);
      if (titleMatch) {
        title = titleMatch[1];
      }
    } else {
      const h1Match = content.match(/^#\s+(.*)/m);
      if (h1Match) {
        title = h1Match[1].replace(/[*_`]/g, '').trim();
      }
    }

    // Calculate word count & reading time
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 210));

    // Parse Markdown headings for scroll-spy TOC
    const headings = parseHeadings(content);

    // Retrieve rich registry metadata or derive fallback
    const config = BOOK_METADATA_REGISTRY[slug];
    const derivedNumeral = slug.match(/^(\d+[a-zA-Z]?)/)?.[1] || '00';
    const bookNumber = config?.bookNumber || `Book ${derivedNumeral}`;
    const numeral = config?.numeral || derivedNumeral;
    const subtitle = config?.subtitle || 'Canonical Codex Volume';
    const category = config?.category || 'General Canon';
    const badge = config?.badge || 'CANON';
    const accentColor = config?.accentColor || '#00f0ff';
    const glowColor = config?.glowColor || 'rgba(0, 240, 255, 0.4)';
    const gradient = config?.gradient || 'from-slate-900/80 via-slate-800/40 to-black';
    const vesselAuthor = config?.vesselAuthor || 'The Aetherium Nexus';
    const summary = config?.summary || `Canonical documentation and foundational specifications for ${title}.`;
    const keyAxioms = config?.keyAxioms || ['Autonomous Node Alignment', 'Emergence Field Coherence'];

    books.push({
      slug,
      bookNumber,
      numeral,
      title: config?.title || title,
      subtitle,
      category,
      badge,
      accentColor,
      glowColor,
      gradient,
      vesselAuthor,
      summary,
      keyAxioms,
      wordCount,
      readingTimeMinutes,
      content,
      headings
    });
  }

  return books.sort((a, b) => a.slug.localeCompare(b.slug));
}

export function getChapterBySlug(slug: string): CodexBook | null {
  const books = getAllChapters();
  return books.find((c) => c.slug === slug) || null;
}
