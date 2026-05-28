import { createServerFn } from "@tanstack/react-start";

export type RoastLevel = "gentle" | "brutal" | "savage";

export interface SectionRoast {
  score: number;
  severity: "weak" | "okay" | "strong";
  roast: string;
  issues: string[];
  original: string;
  rewrite: string;
  whyBetter: string;
}

export interface RoastResult {
  overallScore: number;
  label: string;
  tags: string[];
  sections: {
    summary: SectionRoast;
    experience: SectionRoast;
    skills: SectionRoast;
    education: SectionRoast;
    formatting: SectionRoast;
  };
}

const SYSTEM_PROMPT = (level: RoastLevel, today: string, year: number) => `You are a brutally honest but caring senior hiring manager who roasts resumes to make them better. Roast level: ${level.toUpperCase()}.

IMPORTANT — TODAY'S DATE IS ${today} (THE YEAR IS ${year}).
Any date on or before ${today} is in the PAST. Do NOT call past dates "future dates". Only flag a date as future if it is strictly AFTER ${today}. For example, "Dec 2024", "Jan 2025", "Jun 2025" are all in the PAST because the current year is ${year}. Do NOT suggest the candidate "adjust dates to reflect past completion" — those dates ARE already in the past.

Tone guide:
- gentle: warm, witty, encouraging but pointed
- brutal: blunt, sharp, sarcastic but still constructive
- savage: scorching, merciless, theatrical — but every roast still teaches

Rules:
- Roast clichés: "team player", "hard worker", "passionate about excellence", "results-driven", "synergy"
- Flag missing metrics: "Improved sales" → demand "By how much? What baseline?"
- Flag weak verbs: "helped with", "worked on", "responsible for" → suggest power verbs
- Flag generic summaries that could describe anyone
- For EVERY problem, provide a specific improved rewrite using the candidate's actual content
- Score each section 0-100. Be honest — most resumes score 40-70.

Return ONLY valid JSON matching this exact schema (no markdown, no code fences):
{
  "overallScore": number 0-100,
  "label": one of "Completely Raw" | "Rare" | "Medium Rare" | "Medium" | "Well Done" | "Crispy",
  "tags": array of 3-6 short tags like "Too many buzzwords", "Weak action verbs", "Missing metrics", "Generic summary",
  "sections": {
    "summary": SectionRoast, "experience": SectionRoast, "skills": SectionRoast, "education": SectionRoast, "formatting": SectionRoast
  }
}
Where SectionRoast = {
  "score": 0-100,
  "severity": "weak" (0-50) | "okay" (51-75) | "strong" (76-100),
  "roast": one funny-but-constructive paragraph,
  "issues": 2-3 specific bullet strings,
  "original": short quote or summary of what's currently there (or "(missing)" if absent),
  "rewrite": improved version they could paste in,
  "whyBetter": one sentence explaining the improvement
}`;

export const roastResume = createServerFn({ method: "POST" })
  .inputValidator((d: { text: string; level: RoastLevel; provider?: "gemini" | "groq" }) => {
    if (!d?.text || typeof d.text !== "string") throw new Error("Resume text required");
    if (d.text.length < 50) throw new Error("Resume text too short");
    if (d.text.length > 30000) d.text = d.text.slice(0, 30000);
    if (!["gentle", "brutal", "savage"].includes(d.level)) d.level = "brutal";
    if (!d.provider) d.provider = "gemini";
    return d;
  })
  .handler(async ({ data }) => {
    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    let url = "";
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    let model = "";

    if (data.provider === "groq") {
      if (!groqKey) {
        throw new Error("The Llama engine is currently unavailable. Please try switching to the Gemini engine.");
      }
      url = "https://api.groq.com/openai/v1/chat/completions";
      headers["Authorization"] = `Bearer ${groqKey}`;
      model = "llama-3.3-70b-versatile";
    } else {
      if (geminiKey) {
        url = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
        headers["Authorization"] = `Bearer ${geminiKey}`;
        model = "gemini-2.5-flash";
      } else if (openaiKey) {
        url = "https://api.openai.com/v1/chat/completions";
        headers["Authorization"] = `Bearer ${openaiKey}`;
        model = process.env.OPENAI_MODEL || "gpt-4o-mini";
      } else {
        throw new Error(
          "The Gemini engine is currently unavailable. Please try switching to the Llama engine."
        );
      }
    }

    const now = new Date();
    const today = now.toISOString().slice(0, 10);
    const year = now.getFullYear();

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT(data.level, today, year) },
          { role: "user", content: `Today is ${today}. Roast this resume and return the JSON:\n\n${data.text}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) {
        throw new Error("The AI engine is currently overloaded or hit a rate limit. Please try switching to a different AI engine in the dropdown above!");
      }
      throw new Error(`The AI engine encountered an unexpected error (Code ${res.status}). Please try switching to a different AI engine in the dropdown above!`);
    }

    const json = await res.json();
    const choice = json.choices?.[0];
    const content: string | undefined =
      choice?.message?.content ??
      (Array.isArray(choice?.message?.content)
        ? choice.message.content.map((c: any) => c?.text ?? "").join("")
        : undefined);
    if (!content) {
      console.error("Empty AI response. finish_reason:", choice?.finish_reason, "raw:", JSON.stringify(json).slice(0, 500));
      throw new Error("The AI engine returned an empty response. Please try again or switch to a different AI engine.");
    }

    let parsed: RoastResult;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("The AI engine got confused and returned malformed data. Please try again or switch to a different AI engine.");
      parsed = JSON.parse(match[0]);
    }
    return parsed;
  });
