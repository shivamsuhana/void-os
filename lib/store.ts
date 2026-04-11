import { create } from 'zustand';

export type Section = 'boot' | 'desktop' | 'about' | 'work' | 'skills' | 'timeline' | 'contact' | 'lab';
export type CursorMode = 'default' | 'pointer' | 'text' | 'image' | 'hidden';
export type BootPhase = 'bios' | 'diagnostics' | 'glitch' | 'particles' | 'tagline' | 'ready' | 'done';

interface VoidStore {
  // Boot
  bootPhase: BootPhase;
  setBootPhase: (phase: BootPhase) => void;
  bootComplete: boolean;
  setBootComplete: (v: boolean) => void;

  // Navigation + Transitions
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  previousSection: Section | null;
  isTransitioning: boolean;
  transitionTarget: Section | null;
  navigateTo: (section: Section) => void; // triggers transition → then swaps

  // Cursor
  cursorMode: CursorMode;
  setCursorMode: (mode: CursorMode) => void;
  cursorText: string;
  setCursorText: (text: string) => void;

  // Sound
  soundEnabled: boolean;
  toggleSound: () => void;

  // Easter Eggs
  labUnlocked: boolean;
  setLabUnlocked: (v: boolean) => void;
  easterEggsFound: string[];
  addEasterEgg: (egg: string) => void;

  // UI
  showScreensaver: boolean;
  setShowScreensaver: (v: boolean) => void;
}

export const useVoidStore = create<VoidStore>((set, get) => ({
  // Boot
  bootPhase: 'bios',
  setBootPhase: (phase) => set({ bootPhase: phase }),
  bootComplete: false,
  setBootComplete: (v) => set({ bootComplete: v }),

  // Navigation + Transitions
  activeSection: 'boot',
  setActiveSection: (section) =>
    set((state) => ({
      activeSection: section,
      previousSection: state.activeSection,
      isTransitioning: false,
      transitionTarget: null,
    })),
  previousSection: null,
  isTransitioning: false,
  transitionTarget: null,
  navigateTo: (section) => {
    const { activeSection } = get();
    if (section === activeSection) return;
    // Start transition: flag transitioning, set target
    set({ isTransitioning: true, transitionTarget: section });
    // After glitch-out animation completes, actually swap the section
    setTimeout(() => {
      set((state) => ({
        activeSection: section,
        previousSection: state.activeSection,
        isTransitioning: false,
        transitionTarget: null,
      }));
    }, 600); // 600ms = glitch-out duration
  },

  // Cursor
  cursorMode: 'default',
  setCursorMode: (mode) => set({ cursorMode: mode }),
  cursorText: '',
  setCursorText: (text) => set({ cursorText: text }),

  // Sound
  soundEnabled: false,
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

  // Easter Eggs
  labUnlocked: false,
  setLabUnlocked: (v) => set({ labUnlocked: v }),
  easterEggsFound: [],
  addEasterEgg: (egg) =>
    set((state) => ({
      easterEggsFound: state.easterEggsFound.includes(egg)
        ? state.easterEggsFound
        : [...state.easterEggsFound, egg],
    })),

  // UI
  showScreensaver: false,
  setShowScreensaver: (v) => set({ showScreensaver: v }),
}));
