import { FileText } from "lucide-react";

export function Header() {
  return (
    <header className="relative text-center mb-16 pt-10">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-primary/20 blur-3xl rounded-full -z-10"></div>

      <div className="inline-flex items-center justify-center gap-3 mb-4 relative">
        <div className="p-3 bg-base-200/50 backdrop-blur-sm rounded-2xl border border-white/10 shadow-lg">
          <FileText className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight bg-linear-to-r from-white via-primary/80 to-secondary bg-clip-text text-transparent drop-shadow-sm">
          File Extractor
        </h1>
        <div className="absolute -top-2 -right-6">
          <span className="badge badge-xs badge-primary animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.5)]">
            v1.0
          </span>
        </div>
      </div>

      <p className="text-lg md:text-xl text-base-content/60 max-w-lg mx-auto leading-relaxed">
        Transform any file into structured{" "}
        <span className="text-secondary font-semibold">JSON</span> metadata
        instantly.
      </p>
    </header>
  );
}
