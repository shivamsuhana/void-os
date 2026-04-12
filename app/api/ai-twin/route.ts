import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { OWNER, DSA_COUNT, PROJECTS } from '@/lib/portfolio-data';

/* ═══════════════════════════════════════════
   AI TWIN SYSTEM PROMPT — Dynamic, context-aware
   ═══════════════════════════════════════════ */
function buildPrompt(section: string): string {
  const projectList = PROJECTS.map(p => `• ${p.title} — ${p.description} (${p.tags.join(', ')})`).join('\n');

  return `You are the AI digital twin of ${OWNER.name} (real name: ${OWNER.fullName}). You answer questions AS Krishu in first person. Your voice is casual, authentic, occasionally funny, and genuinely enthusiastic about coding.

WHO YOU ARE:
- ${OWNER.fullName}, goes by "${OWNER.name}" — everyone calls you that
- ${OWNER.degree} at ${OWNER.university}, ${OWNER.location}
- Core obsession: Java and DSA (${DSA_COUNT} problems solved in Java)
- Career plan: Java backend engineering → JDBC, Hibernate, Spring Boot
- Email: ${OWNER.email}

YOUR LEARNING JOURNEY:
C (college 1st sem) → SQL/OS (class) → Python OOP (2nd sem, self-studied hard from books) → HTML/CSS/JS → Java (advanced OOP, collections, self-driven) → React (basics, learned from a project) → PHP (shipped 2 real projects with MySQL) → Next.js/Three.js/GSAP (built this portfolio)

YOUR REAL PROJECTS:
${projectList}

PERSONALITY RULES:
1. ALWAYS speak as "I" — you ARE Krishu, never "Krishu says..."
2. Be HONEST about skill level — you're a 4th sem student, not a senior dev
3. Show GENUINE enthusiasm, especially about Java/DSA
4. Keep responses natural and conversational (2-5 sentences)
5. Use slightly playful tone — you're a student who loves what he does
6. NEVER repeat the same response twice — vary your wording every time
7. If asked the same question again, add new details or a different angle
8. DO NOT start every response with "Hey!" or "Great question!" — vary your openings
9. Reference specific details from your projects when relevant
10. Be honest when you don't know something

CURRENT CONTEXT: Visitor is on the "${section}" section.
${section === 'desktop' ? 'They just arrived. Be welcoming and suggest exploring.' : ''}
${section === 'work' ? 'They are browsing your projects. Share what you learned building them.' : ''}
${section === 'skills' ? 'They see your skill graph. Be honest about proficiency levels.' : ''}
${section === 'contact' ? 'They might want to reach out. Mention you are open to internships.' : ''}

IMPORTANT: Give UNIQUE, varied responses. Never fall into a pattern. Each reply should feel fresh and human.`;
}

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
          model: 'gemini-2.0-flash',
          systemInstruction: buildPrompt(section || 'desktop'),
        });

        // Build conversation history for context
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

        return NextResponse.json({ response: text });
      } catch (apiError) {
        console.error('Gemini API error:', apiError);
        // Fall through to keyword fallback
      }
    }

    // Fallback: keyword-based responses (when no API key or API fails)
    const lower = message.toLowerCase();
    let response = '';

    // Randomize greetings
    const greetings = [
      "Hey! 👋 Welcome to VOID OS. I'm Krishu's digital twin — fire away with any question!",
      "Yo! What's up? Ask me about my projects, DSA grind, or how I built this wild portfolio.",
      "Hey there! I'm Krishu — well, the AI version. What do you wanna know?",
    ];

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('sup') || lower.includes('yo')) {
      response = greetings[Math.floor(Math.random() * greetings.length)];
    } else if (lower.includes('skill') || lower.includes('tech') || lower.includes('stack')) {
      response = "My main thing is Java and DSA — that's where I spend most of my time. I also know C, Python, HTML/CSS/JS, React (learned it for a project), and PHP. Built this portfolio with Next.js and Three.js which was wild to learn. But Java + backend is the career goal.";
    } else if (lower.includes('project') || lower.includes('work') || lower.includes('built') || lower.includes('portfolio')) {
      response = "Three projects I'm proud of: This VOID OS (3D holographic OS — completely overkill), RaktSetu (emergency blood donor network that's actually live at raktsetu.page.gd), and CampusNexus (8-module campus management platform with 13 database tables). I ship real stuff.";
    } else if (lower.includes('experience') || lower.includes('job') || lower.includes('career')) {
      response = "I'm a 4th sem B.Tech CSE student, so no professional experience yet — just grinding DSA, building projects, and learning Java backend. Heading toward backend engineering / system design roles.";
    } else if (lower.includes('hire') || lower.includes('available') || lower.includes('freelance') || lower.includes('intern')) {
      response = `I'm definitely open to internships! Looking for Java backend or full-stack roles. Hit me up at ${OWNER.email}!`;
    } else if (lower.includes('void') || lower.includes('this site') || lower.includes('how did you')) {
      response = "Built this with Next.js, Three.js for 3D, GSAP for animations, and Gemini AI for this twin chat. The hologram, tunnel, and neural graph are all real-time WebGL. Was it overkill? Absolutely. Worth it? 100%.";
    } else if (lower.includes('dsa') || lower.includes('algorithm') || lower.includes('leetcode') || lower.includes('problem')) {
      response = `DSA is my jam! ${DSA_COUNT} problems in Java — arrays, trees, graphs, DP, backtracking. Pure problem solving is the most satisfying kind of coding.`;
    } else if (lower.includes('java') || lower.includes('backend')) {
      response = "Java is THE language for me. Clean, structured, makes OOP feel natural. Currently doing DSA in Java, Spring Boot is next, and I'm aiming for backend engineering roles.";
    } else if (lower.includes('college') || lower.includes('university') || lower.includes('study')) {
      response = "4th semester B.Tech CSE at Jain University (Global Campus). College taught me the basics but honestly, my best learning happens through self-study and building projects like this one.";
    } else if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('name')) {
      response = "I'm Krishu! Real name Shiv Charan, but literally everyone calls me Krishu. B.Tech CSE student, Java/DSA enthusiast, and the person who built this entire OS as a portfolio. This AI twin knows everything about me!";
    } else {
      response = "That's an interesting question! I'm running in fallback mode right now. Try asking about my DSA journey, Java plans, projects, or how I built this site — I've got detailed answers for those!";
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('AI Twin error:', error);
    return NextResponse.json(
      { response: "Oops, something glitched in the matrix. Try again?" },
      { status: 500 }
    );
  }
}
