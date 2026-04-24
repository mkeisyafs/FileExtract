import { useState, useRef, useEffect, useMemo, memo, useCallback } from "react";
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

// Page size for "Load More" pagination
const PAGE_SIZE = 10;

// Virtualized JSON view using plain <pre> instead of recursive React elements
const VirtualizedJsonView = memo(function VirtualizedJsonView({
  data,
}: {
  data: unknown;
}) {
  const jsonString = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return "Error: Unable to serialize data";
    }
  }, [data]);

  return (
    <pre className="font-mono text-xs md:text-sm text-[#d4d4d4] whitespace-pre-wrap break-all">
      {jsonString}
    </pre>
  );
});

// Single file card component - memoized to prevent re-renders
const FileCard = memo(function FileCard({
  file,
  index,
  searchTerm,
}: {
  file: import("../lib/fileUtils").ExtractedFile;
  index: number;
  searchTerm: string;
}) {
  return (
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
          title="File Info"
          searchTerm={searchTerm}
        />

        {file.contents ? (
          <div className="mt-4">
            <MetadataTable
              data={file.contents}
              title="Archive Contents"
              searchTerm={searchTerm}
            />
          </div>
        ) : null}

        {/* Parsed Content (for character cards, JSON files, etc.) */}
        {file.contentParsed ? (
          <div className="mt-4">
            <MetadataTable
              data={file.contentParsed}
              title="Parsed Content"
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
                  Raw Content
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
                File List ({file.fileList.length} files)
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
  );
});

export const ResultSection = memo(function ResultSection({
  result,
  onCopy,
  onDownload,
}: ResultSectionProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [matchCount, setMatchCount] = useState(0);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset pagination when result changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [result]);

  // Reset match index when search term changes
  useEffect(() => {
    setCurrentMatchIndex(-1);

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

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

  const scrollToMatch = useCallback(
    (direction: "next" | "prev") => {
      const matches = document.querySelectorAll(".search-match");
      if (matches.length === 0) return;

      let newIndex =
        direction === "next" ? currentMatchIndex + 1 : currentMatchIndex - 1;

      if (newIndex >= matches.length) newIndex = 0;
      if (newIndex < 0) newIndex = matches.length - 1;

      setCurrentMatchIndex(newIndex);

      const target = matches[newIndex];
      target.scrollIntoView({ behavior: "smooth", block: "center" });

      matches.forEach((m) => {
        (m as HTMLElement).style.outline = "none";
        (m as HTMLElement).style.backgroundColor = "";
        (m as HTMLElement).style.color = "";
        (m as HTMLElement).style.borderRadius = "";
      });

      const el = target as HTMLElement;
      el.style.outline = "2px solid hsl(var(--p))";
      el.style.outlineOffset = "2px";
      el.style.backgroundColor = "hsl(var(--p))";
      el.style.color = "hsl(var(--pc))";
      el.style.borderRadius = "2px";
    },
    [currentMatchIndex]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        setSearchTerm(searchInput.trim());
      }
    },
    [searchInput]
  );

  const clearSearch = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => prev + PAGE_SIZE);
  }, []);

  // Memoize visible files slice
  const visibleFiles = useMemo(
    () => result.files.slice(0, visibleCount),
    [result.files, visibleCount]
  );

  const hasMore = visibleCount < result.files.length;

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

            {/* File Details - paginated */}
            {visibleFiles.map((file, index) => (
              <FileCard
                key={`${file.filename}-${index}`}
                file={file}
                index={index}
                searchTerm={searchTerm}
              />
            ))}

            {/* Load More button */}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={loadMore}
                  className="btn btn-outline btn-primary btn-sm gap-2"
                >
                  <ChevronDown className="w-4 h-4" />
                  Load More ({result.files.length - visibleCount} remaining)
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#1e1e1e] p-6 max-h-[600px] overflow-auto custom-scrollbar font-mono text-sm leading-6">
            <VirtualizedJsonView data={result} />
          </div>
        )}
      </div>
    </div>
  );
});
