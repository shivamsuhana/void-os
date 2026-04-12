'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useVoidStore, Section } from '@/lib/store';
import { PROJECTS, OWNER } from '@/lib/portfolio-data';

/* ═══════════════════════════════════════════
   COMMAND PALETTE — ⌘K / Ctrl+K
   VS Code-style instant navigation
   ═══════════════════════════════════════════ */

interface PaletteItem {
  id: string;
  label: string;
  sublabel: string;
  category: 'section' | 'project' | 'skill' | 'command';
  icon: string;
  color: string;
  action: () => void;
}

export default function CommandPalette() {
  const { navigateTo, addEasterEgg } = useVoidStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Build search index
  const allItems = useMemo<PaletteItem[]>(() => {
    const items: PaletteItem[] = [];

    // Sections
    const sections: { id: Section; label: string; icon: string; color: string; desc: string }[] = [
      { id: 'desktop', label: 'Desktop', icon: '◎', color: '#00D4FF', desc: 'Return to VOID desktop' },
      { id: 'about', label: 'About', icon: '◎', color: '#00D4FF', desc: 'Identity & manifesto' },
      { id: 'work', label: 'Work', icon: '◈', color: '#7B2FFF', desc: 'Project tunnel' },
      { id: 'skills', label: 'Skills', icon: '⬡', color: '#FFB800', desc: 'Neural network map' },
      { id: 'timeline', label: 'Timeline', icon: '◉', color: '#39FF14', desc: 'Career signal log' },
      { id: 'contact', label: 'Contact', icon: '◇', color: '#FF3366', desc: 'Send transmission' },
      { id: 'lab', label: 'Lab', icon: '⬢', color: '#39FF14', desc: 'Experiments' },
    ];
    sections.forEach(s => items.push({
      id: `section-${s.id}`, label: s.label, sublabel: s.desc,
      category: 'section', icon: s.icon, color: s.color,
      action: () => { navigateTo(s.id); setOpen(false); },
    }));

    // Projects
    PROJECTS.forEach(p => items.push({
      id: `project-${p.id}`, label: p.title, sublabel: p.description.slice(0, 50),
      category: 'project', icon: '◈', color: p.color,
      action: () => { navigateTo('work'); setOpen(false); },
    }));

    // Skills
    OWNER.techArsenal.forEach(skill => items.push({
      id: `skill-${skill}`, label: skill, sublabel: 'Tech arsenal',
      category: 'skill', icon: '⬡', color: '#FFB800',
      action: () => { navigateTo('skills'); setOpen(false); },
    }));

    // Secret commands
    items.push({
      id: 'cmd-sudo', label: '/sudo', sublabel: 'Attempt root access',
      category: 'command', icon: '⚡', color: '#FF3366',
      action: () => { addEasterEgg('sudo'); setOpen(false); },
    });
    items.push({
      id: 'cmd-matrix', label: '/matrix', sublabel: 'Enter the matrix',
      category: 'command', icon: '⚡', color: '#39FF14',
      action: () => { addEasterEgg('matrix'); setOpen(false); },
    });
    items.push({
      id: 'cmd-resume', label: '/resume', sublabel: 'View formatted resume',
      category: 'command', icon: '📄', color: '#00D4FF',
      action: () => { window.open('/resume', '_blank'); setOpen(false); },
    });

    return items;
  }, [navigateTo, addEasterEgg]);

  // Filtered results
  const filtered = useMemo(() => {
    if (!query.trim()) return allItems.slice(0, 12);
    const q = query.toLowerCase();
    return allItems.filter(item =>
      item.label.toLowerCase().includes(q) ||
      item.sublabel.toLowerCase().includes(q) ||
      item.category.includes(q)
    ).slice(0, 10);
  }, [query, allItems]);

  // Reset selection on filter change
  useEffect(() => { setSelected(0); }, [filtered]);

  // Keyboard shortcut to open
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open]);

  // Focus input on open
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard navigation
  const handleInputKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selected]) {
      filtered[selected].action();
    }
  }, [filtered, selected]);

  // Scroll selected into view
  useEffect(() => {
    if (listRef.current) {
      const el = listRef.current.children[selected] as HTMLElement;
      if (el) el.scrollIntoView({ block: 'nearest' });
    }
  }, [selected]);

  if (!open) return null;

  const categoryLabel: Record<string, string> = {
    section: 'SECTIONS', project: 'PROJECTS', skill: 'SKILLS', command: 'COMMANDS',
  };

  // Group by category
  let lastCat = '';

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100000,
      background: 'rgba(3,3,6,0.7)', backdropFilter: 'blur(12px)',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '15vh',
    }} onClick={() => setOpen(false)}>
      <div onClick={e => e.stopPropagation()} style={{
        width: '100%', maxWidth: 520,
        background: 'rgba(8,8,20,0.97)', border: '1px solid rgba(0,212,255,0.12)',
        boxShadow: '0 0 60px rgba(0,212,255,0.06), 0 20px 60px rgba(0,0,0,0.5)',
        overflow: 'hidden',
      }}>
        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(0,212,255,0.5)' }}>❯</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleInputKey}
            placeholder="Search sections, projects, skills, or type / for commands..."
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontFamily: 'var(--font-mono)', fontSize: '13px', color: '#E8E8F0',
              caretColor: '#00D4FF',
            }}
          />
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(232,232,240,0.2)',
            padding: '3px 6px', border: '1px solid rgba(255,255,255,0.06)', letterSpacing: '0.5px',
          }}>ESC</span>
        </div>

        {/* Results */}
        <div ref={listRef} style={{ maxHeight: 340, overflowY: 'auto', padding: '6px 0' }}>
          {filtered.length === 0 && (
            <div style={{ padding: '20px 18px', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'rgba(232,232,240,0.2)' }}>
              No results found
            </div>
          )}
          {filtered.map((item, i) => {
            const showCat = item.category !== lastCat;
            lastCat = item.category;
            return (
              <div key={item.id}>
                {showCat && (
                  <div style={{ padding: '8px 18px 4px', fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px', color: 'rgba(232,232,240,0.2)' }}>
                    {categoryLabel[item.category]}
                  </div>
                )}
                <div
                  onClick={() => item.action()}
                  onMouseEnter={() => setSelected(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 18px', cursor: 'pointer',
                    background: i === selected ? 'rgba(0,212,255,0.06)' : 'transparent',
                    borderLeft: i === selected ? `2px solid ${item.color}` : '2px solid transparent',
                    transition: 'background 0.1s',
                  }}
                >
                  <span style={{ fontSize: '14px', color: item.color, width: 20, textAlign: 'center' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: i === selected ? '#E8E8F0' : 'rgba(232,232,240,0.5)' }}>{item.label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'rgba(232,232,240,0.2)', marginTop: 2 }}>{item.sublabel}</div>
                  </div>
                  {item.category === 'section' && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(232,232,240,0.15)' }}>↵</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 18px', borderTop: '1px solid rgba(255,255,255,0.04)',
          display: 'flex', gap: 16, fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(232,232,240,0.15)',
        }}>
          <span>↑↓ navigate</span>
          <span>↵ select</span>
          <span>esc close</span>
          <span style={{ marginLeft: 'auto' }}>⌘K to toggle</span>
        </div>
      </div>
    </div>
  );
}
