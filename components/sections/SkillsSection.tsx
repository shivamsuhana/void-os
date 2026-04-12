'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { SKILLS, SKILL_CATEGORIES, Skill } from '@/lib/portfolio-data';
import { audioEngine } from '@/lib/audio-engine';

/* ═══════════════════════════════════════════
   COLOR MAP
   ═══════════════════════════════════════════ */
const CAT_COLORS: Record<string, string> = {};
SKILL_CATEGORIES.forEach(c => { CAT_COLORS[c.name] = c.color; });

const CAT_LABELS: Record<string, string> = {
  Core: 'CORE', Frontend: 'FRONTEND', Backend: 'BACKEND',
  Database: 'DATABASE', Tools: 'DEVOPS / TOOLS', 'Next Up': 'LEARNING',
};

/* ═══════════════════════════════════════════
   BUILD LINKS FROM CONNECTIONS
   ═══════════════════════════════════════════ */
const LINKS: [string, string][] = [];
const linkSet = new Set<string>();
SKILLS.forEach(skill => {
  skill.connections.forEach(targetId => {
    const key = [skill.id, targetId].sort().join('-');
    if (!linkSet.has(key)) {
      linkSet.add(key);
      LINKS.push([skill.id, targetId]);
    }
  });
});

/* ═══════════════════════════════════════════
   NODE TYPE
   ═══════════════════════════════════════════ */
interface GraphNode {
  id: string; name: string; category: string; proficiency: number;
  connections: string[];
  x: number; y: number; vx: number; vy: number;
  r: number; currentR: number; pulsePhase: number;
}

/* ═══════════════════════════════════════════
   LIQUID METAL BACKGROUND
   ═══════════════════════════════════════════ */
