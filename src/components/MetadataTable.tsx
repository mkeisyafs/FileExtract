import { useState, createContext, useContext, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  X,
  Download,
  Copy,
  Check,
  Hash,
  Type,
  Box,
  Binary,
  Maximize2,
  Minimize2,
  Database,
} from "lucide-react";

type MetadataTableProps = {
  data: unknown;
  title?: string;
  searchTerm?: string;
};

// Context to share searchTerm with nested components
const SearchContext = createContext<string>("");

// Check if a string is a valid base64 image
function isBase64Image(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return (
    value.startsWith("data:image/") ||
    (value.length > 100 && /^[A-Za-z0-9+/]+=*$/.test(value.slice(0, 100)))
  );
}

// Get base64 image source
function getBase64ImageSrc(value: string): string {
  if (value.startsWith("data:image/")) {
    return value;
  }
  // Assume PNG if no data: prefix
  return `data:image/png;base64,${value}`;
}

// Truncate long strings for preview
function truncateValue(value: string, maxLength: number = 100): string {
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength) + "...";
}

// Check if text matches search term
function matchesSearch(text: string, searchTerm: string): boolean {
  if (!searchTerm) return false;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
}

// Highlight matching text
function HighlightedText({
  text,
  searchTerm,
}: {
  text: string;
  searchTerm: string;
}) {
  if (!searchTerm) return <>{text}</>;

  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();
  const index = lowerText.indexOf(lowerSearch);

  if (index === -1) return <>{text}</>;

  const before = text.slice(0, index);
  const match = text.slice(index, index + searchTerm.length);
  const after = text.slice(index + searchTerm.length);

  return (
    <>
      {before}
      <mark className="bg-warning/30 text-warning-content px-0.5 rounded shadow-[0_0_10px_rgba(250,189,0,0.3)] border border-warning/50">
        {match}
      </mark>
      {after.length > 0 && (
        <HighlightedText text={after} searchTerm={searchTerm} />
      )}
    </>
  );
}

// Type Indicator Icon
function TypeIcon({ value }: { value: unknown }) {
  if (value === null || value === undefined)
    return <Binary className="w-3 h-3 opacity-40" />;
  if (typeof value === "number") return <Hash className="w-3 h-3 text-info" />;
  if (typeof value === "boolean")
    return <Binary className="w-3 h-3 text-error" />;
  if (typeof value === "string")
    return <Type className="w-3 h-3 text-success" />;
  if (Array.isArray(value)) return <Box className="w-3 h-3 text-secondary" />;
  if (typeof value === "object")
    return <Box className="w-3 h-3 text-primary" />;
  return <Type className="w-3 h-3 opacity-50" />;
}

// Copy Button Component
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={`btn btn-ghost btn-xs btn-square transition-all duration-300 ${
        copied
          ? "text-success bg-success/10"
          : "text-base-content/30 hover:text-primary hover:bg-primary/10"
      }`}
      title="Copy value"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
    </button>
  );
}

