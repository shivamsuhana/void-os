/* ============================================
   VOID OS — Portfolio Data (SINGLE SOURCE OF TRUTH)
   ============================================
   
   ★ CENTRAL DATA HUB — Edit data HERE, it auto-updates everywhere!
   
   DATA FLOW MAP:
   ┌─────────────────────────────────────────────────────────┐
   │ OWNER        → About, Contact, Resume, Desktop, AI Twin │
   │ PROJECTS     → Work, Resume, Skills popup, About stats  │
   │ SKILLS       → Skills graph, Skills popup               │
   │ TIMELINE     → Timeline section                         │
   │ DSA_COUNT    → About stats, Resume, Contact boot, AI    │
   │ PROJECT_COUNT→ About stats, Resume, Contact boot        │
   └─────────────────────────────────────────────────────────┘
   
   TO ADD A NEW PROJECT:
   1. Add entry to PROJECTS array below
   2. Put screenshot at /public/projects/your-project.png
   3. Add timeline entry to TIMELINE array
   4. If new skill used, add to SKILLS array
   That's it! Work, Resume, Skills popup update automatically.
   ============================================ */

// ====== GLOBAL COUNTERS ======
// Change these values ONCE → auto-updates: About section stats, Resume, Contact boot sequence, AI Twin
export const DSA_COUNT = '50+';       // ← Update when you solve more
export const PROJECT_COUNT = '5+';     // ← Update when you ship more

// ====== OWNER INFO ======
// Auto-updates: About section, Contact section, Resume header, Desktop, AI Twin context
export const OWNER = {
  name: 'KRISHU',
  fullName: 'Shiv Charan',
  role: 'Software Developer | Java · DSA · Full-Stack Web',
  tagline: 'DSA grinder. Backend dreamer. Accidental full-stack builder.',
  phone: '+91 9101870245',
  email: 'shivamsuhana649@gmail.com',
  github: 'https://github.com/shivamsuhana',
  linkedin: 'https://linkedin.com/in/shivamsuhana',
  leetcode: 'https://leetcode.com/u/shivamsuhana',
  gfg: 'https://www.geeksforgeeks.org/profile/krishuji',
  location: 'Bangalore, India',
  university: 'Jain (Deemed-to-be University) — Global Campus',
  degree: 'B.Tech CSE — 4th Semester',
  availability: 'online' as const,
  bio: `I'm Krishu — a B.Tech CSE student who codes because he genuinely can't stop.
Java and DSA are my core — the problem-solving grind is where I feel most alive.
But I also built an entire operating system as a portfolio, a blood donation emergency network,
and a campus management platform with 8 modules. I don't just learn things — I ship them.
Backend engineering is the goal. Java is the weapon. The grind never stops.`,
  manifesto: [
    'I don\'t just solve problems.',
    'I engineer solutions.',
    'Java in the veins.',
    'Algorithms in the brain.',
    'Backend in the bones.',
    'Built a blood donation network.',
    'An 8-module campus platform.',
    'And a whole VOID OS—',
    'just because I could.',
  ],
  // Stats badges — Auto-updates: About section floating badges
  stats: [
    { label: 'Current Semester', value: '4th' },
    { label: 'DSA Problems', value: DSA_COUNT },
    { label: 'Projects Shipped', value: PROJECT_COUNT },
    { label: 'Curiosity Level', value: '∞' },
  ],
  // Tech list — Auto-updates: Resume "Technical Skills" row
  techArsenal: [
    'Java', 'DSA', 'C', 'Python', 'OOP',
    'PHP', 'MySQL', 'SQL', 'DBMS',
    'HTML', 'CSS', 'JavaScript', 'React',
    'Next.js', 'Three.js', 'GSAP', 'Git',
  ],
  // ATS-optimized keyword list — these appear in resume's "Additional Skills" row
  atsKeywords: [
    'REST API', 'JDBC', 'Data Structures', 'Algorithms',
    'Problem Solving', 'Agile', 'Linux', 'VS Code', 'IntelliJ IDEA',
    'Responsive Design', 'Version Control',
  ],
  // Certificates — add entries here and they auto-appear on resume
  // { name: 'Certificate Name', issuer: 'Issuing Org', date: 'Month Year', url: 'optional link' }
  certificates: [] as Array<{ name: string; issuer: string; date: string; url?: string }>,
};

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  tags: string[];
  image: string;
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
  color: string;
  year: string;
}

