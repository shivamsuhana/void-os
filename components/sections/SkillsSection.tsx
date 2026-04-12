'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { SKILLS, SKILL_CATEGORIES, Skill } from '@/lib/portfolio-data';

interface Node {
  id: string; name: string; category: string; proficiency: number;
  x: number; y: number; vx: number; vy: number;
  connections: string[]; glowing: boolean; glowIntensity: number;
  locked: boolean;
}

export default function SkillsSection() {
  const { navigateTo } = useVoidStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const animRef = useRef<number>(0);
  const mouseRef = useRef({ x: -999, y: -999 });
  const [hoveredSkill, setHoveredSkill] = useState<Skill | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<Node | null>(null);
  const activeCategoryRef = useRef<string | null>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const graphRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const catColorMap: Record<string, string> = {};
  SKILL_CATEGORIES.forEach(c => { catColorMap[c.name] = c.color; });

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.15 });
    if (backRef.current) tl.fromTo(backRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0);
    if (labelRef.current) tl.fromTo(labelRef.current, { opacity: 0, x: -15 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0.1);
    if (titleRef.current) tl.fromTo(titleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.2);
    if (subtitleRef.current) tl.fromTo(subtitleRef.current, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }, 0.3);
    if (graphRef.current) tl.fromTo(graphRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'power3.out' }, 0.4);
    if (sidebarRef.current) {
      const cards = sidebarRef.current.children;
      tl.fromTo(cards, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.4, stagger: 0.06, ease: 'power2.out' }, 0.5);
    }
    return () => { tl.kill(); };
  }, []);

  useEffect(() => { activeCategoryRef.current = activeCategory; }, [activeCategory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const W = canvas.getBoundingClientRect().width;
    const H = canvas.getBoundingClientRect().height;

    const nodes: Node[] = SKILLS.map((s) => ({
      ...s,
      x: W / 2 + (Math.random() - 0.5) * W * 0.5,
      y: H / 2 + (Math.random() - 0.5) * H * 0.5,
      vx: 0, vy: 0, glowing: false, glowIntensity: 0, locked: false,
    }));
    nodesRef.current = nodes;
    const nodeMap: Record<string, Node> = {};
    nodes.forEach(n => { nodeMap[n.id] = n; });

    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    };

    const simulate = () => {
      const cx = W / 2, cy = H / 2;
      for (const node of nodes) {
        if (node.locked) continue;

        // Center gravity — gentle
        node.vx += (cx - node.x) * 0.0003;
        node.vy += (cy - node.y) * 0.0003;

        // Repulsion — reduced strength
        for (const other of nodes) {
          if (node === other) continue;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          if (dist < 90) {
            const force = (90 - dist) / dist * 0.3;
            node.vx += dx * force * 0.005;
            node.vy += dy * force * 0.005;
          }
        }

        // Attraction to connected
        for (const connId of node.connections) {
          const other = nodeMap[connId];
          if (!other) continue;
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = (dist - 80) * 0.0015;
          node.vx += dx / dist * force;
          node.vy += dy / dist * force;
        }

        // Mouse — gentle push out instead of violent repulsion
        const mdx = node.x - mouseRef.current.x;
        const mdy = node.y - mouseRef.current.y;
        const mDist = Math.sqrt(mdx * mdx + mdy * mdy) || 1;
        if (mDist < 60) {
          node.vx += mdx / mDist * 0.3;
          node.vy += mdy / mDist * 0.3;
        }

        // High damping — nodes settle quickly
        node.vx *= 0.88; node.vy *= 0.88;
        node.x += node.vx; node.y += node.vy;
        node.x = Math.max(50, Math.min(W - 50, node.x));
        node.y = Math.max(50, Math.min(H - 50, node.y));

        if (node.glowing) {
          node.glowIntensity = Math.max(0, node.glowIntensity - 0.006);
          if (node.glowIntensity <= 0) node.glowing = false;
        }
      }
    };

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Background hex grid instead of square grid
      const hexR = 30;
      const hexH = hexR * Math.sqrt(3);
      ctx.strokeStyle = 'rgba(0,212,255,0.025)';
      ctx.lineWidth = 0.5;
      for (let gy = -1; gy < rect.height / hexH + 1; gy++) {
        for (let gx = -1; gx < rect.width / (hexR * 1.5) + 1; gx++) {
          const hcx = gx * hexR * 1.5;
          const hcy = gy * hexH + (gx % 2 ? hexH / 2 : 0);
          ctx.beginPath();
          for (let a = 0; a < 6; a++) {
            const ang = Math.PI / 3 * a + Math.PI / 6;
            const px = hcx + hexR * 0.45 * Math.cos(ang);
            const py = hcy + hexR * 0.45 * Math.sin(ang);
            a === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
          }
          ctx.closePath(); ctx.stroke();
        }
      }

      const time = Date.now();

      // Edges — 3-layer rendering for 3D look
      for (const node of nodes) {
        for (const connId of node.connections) {
          const other = nodeMap[connId];
          if (!other || node.id > other.id) continue;
          const isGlowing = node.glowing && other.glowing;
          const color = catColorMap[node.category] || '#00D4FF';
          const isDimmed = activeCategoryRef.current && node.category !== activeCategoryRef.current && other.category !== activeCategoryRef.current;

          const mx = (node.x + other.x) / 2, my = (node.y + other.y) / 2;
          const dx = other.x - node.x, dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const perpX = -dy / dist * (dist * 0.1);
          const perpY = dx / dist * (dist * 0.1);
          const cpx = mx + perpX, cpy = my + perpY;

          if (isDimmed) {
            // Dim connections
            ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.quadraticCurveTo(cpx, cpy, other.x, other.y);
            ctx.strokeStyle = 'rgba(255,255,255,0.015)'; ctx.lineWidth = 0.5; ctx.stroke();
            continue;
          }

          // Layer 1: Wide outer glow (3D depth)
          ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.quadraticCurveTo(cpx, cpy, other.x, other.y);
          ctx.strokeStyle = hexToRgba(color, isGlowing ? 0.12 + node.glowIntensity * 0.15 : 0.02);
          ctx.lineWidth = isGlowing ? 8 : 4; ctx.stroke();

          // Layer 2: Mid glow
          ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.quadraticCurveTo(cpx, cpy, other.x, other.y);
          ctx.strokeStyle = hexToRgba(color, isGlowing ? 0.3 + node.glowIntensity * 0.3 : 0.06);
          ctx.lineWidth = isGlowing ? 3 : 1.5; ctx.stroke();

          // Layer 3: Bright core wire
          ctx.beginPath(); ctx.moveTo(node.x, node.y); ctx.quadraticCurveTo(cpx, cpy, other.x, other.y);
          ctx.strokeStyle = isGlowing ? hexToRgba(color, 0.6 + node.glowIntensity * 0.4) : hexToRgba(color, 0.12);
          ctx.lineWidth = isGlowing ? 1.2 : 0.6; ctx.stroke();

          // Data pulses — 2 per connection
          const nodeIdx = nodes.indexOf(node);
          for (let pi = 0; pi < 2; pi++) {
            const progress = ((time * 0.0005 + nodeIdx * 0.7 + pi * 1.5) % 3) / 3;
            const t2 = progress;
            const dotX = (1 - t2) * (1 - t2) * node.x + 2 * (1 - t2) * t2 * cpx + t2 * t2 * other.x;
            const dotY = (1 - t2) * (1 - t2) * node.y + 2 * (1 - t2) * t2 * cpy + t2 * t2 * other.y;

            // Trail
            for (let ti = 4; ti >= 0; ti--) {
              const tt = Math.max(0, t2 - ti * 0.012);
              const tx = (1 - tt) * (1 - tt) * node.x + 2 * (1 - tt) * tt * cpx + tt * tt * other.x;
              const ty = (1 - tt) * (1 - tt) * node.y + 2 * (1 - tt) * tt * cpy + tt * tt * other.y;
              ctx.beginPath(); ctx.arc(tx, ty, 1.5 - ti * 0.25, 0, Math.PI * 2);
              ctx.fillStyle = hexToRgba(color, (1 - ti / 4) * (isGlowing ? 0.35 : 0.12));
              ctx.fill();
            }

            // Pulse glow
            const pg = ctx.createRadialGradient(dotX, dotY, 0, dotX, dotY, 6);
            pg.addColorStop(0, hexToRgba(color, isGlowing ? 0.5 : 0.2));
            pg.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.beginPath(); ctx.arc(dotX, dotY, 6, 0, Math.PI * 2);
            ctx.fillStyle = pg; ctx.fill();

            // Core dot
            ctx.beginPath(); ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
            ctx.fillStyle = hexToRgba(color, isGlowing ? 0.9 : 0.5);
            ctx.fill();
          }
        }
      }

      // Nodes — premium multi-layer rendering
      for (const node of nodes) {
        const color = catColorMap[node.category] || '#00D4FF';
        const isDimmed = activeCategoryRef.current && node.category !== activeCategoryRef.current;
        const alphaMult = isDimmed ? 0.12 : 1;
        const baseR = 8 + (node.proficiency / 100) * 14;
        const pulseR = baseR + Math.sin(time * 0.002 + nodes.indexOf(node)) * 1;

        if (isDimmed) {
          // Dimmed node — simple
          ctx.beginPath(); ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(color, 0.06); ctx.fill();
          ctx.strokeStyle = hexToRgba(color, 0.08); ctx.lineWidth = 0.5; ctx.stroke();
          ctx.font = '9px "JetBrains Mono", monospace'; ctx.fillStyle = 'rgba(232,232,240,0.1)';
          ctx.textAlign = 'center'; ctx.fillText(node.name, node.x, node.y + pulseR + 14);
          continue;
        }

        // Layer 1: Outer aurora (largest glow)
        const auR = pulseR + 20 + (node.glowing ? node.glowIntensity * 15 : 0);
        const aurora = ctx.createRadialGradient(node.x, node.y, pulseR * 0.5, node.x, node.y, auR);
        aurora.addColorStop(0, hexToRgba(color, node.glowing ? 0.15 + node.glowIntensity * 0.2 : 0.04));
        aurora.addColorStop(0.6, hexToRgba(color, 0.01));
        aurora.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(node.x, node.y, auR, 0, Math.PI * 2);
        ctx.fillStyle = aurora; ctx.fill();

        // Layer 2: Glass body
        const bodyGrad = ctx.createRadialGradient(
          node.x - pulseR * 0.25, node.y - pulseR * 0.25, 0,
          node.x, node.y, pulseR
        );
        bodyGrad.addColorStop(0, hexToRgba(color, 0.7));
        bodyGrad.addColorStop(0.4, hexToRgba(color, 0.35));
        bodyGrad.addColorStop(0.8, hexToRgba(color, 0.12));
        bodyGrad.addColorStop(1, hexToRgba(color, 0.04));
        ctx.beginPath(); ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = bodyGrad; ctx.fill();

        // Layer 3: Rim ring
        ctx.beginPath(); ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
        ctx.strokeStyle = hexToRgba(color, node.glowing ? 0.7 : 0.25);
        ctx.lineWidth = node.glowing ? 1.5 : 0.8; ctx.stroke();

        // Layer 4: Specular highlight (top-left shine)
        const specGrad = ctx.createRadialGradient(
          node.x - pulseR * 0.3, node.y - pulseR * 0.35, 0,
          node.x - pulseR * 0.15, node.y - pulseR * 0.2, pulseR * 0.6
        );
        specGrad.addColorStop(0, 'rgba(255,255,255,0.2)');
        specGrad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.beginPath(); ctx.arc(node.x, node.y, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = specGrad; ctx.fill();

        // Layer 5: Bright inner core
        const coreR = pulseR * 0.3;
        const coreGrad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, coreR);
        coreGrad.addColorStop(0, 'rgba(255,255,255,0.4)');
        coreGrad.addColorStop(0.5, hexToRgba(color, 0.5));
        coreGrad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath(); ctx.arc(node.x, node.y, coreR, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad; ctx.fill();

        // Layer 6: Orbiting ring
        if (node.proficiency > 40) {
          const orbitR = pulseR + 4 + Math.sin(time * 0.0015 + nodes.indexOf(node) * 0.5) * 2;
          ctx.beginPath(); ctx.arc(node.x, node.y, orbitR, 0, Math.PI * 2);
          ctx.strokeStyle = hexToRgba(color, 0.08 + (node.glowing ? node.glowIntensity * 0.15 : 0));
          ctx.lineWidth = 0.5; ctx.stroke();

          // Orbiting dot
          const orbitAngle = time * 0.002 + nodes.indexOf(node);
          const odx = node.x + Math.cos(orbitAngle) * orbitR;
          const ody = node.y + Math.sin(orbitAngle) * orbitR;
          ctx.beginPath(); ctx.arc(odx, ody, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(color, 0.5); ctx.fill();
        }

        // Label
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.fillStyle = node.glowing ? hexToRgba(color, 0.9) : 'rgba(232,232,240,0.65)';
        ctx.textAlign = 'center';
        ctx.fillText(node.name, node.x, node.y + pulseR + 16);
      }
    };

    const loop = () => { simulate(); render(); animRef.current = requestAnimationFrame(loop); };
    loop();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      let found: Node | null = null;
      for (const node of nodes) {
        const r = 8 + (node.proficiency / 100) * 14;
        const dx = mouseRef.current.x - node.x;
        const dy = mouseRef.current.y - node.y;
        if (Math.sqrt(dx * dx + dy * dy) < r + 12) { found = node; break; }
      }
      if (found) {
        setHoveredSkill(SKILLS.find(s => s.id === found!.id) || null);
        setTooltipPos({ x: e.clientX, y: e.clientY });
        canvas.style.cursor = 'pointer';
      } else {
        setHoveredSkill(null);
        canvas.style.cursor = 'crosshair';
      }
    };

    const handleClick = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left, my = e.clientY - rect.top;
      for (const node of nodes) {
        const r = 8 + (node.proficiency / 100) * 14;
        if (Math.sqrt(Math.pow(mx - node.x, 2) + Math.pow(my - node.y, 2)) < r + 12) {
          // Set selected skill for detail panel
          setSelectedSkill(prev => prev?.id === node.id ? null : node);

          // BFS ripple
          const visited = new Set<string>();
          const queue: Array<{ id: string; depth: number }> = [{ id: node.id, depth: 0 }];
          visited.add(node.id);
          const processQueue = () => {
            if (queue.length === 0) return;
            const batch = queue.splice(0, queue.length);
            for (const item of batch) {
              const n = nodeMap[item.id];
              if (!n) continue;
              n.glowing = true;
              n.glowIntensity = Math.max(0.3, 1 - item.depth * 0.2);
              for (const connId of n.connections) {
                if (!visited.has(connId) && item.depth < 5) {
                  visited.add(connId);
                  queue.push({ id: connId, depth: item.depth + 1 });
                }
              }
            }
            if (queue.length > 0) setTimeout(processQueue, 150);
          };
          processQueue();
          break;
        }
      }
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(animRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--void)', overflow: 'auto', zIndex: 50 }}>
      <button ref={backRef} className="back-button" onClick={() => navigateTo('desktop')} style={{ opacity: 0 }}>← VOID DESKTOP</button>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1100px', margin: '0 auto', padding: '30px 20px 60px' }}>
        <div ref={labelRef} className="section-label" style={{ opacity: 0 }}>
          03 // SKILLS.sys
        </div>
        <h2 ref={titleRef} style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(28px, 4vw, 42px)',
          marginBottom: '8px', opacity: 0,
        }}>
          Neural <span className="glow-text-amber">Network</span>
        </h2>
        <p ref={subtitleRef} style={{
          fontSize: '13px', color: 'var(--text-dim)', marginBottom: '40px', maxWidth: '420px', lineHeight: 1.8, opacity: 0,
        }}>
          Skills rendered as a living neural network. Click any node to trigger a signal cascade.
        </p>

        <div id="skills-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 220px', gap: '20px', minHeight: '500px' }}>
          <style dangerouslySetInnerHTML={{ __html: '@media (max-width: 768px) { #skills-grid { grid-template-columns: 1fr !important; min-height: auto !important; } }' }} />

          {/* Canvas */}
          <div ref={graphRef} className="glass-card" style={{ overflow: 'hidden', padding: 0, opacity: 0 }}>
            <canvas ref={canvasRef} style={{ width: '100%', height: '500px', display: 'block', cursor: 'crosshair' }} />
          </div>

          {/* Sidebar */}
          <div ref={sidebarRef} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '4px' }}>
              FILTER CATEGORIES
            </div>
            <div
              onClick={() => setActiveCategory(null)}
              style={{
                padding: '10px 12px', cursor: 'pointer',
                border: `1px solid ${!activeCategory ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
                background: !activeCategory ? 'rgba(0,212,255,0.06)' : 'rgba(255,255,255,0.02)',
                borderRadius: '2px', transition: 'all 0.2s',
              }}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: !activeCategory ? '#00D4FF' : 'var(--text-muted)', letterSpacing: '1px' }}>ALL NODES</span>
            </div>
            {SKILL_CATEGORIES.map(cat => {
              const catSkills = SKILLS.filter(s => s.category === cat.name);
              const avg = Math.round(catSkills.reduce((a, s) => a + s.proficiency, 0) / catSkills.length);
              const isActive = activeCategory === cat.name;
              return (
                <div
                  key={cat.name}
                  onClick={() => setActiveCategory(isActive ? null : cat.name)}
                  style={{
                    padding: '12px', cursor: 'pointer',
                    border: `1px solid ${isActive ? cat.color + '44' : 'rgba(255,255,255,0.05)'}`,
                    borderLeft: isActive ? `3px solid ${cat.color}` : '1px solid rgba(255,255,255,0.05)',
                    background: isActive ? cat.color + '0a' : 'rgba(255,255,255,0.02)',
                    borderRadius: '2px', transition: 'all 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: cat.color, fontWeight: isActive ? 700 : 400 }}>{cat.name}</span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: isActive ? cat.color : 'var(--text-muted)' }}>{avg}%</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)' }}>
                    <div style={{
                      height: '100%', borderRadius: '2px', background: cat.color,
                      width: `${avg}%`, transition: 'width 1.5s ease',
                      boxShadow: isActive ? `0 0 10px ${cat.color}66` : `0 0 8px ${cat.color}44`,
                    }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    {catSkills.length} skills · {isActive ? 'ACTIVE' : 'CLICK TO FILTER'}
                  </div>
                </div>
              );
            })}

            {/* Selected skill detail panel */}
            {selectedSkill && (
              <div style={{
                marginTop: 8, padding: '14px',
                border: `1px solid ${catColorMap[selectedSkill.category]}33`,
                borderLeft: `3px solid ${catColorMap[selectedSkill.category]}`,
                background: `${catColorMap[selectedSkill.category]}08`,
                borderRadius: '2px', transition: 'all 0.3s',
              }}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '2px', color: 'rgba(232,232,240,.3)', marginBottom: 6 }}>SELECTED NODE</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, color: catColorMap[selectedSkill.category], marginBottom: 4 }}>{selectedSkill.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text-muted)', marginBottom: 8 }}>{selectedSkill.category}</div>
                <div style={{ height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.06)', marginBottom: 4 }}>
                  <div style={{ height: '100%', borderRadius: '2px', background: catColorMap[selectedSkill.category], width: `${selectedSkill.proficiency}%`, boxShadow: `0 0 8px ${catColorMap[selectedSkill.category]}44` }} />
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: catColorMap[selectedSkill.category], fontWeight: 600 }}>{selectedSkill.proficiency}%</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--text-muted)', marginTop: 6 }}>
                  Connections: {selectedSkill.connections.length}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tooltip */}
      {hoveredSkill && (
        <div style={{
          position: 'fixed', left: tooltipPos.x + 14, top: tooltipPos.y - 8,
          zIndex: 100, padding: '12px 16px', borderRadius: '2px',
          background: 'rgba(3,3,6,0.97)', border: `1px solid ${catColorMap[hoveredSkill.category]}30`,
          backdropFilter: 'blur(12px)', pointerEvents: 'none',
          animation: 'fadeIn 0.15s ease',
          boxShadow: `0 0 20px ${catColorMap[hoveredSkill.category]}10`,
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>{hoveredSkill.name}</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: catColorMap[hoveredSkill.category], marginBottom: '8px', letterSpacing: '1px' }}>{hoveredSkill.category}</div>
          <div style={{ height: '3px', borderRadius: '1px', background: 'rgba(255,255,255,0.06)', width: '120px' }}>
            <div style={{ height: '100%', borderRadius: '1px', background: catColorMap[hoveredSkill.category], width: `${hoveredSkill.proficiency}%`, boxShadow: `0 0 6px ${catColorMap[hoveredSkill.category]}44` }} />
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: catColorMap[hoveredSkill.category], marginTop: '4px', fontWeight: 600 }}>{hoveredSkill.proficiency}%</div>
        </div>
      )}

      {/* CRT + Vignette */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
    </div>
  );
}
