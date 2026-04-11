/**
 * VoidAudioEngine — Layered spatial Web Audio engine
 * 
 * 3 ambient drone layers that crossfade between sections.
 * 8 synthesized UI sounds with spatial panning.
 * No external audio files needed.
 */

type SoundType = 'hover' | 'click' | 'whoosh' | 'error' | 'success' | 'type' | 'boot' | 'shutdown';

class VoidAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private droneOscillators: Array<{ osc: OscillatorNode; gain: GainNode; filter: BiquadFilterNode }> = [];
  private isPlaying = false;

  private getCtx(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.6;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private getMaster(): GainNode {
    if (!this.masterGain) this.getCtx();
    return this.masterGain!;
  }

  // ─── Ambient Drone System ─────────────────────

  startDrone() {
    if (this.isPlaying) return;
    this.isPlaying = true;
    const ctx = this.getCtx();
    const master = this.getMaster();

    // Layer 1: Deep sub bass (55 Hz)
    const sub = this.createDroneLayer(ctx, {
      freq: 55, type: 'sawtooth', filterFreq: 120, filterQ: 3,
      volume: 0.012, lfoFreq: 0.08, lfoDepth: 8,
    });

    // Layer 2: Mid pad (110 Hz)
    const mid = this.createDroneLayer(ctx, {
      freq: 110, type: 'triangle', filterFreq: 400, filterQ: 1.5,
      volume: 0.006, lfoFreq: 0.15, lfoDepth: 30,
    });

    // Layer 3: High shimmer (330 Hz)
    const shimmer = this.createDroneLayer(ctx, {
      freq: 330, type: 'sine', filterFreq: 800, filterQ: 0.7,
      volume: 0.003, lfoFreq: 0.4, lfoDepth: 50,
    });

    [sub, mid, shimmer].forEach(layer => {
      layer.gain.connect(master);
      this.droneOscillators.push(layer);
    });
  }

  private createDroneLayer(ctx: AudioContext, opts: {
    freq: number; type: OscillatorType; filterFreq: number; filterQ: number;
    volume: number; lfoFreq: number; lfoDepth: number;
  }) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();

    osc.type = opts.type;
    osc.frequency.setValueAtTime(opts.freq, ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(opts.filterFreq, ctx.currentTime);
    filter.Q.setValueAtTime(opts.filterQ, ctx.currentTime);

    lfo.frequency.setValueAtTime(opts.lfoFreq, ctx.currentTime);
    lfoGain.gain.setValueAtTime(opts.lfoDepth, ctx.currentTime);

    osc.connect(filter);
    filter.connect(gain);
    lfo.connect(lfoGain);
    lfoGain.connect(filter.frequency);

    // Fade in over 3s
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(opts.volume, ctx.currentTime + 3);

    osc.start();
    lfo.start();

    return { osc, gain, filter };
  }

  stopDrone() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    const ctx = this.ctx;
    if (!ctx) return;

    this.droneOscillators.forEach(({ osc, gain }) => {
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 1);
      setTimeout(() => { try { osc.stop(); } catch {} }, 1200);
    });
    this.droneOscillators = [];
  }

  // ─── UI Sound Effects ─────────────────────────

  play(type: SoundType, panX: number = 0) {
    try {
      const ctx = this.getCtx();
      const master = this.getMaster();

      // Spatial panner based on mouse X position
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-1, Math.min(1, panX)), ctx.currentTime);

      const gain = ctx.createGain();
      gain.connect(panner);
      panner.connect(master);

      switch (type) {
        case 'hover': this.synthHover(ctx, gain); break;
        case 'click': this.synthClick(ctx, gain); break;
        case 'whoosh': this.synthWhoosh(ctx, gain); break;
        case 'error': this.synthError(ctx, gain); break;
        case 'success': this.synthSuccess(ctx, gain); break;
        case 'type': this.synthType(ctx, gain); break;
        case 'boot': this.synthBoot(ctx, gain); break;
        case 'shutdown': this.synthShutdown(ctx, gain); break;
      }
    } catch {}
  }

  private synthHover(ctx: AudioContext, gain: GainNode) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.06);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
    osc.start(); osc.stop(ctx.currentTime + 0.06);
  }

  private synthClick(ctx: AudioContext, gain: GainNode) {
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    osc.start(); osc.stop(ctx.currentTime + 0.12);
  }

  private synthWhoosh(ctx: AudioContext, gain: GainNode) {
    const noise = ctx.createBufferSource();
    const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() - 0.5) * 2;
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(200, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(4000, ctx.currentTime + 0.15);
    filter.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.35);
    filter.Q.setValueAtTime(1, ctx.currentTime);

    noise.connect(filter);
    filter.connect(gain);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    noise.start(); noise.stop(ctx.currentTime + 0.4);
  }

  private synthError(ctx: AudioContext, gain: GainNode) {
    const osc = ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.setValueAtTime(0.04, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.04, ctx.currentTime + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.start(); osc.stop(ctx.currentTime + 0.25);
  }

  private synthSuccess(ctx: AudioContext, gain: GainNode) {
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    osc1.type = 'sine'; osc2.type = 'sine';
    osc1.frequency.setValueAtTime(523, ctx.currentTime); // C5
    osc2.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
    osc1.connect(gain); osc2.connect(gain);
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.start(); osc1.stop(ctx.currentTime + 0.15);
    osc2.start(ctx.currentTime + 0.1); osc2.stop(ctx.currentTime + 0.3);
  }

  private synthType(ctx: AudioContext, gain: GainNode) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400 + Math.random() * 200, ctx.currentTime);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    osc.start(); osc.stop(ctx.currentTime + 0.03);
  }

  private synthBoot(ctx: AudioContext, gain: GainNode) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(100, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(2000, ctx.currentTime + 1.5);
    osc.connect(gain);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
    osc.start(); osc.stop(ctx.currentTime + 1.8);
  }

  private synthShutdown(ctx: AudioContext, gain: GainNode) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 1.2);
    osc.connect(gain);
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    osc.start(); osc.stop(ctx.currentTime + 1.2);
  }

  setVolume(v: number) {
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, v)), this.ctx!.currentTime);
    }
  }

  dispose() {
    this.stopDrone();
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

// Singleton
export const audioEngine = new VoidAudioEngine();
export type { SoundType };
