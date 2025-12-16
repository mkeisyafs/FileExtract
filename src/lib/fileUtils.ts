import JSZip from "jszip";

export type FileContent = {
  type: "text" | "image" | "binary";
  extension: string;
  size: number;
  content: string;
  parsed?: unknown;
};

export type FileMetadata = {
  type: "text" | "image" | "binary";
  extension: string;
  size: number;
};

export type ZipContents = {
  [filename: string]: FileContent;
};

export type ZipMetadataContents = {
  [filename: string]: FileMetadata;
};

export type ExtractedFile = {
  filename: string;
  extension: string;
  size: number;
  sizeFormatted: string;
  lastModified: string;
  mimeType?: string;
  content?: string;
  contentParsed?: unknown;
  isArchive?: boolean;
  archiveType?: string;
  totalFiles?: number;
  fileList?: string[];
  contents?: ZipContents | ZipMetadataContents;
  error?: string;
};

export type ExtractionResult = {
  extractedAt: string;
  totalFiles: number;
  extractionMode: "full" | "metadata_only";
  files: ExtractedFile[];
};

// ZIP-based extensions
export const zipExtensions = [
  "charx",
  "zip",
  "cbz",
  "epub",
  "docx",
  "xlsx",
  "pptx",
  "odt",
  "ods",
  "odp",
  "apk",
  "jar",
];

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function isZipFile(ext: string): boolean {
  return zipExtensions.includes(ext.toLowerCase());
}

export function isPngFile(ext: string): boolean {
  return ext.toLowerCase() === "png";
}

// Extract embedded JSON from PNG files (character cards)
export async function extractPngMetadata(file: File): Promise<{
  embeddedJson?: unknown;
  base64Image?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);

      // Check PNG signature
      const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
      const isPng = pngSignature.every((byte, i) => bytes[i] === byte);

      if (!isPng) {
        resolve({});
        return;
      }

      // Search for tEXt or iTXt chunk with "chara" keyword
      let offset = 8; // Skip PNG signature
      let embeddedJson: unknown = undefined;

      while (offset < bytes.length) {
        // Read chunk length (4 bytes, big-endian)
        const length =
          (bytes[offset] << 24) |
          (bytes[offset + 1] << 16) |
          (bytes[offset + 2] << 8) |
          bytes[offset + 3];
        offset += 4;

        // Read chunk type (4 bytes)
        const chunkType = String.fromCharCode(
          bytes[offset],
          bytes[offset + 1],
          bytes[offset + 2],
          bytes[offset + 3]
        );
        offset += 4;

        if (chunkType === "tEXt" || chunkType === "iTXt") {
          // Read chunk data
          const chunkData = bytes.slice(offset, offset + length);

          // Find null separator between keyword and text
          let nullIndex = 0;
          for (let i = 0; i < chunkData.length; i++) {
            if (chunkData[i] === 0) {
              nullIndex = i;
              break;
            }
          }

          const keyword = new TextDecoder().decode(
            chunkData.slice(0, nullIndex)
          );

          if (keyword === "chara") {
            // The rest is base64-encoded JSON
            let textStart = nullIndex + 1;

            // For iTXt, skip compression flag, method, and language tag
            if (chunkType === "iTXt") {
              textStart += 2; // compression flag & method
              // Skip language tag (null-terminated)
              while (textStart < chunkData.length && chunkData[textStart] !== 0)
                textStart++;
              textStart++; // Skip null
              // Skip translated keyword (null-terminated)
              while (textStart < chunkData.length && chunkData[textStart] !== 0)
                textStart++;
              textStart++; // Skip null
            }

            const base64Text = new TextDecoder().decode(
              chunkData.slice(textStart)
            );

            try {
              // Decode base64 and parse JSON
              const jsonText = atob(base64Text.trim());
              embeddedJson = JSON.parse(jsonText);
            } catch {
              // Try direct parse (might not be base64)
              try {
                embeddedJson = JSON.parse(base64Text.trim());
              } catch {
                // Failed to parse
              }
            }
            break;
          }
        }

        offset += length + 4; // Skip data and CRC

        if (chunkType === "IEND") break;
      }

      // Convert to base64 for preview
      const base64 = btoa(
        bytes.reduce((data, byte) => data + String.fromCharCode(byte), "")
      );
      const base64Image = `data:image/png;base64,${base64}`;

      resolve({ embeddedJson, base64Image });
    };

    reader.onerror = () => resolve({});
    reader.readAsArrayBuffer(file);
  });
}

