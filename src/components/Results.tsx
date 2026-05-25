import { useEffect, useState } from "react";
import { Copy, Check, RotateCcw } from "lucide-react";
import type { RoastResult, SectionRoast } from "@/lib/roast.functions";

const SECTION_LABELS: Record<keyof RoastResult["sections"], string> = {
  summary: "Summary / Objective",
  experience: "Work Experience",
  skills: "Skills",
  education: "Education",
  formatting: "Formatting & Structure",
};

const severityStyles = {
  weak: { dot: "bg-destructive", text: "text-destructive", label: "🔴 Weak", ring: "ring-destructive/30" },
  okay: { dot: "bg-warn", text: "text-warn", label: "🟡 Okay", ring: "ring-warn/30" },
  strong: { dot: "bg-good", text: "text-good", label: "🟢 Strong", ring: "ring-good/30" },
} as const;

function AnimatedScore({ value }: { value: number }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const dur = 1100;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{n}</span>;
}

function CopyBtn({ text }: { text: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
      className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md bg-muted hover:bg-accent transition-colors"
    >
      {done ? <Check className="h-3.5 w-3.5 text-good" /> : <Copy className="h-3.5 w-3.5" />}
      {done ? "Copied" : "Copy"}
    </button>
  );
}

function SectionCard({ id, section, index }: { id: string; section: SectionRoast; index: number }) {
  const sev = severityStyles[section.severity] ?? severityStyles.okay;
  return (
    <div
      className="grid md:grid-cols-2 gap-4 animate-fade-up"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Roast */}
      <div className={`rounded-xl border bg-card p-5 shadow-card-soft ring-1 ${sev.ring}`}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">{id}</h2>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${sev.text}`}>{sev.label}</span>
            <span className="text-xs text-muted-foreground">· {section.score}/100</span>
          </div>
        </div>
        <p className="text-sm leading-relaxed mb-3">{section.roast}</p>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {section.issues.map((it, i) => (
            <li key={i} className="flex gap-2">
              <span className={`mt-1.5 inline-block h-1.5 w-1.5 rounded-full ${sev.dot} shrink-0`} />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Rewrite */}
      <div className="rounded-xl border bg-card p-5 shadow-card-soft">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold flex items-center gap-2">
            <span className="text-primary">✍️</span> Improved
          </h2>
          <CopyBtn text={section.rewrite} />
        </div>
        {section.original && section.original !== "(missing)" && (
          <div className="mb-3">
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">Original</div>
            <p className="text-xs text-muted-foreground/70 line-through decoration-destructive/40">
              {section.original}
            </p>
          </div>
        )}
        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm leading-relaxed whitespace-pre-wrap">
          {section.rewrite}
        </div>
        <details className="mt-3 group">
          <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground select-none">
            Why this is better
          </summary>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{section.whyBetter}</p>
        </details>
      </div>
    </div>
  );
}

export function Results({ result, onReset }: { result: RoastResult; onReset: () => void }) {
  return (
    <div className="space-y-8">
      {/* Score bar */}
      <div className="rounded-2xl border bg-card p-6 sm:p-8 shadow-card-soft animate-fade-up">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Overall</div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-6xl sm:text-7xl font-bold text-gradient-flame leading-none">
                <AnimatedScore value={result.overallScore} />
              </span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <div className="mt-2 text-lg font-medium">🔥 {result.label}</div>
          </div>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
          >
            <RotateCcw className="h-4 w-4" /> Roast another
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-5">
          {result.tags.map((t) => (
            <span
              key={t}
              className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-5">
        {(Object.keys(SECTION_LABELS) as Array<keyof RoastResult["sections"]>).map((k, i) => (
          <SectionCard key={k} id={SECTION_LABELS[k]} section={result.sections[k]} index={i} />
        ))}
      </div>
    </div>
  );
}
