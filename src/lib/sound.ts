// Procedural audio engine — no external files, no licenses. Uses Web Audio API.
// All sounds are synthesized from oscillators + filters + envelopes.

const MUTE_KEY = "qd-sound-muted";

type AmbientHandle = { stop: () => void };

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private muted = false;
  private menuAmbient: AmbientHandle | null = null;
  private gameAmbient: AmbientHandle | null = null;

  init() {
    if (typeof window === "undefined") return;
    if (this.ctx) return;
    try {
      this.muted = localStorage.getItem(MUTE_KEY) === "true";
    } catch {}
  }

  private ensureCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return null;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  isMuted(): boolean {
    return this.muted;
  }

  toggleMute(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem(MUTE_KEY, String(this.muted));
    } catch {}
    if (this.masterGain) {
      this.masterGain.gain.value = this.muted ? 0 : 1;
    }
    return this.muted;
  }

  // === Sound effects ===

  /** Short percussive click for piece movement */
  playMove() {
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(280, now + 0.08);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.15);
  }

  /** Heavier sound for captures */
  playCapture() {
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    // Low thump
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.15);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(0.4, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.3);
    // Crack
    const noise = this.makeNoiseBuffer(ctx, 0.08);
    const noiseSrc = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = "highpass";
    noiseFilter.frequency.value = 2000;
    noiseSrc.buffer = noise;
    noiseGain.gain.setValueAtTime(0.15, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    noiseSrc.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noiseSrc.start(now);
  }

  /** Triumphant ascending major arpeggio */
  playVictory() {
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const t = now + i * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.55);
    });
    // Final chord
    const chordT = now + notes.length * 0.12 + 0.1;
    [523.25, 659.25, 783.99].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, chordT);
      gain.gain.setValueAtTime(0.001, chordT);
      gain.gain.exponentialRampToValueAtTime(0.2, chordT + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, chordT + 1.4);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(chordT);
      osc.stop(chordT + 1.5);
    });
  }

  /** Descending minor — sad */
  playDefeat() {
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) return;
    const now = ctx.currentTime;
    const notes = [440, 392, 349.23, 261.63]; // A4 G4 F4 C4
    notes.forEach((freq, i) => {
      const t = now + i * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t);
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 1500;
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.exponentialRampToValueAtTime(0.18, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(t);
      osc.stop(t + 0.75);
    });
  }

  // === Ambient backgrounds ===

  startMenuAmbient() {
    if (this.menuAmbient) return;
    this.menuAmbient = this.makeAmbient({
      rootFreq: 146.83, // D3
      intervals: [1, 1.5, 2.25], // root + fifth + ninth
      filterFreq: 600,
      lfoRate: 0.07,
      gain: 0.08,
    });
  }

  stopMenuAmbient() {
    this.menuAmbient?.stop();
    this.menuAmbient = null;
  }

  startGameAmbient() {
    if (this.gameAmbient) return;
    this.gameAmbient = this.makeAmbient({
      rootFreq: 110, // A2
      intervals: [1, 1.5, 1.875], // root + fifth + minor seventh
      filterFreq: 450,
      lfoRate: 0.05,
      gain: 0.07,
    });
  }

  stopGameAmbient() {
    this.gameAmbient?.stop();
    this.gameAmbient = null;
  }

  stopAll() {
    this.stopMenuAmbient();
    this.stopGameAmbient();
  }

  // === Internal helpers ===

  private makeAmbient(opts: {
    rootFreq: number;
    intervals: number[];
    filterFreq: number;
    lfoRate: number;
    gain: number;
  }): AmbientHandle {
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) {
      return { stop: () => {} };
    }
    const now = ctx.currentTime;
    const ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0, now);
    ambientGain.gain.linearRampToValueAtTime(opts.gain, now + 2.5);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = opts.filterFreq;
    filter.Q.value = 4;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = opts.lfoRate;
    lfoGain.gain.value = 120;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);

    const oscs: OscillatorNode[] = [];
    opts.intervals.forEach((mult, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "sawtooth" : "triangle";
      osc.frequency.value = opts.rootFreq * mult;
      // Slight detune for richness
      osc.detune.value = (i - 1) * 6;
      osc.connect(filter);
      osc.start(now);
      oscs.push(osc);
    });
    filter.connect(ambientGain);
    ambientGain.connect(this.masterGain);

    return {
      stop: () => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        try {
          ambientGain.gain.cancelScheduledValues(t);
          ambientGain.gain.setValueAtTime(ambientGain.gain.value, t);
          ambientGain.gain.linearRampToValueAtTime(0, t + 0.8);
          oscs.forEach((o) => {
            try {
              o.stop(t + 1);
            } catch {}
          });
          try {
            lfo.stop(t + 1);
          } catch {}
        } catch {}
      },
    };
  }

  private makeNoiseBuffer(ctx: AudioContext, durationSec: number): AudioBuffer {
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(durationSec * sampleRate);
    const buf = ctx.createBuffer(1, length, sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buf;
  }
}

export const sound = new SoundManager();

// Listener helpers for React UI to react to mute toggle.
const muteListeners = new Set<(muted: boolean) => void>();

export function onMuteChange(cb: (muted: boolean) => void): () => void {
  muteListeners.add(cb);
  return () => muteListeners.delete(cb);
}

export function toggleMuteAndNotify(): boolean {
  const muted = sound.toggleMute();
  muteListeners.forEach((cb) => cb(muted));
  return muted;
}
