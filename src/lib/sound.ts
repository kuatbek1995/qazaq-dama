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
      // Bright C major 9 (C-E-G-D) — uplifting, optimistic
      rootFreq: 261.63, // C4
      intervals: [1, 1.25, 1.5, 2.25], // root + major third + fifth + ninth
      filterFreq: 1400,
      lfoRate: 0.18,
      gain: 0.06,
      bell: true,
    });
  }

  stopMenuAmbient() {
    this.menuAmbient?.stop();
    this.menuAmbient = null;
  }

  startGameAmbient() {
    if (this.gameAmbient) return;
    this.gameAmbient = this.makeAmbient({
      // F major 6 (F-A-C-D) — warm, focused but cheerful
      rootFreq: 174.61, // F3
      intervals: [1, 1.25, 1.5, 1.667], // root + major third + fifth + sixth
      filterFreq: 1100,
      lfoRate: 0.12,
      gain: 0.05,
      bell: true,
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
    bell?: boolean;
  }): AmbientHandle {
    const ctx = this.ensureCtx();
    if (!ctx || !this.masterGain) {
      return { stop: () => {} };
    }
    const now = ctx.currentTime;
    const ambientGain = ctx.createGain();
    ambientGain.gain.setValueAtTime(0, now);
    ambientGain.gain.linearRampToValueAtTime(opts.gain, now + 2.0);
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = opts.filterFreq;
    filter.Q.value = 3;
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.type = "sine";
    lfo.frequency.value = opts.lfoRate;
    lfoGain.gain.value = 250;
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);
    lfo.start(now);

    const oscs: OscillatorNode[] = [];
    opts.intervals.forEach((mult, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 0 ? "triangle" : "sine"; // brighter, less buzzy
      osc.frequency.value = opts.rootFreq * mult;
      osc.detune.value = (i - 1) * 4;
      osc.connect(filter);
      osc.start(now);
      oscs.push(osc);
    });
    filter.connect(ambientGain);
    ambientGain.connect(this.masterGain);

    // Occasional bell-like sparkle on top
    let bellInterval: ReturnType<typeof setInterval> | null = null;
    if (opts.bell) {
      const playBell = () => {
        if (!this.ctx || !this.masterGain) return;
        const bt = this.ctx.currentTime;
        const noteIdx = Math.floor(Math.random() * opts.intervals.length);
        const freq = opts.rootFreq * opts.intervals[noteIdx] * 4; // 2 octaves up
        const bell = this.ctx.createOscillator();
        const bellGain = this.ctx.createGain();
        bell.type = "sine";
        bell.frequency.value = freq;
        bellGain.gain.setValueAtTime(0.001, bt);
        bellGain.gain.exponentialRampToValueAtTime(0.04, bt + 0.02);
        bellGain.gain.exponentialRampToValueAtTime(0.001, bt + 1.8);
        bell.connect(bellGain);
        bellGain.connect(this.masterGain);
        bell.start(bt);
        bell.stop(bt + 2);
      };
      // First bell after 3s, then every 5-9s
      const schedule = () => {
        playBell();
        bellInterval = setTimeout(schedule, 5000 + Math.random() * 4000) as unknown as ReturnType<typeof setInterval>;
      };
      bellInterval = setTimeout(schedule, 3000) as unknown as ReturnType<typeof setInterval>;
    }

    return {
      stop: () => {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        if (bellInterval) clearTimeout(bellInterval);
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
