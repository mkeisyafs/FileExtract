import { useState, createContext, useContext, useMemo } from "react";
import {
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  X,
  Download,
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
      <mark className="bg-warning text-warning-content px-0.5 rounded">
        {match}
      </mark>
      {after.length > 0 && (
        <HighlightedText text={after} searchTerm={searchTerm} />
      )}
    </>
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
    <div className="modal modal-open" onClick={onClose}>
      <div
        className="modal-box max-w-4xl bg-base-300 p-0"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="Preview"
          className="w-full max-h-[70vh] object-contain"
        />
        <div className="p-4 flex justify-end items-center gap-2">
          <button
            onClick={downloadImage}
            className="btn btn-primary btn-sm gap-2"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
          <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
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
  const searchTerm = useContext(SearchContext);

  if (value === null) {
    return <span className="text-base-content/40 italic">null</span>;
  }

  if (value === undefined) {
    return <span className="text-base-content/40 italic">undefined</span>;
  }

  if (typeof value === "boolean") {
    const text = value.toString();
    const isMatch = matchesSearch(text, searchTerm);
    return (
      <span
        className={`${value ? "text-success" : "text-error"} ${
          isMatch ? "ring-2 ring-warning rounded px-1" : ""
        }`}
      >
        {isMatch ? (
          <HighlightedText text={text} searchTerm={searchTerm} />
        ) : (
          text
        )}
      </span>
    );
  }

  if (typeof value === "number") {
    const text = value.toLocaleString();
    const isMatch = matchesSearch(text, searchTerm);
    return (
      <span
        className={`text-info ${
          isMatch ? "ring-2 ring-warning rounded px-1" : ""
        }`}
      >
        {isMatch ? (
          <HighlightedText text={text} searchTerm={searchTerm} />
        ) : (
          text
        )}
      </span>
    );
  }

  if (typeof value === "string") {
    // Check for base64 image
    if (isBase64Image(value)) {
      const imgSrc = getBase64ImageSrc(value);
      return (
        <>
          <div className="flex items-center gap-3">
            <div
              className="relative group cursor-pointer"
              onClick={() => setShowLightbox(true)}
            >
              <img
                src={imgSrc}
                alt="Base64 Image"
                className="w-16 h-16 object-cover rounded-lg border border-base-content/20 hover:ring-2 hover:ring-primary transition-all"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity">
                <ImageIcon className="w-5 h-5 text-white" />
              </div>
            </div>
            <span className="text-xs text-base-content/50 bg-base-300 px-2 py-1 rounded">
              Base64 Image
            </span>
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
        <details className="cursor-pointer" open={isMatch}>
          <summary
            className={`text-primary hover:underline ${
              isMatch ? "ring-2 ring-warning rounded px-1" : ""
            }`}
          >
            {isMatch ? (
              <HighlightedText
                text={truncateValue(value, 100)}
                searchTerm={searchTerm}
              />
            ) : (
              truncateValue(value, 100)
            )}
          </summary>
          <pre className="mt-2 p-3 bg-base-300 rounded-lg text-sm whitespace-pre-wrap wrap-break-word max-h-60 overflow-auto">
            {isMatch ? (
              <HighlightedText text={value} searchTerm={searchTerm} />
            ) : (
              value
            )}
          </pre>
        </details>
      );
    }

    return (
      <span
        className={`wrap-break-word ${
          isMatch ? "ring-2 ring-warning rounded px-1" : ""
        }`}
      >
        {isMatch ? (
          <HighlightedText text={value} searchTerm={searchTerm} />
        ) : (
          value
        )}
      </span>
    );
  }

  // Object or Array - not handled here, use NestedObjectTable
  return <span className="text-base-content/50">[Complex Type]</span>;
}

// Key cell with highlighting
function KeyCell({ keyName }: { keyName: string }) {
  const searchTerm = useContext(SearchContext);
  const isMatch = matchesSearch(keyName, searchTerm);

  return (
    <span className={isMatch ? "ring-2 ring-warning rounded px-1" : ""}>
      {isMatch ? (
        <HighlightedText text={keyName} searchTerm={searchTerm} />
      ) : (
        keyName
      )}
    </span>
  );
}

// Nested expandable table for objects/arrays
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
  const [expanded, setExpanded] = useState(depth < 2 || hasMatchingChildren);

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
      <span className="text-base-content/40 italic">
        {isArray ? "[]" : "{}"}
      </span>
    );
  }

  return (
    <div className="w-full">
      <button
        onClick={() => setExpanded(!expanded)}
        className={`flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-focus transition-colors ${
          hasMatchingChildren ? "ring-2 ring-warning rounded px-1" : ""
        }`}
      >
        {expanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
        {isArray
          ? `Array (${entries.length} items)`
          : `Object (${entries.length} keys)`}
        {hasMatchingChildren && !expanded && (
          <span className="badge badge-warning badge-xs ml-1">has matches</span>
        )}
      </button>

      {expanded && (
        <div className="mt-2 ml-2 border-l-2 border-primary/20 pl-3">
          <table className="table table-xs w-full">
            <tbody>
              {entries.map(([key, value]) => (
                <tr key={key} className="hover:bg-base-300/50">
                  <td className="font-mono text-xs text-secondary align-top py-2 w-1/4 max-w-[150px] truncate">
                    <KeyCell keyName={key} />
                  </td>
                  <td className="py-2">
                    {typeof value === "object" && value !== null ? (
                      <NestedObjectTable data={value} depth={depth + 1} />
                    ) : (
                      <ValueCell value={value} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
      <div className="overflow-x-auto">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-lg font-semibold mb-4 hover:text-primary transition-colors"
        >
          {expanded ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
          {title}
        </button>

        {expanded && (
          <table className="table table-zebra w-full">
            <thead>
              <tr className="bg-base-300/70">
                <th className="text-left w-1/4">Key</th>
                <th className="text-left">Value</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(([key, value]) => (
                <tr key={key} className="hover:bg-base-300/30">
                  <td className="font-mono text-sm text-secondary align-top py-3 font-medium">
                    <KeyCell keyName={key} />
                  </td>
                  <td className="py-3">
                    {typeof value === "object" && value !== null ? (
                      <NestedObjectTable data={value} />
                    ) : (
                      <ValueCell value={value} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </SearchContext.Provider>
  );
}
