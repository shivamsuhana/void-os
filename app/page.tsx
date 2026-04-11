'use client';

import dynamic from 'next/dynamic';
import { useVoidStore } from '@/lib/store';

// Dynamic imports to code-split per section
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

function SectionRenderer() {
  const { activeSection } = useVoidStore();

  switch (activeSection) {
    case 'about': return <AboutSection />;
    case 'work': return <WorkSection />;
    case 'skills': return <SkillsSection />;
    case 'timeline': return <TimelineSection />;
    case 'contact': return <ContactSection />;
    case 'lab': return <LabSection />;
    default: return null;
  }
}

export default function VoidOS() {
  const { bootComplete, activeSection } = useVoidStore();

  return (
    <main style={{ background: 'var(--void-black)', minHeight: '100vh' }}>
      {/* Boot Sequence — shows until user presses a key */}
      {!bootComplete && <BootSequence />}

      {/* VOID Desktop — shows when boot is complete and on desktop */}
      {bootComplete && activeSection === 'desktop' && <VoidDesktop />}

      {/* Section Apps — render based on active section */}
      {bootComplete && activeSection !== 'desktop' && activeSection !== 'boot' && (
        <SectionRenderer />
      )}

      {/* Global Systems — always active after boot */}
      {bootComplete && (
        <>
          <MagneticCursor />
          <EasterEggSystem />
          <SoundManager />
          <NoiseBg />
          <Screensaver />
        </>
      )}
    </main>
  );
}
