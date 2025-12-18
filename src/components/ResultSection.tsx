import { useState, useRef, useEffect } from "react";
import {
  Code,
  Copy,
  Download,
  Table,
  FileJson,
  Search,
  X,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { ExtractionResult } from "../lib/fileUtils";
import { MetadataTable } from "./MetadataTable";

type ResultSectionProps = {
  result: ExtractionResult;
  onCopy: () => void;
  onDownload: () => void;
};

type ViewMode = "table" | "json";

// Syntax Highlighter Component
function SyntaxHighlightedJson({ data }: { data: unknown }) {
  // ... (keep existing implementation)
  const renderValue = (value: unknown): React.ReactNode => {
    // ... (keep existing implementation)
    if (value === null) return <span className="text-gray-500">null</span>;
    if (value === undefined)
      return <span className="text-gray-500">undefined</span>;
    if (typeof value === "boolean")
      return <span className="text-[#569cd6]">{value.toString()}</span>;
    if (typeof value === "number")
      return <span className="text-[#b5cea8]">{value}</span>;
    if (typeof value === "string")
      return <span className="text-[#ce9178]">"{value}"</span>;

    if (Array.isArray(value)) {
      if (value.length === 0) return <span className="text-gray-400">[]</span>;
      return (
        <span>
          <span className="text-[#ffd700]">[</span>
          <div className="pl-4 border-l border-white/5">
            {value.map((item, index) => (
              <div key={index}>
                {renderValue(item)}
                {index < value.length - 1 && (
                  <span className="text-gray-400">,</span>
                )}
              </div>
            ))}
          </div>
          <span className="text-[#ffd700]">]</span>
        </span>
      );
    }

    if (typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0)
        return <span className="text-gray-400">{"{}"}</span>;
      return (
        <span>
          <span className="text-[#da70d6]">{"{"}</span>
          <div className="pl-4 border-l border-white/5">
            {entries.map(([key, val], index) => (
              <div key={key}>
                <span className="text-[#9cdcfe]">"{key}"</span>
                <span className="text-gray-400">: </span>
                {renderValue(val)}
                {index < entries.length - 1 && (
                  <span className="text-gray-400">,</span>
                )}
              </div>
            ))}
          </div>
          <span className="text-[#da70d6]">{"}"}</span>
        </span>
      );
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className="font-mono text-xs md:text-sm">{renderValue(data)}</div>
  );
}

export function ResultSection({
  result,
  onCopy,
  onDownload,
}: ResultSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const searchTimeout = useRef<NodeJS.Timeout>(null);

  // Reset match index when search term changes
  useEffect(() => {
    setCurrentMatchIndex(-1);

    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Slight delay to allow DOM to update before counting matches
    if (searchTerm) {
      searchTimeout.current = setTimeout(() => {
        const matches = document.querySelectorAll(".search-match");
        setMatchCount(matches.length);
      }, 500);
    } else {
      setMatchCount(0);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchTerm, viewMode]);

  const scrollToMatch = (direction: "next" | "prev") => {
    const matches = document.querySelectorAll(".search-match");
    if (matches.length === 0) return;

    let newIndex =
      direction === "next" ? currentMatchIndex + 1 : currentMatchIndex - 1;

    if (newIndex >= matches.length) newIndex = 0;
    if (newIndex < 0) newIndex = matches.length - 1;

    setCurrentMatchIndex(newIndex);

    const target = matches[newIndex];
    target.scrollIntoView({ behavior: "smooth", block: "center" });

    // Highlight the current match visualy
    matches.forEach((m) => {
      (m as HTMLElement).style.outline = "none";
      (m as HTMLElement).style.backgroundColor = "";
      (m as HTMLElement).style.color = "";
      (m as HTMLElement).style.borderRadius = "";
    });

    // Add active style to current match
    const el = target as HTMLElement;
    el.style.outline = "2px solid hsl(var(--p))";
    el.style.outlineOffset = "2px";
    el.style.backgroundColor = "hsl(var(--p))";
    el.style.color = "hsl(var(--pc))";
    el.style.borderRadius = "2px";

    // Remove style after some time or keep it?
    // Keeping it is better for navigation context.
  };

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

  // Count total matches (using DOM elements for navigation)
  // We rely on the useEffect above to set matchCount based on visible .search-match elements

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
      <div className="px-6 py-3 bg-base-300/30 border-b border-base-content/10 sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
            <input
              type="text"
              placeholder="Search metadata... (Press Enter)"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="input input-bordered input-sm w-full pl-10 pr-10 bg-base-100/50 focus:bg-base-100 transition-colors"
            />
            {searchInput && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-xs btn-circle text-base-content/40 hover:text-base-content"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          {searchTerm && (
            <div className="flex items-center gap-3 animate-[fadeIn_0.3s_ease-out]">
              <div className="join shadow-sm">
                <button
                  className="btn btn-sm join-item btn-square"
                  onClick={() => scrollToMatch("prev")}
                  title="Previous match"
                >
                  <ChevronUp className="w-4 h-4" />
                </button>
                <button
                  className="btn btn-sm join-item btn-square"
                  onClick={() => scrollToMatch("next")}
                  title="Next match"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
              <span className="badge badge-primary badge-outline badge-lg gap-2">
                {matchCount > 0 ? (
                  <>
                    <span className="font-bold">{currentMatchIndex + 1}</span>
                    <span className="opacity-60">/</span>
                    <span className="font-bold">{matchCount}</span>
                  </>
                ) : (
                  "No matches"
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="p-0 overflow-hidden">
        {viewMode === "table" ? (
          <div className="p-6 space-y-6 max-h-[600px] overflow-auto">
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

                  {file.contents ? (
                    <div className="mt-4">
                      <MetadataTable
                        data={file.contents}
                        title="📦 Archive Contents"
                        searchTerm={searchTerm}
                      />
                    </div>
                  ) : null}

                  {/* Parsed Content (for character cards, JSON files, etc.) */}
                  {file.contentParsed ? (
                    <div className="mt-4">
                      <MetadataTable
                        data={file.contentParsed}
                        title="🔍 Parsed Content"
                        searchTerm={searchTerm}
                      />
                    </div>
                  ) : null}

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
          <div className="bg-[#1e1e1e] p-6 max-h-[600px] overflow-auto custom-scrollbar font-mono text-sm leading-6">
            <SyntaxHighlightedJson data={result} />
          </div>
        )}
      </div>
    </div>
  );
}
