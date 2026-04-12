'use client';

import { useEffect } from 'react';

/* ═══════════════════════════════════════════
   TIME THEME — Dynamic time-of-day visuals
   
   5am-8am  → Dawn (warm amber)
   8am-5pm  → Day (neutral cyan)
   5pm-8pm  → Dusk (purple/magenta)
   8pm-5am  → Night (deep blue, high contrast)
   ═══════════════════════════════════════════ */
export default function TimeTheme() {
  useEffect(() => {
    const update = () => {
      const hour = new Date().getHours();
      const root = document.documentElement;

      let phase: string;
      let hueShift: number;
      let satMult: number;
      let brightMult: number;
      let fogColor: string;

      if (hour >= 5 && hour < 8) {
        // Dawn — warm amber glow
        phase = 'dawn';
        hueShift = 30;     // shift toward warm
        satMult = 0.9;
        brightMult = 0.85;
        fogColor = 'rgba(40,20,5,0.15)';
      } else if (hour >= 8 && hour < 17) {
        // Day — neutral (default)
        phase = 'day';
        hueShift = 0;
        satMult = 1;
        brightMult = 1;
        fogColor = 'rgba(0,0,0,0)';
      } else if (hour >= 17 && hour < 20) {
        // Dusk — purple shift
        phase = 'dusk';
        hueShift = -20;
        satMult = 1.1;
        brightMult = 0.9;
        fogColor = 'rgba(30,10,40,0.12)';
      } else {
        // Night — deep blue, high contrast
        phase = 'night';
        hueShift = -10;
        satMult = 1.15;
        brightMult = 1.1;
        fogColor = 'rgba(0,5,20,0.1)';
      }

      root.style.setProperty('--time-hue-shift', `${hueShift}deg`);
      root.style.setProperty('--time-saturation', `${satMult}`);
      root.style.setProperty('--time-brightness', `${brightMult}`);
      root.style.setProperty('--time-fog', fogColor);
      root.dataset.timePhase = phase;
    };

    update();
    const iv = setInterval(update, 60000); // update every minute
    return () => clearInterval(iv);
  }, []);

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1,
        pointerEvents: 'none',
        background: 'var(--time-fog, rgba(0,0,0,0))',
        transition: 'background 60s ease',
        mixBlendMode: 'screen',
      }}
    />
  );
}
