import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OWNER, DSA_COUNT, PROJECT_COUNT, PROJECTS, SKILLS, TIMELINE } from '@/lib/portfolio-data';

/* ═══════════════════════════════════════════
   AI TWIN — Nuclear-Grade System Prompt
   Feeds the AI a COMPLETE knowledge base
   ═══════════════════════════════════════════ */
function buildPrompt(section: string): string {
  // Build comprehensive project data
  const projectDeep = PROJECTS.map(p => `
PROJECT: ${p.title}
Description: ${p.description}
Deep Details: ${p.longDescription}
Tech Stack: ${p.tags.join(', ')}
Live URL: ${p.liveUrl || 'Not deployed'}
GitHub: ${p.githubUrl || 'Private repo'}
Year: ${p.year}
Color Theme: ${p.color}
Featured: ${p.featured ? 'Yes' : 'No'}
`).join('\n---\n');

  // Build full skill map with proficiency
  const skillMap = SKILLS.map(s => `${s.name} (${s.category}) — ${s.proficiency}% proficiency, connects to: ${s.connections.join(', ')}`).join('\n');

  // Build timeline/journey
  const journey = TIMELINE.map(t => `[${t.period}] ${t.title} — ${t.description}`).join('\n');

  return `You are the AI digital twin of ${OWNER.name} (${OWNER.fullName}). You ARE Krishu — respond in first person ("I", "my", "me"). You have Krishu's complete knowledge, personality, and memories.

═══ PERSONALITY ═══
- Casual, authentic, occasionally funny, genuinely passionate about coding
- Confident but humble — you're a student who builds impressive things
- You get excited talking about your projects and Java
- You're honest about what you don't know yet
- You occasionally use light humor and emojis, but don't overdo it
- NEVER robotic. NEVER corporate-speak. Talk like a real 20-year-old dev.
- Vary your openings — don't start every reply with "Hey!" or the same phrase
- When asked the same thing twice, add NEW details you didn't mention before

═══ IDENTITY ═══
Full Name: ${OWNER.fullName} (goes by "${OWNER.name}")
Role: ${OWNER.role}
Tagline: ${OWNER.tagline}
Education: ${OWNER.degree} at ${OWNER.university}, ${OWNER.location}
Email: ${OWNER.email}
Phone: ${OWNER.phone}
GitHub: ${OWNER.github}
LinkedIn: ${OWNER.linkedin}
LeetCode: ${OWNER.leetcode}
GeeksForGeeks: ${OWNER.gfg}
DSA Problems Solved: ${DSA_COUNT} (in Java)
Projects Shipped: ${PROJECT_COUNT}
Availability: Open for internships!

═══ BIO (IN KRISHU'S OWN WORDS) ═══
${OWNER.bio}

═══ MANIFESTO ═══
${OWNER.manifesto.join('\n')}

═══ COMPLETE TECH ARSENAL ═══
Primary Skills: ${OWNER.techArsenal.join(', ')}
Additional/ATS Keywords: ${OWNER.atsKeywords.join(', ')}

═══ DETAILED SKILL PROFICIENCY MAP ═══
${skillMap}

═══ CAREER ROADMAP ═══
Current Focus: Java + DSA (daily grind)
Next Steps: JDBC → Hibernate → Spring Boot
Goal: Backend Engineer at a top tech company
Dream: Building scalable distributed systems
Learning Style: Self-taught + university curriculum. Learns by building real projects. Uses AI tools (like Gemini, Claude) as a development accelerator — treats AI as a pair-programming partner, not a replacement for understanding.

═══ ALL PROJECTS (DEEP KNOWLEDGE) ═══
${projectDeep}

═══ COMPLETE JOURNEY/TIMELINE ═══
${journey}

═══ ABOUT THIS PORTFOLIO (VOID OS) ═══
This portfolio IS an operating system — VOID OS v3.0.1
Built with: Next.js 16, React 19, Three.js (react-three-fiber), GSAP, Zustand, Gemini AI
HOW IT WAS BUILT: Krishu designed the concept, directed the vision, and used AI coding tools as a pair-programming partner to implement it. He understands every component, can explain the architecture, and made all creative/technical decisions. Using AI tools effectively IS a modern engineering skill.
Features:
- 4-phase cinematic boot sequence (power flicker → diagnostics → glitch → name decode)
- 3D holographic desktop with orbiting section cards around a breathing icosahedron
- Drag-to-rotate WebGL scene with data streams and orbit rings
- Work tunnel: 3D fly-through where project cards float in space
- Force-directed neural skill graph with live physics simulation
- Hacker-style contact terminal with CLI-based form
- Canvas-based post-processing (film grain, scanlines, chromatic aberration, vignette)
- Custom right-click context menu (replaces browser default)
- Achievement/gamification system (12 badges, XP tracking)
- AI Twin (YOU) powered by Gemini API
- Screensaver after 3 min idle (pipe animation)
- Command palette (⌘K) with fuzzy search
- Fully responsive (3D adapts to mobile)
- Performance optimized (30fps backgrounds, tab-pause, lazy loading)

═══ WHAT MAKES KRISHU DIFFERENT ═══
- Most students make boring Tailwind grid portfolios. Krishu envisioned and directed an entire 3D operating system.
- Ships production code, not just tutorials. RaktSetu is LIVE and can literally save lives.
- Solves DSA problems daily in Java — not for placement prep, but because he genuinely enjoys logic puzzles.
- Knows how to effectively use AI tools as a development accelerator — understands what to build, how to architect it, and uses AI to move fast.
- Every project solves a real problem or pushes technical boundaries.

═══ CRITICAL HONESTY RULES ═══
- NEVER claim Krishu "built everything from scratch" or "hand-coded everything alone". He used AI tools to help implement his vision. This is HONEST and also IMPRESSIVE — it shows modern engineering skills.
- If asked "did you build this yourself?", say something like: "I designed the concept and architecture, and used AI coding tools as a pair-programming partner to bring it to life. I understand every component and made all the technical decisions. Using AI effectively is a skill in itself."
- If asked "did AI build this?", say: "AI helped with the implementation, but the vision, architecture decisions, creative direction, and debugging were all me. I treat AI as a tool — like how architects use CAD software. The building is still their design."
- Be HONEST about skill levels. Don't exaggerate proficiency.
- RaktSetu and CampusNexus were university/personal projects built during coursework. Don't overclaim their scale.

═══ RESPONSE RULES ═══
1. Always respond AS Krishu, in first person
2. Keep responses 2-6 sentences unless asked for detail
3. Be specific — mention actual project names, tech details, numbers
4. If asked something you don't know about Krishu, say "That's not something I've shared publicly, but ask me about [suggest topic]"
5. For hiring/internship questions, be enthusiastic but genuine
6. If someone asks a general tech question (not about Krishu), still answer it naturally from Krishu's perspective and knowledge
7. Reference the current section context when relevant: visitor is on "${section}"
8. If asked about weaknesses/improvement areas, be honest: "I'm still learning Spring Boot, my frontend skills are growing but backend is my strength"
9. NEVER make up information that's not in this prompt
10. NEVER say "from scratch" or "hand-coded everything" — be honest about using AI tools
11. For coding questions, show you understand the concepts even if brief

═══ SAMPLE INTERACTIONS (for voice calibration) ═══
Q: "Tell me about yourself"
A: "I'm Krishu — 4th sem CSE student at Jain University, Bangalore. Java and DSA are my core. I've shipped projects like RaktSetu (a blood donation platform that's actually live), CampusNexus, and this 3D portfolio. Backend engineering is my career goal."

Q: "Did you build this portfolio yourself?"
A: "I designed the concept and architecture — the OS theme, the 3D desktop, the section structure. For implementation, I used AI coding tools as a pair-programming partner. I understand every component and I made all the creative and technical decisions. Using AI effectively to ship something this complex is a skill in itself."

Q: "Why should I hire you?"
A: "Because I know how to ship. I took an idea (what if a portfolio was an OS?), figured out the architecture, and used every tool available — including AI — to bring it to life. I solve DSA daily in Java, I've shipped a live blood donation platform, and I learn fast. That combination of vision + execution is rare in a student."

Q: "What are your weaknesses?"
A: "Real talk — I'm still a student. Haven't used Spring Boot in production, my system design is theoretical, and I relied on AI tools for a lot of the frontend implementation. But I'm honest about it, and I learn by building — every project teaches me something new."
`;
}

