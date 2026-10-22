/**
 * Holographic Read Aloud Engine with Synchronized Page Tracking & Auto-Scroll
 * Interfaces with Web Speech Synthesis API, breaking manuscripts into discrete
 * paragraph utterances to bypass browser timeouts and ensure rock-solid block-by-block tracking.
 */

export type ReadAloudState = 'idle' | 'playing' | 'paused';

export interface ReadAloudCallbacks {
  onBlockChange?: (index: number) => void;
  onStateChange?: (state: ReadAloudState) => void;
  onFinish?: () => void;
}

class ReadAloudEngine {
  private blocks: string[] = [];
  private currentIndex = 0;
  private state: ReadAloudState = 'idle';
  private rate = 1.0;
  private pitch = 1.0;
  private autoScroll = true;
  private callbacks: ReadAloudCallbacks = {};
  private activeUtterance: SpeechSynthesisUtterance | null = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        this.selectOptimalVoice();
      };
      this.selectOptimalVoice();
    }
  }

  private selectOptimalVoice() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const voices = window.speechSynthesis.getVoices();
    // Prioritize natural or rich English voices if available
    const preferred = voices.find(v => 
      v.lang.startsWith('en') && 
      (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Daniel') || v.name.includes('Arthur'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    if (preferred) {
      this.selectedVoice = preferred;
    }
  }

  public setBlocks(blocks: string[], callbacks: ReadAloudCallbacks = {}) {
    this.stop();
    this.blocks = blocks;
    this.callbacks = callbacks;
    this.currentIndex = 0;
    this.state = 'idle';
  }

  public playFrom(index: number) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.blocks.length === 0) return;

    window.speechSynthesis.cancel();
    this.currentIndex = Math.max(0, Math.min(this.blocks.length - 1, index));
    this.speakCurrent();
  }

  public togglePlay() {
    if (this.state === 'playing') {
      this.pause();
    } else if (this.state === 'paused') {
      this.resume();
    } else {
      this.playFrom(this.currentIndex);
    }
  }

  public pause() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.state === 'playing') {
      window.speechSynthesis.pause();
      this.state = 'paused';
      this.callbacks.onStateChange?.(this.state);
    }
  }

  public resume() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (this.state === 'paused') {
      window.speechSynthesis.resume();
      this.state = 'playing';
      this.callbacks.onStateChange?.(this.state);
    } else if (this.state === 'idle') {
      this.playFrom(this.currentIndex);
    }
  }

  public stop() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    this.activeUtterance = null;
    this.state = 'idle';
    this.callbacks.onStateChange?.(this.state);
  }

  public next() {
    if (this.currentIndex < this.blocks.length - 1) {
      this.playFrom(this.currentIndex + 1);
    } else {
      this.stop();
      this.callbacks.onFinish?.();
    }
  }

  public previous() {
    if (this.currentIndex > 0) {
      this.playFrom(this.currentIndex - 1);
    } else {
      this.playFrom(0);
    }
  }

  public setRate(rate: number) {
    this.rate = Math.max(0.5, Math.min(2.0, rate));
    if (this.state === 'playing') {
      // Re-trigger current block with new rate
      this.playFrom(this.currentIndex);
    }
  }

  public getRate(): number {
    return this.rate;
  }

  public setAutoScroll(enabled: boolean) {
    this.autoScroll = enabled;
  }

  public isAutoScroll(): boolean {
    return this.autoScroll;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getTotalBlocks(): number {
    return this.blocks.length;
  }

  public getState(): ReadAloudState {
    return this.state;
  }

  private speakCurrent() {
    if (this.currentIndex >= this.blocks.length) {
      this.stop();
      this.callbacks.onFinish?.();
      return;
    }

    const text = this.blocks[this.currentIndex]?.trim();
    if (!text) {
      // Skip empty block
      this.currentIndex++;
      this.speakCurrent();
      return;
    }

    this.state = 'playing';
    this.callbacks.onStateChange?.(this.state);
    this.callbacks.onBlockChange?.(this.currentIndex);

    // Auto-scroll the page to active paragraph
    if (this.autoScroll) {
      this.scrollToBlock(this.currentIndex);
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
    }
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;

    utterance.onend = () => {
      if (this.state === 'playing') {
        this.currentIndex++;
        if (this.currentIndex < this.blocks.length) {
          this.speakCurrent();
        } else {
          this.stop();
          this.callbacks.onFinish?.();
        }
      }
    };

    utterance.onerror = (e) => {
      console.warn('TTS utterance error:', e);
      if (this.state === 'playing') {
        this.currentIndex++;
        this.speakCurrent();
      }
    };

    this.activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  }

  private scrollToBlock(index: number) {
    if (typeof document === 'undefined') return;
    const el = document.getElementById(`read-block-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }
}

export const readAloudEngine = new ReadAloudEngine();
