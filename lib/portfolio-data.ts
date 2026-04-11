/* ============================================
   VOID OS — Portfolio Data
   Edit this file to customize your portfolio
   ============================================ */

export const OWNER = {
  name: 'KRISHNA',
  role: 'Full-Stack Developer',
  tagline: 'Building the future, one pixel at a time.',
  email: 'krishna@example.com',
  github: 'https://github.com/krishu',
  linkedin: 'https://linkedin.com/in/krishu',
  location: 'India',
  availability: 'online' as const, // 'online' | 'busy' | 'offline'
  bio: `I architect digital experiences that blur the line between technology and art. 
Specializing in immersive web applications, 3D interfaces, and systems that feel alive.
Every line of code I write is a step toward making the impossible feel inevitable.`,
  manifesto: [
    'I don\'t build websites.',
    'I build experiences.',
    'Interfaces that breathe.',
    'Systems that think.',
    'Code that feels alive.',
    'Every pixel intentional.',
    'Every interaction memorable.',
    'The future isn\'t built—',
    'it\'s coded.',
  ],
  stats: [
    { label: 'Years Experience', value: '3+' },
    { label: 'Projects Shipped', value: '20+' },
    { label: 'Technologies', value: 'All of them' },
    { label: 'Curiosity Level', value: '∞' },
  ],
  techArsenal: [
    'Next.js', 'React', 'TypeScript', 'Three.js', 'WebGL', 'GLSL',
    'Node.js', 'Python', 'PostgreSQL', 'Redis', 'Docker', 'AWS',
    'Framer Motion', 'GSAP', 'Figma', 'Git',
  ],
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

export const PROJECTS: Project[] = [
  {
    id: 'void-os',
    title: 'VOID OS Portfolio',
    description: 'An OS-themed portfolio that feels alive. Boot sequence, 3D desktop, neural networks.',
    longDescription: 'A portfolio disguised as an alien operating system from 2045. Features a boot sequence with particle morphing, a 3D desktop with orbiting holographic icons, force-directed skill graphs, and an AI twin powered by Claude. Built with Next.js 14, Three.js, GSAP, and custom WebGL shaders.',
    tags: ['Next.js', 'Three.js', 'GLSL', 'WebGL', 'GSAP'],
    image: '/projects/void-os.png',
    featured: true,
    color: '#00D4FF',
    year: '2025',
  },
  {
    id: 'neural-engine',
    title: 'Neural Engine',
    description: 'Real-time ML inference platform with GPU acceleration and live visualization.',
    longDescription: 'A machine learning inference platform that provides real-time GPU-accelerated predictions with live WebGL visualization of neural network activations. Features custom CUDA kernels, WebSocket streaming, and a React dashboard with D3 visualizations.',
    tags: ['Python', 'CUDA', 'React', 'WebGL', 'D3'],
    image: '/projects/neural.png',
    liveUrl: 'https://neural-engine.dev',
    githubUrl: 'https://github.com/krishu/neural-engine',
    featured: true,
    color: '#7B2FFF',
    year: '2024',
  },
  {
    id: 'quantum-chat',
    title: 'Quantum Chat',
    description: 'End-to-end encrypted messaging with post-quantum cryptography and AI moderation.',
    longDescription: 'A messaging platform implementing post-quantum lattice-based encryption (CRYSTALS-Kyber) for future-proof security. Features AI-powered content moderation, real-time translation, voice messages with transcription, and a custom protocol for minimal latency.',
    tags: ['Node.js', 'WebSocket', 'React', 'Cryptography'],
    image: '/projects/quantum.png',
    githubUrl: 'https://github.com/krishu/quantum-chat',
    featured: false,
    color: '#39FF14',
    year: '2024',
  },
  {
    id: 'synth-wave',
    title: 'SynthWave Studio',
    description: 'Browser-based music production DAW with Web Audio API and real-time effects.',
    longDescription: 'A full-featured digital audio workstation running entirely in the browser. Features multi-track recording, custom synthesizer engines using Web Audio API, real-time effects processing (reverb, delay, distortion), MIDI controller support, and collaborative editing via WebRTC.',
    tags: ['TypeScript', 'Web Audio', 'Canvas', 'WebRTC'],
    image: '/projects/synth.png',
    liveUrl: 'https://synthwave.studio',
    featured: true,
    color: '#FFB800',
    year: '2023',
  },
];

export interface Skill {
  id: string;
  name: string;
  category: string;
  proficiency: number; // 0-100
  connections: string[]; // IDs of connected skills
}

export const SKILL_CATEGORIES = [
  { name: 'Frontend', color: '#00D4FF' },
  { name: 'Backend', color: '#7B2FFF' },
  { name: 'DevOps', color: '#39FF14' },
  { name: '3D / Graphics', color: '#FFB800' },
  { name: 'Database', color: '#FF3366' },
  { name: 'Design', color: '#E8E8F0' },
  { name: 'AI / ML', color: '#00FF88' },
];

export const SKILLS: Skill[] = [
  // Frontend
  { id: 'react', name: 'React', category: 'Frontend', proficiency: 95, connections: ['nextjs', 'typescript', 'redux', 'framer'] },
  { id: 'nextjs', name: 'Next.js', category: 'Frontend', proficiency: 92, connections: ['react', 'typescript', 'vercel', 'node'] },
  { id: 'typescript', name: 'TypeScript', category: 'Frontend', proficiency: 90, connections: ['react', 'nextjs', 'node'] },
  { id: 'javascript', name: 'JavaScript', category: 'Frontend', proficiency: 95, connections: ['typescript', 'react', 'node'] },
  { id: 'html-css', name: 'HTML/CSS', category: 'Frontend', proficiency: 98, connections: ['react', 'sass'] },
  { id: 'sass', name: 'Sass/SCSS', category: 'Frontend', proficiency: 85, connections: ['html-css'] },
  { id: 'redux', name: 'Redux', category: 'Frontend', proficiency: 80, connections: ['react'] },
  { id: 'framer', name: 'Framer Motion', category: 'Frontend', proficiency: 88, connections: ['react', 'gsap'] },

  // 3D / Graphics
  { id: 'threejs', name: 'Three.js', category: '3D / Graphics', proficiency: 85, connections: ['r3f', 'glsl', 'webgl'] },
  { id: 'r3f', name: 'React Three Fiber', category: '3D / Graphics', proficiency: 82, connections: ['threejs', 'react'] },
  { id: 'glsl', name: 'GLSL Shaders', category: '3D / Graphics', proficiency: 70, connections: ['threejs', 'webgl'] },
  { id: 'webgl', name: 'WebGL', category: '3D / Graphics', proficiency: 72, connections: ['threejs', 'glsl'] },
  { id: 'gsap', name: 'GSAP', category: '3D / Graphics', proficiency: 88, connections: ['framer', 'threejs'] },

  // Backend
  { id: 'node', name: 'Node.js', category: 'Backend', proficiency: 90, connections: ['nextjs', 'typescript', 'express'] },
  { id: 'express', name: 'Express.js', category: 'Backend', proficiency: 85, connections: ['node'] },
  { id: 'python', name: 'Python', category: 'Backend', proficiency: 82, connections: ['django', 'tensorflow'] },
  { id: 'django', name: 'Django', category: 'Backend', proficiency: 72, connections: ['python', 'postgres'] },
  { id: 'graphql', name: 'GraphQL', category: 'Backend', proficiency: 78, connections: ['node', 'react'] },

  // Database
  { id: 'postgres', name: 'PostgreSQL', category: 'Database', proficiency: 80, connections: ['node', 'django'] },
  { id: 'mongodb', name: 'MongoDB', category: 'Database', proficiency: 78, connections: ['node', 'express'] },
  { id: 'redis', name: 'Redis', category: 'Database', proficiency: 72, connections: ['node'] },

  // DevOps
  { id: 'docker', name: 'Docker', category: 'DevOps', proficiency: 75, connections: ['kubernetes', 'aws'] },
  { id: 'kubernetes', name: 'Kubernetes', category: 'DevOps', proficiency: 60, connections: ['docker', 'aws'] },
  { id: 'aws', name: 'AWS', category: 'DevOps', proficiency: 70, connections: ['docker', 'vercel'] },
  { id: 'vercel', name: 'Vercel', category: 'DevOps', proficiency: 90, connections: ['nextjs', 'aws'] },
  { id: 'git', name: 'Git', category: 'DevOps', proficiency: 92, connections: ['github'] },
  { id: 'github', name: 'GitHub', category: 'DevOps', proficiency: 90, connections: ['git', 'vercel'] },

  // Design
  { id: 'figma', name: 'Figma', category: 'Design', proficiency: 80, connections: ['html-css'] },

  // AI / ML
  { id: 'tensorflow', name: 'TensorFlow', category: 'AI / ML', proficiency: 65, connections: ['python'] },
  { id: 'openai', name: 'OpenAI API', category: 'AI / ML', proficiency: 80, connections: ['node', 'python'] },
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

export const TIMELINE: TimelineEntry[] = [
  {
    id: 'present',
    type: 'work',
    title: 'Full-Stack Developer',
    company: 'Freelance / Open Source',
    period: '2024 — Present',
    description: 'Building immersive web experiences, 3D interfaces, and open-source tools. Specializing in WebGL, real-time graphics, and AI-integrated applications.',
    tags: ['Next.js', 'Three.js', 'AI', 'WebGL'],
    color: '#00D4FF',
  },
  {
    id: 'milestone-portfolio',
    type: 'milestone',
    title: 'VOID OS Portfolio Launched',
    company: 'Personal',
    period: '2025',
    description: 'Built and launched the most ambitious portfolio project — an OS-themed experience with 3D particle systems, AI twin, and neural network visualizations.',
    tags: ['Three.js', 'GSAP', 'WebGL'],
    color: '#39FF14',
    isMilestone: true,
  },
  {
    id: 'senior-dev',
    type: 'work',
    title: 'Frontend Engineer',
    company: 'TechCorp',
    period: '2023 — 2024',
    description: 'Led frontend architecture for a SaaS platform serving 50K+ users. Implemented real-time collaboration features, design system, and performance optimizations.',
    tags: ['React', 'TypeScript', 'WebSocket'],
    color: '#7B2FFF',
  },
  {
    id: 'junior-dev',
    type: 'work',
    title: 'Junior Developer',
    company: 'StartupXYZ',
    period: '2022 — 2023',
    description: 'First professional role. Built full-stack features, learned production-grade coding practices, and shipped multiple client projects.',
    tags: ['React', 'Node.js', 'MongoDB'],
    color: '#FFB800',
  },
  {
    id: 'started-coding',
    type: 'milestone',
    title: 'Started Coding Journey',
    company: 'Self-taught',
    period: '2022',
    description: 'Wrote the first line of code. Fell in love with the craft. No looking back.',
    tags: ['HTML', 'CSS', 'JavaScript'],
    color: '#39FF14',
    isMilestone: true,
  },
];

export const LOCATIONS = [
  { lat: 20.5937, lng: 78.9629, label: 'India (Home)', size: 0.08 },
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
  clear      — Clear terminal
  exit       — Exit terminal`,
  whoami: `${OWNER.name} — ${OWNER.role}\n${OWNER.tagline}`,
  skills: OWNER.techArsenal.join(', '),
  ls: `drwxr-xr-x  about/\ndrwxr-xr-x  projects/\ndrwxr-xr-x  skills/\n-rw-r--r--  resume.pdf\n-rw-r--r--  contact.md\n-rwx------  secrets/`,
  'cat bio': OWNER.bio,
  projects: PROJECTS.map((p) => `[${p.featured ? '★' : ' '}] ${p.title} — ${p.description}`).join('\n'),
  status: `VOID OS v2045.1
Uptime: ∞
CPU: Quantum (128 qubits)
RAM: 1 PB Holographic
Storage: Infinite
Network: Subspace Entanglement
Status: OPERATIONAL`,
};