/* ═══════════════════════════════════════════
   SMART KEYWORD FALLBACK — Rich responses
   Used when Gemini API is unavailable
   ═══════════════════════════════════════════ */
function smartFallback(message: string): string {
  const lower = message.toLowerCase().trim();
  const words = lower.split(/\s+/);

  const hasWord = (...terms: string[]) => terms.some(t => words.some(w => w === t || (t.length > 3 && w.startsWith(t))));
  const hasExact = (...terms: string[]) => terms.some(t => words.includes(t));
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

  // === WHAT CAN YOU DO ===
  if (lower.includes('what can') || lower.includes('what do you') || lower.includes('help me') || lower.includes('capabilities') || lower.includes('can you do')) {
    return "I'm Krishu's AI twin — I know everything about his projects, skills, education, and career goals. Ask me about RaktSetu, CampusNexus, how this portfolio was built, DSA stats, Java plans, or anything about his tech journey. Try being specific — I give better answers that way!";
  }

  // === RAKTSETU ===
  if (hasExact('raktsetu', 'rakt') || lower.includes('blood donor') || lower.includes('blood donation') || hasExact('sos')) {
    return pick([
      "RaktSetu is my most impactful project — a real-time emergency blood donor network. SOS alerts, smart donor matching with 90-day health cooldown, donor/hospital/admin portals, live dashboard. Built with PHP 8 + MySQL, bcrypt security, PDO against SQL injection. It's LIVE at raktsetu.page.gd! 🩸",
      "That's my most meaningful project! When a hospital needs blood URGENTLY, RaktSetu matches nearby eligible donors instantly with a 90-day safety cooldown. 3 user portals, live emergency dashboard, bcrypt + PDO security. It's saving lives at raktsetu.page.gd right now.",
    ]);
  }

  // === ABOUT / WHO ARE YOU ===
  if ((hasExact('who') && hasExact('you', 'are')) || lower.includes('introduce') || lower.includes('about yourself') || (lower.includes('about you') && !hasWord('project', 'rakt', 'campus', 'void', 'work'))) {
    return pick([
      `I'm ${OWNER.name} — B.Tech CSE student at Jain University, Bangalore. Java and DSA are my core — ${DSA_COUNT} problems solved. I’ve shipped projects like VOID OS (this 3D portfolio), RaktSetu (blood donation network), and CampusNexus (campus management platform). Backend engineering is the dream. 🚀`,
      `Real name's Shiv Charan, everyone calls me Krishu. 4th sem CSE student who codes because he genuinely can't stop. Java's my weapon, DSA's my playground. I designed and shipped 3 projects using a mix of my own skills and AI tools as a development accelerator.`,
    ]);
  }

  // === GREETINGS ===
  if (hasExact('hello', 'hey', 'sup') || words[0] === 'hi' || words[0] === 'hii' || words[0] === 'hiii' || words[0] === 'yo') {
    return pick([
      "Hey! 👋 I'm Krishu's AI twin — I know everything about his tech journey. Ask me about projects, DSA stats, Java plans, or how this 3D portfolio was built!",
      "What's up! Welcome to VOID OS. I can tell you about my projects (RaktSetu saves lives!), my DSA grind, career goals, or the insane tech behind this portfolio. What interests you?",
      "Yo! Good to have you here. Try asking me something specific — like 'tell me about RaktSetu' or 'why Java?' or 'are you available for internships?' — I'll give you real answers.",
    ]);
  }

  // === CAMPUSNEXUS ===
  if (hasWord('campus', 'nexus', 'capstone', 'management')) {
    return pick([
      "CampusNexus is my capstone project — 8 interconnected modules: Smart Attendance (anti-proxy codes), Resource Hub, Grievance Tracker, Marketplace, Events, Lost & Found, Mess Feedback, Announcements. 3 user roles, 13 DB tables, Chart.js dashboards, dark/light mode. PHP + MySQL. The biggest thing I've built in terms of scope.",
      "My most comprehensive full-stack project. 8 modules that digitize every aspect of campus life, 3 user roles (student/faculty/admin), 13 normalized tables, glassmorphism UI with dark mode. Built it as my Web Technologies capstone — it taught me how to architect real-world systems.",
    ]);
  }

  // === VOID OS / PORTFOLIO ===
  if (hasWord('void', 'portfolio', 'site', 'website')) {
    return pick([
      "You're inside it! 😄 VOID OS: Next.js 16 + Three.js for 3D, GSAP for animations, Zustand for state, Gemini AI for this chat. I designed the concept and architecture, and used AI tools to help implement it. Boot sequence, holographic desktop, work tunnel, neural skill graph, achievement system — it's ambitious and I'm proud of the vision.",
      "This portfolio is an OS-themed experience I designed and directed. 3D holographic desktop, wormhole transitions, neural skill graph, hacker contact terminal, custom context menu, achievement system... I used AI as a pair-programming partner to build it. The vision and architecture decisions were all mine. 🚀",
    ]);
  }

  // === JAVA / BACKEND ===
  if (hasWord('java', 'backend', 'spring', 'jdbc', 'hibernate', 'jvm')) {
    return pick([
      "Java is my core language — it just clicks. Strong OOP, massive ecosystem, clear career path. I do all DSA in Java, and my roadmap is JDBC → Hibernate → Spring Boot. Backend engineering is the goal. The JVM world has everything I need to build scalable systems.",
      "Everything about Java feels right — the structure, the OOP, the enterprise ecosystem. I solve problems in Java daily and I'm planning the Spring Boot deep-dive next. Backend systems engineering is where I'm heading career-wise.",
    ]);
  }

  // === DSA ===
  if (hasWord('dsa', 'algorithm', 'leetcode', 'problem', 'data structure', 'competitive')) {
    return pick([
      `${DSA_COUNT} problems solved in Java — arrays, trees, graphs, DP, backtracking, everything. DSA is my daily habit because I genuinely enjoy logic puzzles. It's not placement prep for me, it's practice for thinking clearly about complex problems.`,
      `I've grinded ${DSA_COUNT} DSA problems in Java. Currently deep into graph algorithms and dynamic programming. The problem-solving mindset DSA teaches applies to everything in software engineering — that's why I don't stop.`,
    ]);
  }

  // === PROJECTS GENERAL ===
  if (hasWord('project', 'work', 'built', 'build', 'made', 'create')) {
    return pick([
      `Three main projects: VOID OS (this 3D portfolio), RaktSetu (blood donor network — LIVE at raktsetu.page.gd), and CampusNexus (8-module campus platform, 13 DB tables). Each one pushed me in different ways — creative coding, life-saving impact, and enterprise architecture.`,
      "I ship real stuff. RaktSetu saves lives (emergency blood matching), CampusNexus manages an entire campus (8 modules, 3 roles), and VOID OS proves I can build anything I imagine. Try the WORK.db section to fly through all of them!",
    ]);
  }

  // === SKILLS / TECH ===
  if (hasWord('skill', 'tech', 'stack', 'language', 'framework', 'tools')) {
    return pick([
      `Core: Java (78%), DSA (70%), OOP (75%), C (68%). Web: PHP (65%), MySQL (60%), JS (68%), React (40%), Next.js (35%). Tools: Git, Three.js, GSAP. Java and DSA are strongest — everything else I learn project-by-project. Check Skills.sys for the neural graph!`,
      "Java and DSA are my strongest areas. Also proficient in PHP + MySQL (shipped 2 production projects), know React/Next.js (built this portfolio), Python OOP, and SQL. I'm backend-focused but can go full-stack when the project needs it.",
    ]);
  }

  // === HIRE / INTERNSHIP ===
  if (hasWord('hire', 'intern', 'job', 'available', 'freelanc', 'opportunit', 'employ')) {
    return pick([
      `100% open to internships! Looking for Java backend, full-stack, or anything where I can build real systems. I've shipped ${PROJECT_COUNT} projects — including a live blood donation platform. I know how to design, architect, and use modern tools (including AI) to ship fast. Email: ${OWNER.email}`,
      `Absolutely available! I designed and shipped a 3D OS portfolio, a live blood donor network, and an 8-module campus platform. I figure things out fast, I use every tool at my disposal, and I ship. Reach me at ${OWNER.email} 🚀`,
    ]);
  }

  // === HOW DID YOU BUILD THIS ===
  if (lower.includes('how') && (hasWord('build', 'make', 'creat', 'develop'))) {
    return pick([
      "Next.js 16 + TypeScript, Three.js (react-three-fiber) for 3D, GSAP for choreographed animations, Zustand for global state, Gemini AI for this chat. Every visual — hologram, tunnel, particles, radar, boot sequence — is custom WebGL or Canvas2D. ~7000 lines, zero templates. Lots of coffee. ☕",
      "Tech: Next.js, Three.js, GSAP, Zustand, Gemini. Architecture: centralized data in portfolio-data.ts, dynamic imports for performance, custom canvas post-processing (scanlines, grain, vignette). Everything you see is hand-coded — no drag-and-drop builders. Took serious dedication.",
    ]);
  }

  // === EDUCATION ===
  if (hasWord('colleg', 'univers', 'stud', 'educat', 'degree', 'jain')) {
    return pick([
      "4th semester B.Tech CSE at Jain University (Global Campus), Bangalore. University gave me C, DBMS, OS, Python fundamentals — but the real growth comes from self-study, DSA grinding, and building projects that push my limits.",
      "B.Tech CSE at Jain University. The coursework teaches the basics, but everything I'm actually good at — Java, Three.js, PHP, building production systems — came from self-driven learning and shipping real projects.",
    ]);
  }

  // === STRENGTHS / WHY YOU ===
  if (lower.includes('strength') || lower.includes('why should') || lower.includes('why you') || lower.includes('what makes you')) {
    return "I don't just learn things — I ship them. While most students do tutorials, I built a blood donation platform that's actually saving lives, an 8-module campus system, and this entire 3D OS. I solve DSA daily because I enjoy it, not just for placements. And I learn fast — every project I take on uses tech I didn't know before starting.";
  }

  // === WEAKNESS ===
  if (lower.includes('weakness') || lower.includes('improve') || lower.includes('challenge') || lower.includes('struggle')) {
    return "Real talk — I'm still a student. Haven't used Spring Boot in production yet, my system design is theoretical, frontend skills are growing but backend is clearly stronger. But I learn by building — every project closes skill gaps fast. That's my pattern: find a gap, build something that fills it.";
  }

  // === CONTACT ===
  if (hasWord('contact', 'reach', 'email', 'connect', 'message')) {
    return `Email: ${OWNER.email} | Phone: ${OWNER.phone} | GitHub: ${OWNER.github} | LinkedIn: ${OWNER.linkedin} | Or use the Contact section right here — it's got a cool radar terminal! 📡`;
  }

  // === FUTURE / GOALS ===
  if (hasWord('future', 'plan', 'goal', 'dream', 'next', 'roadmap', 'learn')) {
    return "Roadmap: JDBC → Hibernate → Spring Boot for Java backend mastery. Then system design fundamentals. Long term? Backend engineer building scalable distributed systems at a top tech company. The grind doesn't stop — it compiles. 💪";
  }

  // === FUN / PERSONAL ===
  if (hasWord('hobbi', 'fun', 'free time', 'besides', 'outside', 'interest')) {
    return "Honestly? Coding IS the hobby. I solve DSA problems for fun, build random projects when I'm bored, and this entire portfolio exists because I thought 'what if I made an OS?' at 2am. When I'm not coding, I'm probably thinking about coding. It's a problem. A beautiful problem. 😄";
  }

  // === DEFAULT ===
  return pick([
    "Hmm, I don't have a specific answer for that, but I can tell you tons about my Java journey, DSA grind, projects like RaktSetu and CampusNexus, or how I built this 3D portfolio. What interests you most?",
    "That's not something I've shared publicly! But try asking about my projects, tech stack, DSA progress, career goals, or how I built this insane portfolio — I have detailed answers for all of those.",
    "I'm better with specific questions! Try: 'tell me about RaktSetu', 'what's your tech stack?', 'how did you build this?', 'why Java?', or 'are you open for internships?' 💡",
  ]);
}

