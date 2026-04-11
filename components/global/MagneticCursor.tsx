'use client';

import { useEffect, useRef, useState } from 'react';

export default function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailsRef = useRef<HTMLDivElement[]>([]);
  const pos = useRef({ x: -100, y: -100 });
  const target = useRef({ x: -100, y: -100 });
  const [mode, setMode] = useState<'default' | 'pointer' | 'text'>('default');
  const [hidden, setHidden] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true);
      return;
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

    const onLeave = () => setHidden(true);
    const onEnter = () => setHidden(false);

    let raf: number;
    const animate = () => {
      // Smooth lerp
      pos.current.x += (target.current.x - pos.current.x) * 0.18;
      pos.current.y += (target.current.y - pos.current.y) * 0.18;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${target.current.x}px, ${target.current.y}px) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px) translate(-50%, -50%)`;
      }

      // Trail follows with increasing delay
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
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    document.body.style.cursor = 'none';

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      document.body.style.cursor = 'auto';
      container.remove();
    };
  }, []);

  if (isTouch) return null;

  const dotSize = mode === 'pointer' ? 0 : mode === 'text' ? 2 : 6;
  const ringSize = mode === 'pointer' ? 44 : mode === 'text' ? 24 : 28;
  const ringBorder = mode === 'pointer' ? '2px' : '1px';
  const ringOpacity = hidden ? 0 : mode === 'pointer' ? 0.7 : 0.3;

  return (
    <>
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
