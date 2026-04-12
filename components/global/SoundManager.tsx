'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useVoidStore } from '@/lib/store';
import { audioEngine } from '@/lib/audio-engine';

/**
 * SoundManager v2 — Section-aware spatial audio controller
 * 
 * - 3-layer ambient drone (starts on sound enable)
 * - Whoosh on section transitions
 * - Spatial click/hover sounds (panned by cursor position)
 * - Boot sound on first load
 */
export default function SoundManager() {
  const { soundEnabled, toggleSound, isTransitioning, activeSection } = useVoidStore();
  const prevSectionRef = useRef(activeSection);
  const initializedRef = useRef(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Start/stop ambient drone
  useEffect(() => {
    if (soundEnabled) {
      audioEngine.startDrone();
      setHasInteracted(true);
    } else {
      audioEngine.stopDrone();
    }
    return () => { audioEngine.stopDrone(); };
  }, [soundEnabled]);

  // Section transition whoosh
  useEffect(() => {
    if (isTransitioning && soundEnabled) {
      audioEngine.play('whoosh', 0);
    }
  }, [isTransitioning, soundEnabled]);

  // Section change sound
  useEffect(() => {
    if (activeSection !== prevSectionRef.current && soundEnabled) {
      if (prevSectionRef.current === 'boot') {
        audioEngine.play('boot', 0);
      }
    }
    prevSectionRef.current = activeSection;
  }, [activeSection, soundEnabled]);

  // Attach spatial click sounds to all buttons
  useEffect(() => {
    if (!soundEnabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        const panX = (e.clientX / window.innerWidth) * 2 - 1; // -1 to 1
        audioEngine.play('click', panX);
      }
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'BUTTON' || target.tagName === 'A' || target.closest('button') || target.closest('a')) {
        const panX = (e.clientX / window.innerWidth) * 2 - 1;
        audioEngine.play('hover', panX);
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('mouseover', handleMouseOver);
    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('mouseover', handleMouseOver);
    };
  }, [soundEnabled]);

  return (
    <button
      onClick={() => {
        setHasInteracted(true);
        toggleSound();
      }}
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
        color: soundEnabled ? 'var(--blue)' : 'var(--text-muted)',
        animation: !hasInteracted && !soundEnabled ? 'strongPulse 2s infinite' : 'none',
        boxShadow: !hasInteracted && !soundEnabled ? '0 0 15px rgba(0,212,255,0.4)' : 'none',
      }}
      onMouseEnter={(e) => {
        setHasInteracted(true);
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
        e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
      }}
    >
      {soundEnabled ? '🔊' : '🔇'}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes strongPulse {
          0% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0.4); border-color: rgba(0, 212, 255, 0.5); }
          70% { box-shadow: 0 0 0 10px rgba(0, 212, 255, 0); border-color: rgba(255, 255, 255, 0.08); }
          100% { box-shadow: 0 0 0 0 rgba(0, 212, 255, 0); border-color: rgba(255, 255, 255, 0.08); }
        }
      `}} />
    </button>
  );
}
