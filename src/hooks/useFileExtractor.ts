import { useState, useCallback, useRef, useEffect } from "react";
import type { ExtractedFile, ExtractionResult } from "../lib/fileUtils";
import {
  formatFileSize,
  isZipFile,
  isCharxFile,
  isPngFile,
  extractZipContent,
  extractCharxContent,
  extractZipMetadata,
  extractPngMetadata,
  readFileContent,
  parseContent,
} from "../lib/fileUtils";

// Concurrency limit for batch processing
const BATCH_CONCURRENCY = 3;

// File count / size thresholds for warnings
const WARN_FILE_COUNT = 50;
const WARN_TOTAL_SIZE_MB = 200;

export type ExtractionProgress = {
  current: number;
  total: number;
  currentFile: string;
};

export function useFileExtractor() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [metadataOnly, setMetadataOnly] = useState(false);
  const [showAssets, setShowAssets] = useState(true);
  const [progress, setProgress] = useState<ExtractionProgress | null>(null);
  const [sizeWarning, setSizeWarning] = useState<string | null>(null);

  // Track file names with a Set for O(1) dedup lookups
  const fileNameSetRef = useRef<Set<string>>(new Set());

  // Track blob URLs for cleanup
  const blobUrlsRef = useRef<string[]>([]);

  // Cleanup blob URLs when result changes or component unmounts
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current = [];
    };
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // O(1) dedup using Set
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const newFiles = Array.from(files).filter(
        (file) => !fileNameSetRef.current.has(file.name)
      );

      if (newFiles.length > 0) {
        newFiles.forEach((f) => fileNameSetRef.current.add(f.name));
        setSelectedFiles((prev) => {
          const updated = [...prev, ...newFiles];

          // Check for size/count warnings
          const totalSize = updated.reduce((sum, f) => sum + f.size, 0);
          const totalSizeMB = totalSize / (1024 * 1024);

          if (updated.length > WARN_FILE_COUNT || totalSizeMB > WARN_TOTAL_SIZE_MB) {
            setSizeWarning(
              `Warning: ${updated.length} files (${formatFileSize(totalSize)}) selected. ` +
              `Consider using "Metadata Only" mode for better performance.`
            );
          } else {
            setSizeWarning(null);
          }

          return updated;
        });
        showToast(
          `Added ${newFiles.length} file${newFiles.length > 1 ? "s" : ""}`
        );
      }
    },
    [showToast]
  );

  const removeFile = useCallback((filename: string) => {
    fileNameSetRef.current.delete(filename);
    setSelectedFiles((prev) => prev.filter((f) => f.name !== filename));
  }, []);

  const clearFiles = useCallback(() => {
    fileNameSetRef.current.clear();
    setSelectedFiles([]);
    setResult(null);
    setSizeWarning(null);
    // Cleanup blob URLs
    blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    blobUrlsRef.current = [];
    showToast("All files cleared");
  }, [showToast]);

  // Process a single file
  const processFile = useCallback(
    async (file: File): Promise<ExtractedFile> => {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";

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
      if (isCharxFile(ext)) {
        const charxContent = await extractCharxContent(file);
        return {
          ...baseMetadata,
          ...charxContent,
        };
      }

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
    },
    [metadataOnly]
  );

  // Batch processing with concurrency limit
  const extractFiles = useCallback(async () => {
    if (selectedFiles.length === 0) return;

    setIsProcessing(true);
    setProgress({ current: 0, total: selectedFiles.length, currentFile: "" });

    // Cleanup previous blob URLs
    blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    blobUrlsRef.current = [];

    try {
      const extractedFiles: ExtractedFile[] = [];
      let completed = 0;

      // Process files in batches with concurrency limit
      for (let i = 0; i < selectedFiles.length; i += BATCH_CONCURRENCY) {
        const batch = selectedFiles.slice(i, i + BATCH_CONCURRENCY);

        const batchResults = await Promise.all(
          batch.map(async (file) => {
            setProgress({
              current: completed,
              total: selectedFiles.length,
              currentFile: file.name,
            });

            try {
              return await processFile(file);
            } catch (error) {
              return {
                filename: file.name,
                extension: file.name.split(".").pop()?.toLowerCase() || "",
                size: file.size,
                sizeFormatted: formatFileSize(file.size),
                lastModified: new Date(file.lastModified).toISOString(),
                error: "Failed to extract: " + (error as Error).message,
              } as ExtractedFile;
            }
          })
        );

        extractedFiles.push(...batchResults);
        completed += batch.length;
        setProgress({
          current: completed,
          total: selectedFiles.length,
          currentFile: "",
        });

        // Yield to the main thread between batches to keep UI responsive
        if (i + BATCH_CONCURRENCY < selectedFiles.length) {
          await new Promise((resolve) => setTimeout(resolve, 0));
        }
      }

      const extractionResult: ExtractionResult = {
        extractedAt: new Date().toISOString(),
        totalFiles: extractedFiles.length,
        extractionMode: metadataOnly ? "metadata_only" : "full",
        files: extractedFiles,
      };

      setResult(extractionResult);
      showToast(
        metadataOnly
          ? "Metadata extracted successfully!"
          : "Files extracted successfully!"
      );
    } catch (error) {
      showToast("Error: " + (error as Error).message);
    } finally {
      setIsProcessing(false);
      setProgress(null);
    }
  }, [selectedFiles, metadataOnly, showToast, processFile]);

  // Use Web Worker for JSON serialization to avoid blocking main thread
  const copyToClipboard = useCallback(async () => {
    if (!result) return;
    try {
      // Serialize in a microtask to avoid blocking
      const jsonStr = await new Promise<string>((resolve) => {
        setTimeout(() => resolve(JSON.stringify(result, null, 2)), 0);
      });
      await navigator.clipboard.writeText(jsonStr);
      showToast("JSON copied to clipboard!");
    } catch {
      showToast("Failed to copy to clipboard");
    }
  }, [result, showToast]);

  const downloadJSON = useCallback(() => {
    if (!result) return;
    // Use setTimeout to avoid blocking main thread during serialization
    setTimeout(() => {
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
      showToast("JSON file downloaded!");
    }, 0);
  }, [result, showToast]);

  const toggleMetadataOnly = useCallback(() => {
    setMetadataOnly((prev) => !prev);
  }, []);

  const toggleShowAssets = useCallback(() => {
    setShowAssets((prev) => !prev);
  }, []);

  return {
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
  };
}
