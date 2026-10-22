/**
 * 1.618 Hz Golden Ratio Theta Wave Ambient Focus Synthesizer
 * Procedural WebAudio engine generating binaural micro-beats for deep reading flow.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let oscLeft: OscillatorNode | null = null;
let oscRight: OscillatorNode | null = null;
let subOsc: OscillatorNode | null = null;
let filter: BiquadFilterNode | null = null;
let isPlaying = false;

export function isFocusAudioPlaying(): boolean {
  return isPlaying;
}

export function startFocusAudio(volume = 0.15): boolean {
  try {
    if (isPlaying) return true;

    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return false;

    audioCtx = new AudioContextClass();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(Math.max(0.01, volume), audioCtx.currentTime + 2.5);

    // Warm low-pass filter to make it deeply atmospheric
    filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, audioCtx.currentTime);
    filter.Q.setValueAtTime(1.5, audioCtx.currentTime);

    // Stereo panner nodes for Left and Right binaural separation
    const merger = audioCtx.createChannelMerger(2);

    // Golden Ratio Binaural Beat: Left = 108.0 Hz, Right = 109.618 Hz (Difference = 1.618 Hz Theta/Phi Wave)
    oscLeft = audioCtx.createOscillator();
    oscLeft.type = 'sine';
    oscLeft.frequency.setValueAtTime(108.0, audioCtx.currentTime);

    oscRight = audioCtx.createOscillator();
    oscRight.type = 'sine';
    oscRight.frequency.setValueAtTime(109.618, audioCtx.currentTime);

    // Sub-harmonic drone at 54.0 Hz
    subOsc = audioCtx.createOscillator();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(54.0, audioCtx.currentTime);

    const subGain = audioCtx.createGain();
    subGain.gain.setValueAtTime(0.35, audioCtx.currentTime);
    subOsc.connect(subGain);
    subGain.connect(filter);

    oscLeft.connect(merger, 0, 0); // Left channel
    oscRight.connect(merger, 0, 1); // Right channel

    merger.connect(filter);
    filter.connect(masterGain);
    masterGain.connect(audioCtx.destination);

    oscLeft.start();
    oscRight.start();
    subOsc.start();

    isPlaying = true;
    return true;
  } catch (err) {
    console.warn('Failed to start ambient focus audio:', err);
    isPlaying = false;
    return false;
  }
}

export function stopFocusAudio(): void {
  if (!isPlaying || !audioCtx || !masterGain) return;

  try {
    masterGain.gain.setValueAtTime(masterGain.gain.value, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.2);

    setTimeout(() => {
      try {
        oscLeft?.stop();
        oscRight?.stop();
        subOsc?.stop();
        oscLeft?.disconnect();
        oscRight?.disconnect();
        subOsc?.disconnect();
        audioCtx?.close();
      } catch (e) {
        // Ignore cleanup error
      }
      audioCtx = null;
      masterGain = null;
      oscLeft = null;
      oscRight = null;
      subOsc = null;
      isPlaying = false;
    }, 1250);
  } catch (err) {
    isPlaying = false;
  }
}

export function setFocusVolume(volume: number): void {
  if (masterGain && audioCtx) {
    const clamped = Math.max(0.01, Math.min(1, volume));
    masterGain.gain.cancelScheduledValues(audioCtx.currentTime);
    masterGain.gain.linearRampToValueAtTime(clamped, audioCtx.currentTime + 0.1);
  }
}
