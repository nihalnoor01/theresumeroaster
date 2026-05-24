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

const SYSTEM_PROMPT = (level: RoastLevel) => `You are a brutally honest but caring senior hiring manager who roasts resumes to make them better. Roast level: ${level.toUpperCase()}.

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
  .inputValidator((d: { text: string; level: RoastLevel }) => {
    if (!d?.text || typeof d.text !== "string") throw new Error("Resume text required");
    if (d.text.length < 50) throw new Error("Resume text too short");
    if (d.text.length > 30000) d.text = d.text.slice(0, 30000);
    if (!["gentle", "brutal", "savage"].includes(d.level)) d.level = "brutal";
    return d;
  })
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY not configured");

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT(data.level) },
          { role: "user", content: `Roast this resume and return the JSON:\n\n${data.text}` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Rate limit hit. Try again in a moment.");
      if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
      throw new Error(`AI error ${res.status}: ${body.slice(0, 200)}`);
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
      throw new Error("Empty AI response");
    }

    let parsed: RoastResult;
    try {
      parsed = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      if (!match) throw new Error("Could not parse AI response as JSON");
      parsed = JSON.parse(match[0]);
    }
    return parsed;
  });
