'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useVoidStore } from '@/lib/store';

const BootSequence = dynamic(() => import('@/components/boot/BootSequence'), { ssr: false });
const VoidDesktop = dynamic(() => import('@/components/desktop/VoidDesktop'), { ssr: false });
const AboutSection = dynamic(() => import('@/components/sections/AboutSection'), { ssr: false });
const WorkSection = dynamic(() => import('@/components/sections/WorkSection'), { ssr: false });
const SkillsSection = dynamic(() => import('@/components/sections/SkillsSection'), { ssr: false });
const TimelineSection = dynamic(() => import('@/components/sections/TimelineSection'), { ssr: false });
const ContactSection = dynamic(() => import('@/components/sections/ContactSection'), { ssr: false });
const LabSection = dynamic(() => import('@/components/sections/LabSection'), { ssr: false });
const MagneticCursor = dynamic(() => import('@/components/global/MagneticCursor'), { ssr: false });
const EasterEggSystem = dynamic(() => import('@/components/global/EasterEggSystem'), { ssr: false });
const SoundManager = dynamic(() => import('@/components/global/SoundManager'), { ssr: false });
const NoiseBg = dynamic(() => import('@/components/global/NoiseBg'), { ssr: false });
const Screensaver = dynamic(() => import('@/components/global/Screensaver'), { ssr: false });
const TransitionManager = dynamic(() => import('@/components/global/TransitionManager'), { ssr: false });
const AITwinChat = dynamic(() => import('@/components/global/AITwinChat'), { ssr: false });
const CommandPalette = dynamic(() => import('@/components/global/CommandPalette'), { ssr: false });
const AchievementSystem = dynamic(() => import('@/components/global/AchievementSystem'), { ssr: false });
const TimeTheme = dynamic(() => import('@/components/global/TimeTheme'), { ssr: false });

/* ═══════════════════════════════════════════
   SECTOR LOADING — Brief terminal-style loader
   ═══════════════════════════════════════════ */
const SECTOR_META: Record<string, { name: string; ext: string; color: string; messages: string[] }> = {
  about:    { name: 'ABOUT', ext: '.exe',  color: '#00D4FF', messages: ['Parsing identity data...', 'Loading manifesto blocks...', 'Decrypting profile matrix...'] },
  work:     { name: 'WORK',  ext: '.db',   color: '#7B2FFF', messages: ['Indexing project records...', 'Loading deployment logs...', 'Building preview cache...'] },
  skills:   { name: 'SKILLS',ext: '.sys',  color: '#FFB800', messages: ['Mapping neural nodes...', 'Computing proficiency matrix...', 'Calibrating force graph...'] },
  timeline: { name: 'TIME',  ext: '.log',  color: '#39FF14', messages: ['Reading signal pathway...', 'Loading chronological data...', 'Initializing propagation...'] },
  contact:  { name: 'CONTACT',ext: '.net', color: '#FF3366', messages: ['Opening secure channel...', 'Establishing relay...', 'Handshake complete...'] },
  lab:      { name: 'LAB',   ext: '.beta', color: '#39FF14', messages: ['Loading experiments...', 'Compiling sandbox...', 'Activating protocols...'] },
};

function SectorLoader({ section, onDone }: { section: string; onDone: () => void }) {
  const [progress, setProgress] = useState(0);
  const [msgIdx, setMsgIdx] = useState(0);
  const meta = SECTOR_META[section] || SECTOR_META.about;

  useEffect(() => {
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 12 + 6;
      if (p > 100) p = 100;
      setProgress(p);
      if (p > 33 && msgIdx === 0) setMsgIdx(1);
      if (p > 66 && msgIdx <= 1) setMsgIdx(2);
      if (p >= 100) { clearInterval(iv); setTimeout(onDone, 150); }
    }, 50);
    return () => clearInterval(iv);
  }, [onDone, msgIdx]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200, background: '#030306',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-mono)',
    }}>
      <div style={{ width: 340 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
          <span style={{ fontSize: '10px', letterSpacing: '3px', color: meta.color, textShadow: `0 0 10px ${meta.color}44` }}>
            LOADING SECTOR: {meta.name}{meta.ext}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 3, background: 'rgba(255,255,255,0.04)', marginBottom: 12 }}>
          <div style={{
            height: '100%', width: `${progress}%`,
            background: `linear-gradient(90deg, ${meta.color}88, ${meta.color})`,
            boxShadow: `0 0 8px ${meta.color}66`,
            transition: 'width 0.08s linear',
          }} />
        </div>

        {/* Status messages */}
        <div style={{ fontSize: '9px', color: 'rgba(232,232,240,0.3)', lineHeight: 1.8 }}>
          {meta.messages.slice(0, msgIdx + 1).map((m, i) => (
            <div key={i} style={{
              color: i < msgIdx ? 'rgba(232,232,240,0.15)' : meta.color,
              animation: 'fadeIn 0.15s ease',
            }}>
              {i < msgIdx ? `✓ ${m}` : `› ${m}`}
            </div>
          ))}
        </div>

        {/* Percentage */}
        <div style={{ fontSize: '8px', color: 'rgba(232,232,240,0.2)', marginTop: 8, textAlign: 'right', letterSpacing: '1.5px' }}>
          {Math.floor(progress)}%
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SECTION RENDERER with loading state
   ═══════════════════════════════════════════ */
function SectionRenderer() {
  const { activeSection } = useVoidStore();
  const [loaded, setLoaded] = useState(false);
  const [currentSection, setCurrentSection] = useState(activeSection);

  useEffect(() => {
    if (activeSection !== currentSection) {
      setLoaded(false);
      setCurrentSection(activeSection);
    }
  }, [activeSection, currentSection]);

  if (!loaded && currentSection !== 'desktop' && currentSection !== 'boot') {
    return <SectorLoader section={currentSection} onDone={() => setLoaded(true)} />;
  }

  switch (currentSection) {
    case 'about': return <AboutSection />;
    case 'work': return <WorkSection />;
    case 'skills': return <SkillsSection />;
    case 'timeline': return <TimelineSection />;
    case 'contact': return <ContactSection />;
    case 'lab': return <LabSection />;
    default: return null;
  }
}

/* ═══════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════ */
export default function VoidOS() {
  const { bootComplete, activeSection } = useVoidStore();

  return (
    <main style={{ background: 'var(--void)', minHeight: '100vh' }}>
      {!bootComplete && <BootSequence />}
      {bootComplete && activeSection === 'desktop' && <VoidDesktop />}
      {bootComplete && activeSection !== 'desktop' && activeSection !== 'boot' && <SectionRenderer />}

      {bootComplete && (
        <>
          <TransitionManager />
          <MagneticCursor />
          <EasterEggSystem />
          <SoundManager />
          <NoiseBg />
          <Screensaver />
          <AITwinChat />
          <CommandPalette />
          <AchievementSystem />
          <TimeTheme />
        </>
      )}
    </main>
  );
}
