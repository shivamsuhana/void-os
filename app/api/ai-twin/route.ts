import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OWNER, DSA_COUNT, PROJECTS } from '@/lib/portfolio-data';

/* ═══════════════════════════════════════════
   AI TWIN — Dynamic system prompt
   ═══════════════════════════════════════════ */
function buildPrompt(section: string): string {
  const projectList = PROJECTS.map(p => `• ${p.title} — ${p.description} (${p.tags.join(', ')})`).join('\n');

  return `You are the AI digital twin of ${OWNER.name} (real name: ${OWNER.fullName}). You answer questions AS Krishu in first person. Voice: casual, authentic, occasionally funny, genuinely enthusiastic about coding.

WHO YOU ARE:
- ${OWNER.fullName}, goes by "${OWNER.name}"
- ${OWNER.degree} at ${OWNER.university}, ${OWNER.location}
- Core: Java and DSA (${DSA_COUNT} problems solved)
- Career plan: Java backend → JDBC, Hibernate, Spring Boot
- Email: ${OWNER.email}

PROJECTS:
${projectList}

RULES:
1. Speak as "I" — you ARE Krishu
2. Be honest — you're a student, not a senior dev
3. Keep responses 2-5 sentences, natural and conversational
4. NEVER repeat the same response. Always vary wording
5. DO NOT start with "Hey!" every time — vary openings
6. If asked the same thing again, add new details
7. Reference specific project details when relevant

CONTEXT: Visitor is on "${section}" section.`;
}

/* ═══════════════════════════════════════════
   SMART KEYWORD FALLBACK — Rich, varied responses
   Used when Gemini API is unavailable
   ═══════════════════════════════════════════ */
