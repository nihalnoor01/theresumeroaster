import { useCallback, useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";

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
      className={`relative rounded-2xl border-2 border-dashed p-10 sm:p-14 text-center transition-all shadow-card-soft cursor-pointer ${
        drag
          ? "border-primary bg-primary/5 scale-[1.01]"
          : "border-border bg-card/60 hover:border-primary/60 hover:bg-card"
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
        <div className="flex items-center justify-center gap-3 text-foreground">
          <FileText className="h-6 w-6 text-primary" />
          <span className="font-medium">{file.name}</span>
          <button
            type="button"
            aria-label="Remove file"
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
            }}
            className="relative z-10 p-1 rounded-md hover:bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-gradient-flame shadow-flame">
            <UploadCloud className="h-7 w-7 text-flame-foreground" />
          </div>
          <h2 className="text-xl font-semibold">Drop your resume here</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            PDF, DOCX, or TXT — up to 10MB. Nothing is stored.
          </p>
          <p className="mt-4 text-xs text-muted-foreground">or click anywhere to browse</p>
        </>
      )}
    </div>
  );
}
