import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { UploadZone } from "@/components/UploadZone";
import { RoastingScreen } from "@/components/RoastingScreen";
import { Results } from "@/components/Results";
import { extractText } from "@/lib/extract-text";
import { roastResume, type RoastLevel, type RoastResult } from "@/lib/roast.functions";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Free AI Resume Review — Instant Roast & Rewrites | Medium Rare Hire" },
      {
        name: "description",
        content:
          "Free AI resume review in seconds. Upload your resume for brutally honest feedback, ATS-friendly rewrites, and a no-holds-barred resume roast. No signup.",
      },
      { property: "og:title", content: "Free AI Resume Review — Medium Rare Hire" },
      {
        property: "og:description",
        content: "AI resume review with brutally honest feedback and instant rewrites. Free, no signup.",
      },
      { property: "og:url", content: "https://mediumrarehire.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://mediumrarehire.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Medium Rare Hire",
          alternateName: "AI Resume Review",
          url: "https://mediumrarehire.lovable.app",
          applicationCategory: "BusinessApplication",
          operatingSystem: "All",
          description: "Free AI resume review with brutally honest feedback and instant rewrites.",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            { "@type": "Question", name: "Is the AI resume review free?", acceptedAnswer: { "@type": "Answer", text: "Yes. Medium Rare Hire is 100% free, no signup required, and nothing is stored." } },
            { "@type": "Question", name: "Can AI really review my resume?", acceptedAnswer: { "@type": "Answer", text: "Yes. Our AI scans your resume for weak verbs, missing metrics, clichés, and ATS issues, then rewrites the weakest sections instantly." } },
            { "@type": "Question", name: "How do I fix my resume?", acceptedAnswer: { "@type": "Answer", text: "Upload it here. You'll get an honest roast plus paste-ready rewrites for every weak bullet in seconds." } },
            { "@type": "Question", name: "What is Medium Rare Hire?", acceptedAnswer: { "@type": "Answer", text: "Medium Rare Hire is a free AI resume review tool that gives brutally honest feedback and instant rewrites." } },
          ],
        }),
      },
    ],
  }),
});

type Phase = "idle" | "loading" | "results" | "error";

const LEVELS: { id: RoastLevel; label: string; emoji: string }[] = [
  { id: "gentle", label: "Gentle Edition", emoji: "🫶" },
  { id: "brutal", label: "Brutal Edition", emoji: "🔥" },
  { id: "savage", label: "Savage Edition", emoji: "💀" },
];

function Masthead() {
  return (
    <header className="border-b-2 border-ink">
      <div className="bg-ink text-newsprint">
        <div className="max-w-[900px] mx-auto px-4 py-3 sm:py-4 flex flex-col items-center gap-2">
          <div className="w-full flex items-center justify-between gap-2">
            <div className="font-mono-news text-[9px] sm:text-[11px] uppercase tracking-widest">
              Est. 2025
            </div>
            <div className="font-mono-news text-[9px] sm:text-[11px] uppercase tracking-widest text-right">
              Free · No Signup · Nothing Stored
            </div>
          </div>
          <div className="text-center font-fraktur text-3xl sm:text-5xl leading-none whitespace-nowrap">
            The Resume Roaster
          </div>
        </div>
      </div>
      <div className="max-w-[900px] mx-auto px-4 pt-2">
        <div className="rule-double" />
      </div>
    </header>
  );
}

