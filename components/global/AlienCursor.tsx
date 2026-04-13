'use client';

import { useEffect, useRef, useState } from 'react';

/* ══════════════════════════════════════
   ALIEN CURSOR — 2045 crosshair with trail
   Pure CSS + minimal JS — zero canvas
   ══════════════════════════════════════ */
export default function AlienCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const [clicking, setClicking] = useState(false);
  const [hovering, setHovering] = useState(false);
  const posRef = useRef({ x: -200, y: -200 });
  const ringPosRef = useRef({ x: -200, y: -200 });

  useEffect(() => {
    let rafId: number;

    const moveCursor = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
      if (dotRef.current) {
        dotRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    // Lag ring follows smoothly
    const animateRing = () => {
      const target = posRef.current;
      ringPosRef.current.x += (target.x - ringPosRef.current.x) * 0.12;
      ringPosRef.current.y += (target.y - ringPosRef.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ringPosRef.current.x}px, ${ringPosRef.current.y}px)`;
      }
      rafId = requestAnimationFrame(animateRing);
    };
    rafId = requestAnimationFrame(animateRing);

    const onDown = () => setClicking(true);
    const onUp = () => setClicking(false);

    // Detect interactive elements
    const onCheck = (e: MouseEvent) => {
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const isInteractive = el?.closest('a,button,input,textarea,[role="button"],[style*="cursor: pointer"],[style*="cursor:pointer"]');
      setHovering(!!isInteractive);
    };

    window.addEventListener('mousemove', moveCursor, { passive: true });
    window.addEventListener('mousemove', onCheck, { passive: true });
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    // Hide default cursor
    document.documentElement.style.cursor = 'none';

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', moveCursor);
      window.removeEventListener('mousemove', onCheck);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
      document.documentElement.style.cursor = '';
    };
  }, []);

  const color = hovering ? '#FF3366' : '#00D4FF';
  const size = clicking ? 12 : hovering ? 20 : 16;
  const ringSize = clicking ? 28 : hovering ? 44 : 36;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        *{cursor:none!important;}
        @keyframes cursor-pulse{0%,100%{opacity:0.7;transform:scale(1)}50%{opacity:0.3;transform:scale(1.3)}}
        @keyframes cursor-ring-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
      `}} />

      {/* Crosshair */}
      <div ref={cursorRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 99999,
        pointerEvents: 'none', willChange: 'transform',
        marginLeft: -size/2, marginTop: -size/2,
        transition: 'width 0.15s, height 0.15s',
      }}>
        <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
          {/* Crosshair lines */}
          <line x1="10" y1="0" x2="10" y2="7" stroke={color} strokeWidth="1" opacity="0.9"/>
          <line x1="10" y1="13" x2="10" y2="20" stroke={color} strokeWidth="1" opacity="0.9"/>
          <line x1="0" y1="10" x2="7" y2="10" stroke={color} strokeWidth="1" opacity="0.9"/>
          <line x1="13" y1="10" x2="20" y2="10" stroke={color} strokeWidth="1" opacity="0.9"/>
          {/* Center dot */}
          <circle cx="10" cy="10" r="1.5" fill={color} opacity="1"/>
          {/* Corner marks */}
          <polyline points="4,7 4,4 7,4" stroke={color} strokeWidth="0.8" opacity="0.6" fill="none"/>
          <polyline points="13,4 16,4 16,7" stroke={color} strokeWidth="0.8" opacity="0.6" fill="none"/>
          <polyline points="4,13 4,16 7,16" stroke={color} strokeWidth="0.8" opacity="0.6" fill="none"/>
          <polyline points="16,13 16,16 13,16" stroke={color} strokeWidth="0.8" opacity="0.6" fill="none"/>
        </svg>
      </div>

      {/* Lagging outer ring */}
      <div ref={ringRef} style={{
        position: 'fixed', top: 0, left: 0, zIndex: 99998,
        pointerEvents: 'none', willChange: 'transform',
        marginLeft: -ringSize/2, marginTop: -ringSize/2,
        width: ringSize, height: ringSize,
        transition: 'width 0.2s, height 0.2s',
      }}>
        <svg width={ringSize} height={ringSize} viewBox="0 0 44 44" fill="none">
          {/* Dashed outer ring */}
          <circle cx="22" cy="22" r="20" stroke={color} strokeWidth="0.5" strokeDasharray="3 6" opacity={clicking ? 0.9 : 0.4}/>
          {/* Solid inner ring */}
          <circle cx="22" cy="22" r="16" stroke={color} strokeWidth="0.3" opacity={clicking ? 0.7 : 0.2}/>
          {/* Corner neon ticks */}
          <line x1="22" y1="2" x2="22" y2="6" stroke={color} strokeWidth="1" opacity="0.7"/>
          <line x1="22" y1="38" x2="22" y2="42" stroke={color} strokeWidth="1" opacity="0.7"/>
          <line x1="2" y1="22" x2="6" y2="22" stroke={color} strokeWidth="1" opacity="0.7"/>
          <line x1="38" y1="22" x2="42" y2="22" stroke={color} strokeWidth="1" opacity="0.7"/>
        </svg>
      </div>
    </>
  );
}
