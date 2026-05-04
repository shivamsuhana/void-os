'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useVoidStore } from '@/lib/store';

/* ═══════════════════════════════════════════
   VOID OS CONTEXT MENU — Premium right-click
   ═══════════════════════════════════════════ */

interface MenuItem {
  label: string;
  icon: string;
  shortcut?: string;
  color?: string;
  action: () => void;
  divider?: boolean;
}

export default function VoidContextMenu() {
  const { navigateTo, soundEnabled, toggleSound, setShowScreensaver } = useVoidStore();
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [hoveredIdx, setHoveredIdx] = useState(-1);
  const [animateIn, setAnimateIn] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => {
    setAnimateIn(false);
    setTimeout(() => setVisible(false), 120);
  }, []);

  const menuItems: MenuItem[] = [
    {
      label: 'Back to Desktop',
      icon: '◎',
      shortcut: 'ESC',
      color: '#00D4FF',
      action: () => { navigateTo('desktop'); close(); },
    },
    {
      label: 'Command Palette',
      icon: '⌘',
      shortcut: '⌘K',
      color: '#7B2FFF',
      action: () => {
        close();
        setTimeout(() => {
          window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, bubbles: true }));
        }, 150);
      },
    },
    {
      label: 'View Resume',
      icon: '📄',
      color: '#00D4FF',
      action: () => { window.open('/resume', '_blank'); close(); },
      divider: true,
    },
    {
      label: soundEnabled ? 'Mute Sound' : 'Enable Sound',
      icon: soundEnabled ? '🔇' : '🔊',
      color: '#39FF14',
      action: () => { toggleSound(); close(); },
    },
    {
      label: 'Screensaver',
      icon: '🌌',
      color: '#7B2FFF',
      action: () => { setShowScreensaver(true); close(); },
    },
    {
      label: 'Reload VOID OS',
      icon: '↻',
      shortcut: '⌘R',
      color: '#FFB800',
      action: () => { close(); setTimeout(() => window.location.reload(), 200); },
      divider: true,
    },
    {
      label: 'About VOID OS',
      icon: '⬡',
      color: '#00D4FF',
      action: () => {
        close();
        showAboutPopup();
      },
    },
  ];

  // About popup — z-index below cursor so cursor stays visible
  const showAboutPopup = () => {
    // Remove any existing about popup
    document.querySelector('.void-about-popup')?.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'void-about-popup';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:99000;
      background:rgba(3,3,6,0.6);backdrop-filter:blur(8px);
      display:flex;align-items:center;justify-content:center;
      animation:voidAboutOverlayIn 0.3s ease;cursor:pointer;
    `;
    
    const card = document.createElement('div');
    card.style.cssText = `
      padding:36px 48px;background:rgba(8,8,20,0.98);
      border:1px solid rgba(0,212,255,0.15);position:relative;
      font-family:'JetBrains Mono',monospace;text-align:center;
      animation:voidAboutCardIn 0.4s cubic-bezier(0.16,1,0.3,1);
      box-shadow:0 0 80px rgba(0,212,255,0.06),0 0 200px rgba(123,47,255,0.03),0 30px 80px rgba(0,0,0,0.5);
      cursor:default;max-width:320px;
    `;
    card.onclick = (e) => e.stopPropagation();
    
    card.innerHTML = `
      <div style="position:absolute;top:-1px;left:-1px;width:14px;height:14px;border-top:1px solid rgba(0,212,255,0.3);border-left:1px solid rgba(0,212,255,0.3)"></div>
      <div style="position:absolute;top:-1px;right:-1px;width:14px;height:14px;border-top:1px solid rgba(0,212,255,0.3);border-right:1px solid rgba(0,212,255,0.3)"></div>
      <div style="position:absolute;bottom:-1px;left:-1px;width:14px;height:14px;border-bottom:1px solid rgba(0,212,255,0.15);border-left:1px solid rgba(0,212,255,0.15)"></div>
      <div style="position:absolute;bottom:-1px;right:-1px;width:14px;height:14px;border-bottom:1px solid rgba(0,212,255,0.15);border-right:1px solid rgba(0,212,255,0.15)"></div>
      <div style="font-size:28px;margin-bottom:14px;filter:drop-shadow(0 0 12px rgba(0,212,255,0.4))">⬡</div>
      <div style="font-size:13px;letter-spacing:5px;color:#00D4FF;margin-bottom:6px;text-shadow:0 0 20px rgba(0,212,255,0.4)">VOID OS</div>
      <div style="font-size:9px;color:rgba(232,232,240,0.5);letter-spacing:1.5px;margin-bottom:16px">VERSION 3.0.1</div>
      <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(0,212,255,0.15),transparent);margin:0 -12px 16px"></div>
      <div style="font-size:8px;color:rgba(232,232,240,0.3);letter-spacing:1px;line-height:2">
        <div>NEXT.JS 16 · THREE.JS · GSAP</div>
        <div>REACT 19 · ZUSTAND · WEBGL</div>
      </div>
      <div style="height:1px;background:linear-gradient(90deg,transparent,rgba(123,47,255,0.15),transparent);margin:16px -12px"></div>
      <div style="font-size:8px;color:rgba(232,232,240,0.25);letter-spacing:1.5px;margin-bottom:20px">DESIGNED & BUILT BY KRISHU</div>
      <button onclick="document.querySelector('.void-about-popup').remove()" style="
        font-family:'JetBrains Mono',monospace;font-size:8px;letter-spacing:2px;
        color:rgba(0,212,255,0.5);padding:8px 20px;cursor:pointer;
        border:1px solid rgba(0,212,255,0.12);background:rgba(0,212,255,0.03);
        transition:all 0.3s;
      " onmouseenter="this.style.borderColor='rgba(0,212,255,0.35)';this.style.color='rgba(0,212,255,0.8)';this.style.background='rgba(0,212,255,0.06)';this.style.boxShadow='0 0 20px rgba(0,212,255,0.1)'"
         onmouseleave="this.style.borderColor='rgba(0,212,255,0.12)';this.style.color='rgba(0,212,255,0.5)';this.style.background='rgba(0,212,255,0.03)';this.style.boxShadow='none'"
      >CLOSE</button>
    `;
    
    overlay.appendChild(card);
    overlay.onclick = () => overlay.remove();
    document.body.appendChild(overlay);

    // Add keyframes if not present
    if (!document.querySelector('#void-about-styles')) {
      const style = document.createElement('style');
      style.id = 'void-about-styles';
      style.textContent = `
        @keyframes voidAboutOverlayIn { from{opacity:0} to{opacity:1} }
        @keyframes voidAboutCardIn { from{opacity:0;transform:scale(0.92) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
      `;
      document.head.appendChild(style);
    }
  };

  // Intercept right-click
  useEffect(() => {
    const handleContext = (e: MouseEvent) => {
      e.preventDefault();
      const x = Math.min(e.clientX, window.innerWidth - 240);
      const y = Math.min(e.clientY, window.innerHeight - 380);
      setPosition({ x, y });
      setVisible(true);
      setHoveredIdx(-1);
      requestAnimationFrame(() => setAnimateIn(true));
    };

    const handleClick = () => { if (visible) close(); };
    const handleScroll = () => { if (visible) close(); };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && visible) close(); };

    document.addEventListener('contextmenu', handleContext);
    document.addEventListener('click', handleClick);
    document.addEventListener('scroll', handleScroll, true);
    document.addEventListener('keydown', handleKey);

    return () => {
      document.removeEventListener('contextmenu', handleContext);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('keydown', handleKey);
    };
  }, [close, visible]);

  // Block inspect shortcuts (F12, Ctrl+Shift+I/J/C, Ctrl+U)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && /^[ijc]$/i.test(e.key)) ||
        (e.metaKey && e.altKey && /^[ijc]$/i.test(e.key)) ||
        ((e.ctrlKey || e.metaKey) && /^u$/i.test(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', handler, true);
    return () => document.removeEventListener('keydown', handler, true);
  }, []);

  if (!visible) return null;

  return (
    <div
      ref={menuRef}
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: position.x,
        top: position.y,
        zIndex: 99990,
        minWidth: 220,
        overflow: 'hidden',
        opacity: animateIn ? 1 : 0,
        transform: animateIn ? 'scale(1) translateY(0)' : 'scale(0.92) translateY(-6px)',
        transformOrigin: 'top left',
        transition: 'opacity 0.15s ease, transform 0.2s cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      {/* Outer glow border */}
      <div style={{
        position: 'absolute', inset: -1,
        background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(123,47,255,0.15), rgba(0,212,255,0.1))',
        filter: 'blur(0.5px)',
        zIndex: -1,
      }} />
      
      {/* Main panel */}
      <div style={{
        background: 'rgba(6,6,18,0.98)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 12px 50px rgba(0,0,0,0.7), 0 0 40px rgba(0,212,255,0.04), inset 0 1px 0 rgba(255,255,255,0.03)',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Animated scan line inside menu */}
        <div style={{
          position: 'absolute', left: 0, right: 0, height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.15), transparent)',
          animation: 'ctxScan 3s linear infinite',
          pointerEvents: 'none', zIndex: 5,
        }} />

        {/* Corner accents */}
        <div style={{ position: 'absolute', top: 0, left: 0, width: 10, height: 10, borderTop: '1px solid rgba(0,212,255,0.35)', borderLeft: '1px solid rgba(0,212,255,0.35)' }} />
        <div style={{ position: 'absolute', top: 0, right: 0, width: 10, height: 10, borderTop: '1px solid rgba(0,212,255,0.35)', borderRight: '1px solid rgba(0,212,255,0.35)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: 10, height: 10, borderBottom: '1px solid rgba(0,212,255,0.15)', borderLeft: '1px solid rgba(0,212,255,0.15)' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderBottom: '1px solid rgba(0,212,255,0.15)', borderRight: '1px solid rgba(0,212,255,0.15)' }} />

        {/* Header */}
        <div style={{
          padding: '10px 16px',
          borderBottom: '1px solid rgba(0,212,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(180deg, rgba(0,212,255,0.03), transparent)',
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#39FF14',
              boxShadow: '0 0 8px rgba(57,255,20,0.8), 0 0 16px rgba(57,255,20,0.3)',
            }} />
            <div style={{
              position: 'absolute', top: -2, left: -2, width: 9, height: 9, borderRadius: '50%',
              border: '1px solid rgba(57,255,20,0.2)',
              animation: 'ctxPulse 2s infinite',
            }} />
          </div>
          <span style={{
            fontSize: '8px', letterSpacing: '2.5px', color: 'rgba(0,212,255,0.5)',
            textShadow: '0 0 10px rgba(0,212,255,0.2)',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            VOID OS v3.0.1
          </span>
        </div>

        {/* Menu items */}
        <div style={{ padding: '4px 0' }}>
          {menuItems.map((item, i) => {
            const isHovered = hoveredIdx === i;
            return (
              <div key={i}>
                {item.divider && i > 0 && (
                  <div style={{
                    height: 1, margin: '4px 16px',
                    background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.08), transparent)',
                  }} />
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); item.action(); }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(-1)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    width: '100%', padding: '8px 16px',
                    fontSize: '11px',
                    color: isHovered ? (item.color || '#E8E8F0') : 'rgba(232,232,240,0.55)',
                    cursor: 'pointer',
                    textAlign: 'left', border: 'none',
                    fontFamily: "'JetBrains Mono', monospace",
                    position: 'relative', overflow: 'hidden',
                    background: isHovered ? 'rgba(0,212,255,0.04)' : 'transparent',
                    transition: 'all 0.15s ease',
                    textShadow: isHovered ? `0 0 12px ${item.color || '#00D4FF'}30` : 'none',
                  }}
                >
                  {/* Hover glow bar */}
                  {isHovered && (
                    <div style={{
                      position: 'absolute', left: 0, top: 0, bottom: 0, width: 2,
                      background: item.color || '#00D4FF',
                      boxShadow: `0 0 8px ${item.color || '#00D4FF'}60, 0 0 16px ${item.color || '#00D4FF'}20`,
                    }} />
                  )}
                  <span style={{
                    width: 18, textAlign: 'center', fontSize: '12px',
                    filter: isHovered ? `drop-shadow(0 0 4px ${item.color || '#00D4FF'}60)` : 'none',
                    transition: 'filter 0.15s',
                  }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.shortcut && (
                    <span style={{
                      fontSize: '8px',
                      color: isHovered ? 'rgba(232,232,240,0.35)' : 'rgba(232,232,240,0.15)',
                      letterSpacing: '0.5px',
                      padding: '2px 5px',
                      border: `1px solid ${isHovered ? 'rgba(255,255,255,0.06)' : 'transparent'}`,
                      transition: 'all 0.15s',
                    }}>{item.shortcut}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          borderTop: '1px solid rgba(0,212,255,0.06)',
          padding: '7px 16px',
          background: 'linear-gradient(0deg, rgba(0,212,255,0.02), transparent)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{
            fontSize: '7px', color: 'rgba(232,232,240,0.15)', letterSpacing: '1.5px',
            fontFamily: "'JetBrains Mono', monospace",
          }}>
            ⌘K MORE OPTIONS
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {['#00D4FF', '#7B2FFF', '#39FF14'].map((c, i) => (
              <div key={i} style={{
                width: 3, height: 3, borderRadius: '50%',
                background: c, opacity: 0.4,
                boxShadow: `0 0 4px ${c}40`,
              }} />
            ))}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ctxScan {
          0% { top: 0; }
          100% { top: 100%; }
        }
        @keyframes ctxPulse {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}} />
    </div>
  );
}
