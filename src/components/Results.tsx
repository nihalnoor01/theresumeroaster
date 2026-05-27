import { useEffect, useState } from "react";
import type { RoastResult, SectionRoast } from "@/lib/roast.functions";

const SECTION_LABELS: Record<keyof RoastResult["sections"], string> = {
  summary: "Summary Section",
  experience: "Work Experience",
  skills: "Skills",
  education: "Education",
  formatting: "Formatting & Structure",
};

const severityVerdict = {
  weak: "WEAK",
  okay: "MEDIOCRE",
  strong: "STRONG",
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
      className="inline-block border-2 border-stamp text-stamp px-3 py-1 font-mono-news text-[11px] uppercase tracking-widest hover:bg-stamp hover:text-white transition-colors -rotate-2"
    >
      {done ? "✓ Copied" : "Copy ✦"}
    </button>
  );
}

function headlineFor(score: number) {
  if (score < 40) return "LOCAL RESUME DECLARED 'RAW' — HIRING MANAGERS WEEP";
  if (score < 60) return "RESUME FOUND GUILTY OF MEDIOCRITY — REWRITES ORDERED";
  if (score < 80) return "RESUME SHOWS PROMISE, SOURCES SAY — IMPROVEMENTS NOTED";
  return "RARE SIGHTING: COMPETENT RESUME STUNS AI REVIEWER";
}

function SectionArticle({ id, section, index }: { id: string; section: SectionRoast; index: number }) {
  const verdict = severityVerdict[section.severity] ?? "MEDIOCRE";
  return (
    <article
      className="animate-fade-up grid md:grid-cols-2 gap-6 py-8"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* THE ROAST */}
      <div>
        <div className="font-mono-news text-[10px] uppercase tracking-[0.25em] text-stamp mb-1">
          The Roast · Section {index + 1}
        </div>
        <h2 className="font-display text-2xl sm:text-3xl font-black uppercase leading-tight">
          {id} — Verdict: <span className="text-stamp">{verdict}</span>
        </h2>
        <div className="font-mono-news text-[11px] uppercase tracking-widest text-foreground/70 mt-1 mb-3 italic">
          Reported by Medium Rare AI · Section score: {section.score}/100
        </div>
        <p className="font-serif text-[15px] leading-relaxed first-letter:font-display first-letter:text-5xl first-letter:font-black first-letter:float-left first-letter:mr-2 first-letter:leading-none">
          {section.roast}
        </p>
        <ul className="mt-4 space-y-2">
          {section.issues.map((it, i) => (
            <li key={i} className="flex gap-2 font-serif text-sm">
              <span className="text-stamp font-bold text-lg leading-none mt-0.5">✗</span>
              <span>{it}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CORRECTED BY EDITOR */}
      <div>
        <div className="font-mono-news text-[10px] uppercase tracking-[0.25em] text-stamp mb-1">
          Corrected by Editor
        </div>
        <h3 className="font-display text-xl font-black uppercase mb-3">
          The Rewrite ✍
        </h3>
        {section.original && section.original !== "(missing)" && (
          <div className="mb-3 border-l-2 border-stamp/60 pl-3">
            <div className="text-[10px] font-mono-news uppercase tracking-widest text-foreground/60 mb-1">
              Original
            </div>
            <p className="text-xs font-serif italic line-through decoration-stamp/60 text-foreground/60">
              {section.original}
            </p>
          </div>
        )}
        <div className="border-2 border-ink bg-white p-4">
          <p className="font-mono-news text-[13px] leading-relaxed whitespace-pre-wrap">
            {section.rewrite}
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <details className="flex-1">
            <summary className="text-[11px] font-mono-news uppercase tracking-widest cursor-pointer hover:text-stamp">
              ▸ Why this is better
            </summary>
            <p className="mt-2 text-xs font-serif italic text-foreground/70">{section.whyBetter}</p>
          </details>
          <CopyBtn text={section.rewrite} />
        </div>
      </div>
    </article>
  );
}

export function Results({ result, onReset }: { result: RoastResult; onReset: () => void }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).toUpperCase();

  return (
    <div className="space-y-2 relative">
      {/* Dynamic headline */}
      <div className="rule-double" />
      <div className="py-6 pr-32 sm:pr-48 relative">
        <div className="font-mono-news text-[10px] uppercase tracking-[0.3em] text-foreground/70 mb-2">
          Today's Edition · Medium Rare Hire · {today}
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-black uppercase leading-[1.05] tracking-tight">
          {headlineFor(result.overallScore)}
        </h1>

        {/* Red stamp score */}
        <div className="absolute top-4 right-0 sm:right-2 stamp-red text-center" style={{ transform: "rotate(-5deg)" }}>
          <div className="text-[9px] tracking-[0.2em]">★ Verdict ★</div>
          <div className="font-display text-4xl sm:text-5xl font-black leading-none my-1">
            <AnimatedScore value={result.overallScore} />
          </div>
          <div className="text-[10px] tracking-widest">/100</div>
          <div className="text-[11px] mt-1 font-bold">{result.label.toUpperCase()}</div>
        </div>
      </div>

      <div className="rule-double" />

      {/* Tags as correction stamps */}
      <div className="flex flex-wrap gap-2 py-4">
        {result.tags.map((t) => (
          <span
            key={t}
            className="border-2 border-stamp text-stamp px-2 py-0.5 font-mono-news text-[11px] uppercase tracking-wider"
            style={{ transform: `rotate(${(Math.random() * 4 - 2).toFixed(1)}deg)` }}
          >
            {t}
          </span>
        ))}
      </div>

      <div className="rule-double" />

      {/* Articles */}
      <div className="divide-y-2 divide-ink/30">
        {(Object.keys(SECTION_LABELS) as Array<keyof RoastResult["sections"]>).map((k, i) => (
          <div key={k}>
            <SectionArticle id={SECTION_LABELS[k]} section={result.sections[k]} index={i} />
            <div className="flex items-center justify-center py-2 text-foreground/40 text-lg">✦</div>
          </div>
        ))}
      </div>

      <button
        onClick={onReset}
        className="w-full bg-ink text-newsprint py-4 font-mono-news text-sm font-bold uppercase tracking-[0.25em] hover:bg-stamp transition-colors"
      >
        ▸ Roast Another Resume ◂
      </button>
      <p className="text-center text-[11px] font-serif italic text-foreground/60 pt-2">
        Results are AI-generated. Medium Rare Hire is not responsible for existential crises.
      </p>
    </div>
  );
}
