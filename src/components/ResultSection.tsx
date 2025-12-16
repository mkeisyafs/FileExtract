import { Code, Copy, Download } from "lucide-react";
import type { ExtractionResult } from "../lib/fileUtils";

type ResultSectionProps = {
  result: ExtractionResult | null;
  onCopy: () => void;
  onDownload: () => void;
};

export function ResultSection({
  result,
  onCopy,
  onDownload,
}: ResultSectionProps) {
  if (!result) return null;

  return (
    <div
      className="card bg-base-200/50 border border-base-content/10 overflow-hidden"
      style={{ animation: "fadeIn 0.5s ease" }}
    >
      <div className="flex justify-between items-center px-6 py-4 bg-base-300/50 border-b border-base-content/10">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Code className="w-5 h-5 text-primary" />
          JSON Result
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onCopy}
            className="btn btn-square btn-sm btn-ghost tooltip"
            data-tip="Copy"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onDownload}
            className="btn btn-square btn-sm btn-ghost tooltip"
            data-tip="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="p-6 max-h-[500px] overflow-auto">
        <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap break-words bg-base-300 p-5 rounded-xl">
          {JSON.stringify(result, null, 2)}
        </pre>
      </div>
    </div>
  );
}