function LiquidMetalBG() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0, H = 0;
    const resize = () => {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();
    window.addEventListener('resize', resize);

    let t = 0;
    let frame: number;

    const draw = () => {
      t += 0.005;
      ctx.fillStyle = '#050510';
      ctx.fillRect(0, 0, W, H);

      // Flowing wave layers
      for (let layer = 0; layer < 5; layer++) {
        const speed = 0.25 + layer * 0.15;
        const amp = H * (0.035 + layer * 0.012);
        const freq = 0.0025 + layer * 0.0008;
        const phase = t * speed + layer * 1.3;
        const yBase = H * (0.15 + layer * 0.16);
        const alpha = 0.03 - layer * 0.004;
        const colors = [
          `rgba(0,212,255,${alpha})`,
          `rgba(123,47,255,${alpha * 0.8})`,
          `rgba(255,184,0,${alpha * 0.6})`,
          `rgba(57,255,20,${alpha * 0.5})`,
          `rgba(0,212,255,${alpha * 0.4})`,
        ];

        ctx.beginPath();
        ctx.moveTo(0, H);
        for (let x = 0; x <= W; x += 3) {
          const y = yBase
            + Math.sin(x * freq + phase) * amp
            + Math.sin(x * freq * 2.1 + phase * 1.3) * amp * 0.4
            + Math.cos(x * freq * 0.6 + phase * 0.7) * amp * 0.25;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(W, H); ctx.closePath();
        ctx.fillStyle = colors[layer];
        ctx.fill();
      }

      // Center radial pulse
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.8);
      const g = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.45);
      g.addColorStop(0, `rgba(123,47,255,${0.04 + pulse * 0.03})`);
      g.addColorStop(0.4, `rgba(0,212,255,${0.02 + pulse * 0.01})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      frame = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

/* ═══════════════════════════════════════════
   FORCE GRAPH — Live physics simulation
   ═══════════════════════════════════════════ */
function ForceGraph({ onSelect, selected, filter }: {
  onSelect: (s: Skill | null) => void;
  selected: Skill | null;
  filter: string | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<GraphNode[]>([]);
  const rafRef = useRef<number>(0);
  const hoveredRef = useRef<GraphNode | null>(null);
  const selectedRef = useRef<Skill | null>(null);
  const filterRef = useRef<string | null>(null);
  const mouseRef = useRef({ x: -999, y: -999 });

  useEffect(() => { filterRef.current = filter; }, [filter]);
  useEffect(() => { selectedRef.current = selected; }, [selected]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.offsetWidth; H = canvas.offsetHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();

    // Init nodes in orbital positions
    nodesRef.current = SKILLS.map((s, i) => {
      const angle = (i / SKILLS.length) * Math.PI * 2;
      const dist = 80 + Math.random() * 160;
      return {
        ...s,
        x: W / 2 + Math.cos(angle) * dist,
        y: H / 2 + Math.sin(angle) * dist,
        vx: 0, vy: 0,
        r: 12 + (s.proficiency / 100) * 18,
        currentR: 12 + (s.proficiency / 100) * 18,
        pulsePhase: Math.random() * Math.PI * 2,
      };
    });

    // Physics tick
    const simulate = () => {
      const nodes = nodesRef.current;
      const cx = W / 2, cy = H / 2;

      nodes.forEach(n => {
        // Center gravity
        const dx = cx - n.x, dy = cy - n.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        n.vx += dx * 0.015 / dist;
        n.vy += dy * 0.015 / dist;

        // Repulsion from all other nodes
        nodes.forEach(m => {
          if (m.id === n.id) return;
          const rx = n.x - m.x, ry = n.y - m.y;
          const rd = Math.sqrt(rx * rx + ry * ry) || 1;
          const minD = n.r + m.r + 35;
          if (rd < minD) {
            const force = (minD - rd) / minD * 0.7;
            n.vx += (rx / rd) * force;
            n.vy += (ry / rd) * force;
          }
        });

        // Link attraction
        LINKS.forEach(([a, b]) => {
          if (a !== n.id && b !== n.id) return;
          const otherId = a === n.id ? b : a;
          const other = nodes.find(x => x.id === otherId);
          if (!other) return;
          const lx = other.x - n.x, ly = other.y - n.y;
          const ld = Math.sqrt(lx * lx + ly * ly) || 1;
          const restLen = 100;
          const stretch = (ld - restLen) / ld * 0.035;
          n.vx += lx * stretch;
          n.vy += ly * stretch;
        });

        // Mouse repulsion
        const mx = mouseRef.current.x, my = mouseRef.current.y;
        if (mx > 0) {
          const mdx = n.x - mx, mdy = n.y - my;
          const md = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
          if (md < 80 && hoveredRef.current?.id !== n.id) {
            n.vx += (mdx / md) * 0.5;
            n.vy += (mdy / md) * 0.5;
          }
        }

        n.vx *= 0.82;
        n.vy *= 0.82;
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(n.r + 10, Math.min(W - n.r - 10, n.x));
        n.y = Math.max(n.r + 10, Math.min(H - n.r - 10, n.y));
      });
    };

    // Hit test
    const hitTest = (mx: number, my: number): GraphNode | null => {
      const nodes = nodesRef.current;
      for (let i = nodes.length - 1; i >= 0; i--) {
        const n = nodes[i];
        const dx = mx - n.x, dy = my - n.y;
        if (dx * dx + dy * dy < (n.r + 8) * (n.r + 8)) return n;
      }
      return null;
    };

    let t = 0;

    const draw = () => {
      simulate();
      t += 0.016;
      ctx.clearRect(0, 0, W, H);

      const nodes = nodesRef.current;
      const hov = hoveredRef.current;
      const sel = selectedRef.current;
      const filt = filterRef.current;

      // Highlighted set
      const highlighted = new Set<string>();
      const activeId = sel?.id || hov?.id;
      if (activeId) {
        highlighted.add(activeId);
        LINKS.forEach(([a, b]) => {
          if (a === activeId) highlighted.add(b);
          if (b === activeId) highlighted.add(a);
        });
      }

      // ── DRAW LINKS ──
      LINKS.forEach(([a, b]) => {
        const na = nodes.find(n => n.id === a);
        const nb = nodes.find(n => n.id === b);
        if (!na || !nb) return;

        const inFilter = !filt || na.category === filt || nb.category === filt;
        if (!inFilter) return;

        const isActive = activeId ? (highlighted.has(a) && highlighted.has(b)) : false;
        const dimmed = activeId ? !isActive : false;
        const alpha = dimmed ? 0.04 : (isActive ? 0.6 : 0.15);

        // Animated pulse along active links
        if (isActive) {
          const progress = (t * 0.6) % 1;
          const px = na.x + (nb.x - na.x) * progress;
          const py = na.y + (nb.y - na.y) * progress;
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = CAT_COLORS[na.category] || '#FFB800';
          ctx.globalAlpha = 0.9;
          ctx.fill();

          // Reverse pulse
          const progress2 = (t * 0.6 + 0.5) % 1;
          const px2 = na.x + (nb.x - na.x) * progress2;
          const py2 = na.y + (nb.y - na.y) * progress2;
          ctx.beginPath();
          ctx.arc(px2, py2, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
        }

        // Link line with gradient
        const colA = CAT_COLORS[na.category] || '#FFB800';
        const colB = CAT_COLORS[nb.category] || '#FFB800';
        const grad = ctx.createLinearGradient(na.x, na.y, nb.x, nb.y);
        const hex = (a: number) => Math.floor(a * 255).toString(16).padStart(2, '0');
        grad.addColorStop(0, colA + hex(alpha));
        grad.addColorStop(1, colB + hex(alpha));
        ctx.beginPath();
        ctx.moveTo(na.x, na.y);
        ctx.lineTo(nb.x, nb.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = isActive ? 1.8 : 0.8;
        ctx.stroke();
      });

      // ── DRAW NODES ──
      nodes.forEach(n => {
        const inFilter = !filt || n.category === filt;
        if (!inFilter) return;

        const isHov = hov?.id === n.id;
        const isSel = sel?.id === n.id;
        const isHighlighted = highlighted.size ? highlighted.has(n.id) : true;
        const dimmed = highlighted.size > 0 && !isHighlighted;
        const color = CAT_COLORS[n.category] || '#FFB800';

        // Smooth radius interpolation
        const targetR = isHov || isSel ? n.r * 1.4 : n.r;
        n.currentR += (targetR - n.currentR) * 0.12;

        const pulse = 0.88 + 0.12 * Math.sin(t * 2.5 + n.pulsePhase);
        const alpha = dimmed ? 0.12 : 1;
        const R = n.currentR * pulse;

        ctx.globalAlpha = alpha;

        // Outer glow rings for hovered/selected
        if ((isHov || isSel) && !dimmed) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, R + 12 + 5 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 1.2;
          ctx.globalAlpha = alpha * 0.35;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(n.x, n.y, R + 24 + 10 * pulse, 0, Math.PI * 2);
          ctx.strokeStyle = color;
          ctx.lineWidth = 0.6;
          ctx.globalAlpha = alpha * 0.12;
          ctx.stroke();
        }

        ctx.globalAlpha = alpha;

        // Node fill — radial gradient
        const gNode = ctx.createRadialGradient(n.x - R * 0.25, n.y - R * 0.25, 0, n.x, n.y, R);
        gNode.addColorStop(0, isHov || isSel ? color + 'cc' : color + '55');
        gNode.addColorStop(0.5, color + '25');
        gNode.addColorStop(1, color + '08');
        ctx.beginPath();
        ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
        ctx.fillStyle = gNode;
        ctx.fill();

        // Node border
        ctx.beginPath();
        ctx.arc(n.x, n.y, R, 0, Math.PI * 2);
        ctx.strokeStyle = color + (isHov || isSel ? 'ff' : '99');
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Inner bright dot
        if (isHov || isSel) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, R * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha * 0.7;
          ctx.fill();
          ctx.globalAlpha = alpha;
        }

        // Label
        const showFull = isHov || isSel || n.r > 20;
        if (showFull) {
          ctx.font = `bold ${Math.floor(Math.min(R * 0.42, 12))}px 'Syne', sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isHov || isSel ? '#EEEEF5' : color;
          ctx.globalAlpha = alpha * (isHov || isSel ? 1 : 0.85);
          ctx.fillText(n.name, n.x, n.y);
        } else {
          ctx.font = `9px 'JetBrains Mono', monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillStyle = color;
          ctx.globalAlpha = alpha * 0.65;
          ctx.fillText(n.name, n.x, n.y + R + 5);
        }

        // Proficiency ring arc
        if (!dimmed) {
          const startAngle = -Math.PI / 2;
          const endAngle = startAngle + (n.proficiency / 100) * Math.PI * 2;
          ctx.beginPath();
          ctx.arc(n.x, n.y, R + 3, startAngle, endAngle);
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.globalAlpha = alpha * 0.4;
          ctx.stroke();
        }

        ctx.globalAlpha = 1;
      });
    };

    const loop = () => { draw(); rafRef.current = requestAnimationFrame(loop); };
    loop();

    // Mouse events
    const getPos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onMove = (e: MouseEvent) => {
      const { x, y } = getPos(e);
      mouseRef.current = { x, y };
      const hit = hitTest(x, y);
      
      if (hit?.id !== hoveredRef.current?.id) {
        if (hit) {
          const panX = (e.clientX / window.innerWidth) * 2 - 1;
          audioEngine.play('hover', panX);
        }
      }
      
      hoveredRef.current = hit;
      canvas.style.cursor = hoveredRef.current ? 'pointer' : 'crosshair';
    };

    const onClick = (e: MouseEvent) => {
      const { x, y } = getPos(e);
      const hit = hitTest(x, y);
      if (hit) {
        const panX = (e.clientX / window.innerWidth) * 2 - 1;
        audioEngine.play('click', panX);
        const skill = SKILLS.find(s => s.id === hit.id);
        onSelect(skill || null);
      } else {
        onSelect(null);
      }
    };

    canvas.addEventListener('mousemove', onMove);
    canvas.addEventListener('click', onClick);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener('mousemove', onMove);
      canvas.removeEventListener('click', onClick);
      window.removeEventListener('resize', resize);
    };
  }, [onSelect]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
}

/* ═══════════════════════════════════════════
   SKILL POPUP — Detail panel
   ═══════════════════════════════════════════ */
function SkillPopup({ skill, onClose }: { skill: Skill; onClose: () => void }) {
  const [vis, setVis] = useState(false);
  const [barW, setBarW] = useState(0);

  useEffect(() => { setTimeout(() => { setVis(true); setBarW(skill.proficiency); }, 20); }, [skill.proficiency]);

  const color = CAT_COLORS[skill.category] || '#FFB800';
  const related = skill.connections
    .map(id => SKILLS.find(s => s.id === id))
    .filter(Boolean) as Skill[];

  const close = () => { setVis(false); setTimeout(onClose, 300); };

  return (
    <div style={{
      position: 'absolute', bottom: 24, right: 24, width: 280,
      border: `1px solid ${color}44`, background: 'rgba(5,5,16,0.96)',
      backdropFilter: 'blur(20px)', padding: 24, zIndex: 50,
      transform: vis ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.96)',
      opacity: vis ? 1 : 0,
      transition: 'all 0.35s cubic-bezier(0.16,1,0.3,1)',
      boxShadow: `0 0 50px ${color}18`,
    }}>
      {/* Corner accents */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 18, height: 18, borderTop: `2px solid ${color}`, borderLeft: `2px solid ${color}` }} />
      <div style={{ position: 'absolute', bottom: 0, right: 0, width: 18, height: 18, borderBottom: `2px solid ${color}`, borderRight: `2px solid ${color}` }} />

      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '3px', color, marginBottom: 8, textShadow: `0 0 8px ${color}40` }}>
        {CAT_LABELS[skill.category] || skill.category.toUpperCase()}
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '22px', marginBottom: 12, color: '#EEEEF5' }}>
        {skill.name}
      </div>

      {/* Level bar */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(232,232,240,0.5)', letterSpacing: '1.5px' }}>PROFICIENCY</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 700, color, textShadow: `0 0 8px ${color}50` }}>{skill.proficiency}%</span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
          <div style={{
            height: '100%', width: `${barW}%`, borderRadius: 2,
            background: `linear-gradient(90deg, ${color}66, ${color})`,
            boxShadow: `0 0 12px ${color}66`,
            transition: 'width 1s cubic-bezier(0.16,1,0.3,1) 0.1s',
          }} />
        </div>
      </div>

      {/* Connections */}
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'rgba(232,232,240,0.4)', letterSpacing: '2px', marginBottom: 8 }}>CONNECTED TO</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 20 }}>
        {related.map(r => (
          <span key={r.id} style={{
            fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1px',
            padding: '3px 8px', border: `1px solid ${CAT_COLORS[r.category]}44`,
            color: CAT_COLORS[r.category], background: `${CAT_COLORS[r.category]}0a`,
          }}>{r.name}</span>
        ))}
      </div>

      <button onClick={close} style={{
        background: 'none', border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(232,232,240,0.5)', fontFamily: 'var(--font-mono)',
        fontSize: '8px', letterSpacing: '2px', padding: '8px', cursor: 'pointer',
        transition: 'all 0.2s', width: '100%',
      }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.color = color; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(232,232,240,0.5)'; }}
      >CLOSE ×</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   CATEGORY FILTER
   ═══════════════════════════════════════════ */
function CategoryFilter({ active, onChange }: { active: string | null; onChange: (f: string | null) => void }) {
  const cats = [
    { id: null, label: 'ALL', color: '#00D4FF' },
    ...SKILL_CATEGORIES.map(c => ({ id: c.name, label: CAT_LABELS[c.name] || c.name, color: c.color })),
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {cats.map(c => {
        const isActive = active === c.id;
        return (
          <button key={String(c.id)} onClick={() => onChange(c.id)}
            style={{
              background: isActive ? `${c.color}15` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${isActive ? c.color + '55' : 'rgba(255,255,255,0.06)'}`,
              borderLeft: isActive ? `3px solid ${c.color}` : '1px solid rgba(255,255,255,0.06)',
              color: isActive ? c.color : 'rgba(232,232,240,0.45)',
              fontFamily: 'var(--font-mono)', fontSize: '9px', letterSpacing: '2px',
              padding: '8px 12px', cursor: 'pointer', transition: 'all 0.2s',
              textAlign: 'left',
              boxShadow: isActive ? `0 0 14px ${c.color}20` : 'none',
              textShadow: isActive ? `0 0 8px ${c.color}40` : 'none',
            }}
            onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = c.color + '44'; e.currentTarget.style.color = c.color; } }}
            onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(232,232,240,0.45)'; } }}
          >{c.label}</button>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   STATS ROW
   ═══════════════════════════════════════════ */
