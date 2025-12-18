import { CloudUpload, Trash2, Loader2, Sparkles } from "lucide-react";

type ActionButtonsProps = {
  onExtract: () => void;
  onClear: () => void;
  isProcessing: boolean;
  hasFiles: boolean;
};

export function ActionButtons({
  onExtract,
  onClear,
  isProcessing,
  hasFiles,
}: ActionButtonsProps) {
  if (!hasFiles) return null;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 animate-[fadeIn_0.5s_ease-out]">
      <button
        onClick={onClear}
        className="btn btn-ghost hover:bg-white/5 text-base-content/60 gap-2 rounded-xl transition-all duration-300 hover:text-error w-full sm:w-auto"
      >
        <Trash2 className="w-4 h-4" />
        Clear Selection
      </button>

      <button
        onClick={onExtract}
        disabled={isProcessing}
        className="btn btn-primary btn-lg gap-3 rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto min-w-[200px] border-none bg-linear-to-r from-primary to-secondary relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        {isProcessing ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" />
            <span className="font-bold">Processing...</span>
          </>
        ) : (
          <>
            <CloudUpload className="w-6 h-6" />
            <span className="font-bold">Extract Metadata</span>
            <Sparkles className="w-4 h-4 absolute top-2 right-2 opacity-50 animate-pulse" />
          </>
        )}
      </button>
    </div>
  );
}
