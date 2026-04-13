'use client';

import { useEffect, useState } from 'react';
import { useVoidStore } from '@/lib/store';

/* ═══════════════════════════════════════════
   OS TASKBAR — Persistent bottom dock
   Visible on desktop + all sections (hidden during boot)

   Left:   VOID OS logo + version
   Center: Active section indicator
   Right:  Live clock + sound toggle + desktop button
   ═══════════════════════════════════════════ */

const SECTION_META: Record<string, { label: string; icon: string; color: string }> = {
  desktop:  { label: 'DESKTOP',  icon: '◈', color: '#00D4FF' },
  about:    { label: 'ABOUT',    icon: '◎', color: '#00D4FF' },
  work:     { label: 'WORK',     icon: '◆', color: '#7B2FFF' },
  skills:   { label: 'SKILLS',   icon: '⬡', color: '#FFB800' },
  timeline: { label: 'TIME',     icon: '◉', color: '#39FF14' },
  contact:  { label: 'CONTACT',  icon: '◇', color: '#FF3366' },
  lab:      { label: 'LAB',      icon: '⬢', color: '#39FF14' },
};

export default function OSTaskbar() {
  const { activeSection, navigateTo, soundEnabled, toggleSound } = useVoidStore();
  const [time, setTime] = useState('');
  const [uptime, setUptime] = useState(0);

  // Live clock
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', { hour12: false }));
      setUptime(prev => prev + 1);
    };
    update();
    const iv = setInterval(update, 1000);
    return () => clearInterval(iv);
  }, []);

  const meta = SECTION_META[activeSection] || SECTION_META.desktop;
  const isDesktop = activeSection === 'desktop';

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 34,
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        padding: '0 12px',
        background: 'rgba(5,5,16,0.8)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(0,212,255,0.06)',
        boxShadow: '0 -2px 20px rgba(0,0,0,0.3)',
        fontFamily: 'var(--font-mono)',
        gap: 8,
      }}
    >
      {/* ═══ LEFT: Logo + version ═══ */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: isDesktop ? 'default' : 'pointer',
          padding: '3px 8px',
          borderRadius: 3,
          transition: 'background 0.2s',
        }}
        onClick={() => !isDesktop && navigateTo('desktop')}
        onMouseEnter={e => {
          if (!isDesktop) e.currentTarget.style.background = 'rgba(0,212,255,0.06)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{
          width: 5, height: 5, borderRadius: '50%',
          background: '#39FF14',
          boxShadow: '0 0 4px #39FF1488',
        }} />
        <span style={{
          fontSize: '8px', letterSpacing: '1.5px',
          color: 'rgba(232,232,240,0.3)',
        }}>
          VOID OS
        </span>
        <span style={{
          fontSize: '7px',
          color: 'rgba(232,232,240,0.12)',
        }}>
          v3.0.1
        </span>
      </div>

      {/* Separator */}
      <div style={{
        width: 1, height: 14,
        background: 'rgba(232,232,240,0.06)',
      }} />

      {/* ═══ CENTER: Active section ═══ */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
      }}>
        {/* Active indicator */}
        <span style={{
          fontSize: '10px',
          color: meta.color,
          textShadow: `0 0 6px ${meta.color}66`,
          lineHeight: 1,
        }}>
          {meta.icon}
        </span>
        <span style={{
          fontSize: '8px',
          letterSpacing: '2px',
          color: `${meta.color}aa`,
          textShadow: `0 0 8px ${meta.color}22`,
        }}>
          {meta.label}
        </span>

        {/* PID badge */}
        <span style={{
          fontSize: '7px',
          color: 'rgba(232,232,240,0.1)',
          letterSpacing: '1px',
          padding: '1px 5px',
          border: '1px solid rgba(232,232,240,0.04)',
          borderRadius: 2,
        }}>
          PID:0x{Math.abs(activeSection.split('').reduce((a, c) => a + c.charCodeAt(0), 0)).toString(16).toUpperCase().padStart(3, '0')}
        </span>
      </div>

      {/* Separator */}
      <div style={{
        width: 1, height: 14,
        background: 'rgba(232,232,240,0.06)',
      }} />

      {/* ═══ RIGHT: System tray ═══ */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        {/* Sound toggle */}
        <button
          onClick={toggleSound}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '10px',
            color: soundEnabled ? 'rgba(57,255,20,0.5)' : 'rgba(232,232,240,0.15)',
            padding: '2px 4px',
            transition: 'color 0.2s',
          }}
          title={soundEnabled ? 'Mute' : 'Unmute'}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>

        {/* Uptime */}
        <span style={{
          fontSize: '7px',
          color: 'rgba(232,232,240,0.1)',
          letterSpacing: '1px',
        }}>
          UP:{Math.floor(uptime / 60).toString().padStart(2, '0')}:{(uptime % 60).toString().padStart(2, '0')}
        </span>

        {/* Clock */}
        <span style={{
          fontSize: '9px',
          letterSpacing: '1px',
          color: 'rgba(0,212,255,0.4)',
          fontVariantNumeric: 'tabular-nums',
          minWidth: 56,
          textAlign: 'right',
        }}>
          {time}
        </span>
      </div>
    </div>
  );
}
