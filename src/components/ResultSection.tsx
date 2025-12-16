import { useState, useMemo } from "react";
import { Code, Copy, Download, Table, FileJson, Search, X } from "lucide-react";
import type { ExtractionResult } from "../lib/fileUtils";
import { MetadataTable } from "./MetadataTable";

type ResultSectionProps = {
  result: ExtractionResult | null;
  onCopy: () => void;
  onDownload: () => void;
};

type ViewMode = "table" | "json";

// Count matches in an object recursively
function countMatches(data: unknown, searchTerm: string): number {
  if (!searchTerm) return 0;
  const term = searchTerm.toLowerCase();
  let count = 0;

  function traverse(obj: unknown): void {
    if (obj === null || obj === undefined) return;

    if (typeof obj === "string") {
      if (obj.toLowerCase().includes(term)) count++;
    } else if (typeof obj === "number" || typeof obj === "boolean") {
      if (String(obj).toLowerCase().includes(term)) count++;
    } else if (Array.isArray(obj)) {
      obj.forEach(traverse);
    } else if (typeof obj === "object") {
      Object.entries(obj as Record<string, unknown>).forEach(([key, value]) => {
        if (key.toLowerCase().includes(term)) count++;
        traverse(value);
      });
    }
  }

  traverse(data);
  return count;
}

export function ResultSection({
  result,
  onCopy,
  onDownload,
}: ResultSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setSearchTerm(searchInput.trim());
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchInput("");
    setSearchTerm("");
  };

  // Count total matches
  const matchCount = useMemo(() => {
    if (!searchTerm || !result) return 0;
    return countMatches(result, searchTerm);
  }, [result, searchTerm]);

  if (!result) return null;

  return (
    <div
      className="card bg-base-200/50 border border-base-content/10 overflow-hidden"
      style={{ animation: "fadeIn 0.5s ease" }}
    >
      <div className="flex justify-between items-center px-6 py-4 bg-base-300/50 border-b border-base-content/10">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Code className="w-5 h-5 text-primary" />
          Extraction Result
        </h3>
        <div className="flex gap-2">
          {/* View Mode Toggle */}
          <div className="join">
            <button
              onClick={() => setViewMode("table")}
              className={`btn btn-sm join-item gap-1 ${
                viewMode === "table" ? "btn-primary" : "btn-ghost"
              }`}
              title="Table View"
            >
              <Table className="w-4 h-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode("json")}
              className={`btn btn-sm join-item gap-1 ${
                viewMode === "json" ? "btn-primary" : "btn-ghost"
              }`}
              title="JSON View"
            >
              <FileJson className="w-4 h-4" />
              JSON
            </button>
          </div>

          <div className="divider divider-horizontal mx-1"></div>

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

      {/* Search Bar */}
      <div className="px-6 py-3 bg-base-300/30 border-b border-base-content/10">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search metadata... (Press Enter)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input input-bordered input-sm w-full pl-10 pr-10"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="flex items-center gap-2">
              <span className="badge badge-primary badge-sm">
                {matchCount} match{matchCount !== 1 ? "es" : ""}
              </span>
              <span className="text-xs text-base-content/60">
                for "{searchTerm}"
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 max-h-[600px] overflow-auto">
        {viewMode === "table" ? (
          <div className="space-y-6">
            {/* Summary Section */}
            <div className="stats stats-horizontal bg-base-300/50 shadow w-full">
              <div className="stat">
                <div className="stat-title">Extracted At</div>
                <div className="stat-value text-sm font-mono">
                  {new Date(result.extractedAt).toLocaleString()}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Total Files</div>
                <div className="stat-value text-primary">
                  {result.totalFiles}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">Mode</div>
                <div className="stat-value text-sm">
                  <span
                    className={`badge ${
                      result.extractionMode === "full"
                        ? "badge-success"
                        : "badge-info"
                    }`}
                  >
                    {result.extractionMode === "full"
                      ? "Full Extract"
                      : "Metadata Only"}
                  </span>
                </div>
              </div>
            </div>

            {/* File Details */}
            {result.files.map((file, index) => (
              <div
                key={`${file.filename}-${index}`}
                className="card bg-base-300/30 border border-base-content/5"
              >
                <div className="card-body p-4">
                  <h4 className="card-title text-base flex items-center gap-2">
                    <span className="badge badge-outline badge-sm">
                      {file.extension.toUpperCase()}
                    </span>
                    {file.filename}
                  </h4>

                  {/* Basic File Metadata */}
                  <MetadataTable
                    data={{
                      Size: file.sizeFormatted,
                      "Last Modified": new Date(
                        file.lastModified
                      ).toLocaleString(),
                      "MIME Type": file.mimeType || "N/A",
                      ...(file.isArchive && {
                        "Archive Type": file.archiveType,
                      }),
                      ...(file.totalFiles !== undefined && {
                        "Total Files in Archive": file.totalFiles,
                      }),
                    }}
                    title="📁 File Info"
                    searchTerm={searchTerm}
                  />

                  {/* Archive Contents */}
                  {file.contents && (
                    <div className="mt-4">
                      <MetadataTable
                        data={file.contents}
                        title="📦 Archive Contents"
                        searchTerm={searchTerm}
                      />
                    </div>
                  )}

                  {/* Parsed Content (for character cards, JSON files, etc.) */}
                  {file.contentParsed && (
                    <div className="mt-4">
                      <MetadataTable
                        data={file.contentParsed}
                        title="🔍 Parsed Content"
                        searchTerm={searchTerm}
                      />
                    </div>
                  )}

                  {/* Raw Content (for text files without parsing) */}
                  {file.content &&
                    !file.contentParsed &&
                    !file.isArchive &&
                    typeof file.content === "string" &&
                    file.content.length < 5000 && (
                      <div className="mt-4">
                        <details className="collapse collapse-arrow bg-base-300">
                          <summary className="collapse-title text-sm font-medium">
                            📝 Raw Content
                          </summary>
                          <div className="collapse-content">
                            <pre className="text-xs whitespace-pre-wrap wrap-break-word overflow-auto max-h-60">
                              {file.content}
                            </pre>
                          </div>
                        </details>
                      </div>
                    )}

                  {/* File List for Archives */}
                  {file.fileList && file.fileList.length > 0 && (
                    <div className="mt-4">
                      <details className="collapse collapse-arrow bg-base-300">
                        <summary className="collapse-title text-sm font-medium">
                          📋 File List ({file.fileList.length} files)
                        </summary>
                        <div className="collapse-content">
                          <ul className="text-xs space-y-1 font-mono max-h-40 overflow-auto">
                            {file.fileList.map((filePath, idx) => (
                              <li key={idx} className="text-base-content/70">
                                {filePath}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </details>
                    </div>
                  )}

                  {/* Error Display */}
                  {file.error && (
                    <div className="alert alert-error mt-4">
                      <span>{file.error}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <pre className="font-mono text-sm leading-relaxed whitespace-pre-wrap wrap-break-word bg-base-300 p-5 rounded-xl">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
