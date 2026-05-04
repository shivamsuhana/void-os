'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useVoidStore, Section } from '@/lib/store';

/* ═══════════════════════════════════════════
   ACHIEVEMENT SYSTEM — Gamification Layer
   8 unlockable badges + XP + persistence
   ═══════════════════════════════════════════ */

interface Achievement {
  id: string;
  name: string;
  desc: string;
  icon: string;
  xp: number;
  color: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'system_breach', name: 'SYSTEM BREACH', desc: 'Complete the boot sequence', icon: '🔓', xp: 10, color: '#00D4FF' },
  { id: 'cartographer', name: 'CARTOGRAPHER', desc: 'Visit all 6 sections', icon: '🗺️', xp: 25, color: '#7B2FFF' },
  { id: 'scientist', name: 'SCIENTIST', desc: 'Enter the Lab', icon: '🔬', xp: 10, color: '#39FF14' },
  { id: 'first_contact', name: 'FIRST CONTACT', desc: 'Open the Contact terminal', icon: '💬', xp: 20, color: '#FF3366' },
  { id: 'konami_master', name: 'KONAMI MASTER', desc: 'Enter the Konami code', icon: '🎮', xp: 15, color: '#FFB800' },
  { id: 'deep_diver', name: 'DEEP DIVER', desc: 'Click 3 projects in Work tunnel', icon: '🕵️', xp: 20, color: '#7B2FFF' },
  { id: 'command_line', name: 'COMMAND LINE', desc: 'Use ⌘K palette 3 times', icon: '⌨️', xp: 15, color: '#00D4FF' },
  { id: 'speed_runner', name: 'SPEED RUNNER', desc: 'Skip the boot sequence', icon: '⚡', xp: 10, color: '#FFB800' },
  { id: 'night_owl', name: 'NIGHT OWL', desc: 'Visit after midnight', icon: '🦉', xp: 10, color: '#7B2FFF' },
  { id: 'glitch_hacker', name: 'GLITCH HACKER', desc: 'Trigger /glitch command', icon: '💀', xp: 15, color: '#FF3B5C' },
  { id: 'social_butterfly', name: 'SOCIAL BUTTERFLY', desc: 'Click a social link', icon: '🦋', xp: 10, color: '#00D4FF' },
  { id: 'void_master', name: 'VOID MASTER', desc: 'Unlock all other achievements', icon: '👑', xp: 50, color: '#FFB800' },
];

const SECTIONS_TO_TRACK: Section[] = ['about', 'work', 'skills', 'timeline', 'contact', 'lab'];