// ====== PROJECTS ======
// Auto-updates: Work tunnel cards, Resume projects section, Skills popup "USED IN PROJECTS",
//               About stats (PROJECT_COUNT), Contact boot sequence
// 
// HOW TO ADD: Copy any project block below, change the values, add screenshot to /public/projects/
// IMPORTANT: 'tags' must EXACTLY match skill names in SKILLS array for Skills popup to link them
export const PROJECTS: Project[] = [
  {
    id: 'void-os',
    title: 'PORTFOLIO - VOID OS',
    description: 'A portfolio disguised as an immersive operating system with a 3D holographic desktop and AI twin (Fully mobile responsive).',
    longDescription: 'The most over-engineered portfolio in existence — and I regret nothing. Features a BIOS boot sequence, holographic 3D desktop with orbiting cards around a breathing icosahedron, a fly-through work tunnel, force-directed neural skill graph, hacker-style contact terminal, and an AI twin powered by Gemini. Built with Next.js, Three.js, GSAP, and custom canvas shaders. This project was my way of proving that if I can imagine it, I can build it (Fully optimized for fluid cross-device 3D mobile responsiveness).',
    tags: ['Next.js', 'Three.js', 'GSAP', 'React', 'Gemini AI'],
    liveUrl: 'https://portfolio-void-os.vercel.app/',
    // githubUrl: 'https://github.com/shivamsuhana',
    image: '/projects/void-os.png',
    featured: true,
    color: '#00D4FF',
    year: '2026',
  },
  {
    id: 'raktsetu',
    title: 'RaktSetu',
    description: 'Emergency blood donor network with real-time SOS, smart matching, and 90-day health cooldown.',
    longDescription: 'A real-time emergency blood donation platform that can literally save lives. When an urgent blood request is raised, RaktSetu instantly filters nearby eligible donors with a strict 90-day health cooldown to protect donor safety. Features a live auto-refreshing emergency dashboard, multi-user portals for donors, hospitals, and admins, bcrypt password hashing, PDO prepared statements against SQL injection, and role-based access control. Built with PHP 8, MySQL, and vanilla JS with AJAX polling for real-time updates.',
    tags: ['PHP', 'MySQL', 'JavaScript', 'AJAX', 'RBAC'],
    image: '/projects/raktsetu.png',
    liveUrl: 'http://raktsetu.page.gd/',
    githubUrl: 'https://github.com/shivamsuhana/raktsetu',
    featured: true,
    color: '#FF3366',
    year: '2025',
  },
  {
    id: 'campusnexus',
    title: 'CampusNexus',
    description: 'Unified smart campus ecosystem — 8 modules, 3 user roles, 13 database tables.',
    longDescription: 'A comprehensive campus management platform that digitizes every aspect of college life. 8 interconnected modules: Smart Attendance (anti-proxy session codes), Resource Hub (notes/slides with ratings), Grievance Tracker (photo uploads + upvoting), Campus Marketplace (buy/sell), Events Hub, Lost & Found, Mess Feedback (daily ratings), and Announcements. Features 3 user roles (student, faculty, admin), dark/light mode, glassmorphism UI, Chart.js analytics dashboards, and 13 normalized database tables. Built as a capstone project for Web Technologies.',
    tags: ['PHP', 'MySQL', 'JavaScript', 'Chart.js', 'RBAC'],
    image: '/projects/campusnexus.png',
    liveUrl: 'https://campus-nexus.infinityfreeapp.com',
    githubUrl: 'https://github.com/shivamsuhana/campusnexus',
    featured: true,
    color: '#7B2FFF',
    year: '2025',
  },
];

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number;
  connections: string[];
}

// ====== SKILL CATEGORIES ======
// Auto-updates: Skills section sidebar categories + graph node colors
export const SKILL_CATEGORIES = [
  { name: 'Core', color: '#FFB800' },
  { name: 'Frontend', color: '#00D4FF' },
  { name: 'Backend', color: '#7B2FFF' },
  { name: 'Database', color: '#FF3366' },
  { name: 'Tools', color: '#39FF14' },
  { name: 'Next Up', color: '#E8E8F0' },
];

