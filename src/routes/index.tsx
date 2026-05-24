import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Flame, Pencil, Zap } from "lucide-react";
import { UploadZone } from "@/components/UploadZone";
import { RoastingScreen } from "@/components/RoastingScreen";
import { Results } from "@/components/Results";
import { extractText } from "@/lib/extract-text";
import { roastResume, type RoastLevel, type RoastResult } from "@/lib/roast.functions";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Resume Roast — Brutally honest AI resume feedback" },
      {
        name: "description",
        content:
          "Upload your resume and get brutally honest AI feedback plus instant rewrites. Free. No signup.",
      },
      { property: "og:title", content: "Resume Roast" },
      {
        property: "og:description",
        content: "Brutally honest AI resume feedback + instant rewrites.",
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
        <div className="flex items-center gap-2 font-bold">
          <span className="text-2xl">🔥</span>
          <span className="text-lg">Resume Roast</span>
        </div>
        <a
          href="https://github.com"
          className="text-xs text-muted-foreground hover:text-foreground hidden sm:inline"
        >
          Free · No signup · Nothing stored
        </a>
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
                Your resume has problems.{" "}
                <span className="text-gradient-flame">Let's fix them.</span>
              </h1>
              <p className="mt-5 text-lg text-muted-foreground max-w-xl mx-auto">
                Get brutally honest AI feedback + instant rewrites. Drop your resume below and watch
                the roast unfold.
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
