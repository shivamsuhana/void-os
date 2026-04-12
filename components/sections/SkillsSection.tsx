'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { useVoidStore } from '@/lib/store';
import { SKILLS, SKILL_CATEGORIES, Skill } from '@/lib/portfolio-data';
import SectionAmbientBG from '@/components/global/SectionAmbientBG';

/* ═══════════════════════════════════════════
   SKILL NODE — Interactive card with glow
   ═══════════════════════════════════════════ */
function SkillNode({ skill, color, delay, active }: { skill: Skill; color: string; delay: number; active: boolean }) {
  const [hov, setHov] = useState(false);
  const [visible, setVisible] = useState(false);
  const [barWidth, setBarWidth] = useState(0);
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => { setVisible(true); setBarWidth(skill.proficiency); }, delay);
    return () => clearTimeout(timer);
  }, [delay, skill.proficiency]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!nodeRef.current) return;
    const rect = nodeRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    nodeRef.current.style.background = `radial-gradient(circle at ${x}% ${y}%, ${color}18, ${color}08 50%, rgba(255,255,255,0.04))`;
  }, [color]);

  return (
    <div
      ref={nodeRef}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={(e) => { setHov(false); e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
      onMouseMove={handleMouseMove}
      style={{
        padding: '16px 18px',
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${hov ? color + '55' : active ? color + '30' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: '3px',
        opacity: visible ? (active ? 1 : 0.35) : 0,
        transform: visible ? (hov ? 'translateY(-3px) scale(1.02)' : 'translateY(0)') : 'translateY(20px)',
        transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: hov ? `0 6px 30px ${color}15, 0 0 15px ${color}08` : 'none',
        backdropFilter: 'blur(4px)',
      }}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: hov ? 2 : 1,
        background: `linear-gradient(90deg, transparent, ${color}${hov ? 'aa' : '44'}, transparent)`,
        transition: 'all 0.3s',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{
          fontFamily: 'var(--font-display)', fontSize: hov ? '15px' : '14px', fontWeight: 700,
          color: hov ? color : '#EEEEF5',
          textShadow: hov ? `0 0 12px ${color}50` : 'none',
          transition: 'all 0.3s',
        }}>{skill.name}</span>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 700,
          color, textShadow: `0 0 8px ${color}50`,
          transition: 'all 0.3s',
        }}>{skill.proficiency}%</span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: hov ? 6 : 4, borderRadius: 3,
        background: 'rgba(255,255,255,0.06)',
        transition: 'height 0.3s',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%', borderRadius: 3,
          width: `${barWidth}%`,
          background: `linear-gradient(90deg, ${color}66, ${color})`,
          boxShadow: hov ? `0 0 16px ${color}66, 0 0 30px ${color}22` : `0 0 8px ${color}44`,
          transition: 'width 1.5s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s',
        }} />
      </div>

      {/* Connections */}
      {hov && skill.connections.length > 0 && (
        <div style={{
          marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: '8px',
          color: `${color}88`, letterSpacing: '1px',
          animation: 'fadeIn 0.2s ease',
        }}>
          LINKED → {skill.connections.map(c => {
            const linked = SKILLS.find(s => s.id === c);
            return linked?.name;
          }).filter(Boolean).join(' · ')}
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════
   CATEGORY TAB
   ═══════════════════════════════════════════ */
function CategoryTab({ cat, isActive, onClick, skillCount, avg }: {
  cat: { name: string; color: string };
  isActive: boolean; onClick: () => void;
  skillCount: number; avg: number;
}) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '12px 20px',
        background: isActive ? `${cat.color}12` : hov ? 'rgba(255,255,255,0.04)' : 'transparent',
        border: `1px solid ${isActive ? cat.color + '55' : hov ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.04)'}`,
        borderBottom: isActive ? `2px solid ${cat.color}` : '2px solid transparent',
        borderRadius: '3px 3px 0 0',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
        fontFamily: 'var(--font-mono)',
        color: isActive ? cat.color : hov ? '#EEEEF5' : 'rgba(232,232,240,0.5)',
        transform: isActive ? 'translateY(-2px)' : 'none',
        boxShadow: isActive ? `0 4px 20px ${cat.color}15` : 'none',
      }}
    >
      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textShadow: isActive ? `0 0 10px ${cat.color}40` : 'none' }}>
        {cat.name.toUpperCase()}
      </span>
      <span style={{ fontSize: '8px', opacity: 0.6 }}>
        {skillCount} skills · {avg}%
      </span>
    </button>
  );
}

/* ═══════════════════════════════════════════
   STATS OVERVIEW — animated counters
   ═══════════════════════════════════════════ */