function StatsRow() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {SKILL_CATEGORIES.map(cat => {
        const catSkills = SKILLS.filter(s => s.category === cat.name);
        return (
          <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: cat.color, boxShadow: `0 0 6px ${cat.color}`, flexShrink: 0 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1px', color: 'rgba(232,232,240,0.5)', flex: 1 }}>
              {CAT_LABELS[cat.name] || cat.name}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: cat.color, fontWeight: 600 }}>
              {catSkills.length}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SKILLS SECTION — Force Graph + Panel
   ═══════════════════════════════════════════ */
export default function SkillsSection() {
  const { navigateTo } = useVoidStore();
  const [selected, setSelected] = useState<Skill | null>(null);
  const [filter, setFilter] = useState<string | null>(null);
  const [entered, setEntered] = useState(false);
  const onSelect = useCallback((s: Skill | null) => setSelected(s), []);

  useEffect(() => { setTimeout(() => setEntered(true), 100); }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#050510', overflow: 'hidden', zIndex: 50, fontFamily: 'var(--font-mono)', color: '#EEEEF5' }}>
      <LiquidMetalBG />

      {/* CRT overlay */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.45) 100%)' }} />

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20,
        padding: '14px clamp(16px, 3vw, 40px)',
        background: 'rgba(5,5,16,0.75)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(0,212,255,0.1)',
        display: 'flex', alignItems: 'center', gap: 14,
      }}>
        <button onClick={() => navigateTo('desktop')} style={{
          background: 'none', border: '1px solid rgba(0,212,255,0.2)', padding: '5px 14px',
          fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '1.5px', color: '#00D4FF',
          cursor: 'pointer', transition: 'all 0.2s', borderRadius: 2,
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.5)'; e.currentTarget.style.background = 'rgba(0,212,255,0.06)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'; e.currentTarget.style.background = 'none'; }}
        >← DESKTOP</button>
        <div style={{ width: 1, height: 14, background: 'rgba(0,212,255,0.15)' }} />
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#39FF14', boxShadow: '0 0 8px rgba(57,255,20,0.6)' }} />
        <span style={{ fontSize: '9px', letterSpacing: '3px', color: 'rgba(232,232,240,0.55)' }}>VOID_OS</span>
        <span style={{ color: 'rgba(232,232,240,0.2)' }}>/</span>
        <span style={{ fontSize: '9px', letterSpacing: '2px', color: '#FFB800', textShadow: '0 0 8px rgba(255,184,0,0.3)' }}>SKILLS.sys</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 20 }}>
          <span style={{ fontSize: '8px', letterSpacing: '1.5px', color: 'rgba(232,232,240,0.4)' }}>{SKILLS.length} NODES</span>
          <span style={{ fontSize: '8px', letterSpacing: '1.5px', color: 'rgba(232,232,240,0.4)' }}>{LINKS.length} CONNECTIONS</span>
        </div>
      </div>

      {/* Right sidebar */}
      <div id="skills-sidebar" style={{
        position: 'absolute', top: 50, right: 0, bottom: 0,
        width: 'clamp(200px, 22%, 280px)',
        padding: 'clamp(16px, 2vw, 28px)',
        background: 'rgba(5,5,16,0.65)', backdropFilter: 'blur(16px)',
        borderLeft: '1px solid rgba(0,212,255,0.08)',
        display: 'flex', flexDirection: 'column', gap: 16,
        zIndex: 10, overflowY: 'auto',
        opacity: entered ? 1 : 0,
        transform: entered ? 'translateX(0)' : 'translateX(30px)',
        transition: 'opacity 0.8s ease, transform 0.8s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <style dangerouslySetInnerHTML={{ __html: '@media (max-width: 768px) { #skills-sidebar { display: none !important; } }' }} />

        <div>
          <div style={{ fontSize: '8px', letterSpacing: '3.5px', color: '#7B2FFF', marginBottom: 8, textShadow: '0 0 8px rgba(123,47,255,0.3)' }}>NEURAL_MAP.sys</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', lineHeight: 1.15, marginBottom: 8 }}>
            Skills<br /><span style={{ color: '#FFB800', textShadow: '0 0 12px rgba(255,184,0,0.3)' }}>Network</span>
          </div>
          <div style={{ fontSize: '10px', lineHeight: 1.7, color: 'rgba(232,232,240,0.55)' }}>
            Hover nodes to see connections. Click to inspect details.
          </div>
        </div>

        <div style={{ height: 1, background: 'rgba(0,212,255,0.1)' }} />

        <div>
          <div style={{ fontSize: '8px', letterSpacing: '2.5px', color: 'rgba(232,232,240,0.4)', marginBottom: 10 }}>FILTER BY CATEGORY</div>
          <CategoryFilter active={filter} onChange={f => { setFilter(f); setSelected(null); }} />
        </div>

        <div style={{ height: 1, background: 'rgba(0,212,255,0.1)' }} />

        <div>
          <div style={{ fontSize: '8px', letterSpacing: '2.5px', color: 'rgba(232,232,240,0.4)', marginBottom: 10 }}>NODE SIZE = PROFICIENCY</div>
          <StatsRow />
        </div>

        <div style={{ flex: 1 }} />
        <div style={{ fontSize: '7px', color: 'rgba(232,232,240,0.25)', letterSpacing: '1.5px', lineHeight: 2 }}>
          SKILLS.sys v2.0<br />NODES: LIVE SIMULATION<br />ENGINE: FORCE-DIRECTED GRAPH
        </div>
      </div>

      {/* Graph canvas area */}
      <div style={{
        position: 'absolute', top: 50, left: 0, right: 'clamp(200px, 22%, 280px)', bottom: 0, zIndex: 5,
      }}>
        <ForceGraph onSelect={onSelect} selected={selected} filter={filter} />

        {selected && <SkillPopup skill={selected} onClose={() => setSelected(null)} />}

        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          fontSize: '9px', letterSpacing: '2.5px', color: 'rgba(232,232,240,0.35)',
          pointerEvents: 'none', whiteSpace: 'nowrap',
          textShadow: '0 0 8px rgba(0,0,0,0.5)',
        }}>
          HOVER NODES · CLICK TO INSPECT · GRAPH IS LIVE
        </div>
      </div>
    </div>
  );
}
