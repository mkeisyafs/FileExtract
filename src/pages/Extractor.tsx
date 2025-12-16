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
    <div className="min-h-screen relative overflow-hidden" data-theme="dark">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="max-w-4xl mx-auto px-5 py-10 flex flex-col min-h-screen">
        <Header />

        <main className="flex-1">
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

          <ResultSection
            result={result}
            onCopy={copyToClipboard}
            onDownload={downloadJSON}
          />

          {result && <ImageGallery result={result} />}
        </main>

        <footer className="text-center py-8 text-base-content/40 text-sm">
          <p>File Extractor Tool © 2024</p>
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
