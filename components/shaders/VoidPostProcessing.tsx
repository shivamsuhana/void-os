'use client';

import { useEffect, useRef, useCallback } from 'react';

/**
 * VoidPostProcessing v3 — Animated Canvas Overlay
 * 
 * Real-time post-processing effects rendered to a canvas overlay:
 * - Animated chromatic aberration (breathes + pulses on transitions)
 * - Film grain with temporal noise
 * - CRT scanlines with subtle movement
 * - Vignette with breathing opacity
 * - Glitch frames (random horizontal tears)
 */
export default function VoidPostProcessing({ intensity = 0.5 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let W = window.innerWidth;
    let H = window.innerHeight;

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W;
      canvas.height = H;
    };
    resize();
    window.addEventListener('resize', resize);

    // Pre-generate noise texture (small, tile it)
    const noiseSize = 128;
    const noiseCanvas = document.createElement('canvas');
    noiseCanvas.width = noiseSize;
    noiseCanvas.height = noiseSize;
    const noiseCtx = noiseCanvas.getContext('2d')!;

    const regenerateNoise = () => {
      const imageData = noiseCtx.createImageData(noiseSize, noiseSize);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = 255;
      }
      noiseCtx.putImageData(imageData, 0, 0);
    };

    let lastNoiseTime = 0;

    const render = (time: number) => {
      ctx.clearRect(0, 0, W, H);

      const t = time * 0.001;
      const breathe = Math.sin(t * 0.3) * 0.5 + 0.5; // 0-1 breathing
      const i = intensity;

      // ── Film Grain ──
      // Regenerate noise every ~50ms for temporal variation
      if (time - lastNoiseTime > 50) {
        regenerateNoise();
        lastNoiseTime = time;
      }
      ctx.save();
      ctx.globalAlpha = 0.025 * i;
      ctx.globalCompositeOperation = 'overlay';
      // Tile the noise with random offset
      const ox = Math.random() * noiseSize;
      const oy = Math.random() * noiseSize;
      for (let x = -noiseSize; x < W + noiseSize; x += noiseSize) {
        for (let y = -noiseSize; y < H + noiseSize; y += noiseSize) {
          ctx.drawImage(noiseCanvas, x + ox, y + oy);
        }
      }
      ctx.restore();

      // ── Scanlines ──
      ctx.save();
      ctx.globalAlpha = 0.04 * i;
      const scanOffset = (time * 0.02) % 4; // slowly moving scanlines
      for (let y = scanOffset; y < H; y += 4) {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, y, W, 1);
      }
      ctx.restore();

      // ── Vignette ──
      ctx.save();
      const vignetteGrad = ctx.createRadialGradient(W / 2, H / 2, W * 0.25, W / 2, H / 2, W * 0.75);
      vignetteGrad.addColorStop(0, 'transparent');
      vignetteGrad.addColorStop(1, `rgba(0,0,0,${0.35 + breathe * 0.08 * i})`);
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();

      // ── Chromatic Aberration (subtle RGB edge shift) ──
      ctx.save();
      const caStrength = (0.3 + breathe * 0.4) * i;
      if (caStrength > 0.2) {
        // Red tint on left edge
        const leftGrad = ctx.createLinearGradient(0, 0, W * 0.08, 0);
        leftGrad.addColorStop(0, `rgba(255,0,0,${caStrength * 0.06})`);
        leftGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = leftGrad;
        ctx.fillRect(0, 0, W * 0.08, H);

        // Blue tint on right edge
        const rightGrad = ctx.createLinearGradient(W * 0.92, 0, W, 0);
        rightGrad.addColorStop(0, 'transparent');
        rightGrad.addColorStop(1, `rgba(0,100,255,${caStrength * 0.06})`);
        ctx.fillStyle = rightGrad;
        ctx.fillRect(W * 0.92, 0, W * 0.08, H);
      }
      ctx.restore();

      // ── Random glitch frame (very rare) ──
      if (Math.random() < 0.002 * i) {
        ctx.save();
        const glitchY = Math.random() * H;
        const glitchH = 2 + Math.random() * 6;
        const glitchOffset = (Math.random() - 0.5) * 20;
        ctx.fillStyle = `rgba(0,212,255,${0.05 + Math.random() * 0.05})`;
        ctx.fillRect(glitchOffset, glitchY, W, glitchH);
        ctx.restore();
      }

      // ── Subtle top/bottom letterbox gradient ──
      ctx.save();
      const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.06);
      topGrad.addColorStop(0, `rgba(3,3,6,${0.3 * i})`);
      topGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = topGrad;
      ctx.fillRect(0, 0, W, H * 0.06);

      const bottomGrad = ctx.createLinearGradient(0, H * 0.94, 0, H);
      bottomGrad.addColorStop(0, 'transparent');
      bottomGrad.addColorStop(1, `rgba(3,3,6,${0.3 * i})`);
      ctx.fillStyle = bottomGrad;
      ctx.fillRect(0, H * 0.94, W, H * 0.06);
      ctx.restore();

      frameRef.current = requestAnimationFrame(render);
    };

    frameRef.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 10,
        pointerEvents: 'none',
        mixBlendMode: 'normal',
      }}
    />
  );
}
