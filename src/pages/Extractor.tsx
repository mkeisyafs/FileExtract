import { useFileExtractor } from "../hooks/useFileExtractor";
import { Header } from "../components/Header";
import { UploadArea } from "../components/UploadArea";
import { FileList } from "../components/FileList";
import { ActionButtons } from "../components/ActionButtons";
import { ResultSection } from "../components/ResultSection";
import { ImageGallery } from "../components/ImageGallery";

export function Extractor() {
  const {
    selectedFiles,
    result,
    isProcessing,
    toast,
    metadataOnly,
    addFiles,
    removeFile,
    clearFiles,
    extractFiles,
    copyToClipboard,
    downloadJSON,
    toggleMetadataOnly,
  } = useFileExtractor();

  return (
    <div
      className="min-h-screen relative overflow-hidden selection:bg-primary/30 selection:text-primary-content"
      data-theme="dark"
    >
      {/* Background Effects */}
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

          <FileList files={selectedFiles} onRemoveFile={removeFile} />

          <ActionButtons
            onExtract={extractFiles}
            onClear={clearFiles}
            isProcessing={isProcessing}
            hasFiles={selectedFiles.length > 0}
          />

          {result && (
            <ResultSection
              result={result}
              onCopy={copyToClipboard}
              onDownload={downloadJSON}
            />
          )}

          {result && <ImageGallery result={result} />}
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