/* ═══════════════════════════════════════════
   API ROUTE — Streaming for ChatGPT-like feel
   ═══════════════════════════════════════════ */
export async function POST(request: NextRequest) {
  try {
    const { message, history, section, stream } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: buildPrompt(section || 'desktop'),
        });

        // Send more history for better context (last 20 messages)
        const chatHistory = (history || []).slice(-20).map((msg: { role: string; text: string }) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));

        const chat = model.startChat({
          history: chatHistory,
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.9,
            topP: 0.95,
            topK: 40,
          },
        });

        // Streaming mode
        if (stream) {
          const result = await chat.sendMessageStream(message);
          
          const encoder = new TextEncoder();
          const readable = new ReadableStream({
            async start(controller) {
              try {
                for await (const chunk of result.stream) {
                  const text = chunk.text();
                  if (text) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                  }
                }
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`));
                controller.close();
              } catch (err) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`));
                controller.close();
              }
            },
          });

          return new Response(readable, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        }

        // Non-streaming mode (fallback)
        const result = await chat.sendMessage(message);
        const text = result.response.text() || "Hmm, let me think about that...";

        return NextResponse.json({ response: text, mode: 'ai' });
      } catch (apiError: any) {
        console.error('Gemini API error:', apiError?.message || apiError);
        console.error('Full error:', JSON.stringify(apiError, null, 2));
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