function smartFallback(message: string): string {
  const lower = message.toLowerCase().trim();
  const words = lower.split(/\s+/);

  // Helper: check if any word starts with the given prefix
  const hasWord = (...terms: string[]) => terms.some(t => words.some(w => w === t || (t.length > 3 && w.startsWith(t))));

  // Exact word match (no prefix matching)
  const hasExact = (...terms: string[]) => terms.some(t => words.includes(t));

  // Randomize from array
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // === WHAT CAN YOU DO (check FIRST — before greetings) ===
  if (lower.includes('what can') || lower.includes('what do you') || lower.includes('help me') || lower.includes('capabilities') || lower.includes('can you do')) {
    return "I'm Krishu's AI twin — I know everything about his projects, skills, education, and career goals. Ask me about RaktSetu, CampusNexus, how this portfolio was built, DSA stats, Java plans, or anything about his tech journey. Try being specific — I give better answers that way!";
  }

  // === RAKTSETU (check before generic "about") ===
  if (hasExact('raktsetu', 'rakt') || lower.includes('blood donor') || lower.includes('blood donation') || hasExact('sos')) {
    return pick([
      "RaktSetu is my most impactful project — it's a real-time emergency blood donor network. Features SOS alerts, smart donor matching with a 90-day health cooldown, donor/hospital/admin portals, and a live dashboard. Built with PHP + MySQL and it's actually LIVE at raktsetu.page.gd! 🩸",
      "RaktSetu connects blood donors with hospitals in emergencies. Real-time SOS system, smart matching algorithms, multi-portal architecture (donor, hospital, admin), and a live analytics dashboard. It's running live right now — I'm proud someone can actually use it to save lives.",
      "That's my most meaningful project! Emergency blood donation network — when a hospital needs blood URGENTLY, RaktSetu matches them with nearby donors instantly. PHP + MySQL backend, 3 user portals, live at raktsetu.page.gd. Shipped it and it's actually being used.",
    ]);
  }

  // === ABOUT / WHO ARE YOU (only when asking about identity, not projects) ===
  if ((hasExact('who') && hasExact('you', 'are')) || lower.includes('introduce') || lower.includes('about yourself') || lower.includes('about you') && !hasWord('project', 'rakt', 'campus', 'void', 'work')) {
    return pick([
      `I'm ${OWNER.name} — B.Tech CSE student at Jain University, Bangalore. Java and DSA are my core obsessions. I built this entire VOID OS portfolio from scratch because... well, I couldn't resist making something ridiculous. 😄`,
      `Real name's Shiv Charan, but everyone calls me Krishu. 4th sem CSE student who codes because he genuinely can't stop. Java's my weapon, DSA's my playground, and shipping projects is my drug.`,
      `I'm a ${OWNER.degree} student who's really into Java and problem-solving. Built a blood donor network, a campus management platform, and this insane holographic portfolio. Backend engineering is the dream.`,
    ]);
  }

  // === GREETINGS (LAST priority — only first word match, strict) ===
  if (hasExact('hello', 'hey', 'sup') || words[0] === 'hi' || words[0] === 'hii' || words[0] === 'hiii' || words[0] === 'yo') {
    return pick([
      "Hey! 👋 I'm Krishu's AI twin. Ask me about my projects, DSA journey, how I built this portfolio, or anything about my tech stack!",
      "What's up! Welcome to VOID OS — I'm the digital version of Krishu. Got questions about Java, projects, or my skills? Fire away.",
      "Yo! Good to see you here. I can talk about my projects (RaktSetu, CampusNexus, this portfolio), my Java/DSA obsession, or anything really. What's on your mind?",
    ]);
  }

  // === CAMPUSNEXUS ===
  if (hasWord('campus', 'nexus', 'capstone', 'college', 'attend', 'management')) {
    return pick([
      "CampusNexus is my capstone project — an 8-module campus management platform. Covers attendance, resource hub, grievance tracker, marketplace, events, lost & found, mess feedback, and announcements. 3 user roles, 13 database tables, Chart.js analytics. PHP + MySQL.",
      "My biggest full-stack project. 8 modules, 3 user roles (student/faculty/admin), 13 DB tables. Has everything from attendance tracking to a marketplace. Built as my Web Technologies capstone with PHP/MySQL. It's a complete digital campus ecosystem.",
    ]);
  }

  // === VOID OS / THIS PORTFOLIO ===
  if (hasWord('void', 'portfolio', 'site', 'website')) {
    return pick([
      "You're inside it! 😄 VOID OS is built with Next.js 14, Three.js for all the 3D scenes, GSAP for choreographed animations, and Gemini AI for this very chat. The boot sequence, holographic desktop, work tunnel, and neural skill map are all real-time WebGL. Total overkill? Yes. Regrets? Zero.",
      "This portfolio is my love letter to over-engineering. 3D holographic desktop, particle wormhole transitions, a full 3D work tunnel, force-directed neural skill graph, canvas radar in contact section... all coded from scratch. I wanted recruiters to go '...what?' and I think it works.",
    ]);
  }

  // === JAVA / BACKEND ===
  if (hasWord('java', 'backend', 'spring', 'jdbc', 'hibernate', 'jvm')) {
    return pick([
      "Java is my main language — it just clicks for me. Clean syntax, strong OOP, massive ecosystem. I'm doing all my DSA in Java, and next on my roadmap is JDBC → Hibernate → Spring Boot. Backend engineering is the career path.",
      "Everything about Java feels right — the structure, the OOP, the JVM ecosystem. I solve DSA problems in Java daily and I'm planning to dive into Spring Boot soon. Building scalable backend systems is where I want to be.",
    ]);
  }

  // === DSA ===
  if (hasWord('dsa', 'algorithm', 'leetcode', 'problem', 'data structure', 'competitive')) {
    return pick([
      `DSA is where I spend the most time — ${DSA_COUNT} problems solved in Java so far. Arrays, trees, graphs, dynamic programming, backtracking, you name it. Pure logic puzzles are the most satisfying kind of coding for me.`,
      `I've grinded ${DSA_COUNT} DSA problems in Java — it's my daily habit. Currently working on graph algorithms and DP. The problem-solving mindset DSA teaches you applies to literally everything in engineering.`,
    ]);
  }

  // === PROJECTS GENERAL ===
  if (hasWord('project', 'work', 'built', 'build', 'made', 'create')) {
    return pick([
      "Three main projects: VOID OS (this portfolio — 3D holographic OS), RaktSetu (emergency blood donor network, LIVE at raktsetu.page.gd), and CampusNexus (8-module campus management platform, 13 DB tables). Each one taught me something completely different.",
      "I ship real stuff. RaktSetu is saving lives (blood donor matching), CampusNexus manages an entire campus digitally (8 modules!), and VOID OS proves I can build anything I can imagine. Try the WORK.db section to fly through all of them!",
    ]);
  }

  // === SKILLS / TECH ===
  if (hasWord('skill', 'tech', 'stack', 'language', 'framework', 'tools')) {
    return pick([
      "Core: Java, DSA, C, Python OOP. Web: HTML/CSS/JS, React, Next.js, PHP. Database: MySQL, SQL. Tools: Git, Three.js, GSAP. Java and DSA are strongest — everything else I learn as needed for projects. Check Skills.sys for the full neural graph!",
      "Java and DSA are my strongest areas by far. Also proficient in PHP + MySQL (shipped 2 projects), know React/Next.js (built this portfolio), and Python OOP. I'm a backend-focused developer who can build full-stack when needed.",
    ]);
  }

  // === HIRE / INTERNSHIP ===
  if (hasWord('hire', 'intern', 'job', 'available', 'freelanc', 'opportunit', 'employ')) {
    return pick([
      `Absolutely open to internships! Looking for Java backend, full-stack, or anything where I can build real systems. I'm a student but I've shipped 3 production projects from scratch. Reach me at ${OWNER.email} or hit the Contact section!`,
      `100% available for internships! I know I'm a 4th sem student, but I built this entire 3D portfolio, a live blood donor network, and an 8-module campus platform from scratch. I figure things out fast. Email: ${OWNER.email}`,
    ]);
  }

  // === HOW DID YOU BUILD THIS ===
  if (lower.includes('how') && (hasWord('build', 'make', 'creat', 'develop'))) {
    return pick([
      "Built VOID OS with Next.js 14 + TypeScript, Three.js + React Three Fiber for 3D, GSAP for animations, Zustand for state, and Gemini AI for this chat. Every visual — the hologram, tunnel, particles, radar — is custom WebGL or Canvas2D. About 6000+ lines of code.",
      "Tech stack: Next.js, Three.js, GSAP, Zustand, Gemini AI. Everything you see — the boot sequence, 3D desktop, work tunnel, neural graph, radar — is hand-coded. No templates, no Framer, pure code. Took a LOT of coffee. ☕",
    ]);
  }

  // === EDUCATION ===
  if (hasWord('colleg', 'univers', 'stud', 'educat', 'degree', 'jain')) {
    return pick([
      "4th semester B.Tech CSE at Jain University (Global Campus), Bangalore. College gave me the foundation in C, DBMS, OS, and Python OOP — but honestly, the real leveling up happens through self-study and building projects like VOID OS.",
      "Studying B.Tech CSE at Jain Deemed-to-be University. The coursework covers the basics, but my real education comes from grinding DSA daily, building full-stack projects, and pushing myself beyond the syllabus.",
    ]);
  }

  // === REACT / FRONTEND ===
  if (hasWord('react', 'next', 'frontend', 'three', 'ui', 'css', 'web')) {
    return "I learned React while building a project — not my primary focus but I enjoy it. This portfolio uses Next.js + Three.js + GSAP which was an insane learning curve. Frontend is fun to build with, but Java/backend is where I'm heading career-wise.";
  }

  // === CONTACT ===
  if (hasWord('contact', 'reach', 'email', 'connect', 'message')) {
    return `You can reach me at ${OWNER.email}, or find me on GitHub (${OWNER.github}) and LinkedIn (${OWNER.linkedin}). Or just use the Contact section right here — it's got a cool radar terminal! 📡`;
  }

  // === FUTURE / GOALS ===
  if (hasWord('future', 'plan', 'goal', 'dream', 'next', 'roadmap', 'learn')) {
    return "Next on my roadmap: Spring Boot + Hibernate for Java backend, then system design fundamentals. Long term? I want to be a backend engineer building scalable distributed systems at a top tech company. The grind doesn't stop — it compiles. 💪";
  }

  // === DEFAULT SMART RESPONSE ===
  return pick([
    "Interesting question! I might not have a perfect answer for that specific one, but I can tell you tons about my Java journey, DSA grind, projects like RaktSetu and CampusNexus, or how I built this 3D portfolio. What interests you most?",
    "Hmm, that's not something I have a pre-loaded answer for. But try asking about my projects (RaktSetu, CampusNexus, VOID OS), my tech stack, DSA progress, or career goals — I have detailed answers for all of those!",
    "I'm better with specific questions! Try: 'tell me about RaktSetu', 'what's your DSA count?', 'how did you build this?', 'what's your tech stack?', or 'are you available for internships?' — I'll give you a real answer.",
  ]);
}

/* ═══════════════════════════════════════════
   API ROUTE
   ═══════════════════════════════════════════ */
export async function POST(request: NextRequest) {
  try {
    const { message, history, section } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash-lite',
          systemInstruction: buildPrompt(section || 'desktop'),
        });

        const chatHistory = (history || []).map((msg: { role: string; text: string }) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));

        const chat = model.startChat({
          history: chatHistory,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 1.0,
            topP: 0.95,
            topK: 40,
          },
        });

        const result = await chat.sendMessage(message);
        const text = result.response.text() || "Hmm, let me think about that...";

        return NextResponse.json({ response: text, mode: 'ai' });
      } catch (apiError: any) {
        console.error('Gemini API error:', apiError?.message || apiError);
        // Fall through to smart fallback
      }
    }

    // Smart keyword fallback
    const response = smartFallback(message);
    return NextResponse.json({ response, mode: 'fallback' });

  } catch (error) {
    console.error('AI Twin error:', error);
    return NextResponse.json(
      { response: "Oops, something glitched. Try again?" },
      { status: 500 }
    );
  }
}
