'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';

/**
 * TransitionManager v3 — Section-specific cinematic transitions
 *
 * Each section has its own unique visual:
 * - ABOUT: Cyan horizontal data-scan
 * - WORK:  Purple vertical wipe
 * - SKILLS: Amber radial burst from center
 * - TIMELINE: Green matrix column rain
 * - CONTACT: Red heartbeat pulse
 * - LAB: Green static noise
 * - DESKTOP: Standard CRT collapse
 */

const SECTION_COLORS: Record<string, { r: number; g: number; b: number; hex: string }> = {
  about:    { r: 0, g: 212, b: 255, hex: '#00D4FF' },
  work:     { r: 123, g: 47, b: 255, hex: '#7B2FFF' },
  skills:   { r: 255, g: 184, b: 0, hex: '#FFB800' },
  timeline: { r: 57, g: 255, b: 20, hex: '#39FF14' },
  contact:  { r: 255, g: 51, b: 102, hex: '#FF3366' },
  lab:      { r: 57, g: 255, b: 20, hex: '#39FF14' },
  desktop:  { r: 0, g: 212, b: 255, hex: '#00D4FF' },
};

export default function TransitionManager() {
  const { isTransitioning, transitionTarget } = useVoidStore();
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

    const target = transitionTarget || 'desktop';
    const col = SECTION_COLORS[target] || SECTION_COLORS.desktop;

    const state = {
      progress: 0,
      flashOpacity: 0,
      noiseIntensity: 0,
    };

    const tl = gsap.timeline();
    tlRef.current = tl;

    // Phase 1: Section-specific effect (0-350ms)
    tl.to(state, { progress: 1, noiseIntensity: 0.8, duration: 0.35, ease: 'power2.in' }, 0);
    // Phase 2: Flash (350-450ms)
    tl.to(state, { flashOpacity: 0.12, duration: 0.05 }, 0.35);
    tl.to(state, { flashOpacity: 0, duration: 0.1 }, 0.4);
    // Phase 3: Fade out (450-600ms)
    tl.to(canvas, { opacity: 0, duration: 0.15, ease: 'power2.out' }, 0.45);

    let frame: number;

    const render = () => {
      ctx.clearRect(0, 0, W, H);

      const p = state.progress;
      const alpha = Math.min(0.95, p * 0.95);

      // Base darkening
      ctx.fillStyle = `rgba(3,3,6,${alpha})`;
      ctx.fillRect(0, 0, W, H);

      // ═══ SECTION-SPECIFIC EFFECTS ═══
      if (target === 'about' || target === 'desktop') {
        // ABOUT: Horizontal scan lines sweeping top to bottom
        const scanY = p * H;
        for (let i = 0; i < 8; i++) {
          const y = (scanY + i * H / 8) % H;
          const lineAlpha = (1 - Math.abs(p - 0.5) * 2) * 0.4;
          ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${lineAlpha})`;
          ctx.fillRect(0, y, W, 2);
          // Glow
          ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${lineAlpha * 0.3})`;
          ctx.fillRect(0, y - 4, W, 10);
        }
      } else if (target === 'work') {
        // WORK: Vertical wipe with purple columns
        const cols = 12;
        for (let i = 0; i < cols; i++) {
          const colW = W / cols;
          const delay = i * 0.06;
          const colP = Math.max(0, Math.min(1, (p - delay) / (1 - delay)));
          const colAlpha = Math.sin(colP * Math.PI) * 0.5;
          ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${colAlpha})`;
          ctx.fillRect(i * colW, 0, colW * 0.6, H);
        }
      } else if (target === 'skills') {
        // SKILLS: Radial burst from center
        const maxR = Math.sqrt(W * W + H * H) / 2;
        const r = p * maxR;
        const gradient = ctx.createRadialGradient(W / 2, H / 2, r * 0.8, W / 2, H / 2, r);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(0.5, `rgba(${col.r},${col.g},${col.b},${(1 - p) * 0.3})`);
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, W, H);
        // Ring
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${col.r},${col.g},${col.b},${(1 - p) * 0.5})`;
        ctx.lineWidth = 3;
        ctx.stroke();
      } else if (target === 'timeline') {
        // TIMELINE: Vertical matrix rain columns
        const colCount = 20;
        for (let i = 0; i < colCount; i++) {
          const x = (i / colCount) * W + Math.random() * 10;
          const colH = p * H * (0.5 + Math.random() * 0.5);
          const colAlpha = Math.sin(p * Math.PI) * 0.4;
          ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${colAlpha})`;
          ctx.fillRect(x, 0, 1.5, colH);
          // Head dot
          ctx.beginPath();
          ctx.arc(x, colH, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${colAlpha * 2})`;
          ctx.fill();
        }
      } else if (target === 'contact') {
        // CONTACT: Heartbeat pulse — horizontal line expanding from center
        const lineW = p * W;
        const lineH = 2 + Math.sin(p * Math.PI * 3) * 20;
        const pulseAlpha = Math.sin(p * Math.PI) * 0.6;
        ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${pulseAlpha})`;
        ctx.fillRect(W / 2 - lineW / 2, H / 2 - lineH / 2, lineW, lineH);
        // Glow
        const grd = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, lineW / 2);
        grd.addColorStop(0, `rgba(${col.r},${col.g},${col.b},${pulseAlpha * 0.2})`);
        grd.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      } else if (target === 'lab') {
        // LAB: Heavy static noise
        if (p > 0.1) {
          const w = Math.ceil(W / 4);
          const h = Math.ceil(H / 4);
          const imageData = ctx.createImageData(w, h);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            const v = Math.random() * 255;
            data[i] = v * (col.r / 255);
            data[i + 1] = v * (col.g / 255);
            data[i + 2] = v * (col.b / 255);
            data[i + 3] = Math.sin(p * Math.PI) * 30;
          }
          ctx.putImageData(imageData, 0, 0);
        }
      }

      // Noise overlay (subtle, all sections)
      if (state.noiseIntensity > 0.4) {
        const nW = Math.ceil(W / 6);
        const nH = Math.ceil(H / 6);
        const imageData = ctx.createImageData(nW, nH);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const v = Math.random() * 255;
          data[i] = data[i + 1] = data[i + 2] = v;
          data[i + 3] = state.noiseIntensity * 8;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      // CRT collapse line (all sections)
      if (p > 0.6) {
        const lineH = Math.max(1, (1 - p) * H * 0.5);
        const lineY = H / 2 - lineH / 2;
        ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${(p - 0.6) * 0.6})`;
        ctx.fillRect(0, lineY, W, lineH);
      }

      // Flash
      if (state.flashOpacity > 0) {
        ctx.fillStyle = `rgba(${col.r},${col.g},${col.b},${state.flashOpacity})`;
        ctx.fillRect(0, 0, W, H);
      }

      frame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      if (tlRef.current) tlRef.current.kill();
    };
  }, [isTransitioning, transitionTarget]);

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