function tryParseJSON(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function extractZipContent(
  file: File
): Promise<Partial<ExtractedFile>> {
  try {
    const zip = await JSZip.loadAsync(file);
    const contents: ZipContents = {};
    const fileList: string[] = [];

    for (const [filename, zipEntry] of Object.entries(zip.files)) {
      if (!zipEntry.dir) {
        fileList.push(filename);
        const ext = filename.split(".").pop()?.toLowerCase() || "";

        if (
          [
            "json",
            "txt",
            "xml",
            "html",
            "css",
            "js",
            "md",
            "yaml",
            "yml",
          ].includes(ext)
        ) {
          const text = await zipEntry.async("text");
          contents[filename] = {
            type: "text",
            extension: ext,
            size: text.length,
            content: text,
            parsed: ext === "json" ? tryParseJSON(text) : undefined,
          };
        } else if (["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext)) {
          const base64 = await zipEntry.async("base64");
          contents[filename] = {
            type: "image",
            extension: ext,
            size: base64.length,
            content: `data:image/${
              ext === "jpg" ? "jpeg" : ext
            };base64,${base64}`,
          };
        } else {
          contents[filename] = {
            type: "binary",
            extension: ext,
            size: 0,
            content: "[Binary file - not extracted]",
          };
        }
      }
    }

    return {
      isArchive: true,
      archiveType: file.name.split(".").pop()?.toLowerCase(),
      totalFiles: fileList.length,
      fileList,
      contents,
    };
  } catch (error) {
    return {
      isArchive: false,
      error: "Failed to extract: " + (error as Error).message,
    };
  }
}

// Extract only metadata from ZIP files (no content)
export async function extractZipMetadata(
  file: File
): Promise<Partial<ExtractedFile>> {
  try {
    const zip = await JSZip.loadAsync(file);
    const fileList: string[] = [];
    const contents: ZipMetadataContents = {};

    for (const [filename, zipEntry] of Object.entries(zip.files)) {
      if (!zipEntry.dir) {
        fileList.push(filename);
        const ext = filename.split(".").pop()?.toLowerCase() || "";
        const size =
          (zipEntry as unknown as { _data?: { uncompressedSize?: number } })
            ._data?.uncompressedSize || 0;

        // Determine file type based on extension
        let fileType: "text" | "image" | "binary" = "binary";
        if (
          [
            "json",
            "txt",
            "xml",
            "html",
            "css",
            "js",
            "md",
            "yaml",
            "yml",
          ].includes(ext)
        ) {
          fileType = "text";
        } else if (["png", "jpg", "jpeg", "gif", "webp", "bmp"].includes(ext)) {
          fileType = "image";
        }

        contents[filename] = {
          type: fileType,
          extension: ext,
          size: size,
        };
      }
    }

    return {
      isArchive: true,
      archiveType: file.name.split(".").pop()?.toLowerCase(),
      totalFiles: fileList.length,
      fileList,
      contents,
    };
  } catch (error) {
    return {
      isArchive: false,
      error: "Failed to read metadata: " + (error as Error).message,
    };
  }
}

export function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
}

export function parseCSV(content: string): Record<string, string>[] {
  const lines = content.trim().split("\n");
  if (lines.length === 0) return [];

  const headers = lines[0]
    .split(",")
    .map((h) => h.trim().replace(/^"|"$/g, ""));
  const data: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i]
      .split(",")
      .map((v) => v.trim().replace(/^"|"$/g, ""));
    const row: Record<string, string> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    data.push(row);
  }

  return data;
}

export function parseXML(content: string): unknown {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(content, "text/xml");

  function xmlToObj(node: Node): unknown {
    const obj: Record<string, unknown> = {};

    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      return text || null;
    }

    if ((node as Element).attributes) {
      for (const attr of Array.from((node as Element).attributes)) {
        obj["@" + attr.name] = attr.value;
      }
    }

    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const text = child.textContent?.trim();
        if (text) {
          if (Object.keys(obj).length === 0) {
            return text;
          }
          obj["#text"] = text;
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const childObj = xmlToObj(child);
        if (obj[child.nodeName]) {
          if (!Array.isArray(obj[child.nodeName])) {
            obj[child.nodeName] = [obj[child.nodeName]];
          }
          (obj[child.nodeName] as unknown[]).push(childObj);
        } else {
          obj[child.nodeName] = childObj;
        }
      }
    }

    return Object.keys(obj).length ? obj : null;
  }

  return xmlToObj(xmlDoc.documentElement);
}

export function parseContent(content: string, ext: string): unknown {
  try {
    switch (ext) {
      case "json":
        return JSON.parse(content);
      case "csv":
        return parseCSV(content);
      case "xml":
        return parseXML(content);
      default:
        return null;
    }
  } catch {
    return null;
  }
}
