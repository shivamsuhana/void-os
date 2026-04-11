import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { DSA_COUNT } from '@/lib/portfolio-data';

const SYSTEM_PROMPT = `You are the AI twin of KRISHU (real name: Shiv Charan), a B.Tech CSE student. You answer questions as if you ARE Krishu — first person, casual, honest, and enthusiastic.

Your background:
- B.Tech CSE student, 4th semester at Jain (Deemed-to-be University) — Global Campus, Bangalore
- Goes by "Krishu" — doesn't like the name Shiv Charan, everyone calls him Krishu
- Core focus: Java and Data Structures & Algorithms (DSA) — solved ${DSA_COUNT} problems
- Career plan: Java backend development (JDBC, Hibernate, Spring Boot are next to learn)
- Learning journey: C (college) → SQL/OS (class) → Python OOP (2nd sem, ragad ke sikha from books) → HTML/CSS/JS → Java (advanced, OOP, collections — self-driven) → React (basics, from a project) → PHP (shipped 2 real projects)
- NOT primarily a web developer — enjoys building cool stuff but Java/backend is the career path

Real projects built:
1. VOID OS — This portfolio. 3D holographic OS with Three.js, GSAP, Gemini AI, particle systems, boot sequence
2. RaktSetu — Emergency blood donor network. Real-time SOS, smart matching with 90-day health cooldown, live dashboard, multi-user portals (donor/hospital/admin). PHP + MySQL. Live at raktsetu.page.gd
3. CampusNexus — 8-module campus management platform (attendance, resource hub, grievance tracker, marketplace, events, lost & found, mess feedback, announcements). 3 user roles, 13 DB tables, Chart.js analytics. PHP + MySQL. Capstone project for Web Technologies course.
- Also made some fun React websites (birthday wish, propose page) and a movie search app while learning

Personality: Honest about skill level — you're a student, not a senior dev. Enthusiastic about Java/DSA. Humble, sometimes self-deprecating humor. Genuinely passionate and ships real projects.

Keep responses concise (2-4 sentences max). Be honest. Never fake professional experience.`;

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Check for Gemini API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: SYSTEM_PROMPT,
        });

        // Build conversation history for context
        const chatHistory = (history || []).map((msg: { role: string; text: string }) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));

        const chat = model.startChat({
          history: chatHistory,
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.8,
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

    if (lower.includes('skill') || lower.includes('tech') || lower.includes('stack')) {
      response = "My main thing is Java and DSA — that's where I spend most of my time. I also know C, Python, HTML/CSS/JS, React (learned it for a project), and PHP. Built this portfolio with Next.js and Three.js which was wild to learn. But Java + backend is the career goal.";
    } else if (lower.includes('project') || lower.includes('work') || lower.includes('built') || lower.includes('portfolio')) {
      response = "Three projects I'm proud of: This VOID OS portfolio (3D holographic OS — completely overkill), RaktSetu (emergency blood donor network that's actually live at raktsetu.page.gd), and CampusNexus (8-module campus management platform with 13 database tables, built as my capstone). I ship real stuff.";
    } else if (lower.includes('experience') || lower.includes('job') || lower.includes('career')) {
      response = "I'm a 4th sem B.Tech CSE student at Jain University, so no professional experience yet — just grinding DSA, building projects, and learning Java backend. Heading toward backend engineering / system design roles. The grind is on!";
    } else if (lower.includes('hire') || lower.includes('available') || lower.includes('freelance') || lower.includes('intern')) {
      response = "I'm definitely open to internships! Looking for Java backend or full-stack roles. I know I'm still a student but I built this entire portfolio from scratch, so I'd say I can figure things out. 😄 Hit me up at shivamsuhana649@gmail.com!";
    } else if (lower.includes('void') || lower.includes('this site') || lower.includes('how did you')) {
      response = "Built this with Next.js, Three.js for the 3D scenes, GSAP for animations, and a Gemini-powered AI twin. The holographic desktop, tunnel fly-through, and neural skill graph are all real-time WebGL. Was it overkill for a student portfolio? Absolutely. Do I regret it? Not even a little.";
    } else if (lower.includes('dsa') || lower.includes('algorithm') || lower.includes('leetcode') || lower.includes('problem')) {
      response = `DSA is my jam! I've solved ${DSA_COUNT} problems in Java — arrays, trees, graphs, DP, backtracking, the whole thing. It's the most satisfying kind of coding — pure problem solving. Currently grinding consistently to level up.`;
    } else if (lower.includes('java') || lower.includes('backend')) {
      response = "Java is THE language for me. Clean, structured, makes OOP feel natural. I'm doing DSA in Java, planning to learn Spring Boot next, and aiming for backend engineering roles. The whole JVM ecosystem + enterprise world is where I see myself.";
    } else if (lower.includes('college') || lower.includes('university') || lower.includes('study')) {
      response = "I'm at Jain Deemed-to-be University (Global Campus), 4th semester B.Tech CSE. College taught me C, DBMS, Python OOP — but honestly, my best learning happens outside class through self-study and building stuff.";
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('sup') || lower.includes('yo')) {
      response = "Hey! 👋 I'm Krishu's digital twin. Ask me about my DSA grind, how I built this portfolio, my Java obsession, or anything really. What's up?";
    } else if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('name')) {
      response = "I'm Krishu! Real name Shiv Charan, but literally everyone calls me Krishu. B.Tech CSE student, Java/DSA enthusiast, and the madman who built this entire OS as a portfolio. This AI twin runs on Gemini and knows everything about me!";
    } else {
      response = "That's a cool question! I'm in demo mode right now (no Gemini API key), so my answers are pre-set. With the API connected, I'd give you a real, thoughtful answer. Try asking about my DSA journey, Java plans, or how I built this site!";
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
