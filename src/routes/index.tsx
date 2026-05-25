import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Flame, Pencil, Zap } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { RoastingScreen } from "@/components/RoastingScreen";
import { Results } from "@/components/Results";
import { extractText } from "@/lib/extract-text";
import { roastResume, type RoastLevel, type RoastResult } from "@/lib/roast.functions";
import logo from "@/assets/logo.png";

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
    links: [
      { rel: "canonical", href: "https://mediumrarehire.lovable.app/" },
    ],
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
            {
              "@type": "Question",
              name: "Is the AI resume review free?",
              acceptedAnswer: { "@type": "Answer", text: "Yes. Medium Rare Hire is 100% free, no signup required, and nothing is stored." },
            },
            {
              "@type": "Question",
              name: "Can AI really review my resume?",
              acceptedAnswer: { "@type": "Answer", text: "Yes. Our AI scans your resume for weak verbs, missing metrics, clichés, and ATS issues, then rewrites the weakest sections instantly." },
            },
            {
              "@type": "Question",
              name: "How do I fix my resume?",
              acceptedAnswer: { "@type": "Answer", text: "Upload it here. You'll get an honest roast plus paste-ready rewrites for every weak bullet in seconds." },
            },
            {
              "@type": "Question",
              name: "What is Medium Rare Hire?",
              acceptedAnswer: { "@type": "Answer", text: "Medium Rare Hire is a free AI resume review tool that gives brutally honest feedback and instant rewrites." },
            },
          ],
        }),
      },
    ],
  }),
});

type Phase = "idle" | "loading" | "results" | "error";

const LEVELS: { id: RoastLevel; label: string; emoji: string }[] = [
  { id: "gentle", label: "Gentle", emoji: "🫶" },
  { id: "brutal", label: "Brutal", emoji: "🔥" },
  { id: "savage", label: "Savage", emoji: "💀" },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5 select-none">
      <img
        src={logo}
        alt="Medium Rare Hire"
        className="h-10 w-10 sm:h-11 sm:w-11 invert brightness-200 contrast-200"
      />
      <span className="text-base sm:text-lg font-bold tracking-tight">
        Medium <span className="text-gradient-flame">Rare</span> Hire
      </span>
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
      <header className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-4 flex items-center justify-between">
        <Logo />
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Free · No signup · Nothing stored
        </span>
      </header>


      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {phase === "idle" || phase === "error" ? (
          <section className="pt-8 sm:pt-16 animate-fade-up">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/60 text-xs text-muted-foreground mb-6">
                <Flame className="h-3.5 w-3.5 text-primary" />
                Brutally honest AI · Free · No signup
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight leading-[1.05]">
                Free AI Resume Review.{" "}
                <span className="text-gradient-flame">Brutally honest.</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
                Upload your resume and get an honest AI roast plus instant, ATS-friendly rewrites for
                every weak section. No signup. Nothing stored.
              </p>
            </div>

            <div className="mt-10 max-w-2xl mx-auto">
              {/* Level toggle */}
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="text-xs text-muted-foreground mr-1">Roast level:</span>
                {LEVELS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setLevel(l.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      level === l.id
                        ? "bg-gradient-flame text-flame-foreground border-transparent shadow-flame"
                        : "border-border bg-card hover:bg-accent text-foreground"
                    }`}
                  >
                    {l.emoji} {l.label}
                  </button>
                ))}
              </div>

              <UploadZone onFile={handleFile} />

              {phase === "error" && (
                <div className="mt-4 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-8">
                {[
                  { icon: Flame, title: "Honest Roast", body: "Real talk on clichés, weak verbs, missing metrics." },
                  { icon: Pencil, title: "Smart Rewrites", body: "AI rewrites every weak section — paste-ready." },
                  { icon: Zap, title: "Instant Results", body: "No signup. No storage. Done in seconds." },
                ].map((f) => (
                  <div key={f.title} className="rounded-xl border bg-card/60 p-4 shadow-card-soft">
                    <f.icon className="h-5 w-5 text-primary mb-2" />
                    <div className="font-semibold text-sm">{f.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{f.body}</div>
                  </div>
                ))}
              </div>
            </div>

            <section aria-labelledby="faq-heading" className="mt-20 max-w-2xl mx-auto">
              <h2 id="faq-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-center">
                AI Resume Review — FAQ
              </h2>
              <div className="mt-6 space-y-4">
                {[
                  { q: "Is the AI resume review free?", a: "Yes. Medium Rare Hire is 100% free, no signup required, and nothing is stored." },
                  { q: "Can AI really review my resume?", a: "Yes. Our AI scans for weak verbs, missing metrics, clichés, and ATS issues, then rewrites the weakest sections instantly." },
                  { q: "How do I fix my resume?", a: "Upload it above. You'll get an honest roast plus paste-ready rewrites for every weak bullet in seconds." },
                  { q: "What is Medium Rare Hire?", a: "Medium Rare Hire is a free AI resume review tool that gives brutally honest feedback and instant rewrites." },
                ].map((f) => (
                  <details key={f.q} className="rounded-xl border bg-card/60 p-4 shadow-card-soft">
                    <summary className="font-semibold text-sm cursor-pointer">{f.q}</summary>
                    <p className="text-sm text-muted-foreground mt-2">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          </section>
        ) : phase === "loading" ? (
          <RoastingScreen />
        ) : result ? (
          <div className="pt-6">
            <Results
              result={result}
              onReset={() => {
                setPhase("idle");
                setResult(null);
              }}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
