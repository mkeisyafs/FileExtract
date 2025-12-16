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
    <div className="mb-8">
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="card bg-base-200/50 border-2 border-dashed border-base-content/20 p-16 text-center cursor-pointer transition-all duration-300 hover:border-primary hover:bg-base-200"
      >
        <div className="upload-icon w-20 h-20 mx-auto mb-5 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
          <Upload className="w-10 h-10 text-primary-content" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Drag & Drop File</h3>
        <p className="text-base-content/60">or click to select files</p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center mt-5">
        <span className="badge badge-lg badge-ghost gap-2">
          ✨ All file types supported!
        </span>
      </div>

      <ToggleSwitch
        isOn={metadataOnly}
        onToggle={onToggleMetadata}
        labelOff="Full Extract"
        labelOn="Metadata Only"
      />
    </div>
  );
}