// ====== SKILLS ======
// Auto-updates: Skills graph (nodes + connections), Skills popup
// 
// HOW TO ADD: { id: 'unique-id', name: 'Display Name', category: 'Core|Frontend|Backend|Database|Tools|Next Up',
//              proficiency: 0-100, connections: ['id-of-connected-skill'] }
// IMPORTANT: 'name' is matched against project 'tags' for "USED IN PROJECTS" popup
export const SKILLS: Skill[] = [
  // Core
  { id: 'java', name: 'Java', category: 'Core', proficiency: 78, connections: ['dsa', 'oop', 'c'] },
  { id: 'dsa', name: 'DSA', category: 'Core', proficiency: 70, connections: ['java'] },
  { id: 'oop', name: 'OOP', category: 'Core', proficiency: 75, connections: ['java', 'python'] },
  { id: 'c', name: 'C', category: 'Core', proficiency: 68, connections: ['java', 'dsa'] },
  { id: 'python', name: 'Python', category: 'Core', proficiency: 55, connections: ['oop'] },

  // Frontend
  { id: 'html-css', name: 'HTML/CSS', category: 'Frontend', proficiency: 78, connections: ['javascript', 'php'] },
  { id: 'javascript', name: 'JavaScript', category: 'Frontend', proficiency: 68, connections: ['html-css', 'react'] },
  { id: 'react', name: 'React', category: 'Frontend', proficiency: 40, connections: ['javascript', 'nextjs'] },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend', proficiency: 35, connections: ['react'] },
  { id: 'threejs', name: 'Three.js', category: 'Frontend', proficiency: 30, connections: ['javascript', 'gsap'] },
  { id: 'gsap', name: 'GSAP', category: 'Frontend', proficiency: 30, connections: ['javascript'] },

  // Backend
  { id: 'php', name: 'PHP', category: 'Backend', proficiency: 65, connections: ['mysql', 'html-css'] },

  // Database
  { id: 'mysql', name: 'MySQL', category: 'Database', proficiency: 60, connections: ['php', 'sql'] },
  { id: 'sql', name: 'SQL', category: 'Database', proficiency: 58, connections: ['mysql'] },

  // Tools
  { id: 'git', name: 'Git/GitHub', category: 'Tools', proficiency: 62, connections: ['java', 'php'] },

  // Next Up
  { id: 'jdbc', name: 'JDBC', category: 'Next Up', proficiency: 10, connections: ['java', 'mysql'] },
  { id: 'spring', name: 'Spring Boot', category: 'Next Up', proficiency: 8, connections: ['java'] },
  { id: 'hibernate', name: 'Hibernate', category: 'Next Up', proficiency: 5, connections: ['java', 'mysql'] },
];

export interface TimelineEntry {
  id: string;
  type: 'work' | 'education' | 'milestone';
  title: string;
  company: string;
  period: string;
  description: string;
  tags: string[];
  color: string;
  isMilestone?: boolean;
}