function StatsOverview() {
  const [totalSkills, setTotalSkills] = useState(0);
  const [avgProf, setAvgProf] = useState(0);
  const [topSkill, setTopSkill] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setTotalSkills(SKILLS.length);
      setAvgProf(Math.round(SKILLS.reduce((a, s) => a + s.proficiency, 0) / SKILLS.length));
      const top = SKILLS.reduce((a, b) => a.proficiency > b.proficiency ? a : b);
      setTopSkill(top.name);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: 'TOTAL NODES', value: totalSkills.toString(), color: '#00D4FF' },
    { label: 'AVG PROFICIENCY', value: `${avgProf}%`, color: '#FFB800' },
    { label: 'STRONGEST', value: topSkill, color: '#39FF14' },
    { label: 'CATEGORIES', value: SKILL_CATEGORIES.length.toString(), color: '#7B2FFF' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 32 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          padding: '14px 16px',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${s.color}20`,
          borderTop: `2px solid ${s.color}44`,
          borderRadius: '2px',
          textAlign: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '7px', letterSpacing: '2px', color: 'rgba(232,232,240,0.5)', marginBottom: 6 }}>{s.label}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 800, color: s.color, textShadow: `0 0 12px ${s.color}40` }}>{s.value}</div>
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════
   SKILLS SECTION — Complete rebuild
   ═══════════════════════════════════════════ */
export default function SkillsSection() {
  const { navigateTo } = useVoidStore();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const backRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const catColorMap: Record<string, string> = {};
  SKILL_CATEGORIES.forEach(c => { catColorMap[c.name] = c.color; });

  useEffect(() => {
    const tl = gsap.timeline({ delay: 0.15 });
    if (backRef.current) tl.fromTo(backRef.current, { opacity: 0, x: -20 }, { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }, 0);
    if (contentRef.current) tl.fromTo(contentRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.2);
    return () => { tl.kill(); };
  }, []);

  const filteredSkills = activeCategory ? SKILLS.filter(s => s.category === activeCategory) : SKILLS;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'var(--void)', overflow: 'auto', zIndex: 50 }}>
      <SectionAmbientBG color="#FFB800" particleCount={40} />
      <button ref={backRef} className="back-button" onClick={() => navigateTo('desktop')} style={{ opacity: 0 }}>← VOID DESKTOP</button>

      <div ref={contentRef} style={{ position: 'relative', zIndex: 1, maxWidth: '1000px', margin: '0 auto', padding: '80px 30px 60px', opacity: 0 }}>
        {/* Header */}
        <div style={{ marginBottom: 8 }}>
          <div className="section-label">03 // SKILLS.sys</div>
        </div>
        <h2 style={{
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 'clamp(32px, 5vw, 48px)',
          marginBottom: '8px', lineHeight: 1.1,
        }}>
          Tech <span className="glow-text-amber">Arsenal</span>
        </h2>
        <p style={{
          fontSize: '14px', color: 'var(--text-dim)', marginBottom: '32px', maxWidth: '500px', lineHeight: 1.8,
          fontFamily: 'var(--font-body)',
        }}>
          A living inventory of every tool, language, and framework in my stack. Hover to explore connections. Click categories to filter.
        </p>

        {/* Stats Overview */}
        <StatsOverview />

        {/* Category Tabs */}
        <div style={{
          display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          paddingBottom: 0,
        }}>
          <CategoryTab
            cat={{ name: 'All', color: '#00D4FF' }}
            isActive={!activeCategory}
            onClick={() => setActiveCategory(null)}
            skillCount={SKILLS.length}
            avg={Math.round(SKILLS.reduce((a, s) => a + s.proficiency, 0) / SKILLS.length)}
          />
          {SKILL_CATEGORIES.map(cat => {
            const catSkills = SKILLS.filter(s => s.category === cat.name);
            const avg = Math.round(catSkills.reduce((a, s) => a + s.proficiency, 0) / catSkills.length);
            return (
              <CategoryTab
                key={cat.name}
                cat={cat}
                isActive={activeCategory === cat.name}
                onClick={() => setActiveCategory(activeCategory === cat.name ? null : cat.name)}
                skillCount={catSkills.length}
                avg={avg}
              />
            );
          })}
        </div>

        {/* Skills Grid */}
        <div id="skills-nodes-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: 12,
        }}>
          <style dangerouslySetInnerHTML={{ __html: '@media (max-width: 600px) { #skills-nodes-grid { grid-template-columns: 1fr !important; } }' }} />
          {filteredSkills.map((skill, i) => (
            <SkillNode
              key={skill.id}
              skill={skill}
              color={catColorMap[skill.category] || '#FFB800'}
              delay={100 + i * 60}
              active={!activeCategory || skill.category === activeCategory}
            />
          ))}
        </div>

        {/* Bottom legend */}
        <div style={{
          marginTop: 40, padding: '16px 20px',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '2px', background: 'rgba(255,255,255,0.02)',
          display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', letterSpacing: '2px', color: 'rgba(232,232,240,0.45)' }}>LEGEND:</span>
          {SKILL_CATEGORIES.map(cat => (
            <div key={cat.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: cat.color, boxShadow: `0 0 8px ${cat.color}66` }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: cat.color, letterSpacing: '1px' }}>{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CRT + Vignette */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 55, background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)' }} />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 54, background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.4) 100%)' }} />
    </div>
  );
}
