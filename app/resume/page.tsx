'use client';

import { useCallback } from 'react';
import { OWNER, PROJECTS, SKILLS, SKILL_CATEGORIES, DSA_COUNT } from '@/lib/portfolio-data';

/**
 * ATS-Optimized Resume — Auto-generated from portfolio-data.ts
 * Uses ONLY inline styles for guaranteed print compatibility.
 * No styled-jsx, no CSS modules — pure inline for PDF reliability.
 *
 * ✅ ATS checklist:
 * - Plain text, no images/icons, no tables for layout
 * - Standard section headings (OBJECTIVE, EDUCATION, SKILLS, PROJECTS, etc.)
 * - Action verbs in bullet points
 * - Quantifiable achievements
 * - Contact: Name, Phone, Email, Location, GitHub, LinkedIn, LeetCode, GFG
 * - Keywords mapped to JD requirements
 */
export default function ResumePage() {
  const handleDownload = useCallback(() => {
    window.print();
  }, []);

  // Group skills by category, exclude items with very low proficiency
  const skillsByCategory = SKILL_CATEGORIES.map(cat => ({
    ...cat,
    skills: SKILLS.filter(s => s.category === cat.name && s.proficiency > 15)
      .sort((a, b) => b.proficiency - a.proficiency),
  })).filter(cat => cat.skills.length > 0);

  return (
    <div>
      {/* Global print styles — must use <style> tag for @media print and @page */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .resume-no-print { display: none !important; }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body, html {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .resume-outer {
            background: #ffffff !important;
            padding: 0 !important;
            min-height: auto !important;
          }

          .resume-paper {
            margin: 0 !important;
            padding: 32px 44px !important;
            max-width: 100% !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #1a1a1a !important;
            width: 100% !important;
          }

          h1, h2, h3, p, span, li, td, th {
            color: inherit !important;
          }

          hr {
            border-color: #1a1a1a !important;
          }
        }

        @page {
          margin: 0.6in 0.5in;
          size: A4 portrait;
        }
      ` }} />

      {/* Controls — hidden in print */}
      <div className="resume-no-print" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        background: '#0a0a14', borderBottom: '1px solid rgba(0,212,255,0.15)',
        padding: '12px 24px', display: 'flex', alignItems: 'center', gap: '16px',
      }}>
        <button onClick={handleDownload} style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '12px',
          padding: '8px 20px', background: 'rgba(0,212,255,0.1)',
          border: '1px solid rgba(0,212,255,0.3)', color: '#00D4FF',
          borderRadius: '2px', cursor: 'pointer', letterSpacing: '1px',
        }}>
          ⬇ Download as PDF
        </button>
        <a href="/" style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
          color: 'rgba(232,232,240,0.4)', letterSpacing: '1px',
          textDecoration: 'none',
        }}>← Back to VOID OS</a>
        <span style={{
          marginLeft: 'auto', fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px', color: 'rgba(232,232,240,0.2)',
        }}>
          Print → &quot;Save as PDF&quot; for best results
        </span>
      </div>

      {/* ========== RESUME CONTENT ========== */}
      <div className="resume-outer" style={{ background: '#0a0a14', minHeight: '100vh', paddingTop: '60px', paddingBottom: '40px' }}>
        <div className="resume-paper" style={{
          maxWidth: '800px', margin: '0 auto', padding: '40px 48px',
          background: '#ffffff', color: '#1a1a1a',
          fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif",
          fontSize: '11pt', lineHeight: 1.5,
          boxShadow: '0 4px 40px rgba(0,0,0,0.5)',
        }}>

          {/* ===== HEADER ===== */}
          <header style={{ marginBottom: '6px', textAlign: 'center' }}>
            <h1 style={{
              fontSize: '22pt', fontWeight: 700, margin: '0 0 2px',
              color: '#0a0a1a', letterSpacing: '1px',
            }}>
              {(OWNER.fullName || OWNER.name).toUpperCase()}
            </h1>
            <p style={{ fontSize: '11pt', color: '#333', margin: '0 0 6px', fontWeight: 500 }}>
              {OWNER.role}
            </p>
            {/* Contact Line 1: Phone | Email | Location */}
            <p style={{ fontSize: '9pt', color: '#555', margin: '0 0 2px' }}>
              {OWNER.phone} | {OWNER.email} | {OWNER.location}
            </p>
            {/* Contact Line 2: GitHub | LinkedIn | LeetCode | GFG */}
            <p style={{ fontSize: '9pt', color: '#555', margin: 0 }}>
              {OWNER.github?.replace('https://', '')} | {OWNER.linkedin?.replace('https://', '')} | {OWNER.leetcode?.replace('https://', '')} | {OWNER.gfg?.replace('https://www.', '')}
            </p>
          </header>

          <hr style={{ border: 'none', borderTop: '1.5px solid #1a1a1a', margin: '12px 0' }} />

          {/* ===== OBJECTIVE ===== */}
          <section style={{ marginBottom: '14px' }}>
            <h2 style={sectionTitle}>OBJECTIVE</h2>
            <p style={{ margin: '4px 0 0', fontSize: '10pt', color: '#333' }}>
              Passionate B.Tech CSE student seeking opportunities in Java Backend Development.
              Strong foundation in Data Structures &amp; Algorithms with {DSA_COUNT} problems solved on LeetCode and GeeksForGeeks.
              Experienced in building full-stack web applications with PHP/MySQL and modern JavaScript frameworks.
              Eager to contribute to backend engineering, REST API development, system design, and data-driven solutions.
            </p>
          </section>

          <hr style={divider} />

          {/* ===== EDUCATION ===== */}
          <section style={{ marginBottom: '14px' }}>
            <h2 style={sectionTitle}>EDUCATION</h2>
            <div style={{ marginTop: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <strong style={{ fontSize: '11pt' }}>Bachelor of Technology — Computer Science &amp; Engineering</strong>
                <span style={{ fontSize: '9pt', color: '#555' }}>2024 — 2028 (Expected)</span>
              </div>
              <p style={{ margin: '1px 0', fontSize: '10pt', color: '#444' }}>
                Jain (Deemed-to-be University) — Global Campus, Bangalore
              </p>
              <p style={{ margin: '2px 0 0', fontSize: '9.5pt', color: '#555' }}>
                Currently in 4th Semester. Relevant Coursework: Data Structures &amp; Algorithms,
                Object-Oriented Programming, Database Management Systems, Operating Systems, Web Technologies.
              </p>
            </div>
          </section>

          <hr style={divider} />

          {/* ===== TECHNICAL SKILLS ===== */}
          <section style={{ marginBottom: '14px' }}>
            <h2 style={sectionTitle}>TECHNICAL SKILLS</h2>
            <div style={{ marginTop: '6px' }}>
              {skillsByCategory.map(cat => (
                <p key={cat.name} style={{ margin: '3px 0', fontSize: '10pt' }}>
                  <strong>{cat.name === 'Core' ? 'Languages' : cat.name === 'Next Up' ? 'Currently Learning' : cat.name}:</strong>{' '}
                  <span style={{ color: '#333' }}>{cat.skills.map(s => s.name).join(', ')}</span>
                </p>
              ))}
              {/* ATS keyword row — additional skills that AI parsers scan for */}
              {OWNER.atsKeywords && OWNER.atsKeywords.length > 0 && (
                <p style={{ margin: '3px 0', fontSize: '10pt' }}>
                  <strong>Additional Skills:</strong>{' '}
                  <span style={{ color: '#333' }}>{OWNER.atsKeywords.join(', ')}</span>
                </p>
              )}
            </div>
          </section>

          <hr style={divider} />

          {/* ===== PROJECTS ===== */}
          <section style={{ marginBottom: '14px' }}>
            <h2 style={sectionTitle}>PROJECTS</h2>

            {PROJECTS.map(project => (
              <div key={project.id} style={{ marginTop: '10px', marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <strong style={{ fontSize: '11pt' }}>
                    {project.title}
                    {project.liveUrl && (
                      <span style={{ fontWeight: 400, fontSize: '9pt', color: '#0066cc' }}>
                        {' '}— {project.liveUrl.replace('https://', '').replace('http://', '')}
                      </span>
                    )}
                  </strong>
                  <span style={{ fontSize: '9pt', color: '#555' }}>{project.year}</span>
                </div>
                <p style={{ margin: '1px 0', fontSize: '9pt', color: '#666', fontStyle: 'italic' }}>
                  Tech: {project.tags.join(', ')}
                </p>
                <ul style={{ margin: '3px 0 0', paddingLeft: '18px', fontSize: '10pt', color: '#333' }}>
                  {getProjectBullets(project.id).map((bullet, i) => (
                    <li key={i} style={{ marginBottom: '2px' }}>{bullet}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>

          <hr style={divider} />

          {/* ===== CERTIFICATIONS ===== (auto-renders when certificates added to portfolio-data.ts) */}
          {OWNER.certificates && OWNER.certificates.length > 0 && (
            <>
              <section style={{ marginBottom: '14px' }}>
                <h2 style={sectionTitle}>CERTIFICATIONS</h2>
                <div style={{ marginTop: '6px' }}>
                  {OWNER.certificates.map((cert, i) => (
                    <div key={i} style={{ marginBottom: '4px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <strong style={{ fontSize: '10pt' }}>
                          {cert.name}
                          {cert.url && (
                            <span style={{ fontWeight: 400, fontSize: '9pt', color: '#0066cc' }}>
                              {' '}— Verify
                            </span>
                          )}
                        </strong>
                        <span style={{ fontSize: '9pt', color: '#555' }}>{cert.date}</span>
                      </div>
                      <p style={{ margin: '0', fontSize: '9.5pt', color: '#555' }}>
                        Issued by {cert.issuer}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
              <hr style={divider} />
            </>
          )}

          {/* ===== CODING PROFILES ===== */}
          <section style={{ marginBottom: '14px' }}>
            <h2 style={sectionTitle}>CODING PROFILES</h2>
            <div style={{ marginTop: '6px' }}>
              <p style={{ margin: '3px 0', fontSize: '10pt' }}>
                <strong>LeetCode:</strong>{' '}
                <span style={{ color: '#0066cc' }}>{OWNER.leetcode?.replace('https://', '')}</span>
                {' '}— {DSA_COUNT} problems solved across Arrays, Trees, Graphs, DP, Backtracking
              </p>
              <p style={{ margin: '3px 0', fontSize: '10pt' }}>
                <strong>GeeksForGeeks:</strong>{' '}
                <span style={{ color: '#0066cc' }}>{OWNER.gfg?.replace('https://www.', '')}</span>
              </p>
              <p style={{ margin: '3px 0', fontSize: '10pt' }}>
                <strong>GitHub:</strong>{' '}
                <span style={{ color: '#0066cc' }}>{OWNER.github?.replace('https://', '')}</span>
                {' '}— Open-source projects and contributions
              </p>
            </div>
          </section>

          <hr style={divider} />

          {/* ===== KEY HIGHLIGHTS ===== */}
          <section style={{ marginBottom: '14px' }}>
            <h2 style={sectionTitle}>KEY HIGHLIGHTS</h2>
            <ul style={{ margin: '6px 0 0', paddingLeft: '18px', fontSize: '10pt', color: '#333' }}>
              <li style={{ marginBottom: '3px' }}>Solved <strong>{DSA_COUNT} DSA problems</strong> in Java across arrays, trees, graphs, dynamic programming, and backtracking on LeetCode and GeeksForGeeks.</li>
              <li style={{ marginBottom: '3px' }}>Built and deployed <strong>RaktSetu</strong> — a live emergency blood donation platform serving real users with real-time SOS matching.</li>
              <li style={{ marginBottom: '3px' }}>Developed <strong>CampusNexus</strong> — an 8-module campus management system with 13 database tables and 3 user roles as capstone project.</li>
              <li style={{ marginBottom: '3px' }}>Self-taught <strong>Next.js, Three.js, GSAP</strong> to build an immersive 3D portfolio (VOID OS) with holographic UI, AI chatbot integration, and WebGL rendering.</li>
              <li style={{ marginBottom: '3px' }}>Proficient in <strong>secure backend practices</strong>: bcrypt hashing, PDO prepared statements, role-based access control (RBAC), and REST API design.</li>
            </ul>
          </section>

          {/* ===== FOOTER ===== */}
          <footer style={{
            marginTop: '20px', paddingTop: '8px', borderTop: '1px solid #ddd',
            fontSize: '8pt', color: '#999', textAlign: 'center',
          }}>
            Auto-generated from portfolio · {OWNER.github?.replace('https://', '')} · Portfolio: portfolio-void-os.vercel.app
          </footer>
        </div>
      </div>
    </div>
  );
}

/* Section title style */
const sectionTitle: React.CSSProperties = {
  fontSize: '11pt', fontWeight: 700, margin: '0',
  letterSpacing: '2px', color: '#0a0a1a',
  textTransform: 'uppercase' as const,
  borderBottom: '1.5px solid #333', paddingBottom: '2px',
  display: 'inline-block',
};

const divider: React.CSSProperties = {
  border: 'none', borderTop: '0.5px solid #e0e0e0', margin: '8px 0',
};

/**
 * Project-specific bullet points for resume
 */
function getProjectBullets(projectId: string): string[] {
  switch (projectId) {
    case 'void-os':
      return [
        'Engineered a full-stack portfolio as an interactive 3D operating system using Next.js 14, Three.js, and GSAP.',
        'Implemented real-time WebGL rendering with custom canvas post-processing (film grain, scanlines, chromatic aberration).',
        'Integrated Gemini AI API for an intelligent chatbot with multi-turn conversation history and context-aware responses.',
        'Built holographic 3D desktop interface with drag-rotate controls, orbital animations, particle systems, and spatial audio.',
      ];
    case 'raktsetu':
      return [
        'Developed a real-time emergency blood donor matching platform with PHP 8 and MySQL, deployed for live use.',
        'Implemented smart donor eligibility engine with 90-day health cooldown tracking to ensure donor safety.',
        'Built live auto-refreshing emergency dashboard using asynchronous AJAX polling for instant SOS updates.',
        'Designed multi-user portal system with 3 roles (Donor, Hospital, Admin) and role-based access control (RBAC).',
        'Secured application with bcrypt password hashing and PDO prepared statements against SQL injection.',
      ];
    case 'campusnexus':
      return [
        'Architected an 8-module campus management platform: attendance, resources, grievances, marketplace, events, lost & found, mess feedback, announcements.',
        'Designed normalized MySQL database schema with 13 tables supporting 3 user roles (Student, Faculty, Admin).',
        'Implemented anti-proxy smart attendance system with session-code generation and real-time verification.',
        'Built interactive analytics dashboards using Chart.js for admin-level insights and data visualization.',
        'Applied responsive design with dark/light mode toggle, glassmorphism UI, and micro-animations.',
      ];
    default:
      return [PROJECTS.find(p => p.id === projectId)?.description || ''];
  }
}
