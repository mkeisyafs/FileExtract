import { useRef } from "react";
import type { DragEvent } from "react";
import { Upload } from "lucide-react";
import { ToggleSwitch } from "./ToggleSwitch";

type UploadAreaProps = {
  onFilesAdded: (files: FileList | File[]) => void;
  metadataOnly: boolean;
  onToggleMetadata: () => void;
};

export function UploadArea({
  onFilesAdded,
  metadataOnly,
  onToggleMetadata,
}: UploadAreaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("border-primary", "bg-base-200");
  };

  const handleDragLeave = (e: DragEvent) => {
    e.currentTarget.classList.remove("border-primary", "bg-base-200");
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove("border-primary", "bg-base-200");
    if (e.dataTransfer.files) {
      onFilesAdded(e.dataTransfer.files);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onFilesAdded(e.target.files);
    }
  };

  return (
    <div className="mb-12 max-w-2xl mx-auto">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="group relative overflow-hidden rounded-3xl border border-dashed border-base-content/20 bg-base-200/30 backdrop-blur-md p-10 text-center cursor-pointer transition-all duration-500 hover:border-primary/50 hover:bg-base-200/50 hover:scale-[1.01] hover:shadow-2xl"
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
            <div className="w-20 h-20 bg-base-100 rounded-2xl shadow-lg border border-white/5 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-500">
              <Upload className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-300" />
            </div>
          </div>

          <div className="space-y-1">
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-base-content to-base-content/60">
              Drop files here
            </h3>
            <p className="text-base-content/50 font-medium">
              or click to browse from your computer
            </p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-4 mt-6">
        <div className="flex items-center gap-2 text-xs font-mono text-base-content/40 uppercase tracking-widest">
          <span className="w-2 h-2 rounded-full bg-success"></span>
          All formats supported
        </div>

          <ToggleSwitch
            isOn={metadataOnly}
            onToggle={onToggleMetadata}
            labelOff="Full Extract"
            labelOn="Metadata Only"
          />
      </div>
    </div>
  );
}
