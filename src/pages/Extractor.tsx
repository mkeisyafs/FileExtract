import { useFileExtractor } from "../hooks/useFileExtractor";
import { Header } from "../components/Header";
import { UploadArea } from "../components/UploadArea";
import { FileList } from "../components/FileList";
import { ActionButtons } from "../components/ActionButtons";
import { ResultSection } from "../components/ResultSection";
import { ImageGallery } from "../components/ImageGallery";
import { Image, ImageOff } from "lucide-react";

export function Extractor() {
  const {
    selectedFiles,
    result,
    isProcessing,
    toast,
    metadataOnly,
    showAssets,
    progress,
    sizeWarning,
    addFiles,
    removeFile,
    clearFiles,
    extractFiles,
    copyToClipboard,
    downloadJSON,
    toggleMetadataOnly,
    toggleShowAssets,
  } = useFileExtractor();

  return (
    <div
      className="min-h-screen relative overflow-hidden selection:bg-primary/30 selection:text-primary-content"
      data-theme="dark"
    >
      {/* Background Effects - optimized with will-change and contain */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[#0f0f1a] bg-grid">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0f0f1a]/50 to-[#0f0f1a]"></div>
        <div className="blob blob-1 opacity-20 mix-blend-screen"></div>
        <div className="blob blob-2 opacity-20 mix-blend-screen"></div>
        <div className="blob blob-3 opacity-20 mix-blend-screen"></div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col min-h-screen relative z-10">
        <Header />

        <main className="flex-1 w-full space-y-8 animate-[fadeIn_0.5s_ease-out]">
          <UploadArea
            onFilesAdded={addFiles}
            metadataOnly={metadataOnly}
            onToggleMetadata={toggleMetadataOnly}
          />

          {/* Size/count warning */}
          {sizeWarning && (
            <div className="alert alert-warning shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span>{sizeWarning}</span>
            </div>
          )}

          <FileList files={selectedFiles} onRemoveFile={removeFile} />

          <ActionButtons
            onExtract={extractFiles}
            onClear={clearFiles}
            isProcessing={isProcessing}
            hasFiles={selectedFiles.length > 0}
          />

          {/* Progress indicator */}
          {progress && (
            <div className="card bg-base-200/50 border border-base-content/10 p-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-base-content/70">
                      Processing: {progress.currentFile || "..."}
                    </span>
                    <span className="text-primary font-mono">
                      {progress.current}/{progress.total}
                    </span>
                  </div>
                  <progress
                    className="progress progress-primary w-full"
                    value={progress.current}
                    max={progress.total}
                  ></progress>
                </div>
              </div>
            </div>
          )}

          {result && (
            <>
              {/* Assets toggle */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={toggleShowAssets}
                  className={`btn btn-sm gap-2 rounded-xl transition-all duration-300 ${
                    showAssets
                      ? "btn-secondary"
                      : "btn-ghost border border-base-content/10"
                  }`}
                >
                  {showAssets ? (
                    <>
                      <Image className="w-4 h-4" />
                      Assets On
                    </>
                  ) : (
                    <>
                      <ImageOff className="w-4 h-4" />
                      Assets Off
                    </>
                  )}
                </button>
              </div>

              <ResultSection
                result={result}
                onCopy={copyToClipboard}
                onDownload={downloadJSON}
              />
            </>
          )}

          {result && showAssets && <ImageGallery result={result} />}
        </main>

        <footer className="mt-20 pt-8 border-t border-white/5 text-center">
          <p className="text-base-content/40 text-sm font-medium">
            File Extractor Tool &copy; {new Date().getFullYear()} &bull; Built
            with React & Tailwind
          </p>
        </footer>
      </div>

      {/* Toast */}
      {toast && (
        <div className="toast toast-bottom toast-center">
          <div className="alert alert-info">
            <span>{toast}</span>
          </div>
        </div>
      )}
    </div>
  );
}
