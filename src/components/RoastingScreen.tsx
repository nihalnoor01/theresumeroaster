import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

const MESSAGES = [
  "Judging your life choices...",
  "Counting the buzzwords...",
  "Searching for actual metrics...",
  "Looking for your real skills...",
  "Calculating cliché density...",
  "Sharpening the red pen...",
  "Decoding 'team player'...",
  "Hunting weak verbs...",
];

export function RoastingScreen() {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % MESSAGES.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center animate-fade-up">
      <div className="text-7xl animate-flame-pulse">🔥</div>
      <h1 className="text-3xl sm:text-4xl font-bold text-gradient-flame">
        Roasting your resume...
      </h1>
      <p key={idx} className="text-muted-foreground text-lg animate-fade-up">
        {MESSAGES[idx]}
      </p>
      <div className="w-64 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full animate-shimmer" />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
        <Flame className="h-3.5 w-3.5 text-primary" />
        Usually takes 15–30 seconds
      </div>
    </div>
  );
}
