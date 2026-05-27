import { useCallback, useRef, useState } from "react";

interface Props {
  onFile: (file: File) => void;
  disabled?: boolean;
}

export function UploadZone({ onFile, disabled }: Props) {
  const [drag, setDrag] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (f: File) => {
      setFile(f);
      onFile(f);
    },
    [onFile],
  );

  const openPicker = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={openPicker}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPicker();
        }
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f) handleFile(f);
      }}
      className={`relative border-2 border-dashed border-ink bg-white p-8 sm:p-12 text-center cursor-pointer transition-colors ${
        drag ? "bg-muted" : "hover:bg-muted/60"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,.txt"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
      {file ? (
        <div className="flex items-center justify-center gap-3 text-foreground font-mono-news">
          <span className="text-xs uppercase tracking-widest">[ FILE ]</span>
          <span className="font-bold">{file.name}</span>
          <button
            type="button"
            aria-label="Remove file"
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
            }}
            className="relative z-10 px-2 py-0.5 text-xs uppercase border border-ink hover:bg-ink hover:text-newsprint"
          >
            × Remove
          </button>
        </div>
      ) : (
        <>
          <div className="font-mono-news text-[10px] uppercase tracking-[0.3em] text-stamp mb-3">
            ★ Classified ★
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-black uppercase tracking-tight">
            Submit Evidence
          </h2>
          <p className="mt-3 text-sm font-serif italic text-foreground/80">
            PDF, DOCX, or TXT accepted. Up to 10MB. Nothing stored.
          </p>
          <div className="mt-6 inline-block bg-ink text-newsprint px-6 py-3 font-mono-news text-sm font-bold uppercase tracking-widest">
            ▼ Drop Resume Here ▼
          </div>
          <p className="mt-4 text-[11px] font-mono-news uppercase tracking-widest text-foreground/60">
            or click anywhere to browse
          </p>
        </>
      )}
    </div>
  );
}
