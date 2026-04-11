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

  // Navigation
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  previousSection: Section | null;

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

export const useVoidStore = create<VoidStore>((set) => ({
  // Boot
  bootPhase: 'bios',
  setBootPhase: (phase) => set({ bootPhase: phase }),
  bootComplete: false,
  setBootComplete: (v) => set({ bootComplete: v }),

  // Navigation
  activeSection: 'boot',
  setActiveSection: (section) =>
    set((state) => ({
      activeSection: section,
      previousSection: state.activeSection,
    })),
  previousSection: null,

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
