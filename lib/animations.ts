import gsap from 'gsap';

/**
 * VOID OS — GSAP Animation Presets
 * 
 * Reusable animation functions for choreographed section entrances.
 * Every section should use these for visual consistency.
 */

/**
 * Stagger-reveal a set of elements from below with opacity fade
 */
export function staggerReveal(
  targets: gsap.TweenTarget,
  opts?: { delay?: number; stagger?: number; y?: number; duration?: number }
) {
  return gsap.fromTo(targets,
    { opacity: 0, y: opts?.y ?? 30, willChange: 'transform, opacity' },
    {
      opacity: 1, y: 0,
      duration: opts?.duration ?? 0.8,
      stagger: opts?.stagger ?? 0.12,
      delay: opts?.delay ?? 0,
      ease: 'power3.out',
      clearProps: 'willChange',
    }
  );
}

/**
 * Reveal text character-by-character with a scramble-decode effect
 */
export function textReveal(target: HTMLElement, opts?: { delay?: number; duration?: number }) {
  const original = target.textContent || '';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*!?/\\|{}[]<>~^';
  const len = original.length;
  let resolved = 0;

  return gsap.to({}, {
    duration: opts?.duration ?? 1.2,
    delay: opts?.delay ?? 0,
    ease: 'none',
    onUpdate: function () {
      const progress = this.progress();
      resolved = Math.floor(progress * len);
      let result = '';
      for (let i = 0; i < len; i++) {
        if (original[i] === ' ') { result += ' '; continue; }
        if (i < resolved) { result += original[i]; }
        else { result += chars[Math.floor(Math.random() * chars.length)]; }
      }
      target.textContent = result;
    },
    onComplete: () => { target.textContent = original; },
  });
}

/**
 * Slide in from left/right
 */
export function slideIn(
  target: gsap.TweenTarget,
  direction: 'left' | 'right',
  opts?: { delay?: number; duration?: number; distance?: number }
) {
  const x = direction === 'left' ? -(opts?.distance ?? 60) : (opts?.distance ?? 60);
  return gsap.fromTo(target,
    { opacity: 0, x, willChange: 'transform, opacity' },
    {
      opacity: 1, x: 0,
      duration: opts?.duration ?? 0.9,
      delay: opts?.delay ?? 0,
      ease: 'power3.out',
      clearProps: 'willChange',
    }
  );
}

/**
 * Scale in with slight bounce
 */
export function scaleReveal(target: gsap.TweenTarget, opts?: { delay?: number; duration?: number }) {
  return gsap.fromTo(target,
    { opacity: 0, scale: 0.85, willChange: 'transform, opacity' },
    {
      opacity: 1, scale: 1,
      duration: opts?.duration ?? 0.7,
      delay: opts?.delay ?? 0,
      ease: 'back.out(1.4)',
      clearProps: 'willChange',
    }
  );
}

/**
 * Draw a line from 0 width to full
 */
export function lineReveal(target: gsap.TweenTarget, opts?: { delay?: number; duration?: number }) {
  return gsap.fromTo(target,
    { scaleX: 0, transformOrigin: 'left center' },
    {
      scaleX: 1,
      duration: opts?.duration ?? 0.8,
      delay: opts?.delay ?? 0,
      ease: 'power2.out',
    }
  );
}

/**
 * Glitch flash effect — rapid opacity flicker
 */
export function glitchFlash(target: gsap.TweenTarget, opts?: { delay?: number }) {
  const tl = gsap.timeline({ delay: opts?.delay ?? 0 });
  tl.to(target, { opacity: 0.3, duration: 0.05 })
    .to(target, { opacity: 1, duration: 0.05 })
    .to(target, { opacity: 0.5, duration: 0.03 })
    .to(target, { opacity: 1, duration: 0.05 })
    .to(target, { opacity: 0.7, duration: 0.04 })
    .to(target, { opacity: 1, duration: 0.08 });
  return tl;
}

/**
 * Magnetic hover effect — element follows cursor within bounds
 */
export function enableMagneticHover(element: HTMLElement, strength: number = 0.3) {
  const handleMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    gsap.to(element, { x: dx, y: dy, duration: 0.4, ease: 'power2.out' });
  };

  const handleLeave = () => {
    gsap.to(element, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
  };

  element.addEventListener('mousemove', handleMove);
  element.addEventListener('mouseleave', handleLeave);

  return () => {
    element.removeEventListener('mousemove', handleMove);
    element.removeEventListener('mouseleave', handleLeave);
  };
}

/**
 * Create a full section entrance timeline
 * Standard pattern: label → line → title → subtitle → content
 */
export function sectionEntrance(refs: {
  label?: HTMLElement | null;
  line?: HTMLElement | null;
  title?: HTMLElement | null;
  subtitle?: HTMLElement | null;
  content?: HTMLElement | HTMLElement[] | null;
}) {
  const tl = gsap.timeline({ delay: 0.2 });

  if (refs.label) {
    tl.fromTo(refs.label,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' },
      0
    );
  }

  if (refs.line) {
    tl.fromTo(refs.line,
      { scaleX: 0, transformOrigin: 'left center' },
      { scaleX: 1, duration: 0.7, ease: 'power2.out' },
      0.2
    );
  }

  if (refs.title) {
    tl.add(textReveal(refs.title, { duration: 0.8 }), 0.3);
    tl.fromTo(refs.title,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      0.3
    );
  }

  if (refs.subtitle) {
    tl.fromTo(refs.subtitle,
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
      0.6
    );
  }

  if (refs.content) {
    const targets = Array.isArray(refs.content) ? refs.content : [refs.content];
    tl.fromTo(targets,
      { opacity: 0, y: 25 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' },
      0.8
    );
  }

  return tl;
}
