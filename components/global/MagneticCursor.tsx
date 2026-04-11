'use client';

import { useEffect, useRef, useState } from 'react';

export default function MagneticCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const [isPointer, setIsPointer] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    // Detect touch device
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
      setIsTouch(true);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = { x: e.clientX, y: e.clientY };

      // Check what we're hovering
      const el = document.elementFromPoint(e.clientX, e.clientY);
      if (el) {
        const tag = el.tagName.toLowerCase();
        const style = window.getComputedStyle(el);
        const isClickable = tag === 'button' || tag === 'a' || tag === 'input' || tag === 'textarea' || style.cursor === 'pointer' || el.getAttribute('role') === 'button';
        setIsPointer(isClickable);
      }
    };

    const handleMouseLeave = () => setIsHidden(true);
    const handleMouseEnter = () => setIsHidden(false);

    // Animation loop
    let raf: number;
    const animate = () => {
      posRef.current.x += (targetRef.current.x - posRef.current.x) * 0.15;
      posRef.current.y += (targetRef.current.y - posRef.current.y) * 0.15;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${targetRef.current.x}px, ${targetRef.current.y}px) translate(-50%, -50%)`;
      }
      if (trailRef.current) {
        trailRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px) translate(-50%, -50%)`;
      }
      raf = requestAnimationFrame(animate);
    };
    animate();

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    // Hide default cursor
    document.body.style.cursor = 'none';

    return () => {
      cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
      document.body.style.cursor = 'auto';
    };
  }, []);

  if (isTouch) return null;

  return (
    <>
      {/* Main cursor dot */}
      <div
        ref={cursorRef}
        className="magnetic-cursor"
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 99999,
          width: isPointer ? '40px' : '8px',
          height: isPointer ? '40px' : '8px',
          borderRadius: '50%',
          background: isPointer ? 'transparent' : 'var(--plasma-blue)',
          border: isPointer ? '1.5px solid var(--plasma-blue)' : 'none',
          pointerEvents: 'none',
          transition: 'width 0.3s ease, height 0.3s ease, background 0.3s ease, border 0.3s ease, opacity 0.3s ease',
          opacity: isHidden ? 0 : 1,
          mixBlendMode: 'difference',
        }}
      />
      {/* Trail */}
      <div
        ref={trailRef}
        style={{
          position: 'fixed', top: 0, left: 0, zIndex: 99998,
          width: '24px', height: '24px',
          borderRadius: '50%',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          pointerEvents: 'none',
          transition: 'opacity 0.3s ease',
          opacity: isHidden ? 0 : 0.5,
        }}
      />
    </>
  );
}