// ====== TIMELINE ======
// Auto-updates: Timeline section only (NOT auto-linked to PROJECTS)
// 
// HOW TO ADD: Copy any entry below, change values
// type: 'work' (projects), 'education' (learning), 'milestone' (achievements)
// isMilestone: true → gets special highlight treatment
export const TIMELINE: TimelineEntry[] = [
  {
    id: 'void-os-launch',
    type: 'milestone',
    title: 'VOID OS Portfolio Launched',
    company: 'Personal Project',
    period: '2026',
    description: 'Built a 3D holographic OS as a portfolio — particle systems, AI twin, cinematic transitions. The project that proved if I can imagine it, I can build it.',
    tags: ['Next.js', 'Three.js', 'GSAP', 'Gemini'],
    color: '#00D4FF',
    isMilestone: true,
  },
  {
    id: 'raktsetu',
    type: 'work',
    title: 'RaktSetu — Blood Donor Network',
    company: 'Self-initiated',
    period: '2025',
    description: 'Built a real-time emergency blood donation platform with smart donor matching, 90-day health cooldown, live SOS dashboard, and multi-user portals. A project with real impact.',
    tags: ['PHP', 'MySQL', 'AJAX', 'RBAC'],
    color: '#FF3366',
  },
  {
    id: 'campusnexus',
    type: 'work',
    title: 'CampusNexus — Campus Platform',
    company: 'Capstone Project — Web Tech',
    period: '2025',
    description: '8-module campus management system with smart attendance, resource hub, grievance tracker, marketplace, events, lost & found, mess feedback, and announcements. 3 user roles, 13 database tables.',
    tags: ['PHP', 'MySQL', 'Chart.js'],
    color: '#7B2FFF',
  },
  {
    id: 'java-dsa',
    type: 'milestone',
    title: 'Java DSA Grind Begins',
    company: 'Self-study',
    period: '2025',
    description: `Started the serious DSA journey in Java — arrays, trees, graphs, DP, backtracking. ${DSA_COUNT} problems and counting. Found my real passion here.`,
    tags: ['Java', 'DSA', 'Algorithms'],
    color: '#39FF14',
    isMilestone: true,
  },
  {
    id: 'java-start',
    type: 'education',
    title: 'Java — The Core Language',
    company: 'Self-driven',
    period: '2024-25',
    description: 'Learned Java deeply — advanced Java, OOP, collections, exception handling, everything. The language that just clicked. JDBC, Hibernate, Spring Boot are next.',
    tags: ['Java', 'OOP', 'Advanced Java'],
    color: '#FFB800',
  },
  {
    id: 'python-grind',
    type: 'education',
    title: 'Python Deep Dive',
    company: '2nd Semester — Books + Self-study',
    period: '2024',
    description: 'Ragad ke Python sikha — books, tutorials, everything. Covered OOP and advanced concepts. The kind of grind that builds real understanding.',
    tags: ['Python', 'OOP', 'Advanced'],
    color: '#7B2FFF',
  },
  {
    id: 'btech-start',
    type: 'education',
    title: 'B.Tech CSE — Day 1',
    company: 'Jain University — Global Campus',
    period: '2024',
    description: 'Started B.Tech in Computer Science. First language: C. Built loops, logic, and the foundation of everything that came after. Also learned SQL and OS in class.',
    tags: ['C', 'SQL', 'OS'],
    color: '#00D4FF',
  },
];

export const LOCATIONS = [
  { lat: 12.9716, lng: 77.5946, label: 'Bangalore', size: 0.08 },
  { lat: 20.5937, lng: 78.9629, label: 'India', size: 0.06 },
];

// Terminal commands for LAB.beta
export const TERMINAL_COMMANDS: Record<string, string> = {
  help: `Available commands:
  whoami     — Who am I?
  skills     — List all skills
  ls         — List directory
  cat bio    — Read bio
  projects   — Show projects
  status     — System status
  java       — Why Java?
  clear      — Clear terminal
  exit       — Exit terminal`,
  whoami: `KRISHU (Shiv Charan) — ${OWNER.role}\n${OWNER.tagline}`,
  skills: OWNER.techArsenal.join(', '),
  ls: `drwxr-xr-x  about/\ndrwxr-xr-x  projects/\ndrwxr-xr-x  dsa-solutions/\n-rw-r--r--  resume.pdf\n-rw-r--r--  contact.md\n-rwx------  future-plans/`,
  'cat bio': OWNER.bio,
  java: `Why Java? Because:\n→ Enterprise & backend backbone\n→ DSA feels natural in Java\n→ Spring Boot ecosystem is massive\n→ Clear career path with great pay\n→ JDBC, Hibernate, Spring Boot — next stops\n→ And honestly? It just clicks.`,
  projects: PROJECTS.map((p) => `[${p.featured ? '★' : ' '}] ${p.title} — ${p.description}`).join('\n'),
  status: `VOID OS v3.0.1
Uptime: ∞
CPU: Quantum (128 qubits)
RAM: 1 PB Holographic
Storage: Infinite
Network: Subspace Entanglement
Status: OPERATIONAL
User: KRISHU
Sem: 4th | Branch: CSE
University: Jain — Global Campus`,
};
