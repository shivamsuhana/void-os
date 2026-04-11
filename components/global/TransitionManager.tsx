'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';

/**
 * TransitionManager v2 — GSAP cinematic transitions
 * 
 * Orchestrates a multi-phase glitch animation between sections:
 * 1. Horizontal tear bars flash across screen
 * 2. RGB chromatic shift bands
 * 3. Screen collapses to center line (CRT shutdown)
 * 4. Quick white flash
 * 5. New section fades in
 */
export default function TransitionManager() {
  const { isTransitioning } = useVoidStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!isTransitioning) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    canvas.style.opacity = '1';

    const state = {
      tearProgress: 0,
      rgbShift: 0,
      collapseProgress: 0,
      flashOpacity: 0,
      noiseIntensity: 0,
    };

    const tl = gsap.timeline();
    tlRef.current = tl;

    // Phase 1: Tear bars + noise (0 - 200ms)
    tl.to(state, {
      tearProgress: 1,
      noiseIntensity: 1,
      duration: 0.2,
      ease: 'power2.in',
    }, 0);

    // Phase 2: RGB chromatic shift (100 - 300ms)
    tl.to(state, {
      rgbShift: 1,
      duration: 0.2,
      ease: 'power1.inOut',
    }, 0.1);
    tl.to(state, { rgbShift: 0, duration: 0.1 }, 0.3);

    // Phase 3: CRT collapse (200 - 450ms)
    tl.to(state, {
      collapseProgress: 1,
      duration: 0.25,
      ease: 'power3.in',
    }, 0.2);

    // Phase 4: Flash (400 - 500ms)
    tl.to(state, { flashOpacity: 0.15, duration: 0.05 }, 0.4);
    tl.to(state, { flashOpacity: 0, duration: 0.1 }, 0.45);

    // Phase 5: Fade out (500 - 600ms)
    tl.to(canvas, { opacity: 0, duration: 0.15, ease: 'power2.out' }, 0.5);

    // Render loop
    let frame: number;
    const tearBars = Array.from({ length: 15 }, () => ({
      y: Math.random() * H,
      height: 1 + Math.random() * 6,
      speed: (Math.random() - 0.5) * 80,
      color: Math.random() > 0.5 ? 'rgba(0,212,255,' : 'rgba(123,47,255,',
    }));

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      // Background darken
      const alpha = Math.min(0.95, state.collapseProgress * 0.95);
      ctx.fillStyle = `rgba(3,3,6,${alpha})`;
      ctx.fillRect(0, 0, W, H);

      // Tear bars
      if (state.tearProgress > 0 && state.tearProgress < 1) {
        for (const bar of tearBars) {
          const opacity = (1 - Math.abs(state.tearProgress - 0.5) * 2) * 0.6;
          ctx.fillStyle = `${bar.color}${opacity.toFixed(2)})`;
          const offsetX = bar.speed * state.tearProgress;
          ctx.fillRect(offsetX, bar.y, W, bar.height);
        }
      }

      // RGB shift bands
      if (state.rgbShift > 0) {
        const shift = state.rgbShift * 8;
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = `rgba(255,0,0,${state.rgbShift * 0.1})`;
        ctx.fillRect(-shift, 0, W + shift * 2, H);
        ctx.fillStyle = `rgba(0,255,0,${state.rgbShift * 0.08})`;
        ctx.fillRect(0, -shift * 0.5, W, H + shift);
        ctx.fillStyle = `rgba(0,0,255,${state.rgbShift * 0.1})`;
        ctx.fillRect(shift, 0, W - shift * 2, H);
        ctx.globalCompositeOperation = 'source-over';
      }

      // Noise
      if (state.noiseIntensity > 0.3) {
        const imageData = ctx.createImageData(W / 4, H / 4);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = Math.random() * 255;
          data[i] = data[i + 1] = data[i + 2] = v;
          data[i + 3] = state.noiseIntensity * 15;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // CRT collapse line
      if (state.collapseProgress > 0.5) {
        const lineH = Math.max(1, (1 - state.collapseProgress) * H);
        const lineY = H / 2 - lineH / 2;
        ctx.fillStyle = `rgba(0,212,255,${(state.collapseProgress - 0.5) * 0.4})`;
        ctx.fillRect(0, lineY, W, lineH);
      }

      // Flash
      if (state.flashOpacity > 0) {
        ctx.fillStyle = `rgba(232,232,240,${state.flashOpacity})`;
        ctx.fillRect(0, 0, W, H);
      }

      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      if (tlRef.current) tlRef.current.kill();
    };
  }, [isTransitioning]);

  if (!isTransitioning) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        pointerEvents: 'none',
      }}
    />
  );
}