// Lightbox component for viewing images
function ImageLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  const downloadImage = () => {
    const link = document.createElement("a");
    link.href = src;
    link.download = `image_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]"
      onClick={onClose}
    >
      <div
        className="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center animate-[float_0.3s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="Preview"
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl border border-white/10"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={downloadImage}
            className="btn btn-primary btn-sm gap-2 shadow-lg backdrop-blur-md bg-primary/80 border-none hover:bg-primary"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button
            onClick={onClose}
            className="btn btn-circle btn-sm btn-ghost bg-black/50 hover:bg-white/20 text-white border border-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Render a single value cell
function ValueCell({ value }: { value: unknown }) {
  const [showLightbox, setShowLightbox] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const searchTerm = useContext(SearchContext);

  if (value === null) {
    return (
      <span className="badge badge-ghost badge-sm font-mono opacity-50">
        null
      </span>
    );
  }

  if (value === undefined) {
    return (
      <span className="badge badge-ghost badge-sm font-mono opacity-50">
        undefined
      </span>
    );
  }

  if (typeof value === "boolean") {
    const text = value.toString();
    const isMatch = matchesSearch(text, searchTerm);
    return (
      <div className="flex items-center gap-2 group">
        <span
          className={`badge badge-sm font-bold ${
            value
              ? "badge-success text-success-content"
              : "badge-error text-error-content"
          } ${
            isMatch
              ? "ring-2 ring-warning ring-offset-2 ring-offset-base-100"
              : ""
          }`}
        >
          {isMatch ? (
            <HighlightedText text={text} searchTerm={searchTerm} />
          ) : (
            text
          )}
        </span>
      </div>
    );
  }

  if (typeof value === "number") {
    const text = value.toLocaleString();
    const isMatch = matchesSearch(text, searchTerm);
    return (
      <div className="flex items-center gap-2 group">
        <span
          className={`font-mono text-info font-medium ${
            isMatch ? "bg-warning/20 text-warning px-1 rounded" : ""
          }`}
        >
          {isMatch ? (
            <HighlightedText text={text} searchTerm={searchTerm} />
          ) : (
            text
          )}
        </span>
        <CopyButton text={value.toString()} />
      </div>
    );
  }

  if (typeof value === "string") {
    // Check for base64 image
    if (isBase64Image(value)) {
      const imgSrc = getBase64ImageSrc(value);
      return (
        <>
          <div className="flex items-start gap-3 p-2 bg-base-100/50 rounded-lg border border-base-content/5 hover:border-primary/30 transition-colors w-fit">
            <div
              className="relative group cursor-pointer overflow-hidden rounded-md"
              onClick={() => setShowLightbox(true)}
            >
              <img
                src={imgSrc}
                alt="Base64 Content"
                className="w-20 h-20 object-cover transform transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Maximize2 className="w-5 h-5 text-white drop-shadow-lg" />
              </div>
            </div>
            <div className="flex flex-col gap-1 py-1">
              <span className="text-xs font-semibold text-base-content/70">
                Base64 Image
              </span>
              <span className="text-[10px] bg-base-300 px-1.5 py-0.5 rounded text-base-content/40 font-mono">
                {(value.length / 1024).toFixed(1)} KB
              </span>
              <button
                onClick={() => setShowLightbox(true)}
                className="btn btn-xs btn-outline btn-primary mt-1"
              >
                View Full
              </button>
            </div>
          </div>
          {showLightbox && (
            <ImageLightbox
              src={imgSrc}
              onClose={() => setShowLightbox(false)}
            />
          )}
        </>
      );
    }

    const isMatch = matchesSearch(value, searchTerm);

    // Regular string
    if (value.length > 200) {
      return (
        <div className="group relative">
          <div
            className={`flex items-start gap-2 ${
              isExpanded ? "flex-col" : "items-center"
            }`}
          >
            {isExpanded ? (
              <div className="w-full">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs uppercase font-bold text-base-content/40 tracking-wider">
                    Text Content
                  </span>
                  <div className="flex gap-1">
                    <CopyButton text={value} />
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="btn btn-ghost btn-xs btn-circle hover:bg-base-200"
                    >
                      <Minimize2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <pre className="p-4 bg-base-100/80 rounded-lg text-sm font-mono text-base-content/80 whitespace-pre-wrap break-all shadow-inner border border-base-content/5 max-h-[400px] overflow-auto custom-scrollbar">
                  {isMatch ? (
                    <HighlightedText text={value} searchTerm={searchTerm} />
                  ) : (
                    value
                  )}
                </pre>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="text-left text-base-content/70 hover:text-primary transition-colors line-clamp-2 max-w-xl text-sm"
                >
                  {isMatch ? (
                    <HighlightedText
                      text={truncateValue(value, 150)}
                      searchTerm={searchTerm}
                    />
                  ) : (
                    truncateValue(value, 150)
                  )}
                </button>
                <button
                  onClick={() => setIsExpanded(true)}
                  className="btn btn-ghost btn-xs text-primary text-xs shrink-0 bg-primary/5 hover:bg-primary/20"
                >
                  Show More
                </button>
              </>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2 group max-w-full">
        <span
          className={`break-all text-base-content/80 ${
            isMatch ? "bg-warning/20 text-warning px-1 rounded -ml-1" : ""
          }`}
        >
          {isMatch ? (
            <HighlightedText text={value} searchTerm={searchTerm} />
          ) : (
            value
          )}
        </span>
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <CopyButton text={value} />
        </div>
      </div>
    );
  }

  // Object or Array - not handled here, use NestedObjectTable
  return (
    <span className="text-base-content/40 italic flex items-center gap-1">
      <Box className="w-3 h-3" /> Complex Type
    </span>
  );
}

// Key cell with highlighting and styling
function KeyCell({ keyName }: { keyName: string }) {
  const searchTerm = useContext(SearchContext);
  const isMatch = matchesSearch(keyName, searchTerm);

  return (
    <div className="flex items-center gap-2">
      <span
        className={`font-mono text-xs font-semibold tracking-tight transition-colors ${
          isMatch
            ? "text-warning bg-warning/10 px-1 rounded"
            : "text-secondary hover:text-secondary-focus"
        }`}
      >
        {isMatch ? (
          <HighlightedText text={keyName} searchTerm={searchTerm} />
        ) : (
          keyName
        )}
      </span>
    </div>
  );
}

// Nested expandable table/list for objects/arrays
function NestedObjectTable({
  data,
  depth = 0,
}: {
  data: unknown;
  depth?: number;
}) {
  const searchTerm = useContext(SearchContext);

  // Check if any children match the search term
  const hasMatchingChildren = useMemo(() => {
    if (!searchTerm) return false;

    function checkMatches(obj: unknown): boolean {
      if (obj === null || obj === undefined) return false;

      if (typeof obj === "string") {
        return matchesSearch(obj, searchTerm);
      } else if (typeof obj === "number" || typeof obj === "boolean") {
        return matchesSearch(String(obj), searchTerm);
      } else if (Array.isArray(obj)) {
        return obj.some(checkMatches);
      } else if (typeof obj === "object") {
        return Object.entries(obj as Record<string, unknown>).some(
          ([key, value]) =>
            matchesSearch(key, searchTerm) || checkMatches(value)
        );
      }
      return false;
    }

    return checkMatches(data);
  }, [data, searchTerm]);

  // Auto-expand if there are matching children
  const [expanded, setExpanded] = useState(depth < 1 || hasMatchingChildren);

  if (data === null || data === undefined) {
    return <ValueCell value={data} />;
  }

  if (typeof data !== "object") {
    return <ValueCell value={data} />;
  }

  const isArray = Array.isArray(data);
  const entries = isArray
    ? data.map((item, index) => [index.toString(), item] as [string, unknown])
    : Object.entries(data as Record<string, unknown>);

  if (entries.length === 0) {
    return (
      <span className="text-base-content/40 italic text-xs border border-dashed border-base-content/20 px-2 py-1 rounded">
        {isArray ? "Empty Array []" : "Empty Object {}"}
      </span>
    );
  }

  return (
    <div className="w-full my-1">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider px-2 py-1.5 rounded-md transition-all duration-200 border border-transparent w-full text-left
          ${
            hasMatchingChildren
              ? "text-warning bg-warning/5 border-warning/20"
              : expanded
              ? "text-primary bg-primary/5 hover:bg-primary/10"
              : "text-base-content/60 hover:bg-base-200 hover:text-base-content"
          }`}
      >
        <div
          className={`transition-transform duration-200 ${
            expanded ? "rotate-90" : ""
          }`}
        >
          {expanded ? (
            <ChevronDown className="w-3 h-3" />
          ) : (
            <ChevronRight className="w-3 h-3" />
          )}
        </div>

        <span className="flex items-center gap-2">
          {isArray ? (
            <Box className="w-3 h-3" />
          ) : (
            <Database className="w-3 h-3" />
          )}
          {isArray ? "Array" : "Object"}
          <span className="opacity-50">({entries.length} items)</span>
        </span>

        {hasMatchingChildren && !expanded && (
          <span className="ml-auto badge badge-warning badge-xs animate-pulse">
            match found
          </span>
        )}
      </button>

      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${expanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"}
      `}
      >
        <div className="mt-2 ml-3 pl-3 border-l file:border-primary/10 relative">
          {/* Tree connection line */}
          <div className="absolute top-0 bottom-0 -left-px w-px bg-linear-to-b from-primary/30 to-transparent"></div>

          <div className="flex flex-col gap-1">
            {entries.map(([key, value]) => (
              <div
                key={key}
                className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 p-2 rounded-lg hover:bg-base-100/50 transition-colors border border-transparent hover:border-white/5"
              >
                <div className="flex items-center gap-2 min-w-[140px] max-w-[200px] py-1">
                  <TypeIcon value={value} />
                  <KeyCell keyName={key} />
                </div>
                <div className="flex-1 min-w-0 py-0.5">
                  {typeof value === "object" && value !== null ? (
                    <NestedObjectTable data={value} depth={depth + 1} />
                  ) : (
                    <ValueCell value={value} />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MetadataTable({
  data,
  title = "Metadata",
  searchTerm = "",
}: MetadataTableProps) {
  const [expanded, setExpanded] = useState(true);

  if (!data || typeof data !== "object") {
    return null;
  }

  const entries = Array.isArray(data)
    ? data.map((item, index) => [index.toString(), item] as [string, unknown])
    : Object.entries(data as Record<string, unknown>);

  if (entries.length === 0) {
    return null;
  }

  return (
    <SearchContext.Provider value={searchTerm}>
      <div className="w-full animate-[fadeIn_0.5s_ease-out]">
        <div className="bg-base-200/30 backdrop-blur-xl rounded-2xl border border-white/5 shadow-2xl overflow-hidden box-decoration-clone">
          {/* Header */}
          <div
            onClick={() => setExpanded(!expanded)}
            className="cursor-pointer bg-linear-to-r from-base-200 to-base-300/50 p-4 border-b border-white/5 flex justify-between items-center group select-none relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <h3 className="font-bold text-lg flex items-center gap-3 relative z-10 text-primary-content/90 group-hover:text-primary transition-colors">
              <div className="p-2 rounded-lg bg-primary/10 text-primary shadow-sm group-hover:scale-110 transition-transform duration-300">
                <Database className="w-5 h-5" />
              </div>
              {title}
              <span className="badge badge-sm badge-ghost font-mono opacity-50">
                {entries.length} keys
              </span>
            </h3>

            <div
              className={`p-2 rounded-full hover:bg-white/10 transition-all duration-300 ${
                expanded ? "rotate-180 bg-white/5" : ""
              }`}
            >
              <ChevronDown className="w-5 h-5 text-base-content/70" />
            </div>
          </div>

          {/* Content */}
          <div
            className={`transition-all duration-500 ease-in-out ${
              expanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="overflow-x-auto bg-linear-to-b from-transparent to-base-100/50">
              <div className="p-2 sm:p-4 min-w-full w-max">
                <div className="flex flex-col divide-y divide-white/5">
                  {entries.map(([key, value]) => (
                    <div
                      key={key}
                      className="group transition-all duration-200 hover:bg-white/5 rounded-xl p-3 sm:px-4"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-4">
                        <div className="w-full md:w-auto md:min-w-[180px] md:max-w-[220px] pt-1 flex items-center gap-2 text-secondary/90 shrink-0">
                          <div className="opacity-40 group-hover:opacity-100 transition-opacity">
                            <TypeIcon value={value} />
                          </div>
                          <KeyCell keyName={key} />
                        </div>
                        <div className="flex-1 overflow-hidden min-w-0">
                          {typeof value === "object" && value !== null ? (
                            <div className="bg-base-100/40 rounded-lg p-2 border border-white/5">
                              <NestedObjectTable data={value} />
                            </div>
                          ) : (
                            <ValueCell value={value} />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer / Status bar */}
            <div className="bg-base-300/30 p-2 px-4 text-[10px] text-base-content/30 border-t border-white/5 flex justify-between items-center font-mono uppercase tracking-widest">
              <span>JSON Metadata viewer</span>
              <span>{entries.length} entries shown</span>
            </div>
          </div>
        </div>
      </div>
    </SearchContext.Provider>
  );
}
