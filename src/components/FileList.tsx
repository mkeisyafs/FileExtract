import {
  FileText,
  X,
  Package,
  FileCode,
  FileImage,
  FileAudio,
  FileVideo,
} from "lucide-react";
import { formatFileSize, zipExtensions } from "../lib/fileUtils";

type FileListProps = {
  files: File[];
  onRemoveFile: (filename: string) => void;
};

// Helper to get icon based on extension
function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  if (zipExtensions.includes(ext)) return <Package className="w-6 h-6" />;
  if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext))
    return <FileImage className="w-6 h-6" />;
  if (["mp3", "wav", "ogg"].includes(ext))
    return <FileAudio className="w-6 h-6" />;
  if (["mp4", "webm", "avi"].includes(ext))
    return <FileVideo className="w-6 h-6" />;
  if (["json", "js", "ts", "css", "html", "xml"].includes(ext))
    return <FileCode className="w-6 h-6" />;
  return <FileText className="w-6 h-6" />;
}

export function FileList({ files, onRemoveFile }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="mb-8 animate-[fadeIn_0.3s_ease-out]">
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-lg font-semibold text-base-content/80 flex items-center gap-2">
          Selected Files{" "}
          <span className="badge badge-primary badge-sm bg-primary/20 text-primary border-0">
            {files.length}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {files.map((file, index) => {
          const ext = file.name.split(".").pop()?.toLowerCase() || "";
          const isZip = zipExtensions.includes(ext);

          return (
            <div
              key={`${file.name}-${index}`}
              className="group relative bg-base-200/40 backdrop-blur-sm border border-white/5 p-3 rounded-2xl hover:bg-base-200/60 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{
                animation: `fadeIn 0.3s ease-out ${index * 0.05}s backwards`,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`p-3 rounded-xl ${
                    isZip
                      ? "bg-secondary/10 text-secondary"
                      : "bg-primary/10 text-primary"
                  } group-hover:scale-110 transition-transform duration-300`}
                >
                  {getFileIcon(file.name)}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <h4
                    className="font-medium text-sm truncate text-base-content/90"
                    title={file.name}
                  >
                    {file.name}
                  </h4>
                  <p className="text-xs text-base-content/50 mt-0.5 font-mono flex items-center gap-2">
                    {formatFileSize(file.size)}
                    {isZip && (
                      <span className="inline-flex items-center gap-1 text-secondary/80 bg-secondary/5 px-1.5 py-0.5 rounded text-[10px]">
                        ARCHIVE
                      </span>
                    )}
                  </p>
                </div>

                <button
                  onClick={() => onRemoveFile(file.name)}
                  className="opacity-0 group-hover:opacity-100 btn btn-xs btn-circle btn-ghost text-base-content/40 hover:text-error hover:bg-error/10 transition-all duration-200 absolute top-2 right-2"
                  title="Remove file"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
