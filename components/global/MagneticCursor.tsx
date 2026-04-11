'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * MagneticCursor v2 — Enhanced with:
 * - Click particle burst effect
 * - Smoother morphing between states
 * - Ring expands on click
 * - More responsive trail
 */
export default function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const burstRef = useRef<HTMLCanvasElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const [mode, setMode] = useState<'default' | 'pointer' | 'text'>('default');
  const [hidden, setHidden] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  // Click burst particles
  const spawnBurst = useCallback((x: number, y: number) => {
    const canvas = burstRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string; size: number }> = [];
    const colors = ['#00D4FF', '#7B2FFF', '#39FF14', '#FFB800'];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.5;
      const speed = 1.5 + Math.random() * 3;
      particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 1.5 + Math.random() * 2,
      });
    }

    let frame: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.96;
        p.vy *= 0.96;
        p.life -= 0.035;
        if (p.life <= 0) continue;
        alive = true;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life * 0.6;
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (alive) frame = requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
    frame = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true);
      return;
    }

    // Burst canvas
    const burstCanvas = burstRef.current;
    if (burstCanvas) {
      burstCanvas.width = window.innerWidth;
      burstCanvas.height = window.innerHeight;
      const handleResize = () => {
        burstCanvas.width = window.innerWidth;
        burstCanvas.height = window.innerHeight;
      };
      window.addEventListener('resize', handleResize);
    }

    // Create particle trail elements
    const container = document.createElement('div');
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99996';
    document.body.appendChild(container);
    const trails: HTMLDivElement[] = [];
    for (let i = 0; i < 6; i++) {
      const trail = document.createElement('div');
      trail.style.cssText = `
        position:fixed;width:${4 - i * 0.5}px;height:${4 - i * 0.5}px;
        border-radius:50%;background:rgba(0,212,255,${0.3 - i * 0.04});
        pointer-events:none;z-index:99996;transition:none;
      `;
      container.appendChild(trail);
      trails.push(trail);
    }
    trailsRef.current = trails;

    const trailPositions = trails.map(() => ({ x: -100, y: -100 }));

    const onMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };

      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el) {
        const tag = el.tagName.toLowerCase();
        const cs = window.getComputedStyle(el);
        const clickable = tag === 'button' || tag === 'a' || tag === 'input' || tag === 'textarea'
          || cs.cursor === 'pointer' || el.getAttribute('role') === 'button' || el.closest('button') || el.closest('a');
        const isText = tag === 'p' || tag === 'span' || tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'li';
        setMode(clickable ? 'pointer' : isText ? 'text' : 'default');
      }
    };

    // Click burst + ring pulse
    const onClick = (e: MouseEvent) => {
      spawnBurst(e.clientX, e.clientY);
      // Ring pulse animation
      if (ringRef.current) {
        const ring = ringRef.current;
        ring.style.transition = 'none';
        ring.style.width = '60px';
        ring.style.height = '60px';
        ring.style.borderColor = 'rgba(0,212,255,0.5)';
        requestAnimationFrame(() => {
          ring.style.transition = 'width 0.4s cubic-bezier(0.16,1,0.3,1), height 0.4s cubic-bezier(0.16,1,0.3,1), border 0.4s ease';
          ring.style.width = `${mode === 'pointer' ? 44 : 28}px`;
          ring.style.height = `${mode === 'pointer' ? 44 : 28}px`;
          ring.style.borderColor = `rgba(0,212,255,${mode === 'pointer' ? 0.7 : 0.3})`;
        });
      }
    };

    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    let raf: number;
    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }

      for (let i = 0; i < trails.length; i++) {
        const prev = i === 0 ? pos.current : trailPositions[i - 1];
        trailPositions[i].x += (prev.x - trailPositions[i].x) * (0.15 - i * 0.015);
        trailPositions[i].y += (prev.y - trailPositions[i].y) * (0.15 - i * 0.015);
        trails[i].style.transform = `translate(${trailPositions[i].x}px, ${trailPositions[i].y}px) translate(-50%, -50%)`;
      }

      raf = requestAnimationFrame(animate);
    };
    animate();

    document.addEventListener('mousemove', onMove);
    document.addEventListener('click', onClick);
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.body.style.cursor = 'none';

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('click', onClick);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.body.style.cursor = 'auto';
      container.remove();
    };
  }, [spawnBurst, mode]);

  if (isTouch) return null;

  const dotSize = mode === 'pointer' ? 0 : mode === 'text' ? 2 : 6;
  const ringSize = mode === 'pointer' ? 44 : mode === 'text' ? 24 : 28;
  const ringBorder = mode === 'pointer' ? '2px' : '1px';
  const ringOpacity = hidden ? 0 : mode === 'pointer' ? 0.7 : 0.3;

  return (
    <>
      {/* Burst canvas */}
      <canvas ref={burstRef} style={{
        position: 'fixed', inset: 0, zIndex: 99997,
        pointerEvents: 'none',
      }} />

      {/* Inner dot */}
      <div ref={dotRef} className="magnetic-cursor" style={{
        position: 'fixed', top: 0, left: 0, zIndex: 99999,
        width: `${dotSize}px`, height: `${dotSize}px`, borderRadius: '50%',
        background: mode === 'text' ? 'var(--blue)' : 'var(--white)',
        pointerEvents: 'none',
        transition: 'width 0.25s ease, height 0.25s ease, background 0.25s ease, opacity 0.3s ease',
        opacity: hidden ? 0 : 1,
      }} />

      {/* Outer ring */}
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 99998,
        width: `${ringSize}px`, height: `${ringSize}px`, borderRadius: '50%',
        border: `${ringBorder} solid rgba(0,212,255,${ringOpacity})`,
        pointerEvents: 'none',
        transition: 'width 0.35s cubic-bezier(0.16,1,0.3,1), height 0.35s cubic-bezier(0.16,1,0.3,1), border 0.3s ease, opacity 0.3s ease',
        opacity: hidden ? 0 : 1,
        background: mode === 'pointer' ? 'rgba(0,212,255,0.06)' : 'transparent',
      }} />
    </>
  );
}