export default function AchievementSystem() {
  const { activeSection, bootComplete, easterEggsFound } = useVoidStore();
  const [unlocked, setUnlocked] = useState<string[]>([]);
  const [visitedSections, setVisitedSections] = useState<string[]>([]);
  const [panelOpen, setPanelOpen] = useState(false);
  const [newBadge, setNewBadge] = useState<Achievement | null>(null);
  const [paletteUses, setPaletteUses] = useState(0);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('void_achievements');
      if (saved) setUnlocked(JSON.parse(saved));
      const savedVisits = localStorage.getItem('void_visited');
      if (savedVisits) setVisitedSections(JSON.parse(savedVisits));
      const savedPalette = localStorage.getItem('void_palette_uses');
      if (savedPalette) setPaletteUses(parseInt(savedPalette));
    } catch { /* ignore */ }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('void_achievements', JSON.stringify(unlocked));
    } catch { /* ignore */ }
  }, [unlocked]);

  const unlock = useCallback((id: string) => {
    if (unlocked.includes(id)) return;
    setUnlocked(prev => {
      const next = [...prev, id];
      localStorage.setItem('void_achievements', JSON.stringify(next));
      return next;
    });
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (achievement) {
      setNewBadge(achievement);
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setNewBadge(null), 4000);
    }
  }, [unlocked]);

  // Track section visits
  useEffect(() => {
    if (SECTIONS_TO_TRACK.includes(activeSection) && !visitedSections.includes(activeSection)) {
      setVisitedSections(prev => {
        const next = [...prev, activeSection];
        localStorage.setItem('void_visited', JSON.stringify(next));
        return next;
      });
    }
  }, [activeSection, visitedSections]);

  // Track ⌘K usage  
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        setPaletteUses(prev => {
          const next = prev + 1;
          localStorage.setItem('void_palette_uses', String(next));
          return next;
        });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Check triggers
  useEffect(() => {
    // Boot complete
    if (bootComplete) unlock('system_breach');
    // Lab visited
    if (activeSection === 'lab') unlock('scientist');
    // Contact visited
    if (activeSection === 'contact') unlock('first_contact');
    // All sections visited
    if (SECTIONS_TO_TRACK.every(s => visitedSections.includes(s))) unlock('cartographer');
    // Konami code
    if (easterEggsFound.includes('konami')) unlock('konami_master');
    // Glitch hacker
    if (easterEggsFound.includes('glitch')) unlock('glitch_hacker');
    // Command palette 3 times
    if (paletteUses >= 3) unlock('command_line');
    // Speed runner — boot was skipped
    if (bootComplete && sessionStorage.getItem('void-os-booted')) unlock('speed_runner');
    // Night owl — visiting between midnight and 5am
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 5) unlock('night_owl');
    // Deep diver — track project clicks from localStorage
    try {
      const clicks = parseInt(localStorage.getItem('void_project_clicks') || '0');
      if (clicks >= 3) unlock('deep_diver');
    } catch { /* ignore */ }
    // All achievements unlocked → void master
    const nonMaster = ACHIEVEMENTS.filter(a => a.id !== 'void_master').map(a => a.id);
    if (nonMaster.every(id => unlocked.includes(id))) unlock('void_master');
  }, [bootComplete, activeSection, visitedSections, easterEggsFound, paletteUses, unlocked, unlock]);

  // Social butterfly — track external link clicks
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest('a');
      if (el && el.getAttribute('target') === '_blank') {
        unlock('social_butterfly');
      }
    };
    window.addEventListener('click', handler);
    return () => window.removeEventListener('click', handler);
  }, [unlock]);

  const totalXP = unlocked.reduce((sum, id) => sum + (ACHIEVEMENTS.find(a => a.id === id)?.xp || 0), 0);
  const maxXP = ACHIEVEMENTS.reduce((sum, a) => sum + a.xp, 0);

  return (
    <>
      {/* Achievement toast */}
      {newBadge && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', zIndex: 100001,
          padding: '14px 24px', background: 'rgba(8,8,20,0.95)',
          border: `1px solid ${newBadge.color}44`, boxShadow: `0 0 30px ${newBadge.color}22`,
          display: 'flex', alignItems: 'center', gap: 14,
          animation: 'achievementSlide 0.4s cubic-bezier(0.16,1,0.3,1)',
          fontFamily: 'var(--font-mono)',
        }}>
          <span style={{ fontSize: '22px' }}>{newBadge.icon}</span>
          <div>
            <div style={{ fontSize: '8px', letterSpacing: '2px', color: newBadge.color, marginBottom: 2 }}>ACHIEVEMENT UNLOCKED</div>
            <div style={{ fontSize: '12px', color: '#E8E8F0', fontWeight: 600 }}>{newBadge.name}</div>
            <div style={{ fontSize: '9px', color: 'rgba(232,232,240,0.3)', marginTop: 2 }}>{newBadge.desc} · +{newBadge.xp} XP</div>
          </div>
        </div>
      )}

      {/* Floating badge button */}
      <button
        onClick={() => setPanelOpen(prev => !prev)}
        style={{
          position: 'fixed', bottom: 44, left: 20, zIndex: 9999,
          width: 40, height: 40, borderRadius: 8,
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '16px', transition: 'all 0.2s',
          color: unlocked.length > 0 ? '#FFB800' : 'rgba(232,232,240,0.3)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,184,0,0.3)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
      >
        🏆
        {unlocked.length > 0 && (
          <span style={{
            position: 'absolute', top: -4, right: -4,
            width: 16, height: 16, borderRadius: '50%',
            background: '#FFB800', color: '#030306',
            fontSize: '9px', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)',
          }}>{unlocked.length}</span>
        )}
      </button>

      {/* Achievement panel */}
      {panelOpen && (
        <div style={{
          position: 'fixed', bottom: 94, left: 20, zIndex: 9999,
          width: 300, background: 'rgba(8,8,20,0.97)',
          border: '1px solid rgba(255,184,0,0.12)',
          boxShadow: '0 0 40px rgba(0,0,0,0.4)',
          animation: 'achievementSlide 0.3s cubic-bezier(0.16,1,0.3,1)',
          fontFamily: 'var(--font-mono)',
        }}>
          {/* Header */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '9px', letterSpacing: '2px', color: '#FFB800' }}>ACHIEVEMENTS</div>
              <div style={{ fontSize: '10px', color: 'rgba(232,232,240,0.3)', marginTop: 2 }}>{unlocked.length}/{ACHIEVEMENTS.length} unlocked</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#FFB800' }}>{totalXP}</div>
              <div style={{ fontSize: '7px', letterSpacing: '1.5px', color: 'rgba(232,232,240,0.2)' }}>/ {maxXP} XP</div>
            </div>
          </div>

          {/* XP bar */}
          <div style={{ padding: '0 16px', margin: '8px 0' }}>
            <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
              <div style={{ width: `${(totalXP / maxXP) * 100}%`, height: '100%', background: 'linear-gradient(90deg, #FFB800, #FF3366)', transition: 'width 0.5s', boxShadow: '0 0 6px rgba(255,184,0,0.4)' }} />
            </div>
          </div>

          {/* Badge list */}
          <div style={{ maxHeight: 280, overflowY: 'auto', padding: '4px 0' }}>
            {ACHIEVEMENTS.map(a => {
              const isUnlocked = unlocked.includes(a.id);
              return (
                <div key={a.id} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 16px',
                  opacity: isUnlocked ? 1 : 0.35,
                }}>
                  <span style={{ fontSize: '16px', filter: isUnlocked ? 'none' : 'grayscale(1)' }}>{a.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', fontWeight: 600, color: isUnlocked ? '#E8E8F0' : 'rgba(232,232,240,0.3)' }}>{a.name}</div>
                    <div style={{ fontSize: '8px', color: isUnlocked ? a.color : 'rgba(232,232,240,0.15)', marginTop: 1 }}>{a.desc}</div>
                  </div>
                  <span style={{ fontSize: '8px', color: isUnlocked ? a.color : 'rgba(232,232,240,0.1)' }}>+{a.xp}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: '@keyframes achievementSlide{from{opacity:0;transform:translateX(-50%) translateY(-10px);}to{opacity:1;transform:translateX(-50%) translateY(0);}}' }} />
    </>
  );
}
