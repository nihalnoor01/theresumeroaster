import { useEffect, useState } from "react";

const MESSAGES = [
  "ROASTING IN PROGRESS…",
  "COUNTING THE BUZZWORDS…",
  "JUDGING YOUR LIFE CHOICES…",
  "CONSULTING THE HIRING GODS…",
  "SHARPENING THE RED PEN…",
  "HUNTING WEAK VERBS…",
];

export function RoastingScreen() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-8 text-center relative px-4">
      {/* Breaking news stamp */}
      <div className="absolute top-0 right-0 sm:top-4 sm:right-8 stamp-red animate-stamp-pulse text-xs sm:text-sm">
        ★ Breaking News ★
      </div>

      {/* Newspaper mockup */}
      <div className="animate-paper-flutter border-2 border-ink bg-white p-6 w-64 shadow-none">
        <div className="font-fraktur text-2xl text-center leading-none">The Daily Roast</div>
        <div className="rule-double mt-2 mb-3" />
        <div className="font-mono-news text-[9px] uppercase tracking-widest text-center text-foreground/60">
          Vol. I · Issue 1 · Today
        </div>
        <div className="mt-3 space-y-1">
          <div className="h-1.5 bg-ink/80 w-full" />
          <div className="h-1.5 bg-ink/60 w-5/6" />
          <div className="h-1.5 bg-ink/60 w-4/6" />
          <div className="h-1.5 bg-ink/40 w-full" />
          <div className="h-1.5 bg-ink/40 w-3/6" />
        </div>
      </div>

      <h1 key={idx} className="font-display text-2xl sm:text-4xl font-black uppercase tracking-tight animate-fade-up max-w-xl">
        {MESSAGES[idx]}
      </h1>

      {/* Press roller progress */}
      <div className="w-80 max-w-full h-3 border-2 border-ink overflow-hidden">
        <div className="h-full animate-press-roll" />
      </div>

      <p className="font-serif italic text-sm text-foreground/70 max-w-md">
        Usually takes 15–30 seconds. Your career is in good hands. Probably.
      </p>
    </div>
  );
}
