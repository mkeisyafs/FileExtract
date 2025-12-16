import { FileText } from "lucide-react";

export function Header() {
  return (
    <header className="text-center mb-10">
      <div className="flex items-center justify-center gap-3 mb-3">
        <FileText className="w-10 h-10 text-primary" />
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
          File Extractor
        </h1>
      </div>
      <p className="text-base-content/60 text-lg">
        Convert your files to JSON format easily
      </p>
    </header>
  );
}
