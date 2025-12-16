import { FileText, X, Package } from "lucide-react";
import { formatFileSize, zipExtensions } from "../lib/fileUtils";

type FileListProps = {
  files: File[];
  onRemoveFile: (filename: string) => void;
};

export function FileList({ files, onRemoveFile }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="space-y-3 mb-6">
      {files.map((file) => {
        const ext = file.name.split(".").pop()?.toLowerCase() || "";
        const isZip = zipExtensions.includes(ext);

        return (
          <div
            key={file.name}
            className="card card-side bg-base-200/50 border border-base-content/10 p-4"
            style={{ animation: "slideIn 0.3s ease" }}
          >
            <div className="avatar placeholder">
              <div className="bg-gradient-to-br from-primary to-secondary text-primary-content rounded-lg w-12">
                <FileText className="w-6 h-6" />
              </div>
            </div>
            <div className="card-body p-0 pl-4 justify-center">
              <h4 className="font-semibold truncate text-sm">{file.name}</h4>
              <p className="text-xs text-base-content/60">
                {formatFileSize(file.size)} • {ext.toUpperCase()}
                {isZip && (
                  <span className="inline-flex items-center gap-1 ml-2">
                    <Package className="w-3 h-3" /> ZIP Archive
                  </span>
                )}
              </p>
            </div>
            <button
              onClick={() => onRemoveFile(file.name)}
              className="btn btn-circle btn-ghost btn-sm text-error hover:bg-error hover:text-error-content"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