function DatelineTicker() {
  const items = [
    "BREAKING: Your resume has been flagged for excessive use of 'team player'",
    "AI declares another objective statement 'meaningless'",
    "Hiring managers refuse to comment",
    "Buzzword inflation reaches all-time high",
    "Local candidate stuns world by quantifying achievements",
  ];
  const line = items.join("  ·  ");
  return (
    <div className="bg-muted border-b border-ink overflow-hidden">
      <div className="max-w-[900px] mx-auto flex items-center">
        <div className="bg-stamp text-white font-mono-news text-[10px] uppercase tracking-widest px-2 py-1 flex-shrink-0">
          ● Live
        </div>
        <div className="relative overflow-hidden flex-1 py-1">
          <div className="whitespace-nowrap animate-marquee font-mono-news text-xs uppercase tracking-wider">
            <span className="pr-12">{line}</span>
            <span className="pr-12">{line}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Index() {
  const roast = useServerFn(roastResume);
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<RoastResult | null>(null);
  const [error, setError] = useState("");
  const [level, setLevel] = useState<RoastLevel>("brutal");

  async function handleFile(file: File) {
    setPhase("loading");
    setError("");
    try {
      const text = await extractText(file);
      if (text.length < 50) throw new Error("Couldn't read enough text from that file. Try a different format.");
      const r = await roast({ data: { text, level } });
      setResult(r);
      setPhase("results");
      setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);
    } catch (e: any) {
      setError(e?.message ?? "Something went wrong");
      setPhase("error");
    }
  }

  return (
    <main className="min-h-screen">
      <Masthead />
      {phase !== "loading" && <DatelineTicker />}

      <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-10 sm:py-16">
        {phase === "idle" || phase === "error" ? (
          <section className="animate-fade-up">
            {/* HERO */}
            <div className="text-center mb-12">
              <div className="font-mono-news text-[10px] uppercase tracking-[0.3em] text-stamp mb-4">
                ★ Front Page Exclusive ★
              </div>
              <h1 className="font-display font-black tracking-tight leading-[0.95]">
                <span className="block text-5xl sm:text-7xl">YOUR RESUME</span>
                <span className="block text-6xl sm:text-8xl italic mt-1">IS ON TRIAL.</span>
              </h1>
              <p className="mt-6 font-serif italic text-base sm:text-lg text-foreground/80">
                Upload it. The AI will decide your fate.
              </p>
            </div>

            <div className="rule-double mb-8" />

            {/* Roast Level Selector */}
            <div className="mb-6">
              <div className="font-mono-news text-xs uppercase tracking-[0.25em] mb-3 text-center">
                Roast Intensity:
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {LEVELS.map((l, i) => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`border-2 border-ink px-4 py-2 font-mono-news text-xs uppercase tracking-widest font-bold transition-all ${
                      level === l.id
                        ? "bg-ink text-newsprint"
                        : "bg-white text-ink hover:bg-muted"
                    }`}
                    style={{ transform: level === l.id ? `rotate(${i === 0 ? -1.5 : i === 1 ? 1 : -1}deg)` : undefined }}
                  >
                    {l.emoji} {l.label}
                  </button>
                ))}
              </div>
            </div>

            <UploadZone onFile={handleFile} />

            {phase === "error" && (
              <div className="mt-4 border-2 border-stamp bg-white p-3 font-mono-news text-sm text-stamp">
                ★ ERROR: {error}
              </div>
            )}

            {/* Feature columns */}
            <div className="mt-16">
              <div className="rule-double mb-6" />
              <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x-2 divide-ink">
                {[
                  { title: "Honest Roast", body: "No sugarcoating. Clichés exposed. Buzzwords burned." },
                  { title: "Instant Rewrites", body: "Every weak section rewritten. Paste-ready." },
                  { title: "Zero Storage", body: "We read it. We roast it. We forget it." },
                ].map((f) => (
                  <div key={f.title} className="px-4 py-3">
                    <h3 className="font-display text-xl font-black uppercase tracking-tight">
                      {f.title}
                    </h3>
                    <p className="mt-2 font-serif text-sm leading-relaxed text-foreground/80">
                      {f.body}
                    </p>
                  </div>
                ))}
              </div>
              <div className="rule-double mt-6" />
            </div>

            {/* FAQ */}
            <section aria-labelledby="faq-heading" className="mt-16">
              <div className="text-center mb-6">
                <div className="font-mono-news text-[10px] uppercase tracking-[0.3em] text-stamp mb-2">
                  ★ Letters to the Editor ★
                </div>
                <h2 id="faq-heading" className="font-display text-3xl sm:text-4xl font-black uppercase">
                  Frequently Asked
                </h2>
              </div>
              <div className="space-y-4">
                {[
                  { q: "Is the AI resume review free?", a: "Yes. Medium Rare Hire is 100% free, no signup required, and nothing is stored." },
                  { q: "Can AI really review my resume?", a: "Yes. Our AI scans for weak verbs, missing metrics, clichés, and ATS issues, then rewrites the weakest sections instantly." },
                  { q: "How do I fix my resume?", a: "Upload it above. You'll get an honest roast plus paste-ready rewrites for every weak bullet in seconds." },
                  { q: "What is Medium Rare Hire?", a: "Medium Rare Hire is a free AI resume review tool that gives brutally honest feedback and instant rewrites." },
                ].map((f) => (
                  <details key={f.q} className="border-2 border-ink bg-white p-4">
                    <summary className="font-display font-black uppercase text-sm cursor-pointer tracking-tight">
                      Q. {f.q}
                    </summary>
                    <p className="font-serif text-sm mt-2 leading-relaxed text-foreground/80">
                      A. {f.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          </section>
        ) : phase === "loading" ? (
          <RoastingScreen />
        ) : result ? (
          <Results
            result={result}
            onReset={() => {
              setPhase("idle");
              setResult(null);
            }}
          />
        ) : null}
      </div>

      <footer className="border-t-2 border-ink bg-ink text-newsprint py-6 mt-8">
        <div className="max-w-[900px] mx-auto px-4 text-center font-mono-news text-[10px] uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} The Resume Roaster · All rumors printed without verification
        </div>
      </footer>
    </main>
  );
}
