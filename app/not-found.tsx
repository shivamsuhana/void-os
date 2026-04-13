'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

/**
 * VOID OS — Custom 404 "SECTOR NOT FOUND" page
 * CRT-style error screen with glitch text and scanlines
 */
export default function NotFound() {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tl = gsap.timeline();

    // Glitch flicker
    if (textRef.current) {
      tl.fromTo(textRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, 0.2);
      // Random glitch loop
      const glitchLoop = () => {
        if (!textRef.current) return;
        gsap.to(textRef.current, {
          x: (Math.random() - 0.5) * 6,
          skewX: (Math.random() - 0.5) * 3,
          duration: 0.05,
          onComplete: () => {
            gsap.to(textRef.current!, { x: 0, skewX: 0, duration: 0.05 });
          },
        });
        setTimeout(glitchLoop, 2000 + Math.random() * 4000);
      };
      setTimeout(glitchLoop, 1500);
    }

    if (subRef.current) {
      tl.fromTo(subRef.current, { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.6);
    }

    return () => { tl.kill(); };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed', inset: 0, background: '#030306',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'JetBrains Mono', monospace", overflow: 'hidden',
      }}
    >
      {/* Scanlines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 2,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)',
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
      }} />

      {/* Error code */}
      <div style={{
        fontSize: '10px', letterSpacing: '4px', color: '#FF3366',
        marginBottom: 20, textShadow: '0 0 10px rgba(255,51,102,0.5)',
      }}>
        ERROR 0x404
      </div>

      {/* Main text */}
      <h1
        ref={textRef}
        style={{
          fontSize: 'clamp(36px, 8vw, 72px)', fontWeight: 800,
          fontFamily: "'Syne', sans-serif", color: '#E8E8F0', opacity: 0,
          textShadow: '0 0 30px rgba(255,51,102,0.2)',
          letterSpacing: '4px', textAlign: 'center',
          margin: '0 20px',
        }}
      >
        SECTOR <span style={{ color: '#FF3366' }}>NOT FOUND</span>
      </h1>

      {/* Subtext */}
      <div ref={subRef} style={{ opacity: 0, textAlign: 'center', marginTop: 24 }}>
        <div style={{
          fontSize: '11px', color: 'rgba(232,232,240,0.4)', letterSpacing: '2px',
          lineHeight: 2, maxWidth: 400, margin: '0 20px',
        }}>
          The requested sector does not exist in the VOID OS filesystem.
          <br />
          The path you navigated to has no registered module.
        </div>

        {/* Terminal log */}
        <div style={{
          marginTop: 24, padding: '14px 20px',
          border: '1px solid rgba(255,51,102,0.15)',
          background: 'rgba(255,51,102,0.03)',
          textAlign: 'left', maxWidth: 360, margin: '24px auto 0',
        }}>
          <div style={{ fontSize: '9px', color: '#FF3366', letterSpacing: '1.5px', marginBottom: 6 }}>
            VOID_OS:~$ locate sector
          </div>
          <div style={{ fontSize: '9px', color: 'rgba(232,232,240,0.25)', lineHeight: 1.8 }}>
            {'>'} Scanning filesystem... <span style={{ color: '#FF3366' }}>FAILED</span><br />
            {'>'} Sector address: INVALID<br />
            {'>'} Suggestion: return to desktop
          </div>
        </div>

        {/* CTA */}
        <a
          href="/"
          style={{
            display: 'inline-block', marginTop: 32,
            padding: '10px 24px',
            fontSize: '10px', letterSpacing: '3px',
            color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)',
            textDecoration: 'none', transition: 'all 0.3s',
            background: 'rgba(0,212,255,0.04)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(0,212,255,0.1)';
            e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)';
            e.currentTarget.style.boxShadow = '0 0 20px rgba(0,212,255,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(0,212,255,0.04)';
            e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          ← RETURN TO DESKTOP
        </a>
      </div>
    </div>
  );
}
