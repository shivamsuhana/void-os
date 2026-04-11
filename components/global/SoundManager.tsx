'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useVoidStore } from '@/lib/store';

/**
 * SoundManager — Web Audio API synthesized sounds
 * No external audio files needed. Everything is generated.
 */
export default function SoundManager() {
  const { soundEnabled, toggleSound } = useVoidStore();
  const ctxRef = useRef<AudioContext | null>(null);
  const droneRef = useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    return ctxRef.current;
  }, []);

  // Play a short UI blip
  const playClick = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.08);
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }, [soundEnabled, getCtx]);

  // Ambient drone
  useEffect(() => {
    if (!soundEnabled) {
      if (droneRef.current) {
        droneRef.current.gain.gain.linearRampToValueAtTime(0, (ctxRef.current?.currentTime || 0) + 0.5);
        setTimeout(() => {
          try { droneRef.current?.osc.stop(); } catch {}
          droneRef.current = null;
        }, 600);
      }
      return;
    }

    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(55, ctx.currentTime); // Low A
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, ctx.currentTime);
      filter.Q.setValueAtTime(2, ctx.currentTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 2);

      // Subtle modulation
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
      lfoGain.gain.setValueAtTime(15, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      osc.start();
      droneRef.current = { osc, gain };
    } catch {}

    return () => {
      if (droneRef.current) {
        try { droneRef.current.osc.stop(); } catch {}
        droneRef.current = null;
      }
    };
  }, [soundEnabled, getCtx]);

  // Attach click sounds to all buttons
  useEffect(() => {
    if (!soundEnabled) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        playClick();
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [soundEnabled, playClick]);

  return (
    <button
      onClick={toggleSound}
      title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '60px',
        zIndex: 9999,
        width: '36px',
        height: '36px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(8px)',
        fontSize: '16px',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        color: soundEnabled ? 'var(--plasma-blue)' : 'var(--text-muted)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      {soundEnabled ? '🔊' : '🔇'}
    </button>
  );
}
