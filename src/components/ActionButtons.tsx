import { CloudUpload, Trash2, Loader2 } from "lucide-react";

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
    <div className="flex gap-4 justify-center mb-8">
      <button
        onClick={onExtract}
        disabled={isProcessing}
        className="btn btn-primary gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CloudUpload className="w-5 h-5" />
            Extract to JSON
          </>
        )}
      </button>
      <button onClick={onClear} className="btn btn-ghost gap-2">
        <Trash2 className="w-5 h-5" />
        Clear All
      </button>
    </div>
  );
}
