import { useState, useCallback } from "react";
import type { ExtractedFile, ExtractionResult } from "../lib/fileUtils";
import {
  formatFileSize,
  isZipFile,
  isPngFile,
  extractZipContent,
  extractZipMetadata,
  extractPngMetadata,
  readFileContent,
  parseContent,
} from "../lib/fileUtils";

export function useFileExtractor() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [metadataOnly, setMetadataOnly] = useState(false);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const newFiles = Array.from(files).filter(
        (file) => !selectedFiles.some((f) => f.name === file.name)
      );
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    },
    [selectedFiles]
  );

  const removeFile = useCallback((filename: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.name !== filename));
  }, []);

  const clearFiles = useCallback(() => {
    setSelectedFiles([]);
    setResult(null);
    showToast("All files cleared");
  }, [showToast]);

  const extractFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);

    try {
      const extractedFiles = await Promise.all(
        selectedFiles.map(async (file): Promise<ExtractedFile> => {
          const ext = file.name.split(".").pop()?.toLowerCase() || "";

          // Base metadata (same for full and metadata-only)
          const baseMetadata = {
            filename: file.name,
            extension: ext,
            size: file.size,
            sizeFormatted: formatFileSize(file.size),
            lastModified: new Date(file.lastModified).toISOString(),
            mimeType: file.type || "application/octet-stream",
          };

          // Handle PNG files with potential embedded JSON (character cards)
          if (isPngFile(ext)) {
            const pngData = await extractPngMetadata(file);

            if (pngData.embeddedJson) {
              return {
                ...baseMetadata,
                content: "[PNG Image - Character Card Detected]",
                contentParsed: pngData.embeddedJson,
                isArchive: true,
                archiveType: "character_card",
              };
            } else {
              return {
                ...baseMetadata,
                content: "[PNG Image - No embedded data found]",
              };
            }
          }

          // If metadata only, return without content
          if (metadataOnly) {
            if (isZipFile(ext)) {
              const zipMetadata = await extractZipMetadata(file);
              return {
                ...baseMetadata,
                ...zipMetadata,
              };
            }
            return baseMetadata;
          }

          // Full extraction with content
          if (isZipFile(ext)) {
            const zipContent = await extractZipContent(file);
            return {
              ...baseMetadata,
              ...zipContent,
            };
          }

          const content = await readFileContent(file);
          return {
            ...baseMetadata,
            content,
            contentParsed: parseContent(content, ext),
          };
        })
      );

      const extractionResult: ExtractionResult = {
        extractedAt: new Date().toISOString(),
        totalFiles: extractedFiles.length,
        extractionMode: metadataOnly ? "metadata_only" : "full",
        files: extractedFiles,
      };

      setResult(extractionResult);
      showToast(
        metadataOnly
          ? "Metadata extracted successfully! 📋"
          : "Files extracted successfully! ✨"
      );
    } catch (error) {
      showToast("Error: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedFiles, metadataOnly, showToast]);

  const copyToClipboard = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      showToast("JSON copied to clipboard! 📋");
    } catch {
      showToast("Failed to copy to clipboard");
    }
  }, [result, showToast]);

  const downloadJSON = useCallback(() => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `extracted_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("JSON file downloaded! 💾");
  }, [result, showToast]);

  const toggleMetadataOnly = useCallback(() => {
    setMetadataOnly((prev) => !prev);
  }, []);

  return {
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
  };
}
