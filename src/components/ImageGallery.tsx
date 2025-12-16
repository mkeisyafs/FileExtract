import { useState } from "react";
import { Image, Download, X } from "lucide-react";
import type { ExtractionResult } from "../lib/fileUtils";

type ImageGalleryProps = {
  result: ExtractionResult;
};

type ImageItem = {
  filename: string;
  path: string;
  content: string;
  extension: string;
};

export function ImageGallery({ result }: ImageGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null);

  // Extract all images from the result
  const images: ImageItem[] = [];

  result.files.forEach((file) => {
    if (file.contents) {
      Object.entries(file.contents).forEach(([path, content]) => {
        if (content.type === "image" && "content" in content) {
          images.push({
            filename: file.filename,
            path,
            content: (content as { content: string }).content,
            extension: content.extension,
          });
        }
      });
    }
  });

  if (images.length === 0) {
    return null;
  }

  const downloadImage = (image: ImageItem) => {
    const link = document.createElement("a");
    link.href = image.content;
    link.download = image.path.split("/").pop() || `image.${image.extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadAllImages = () => {
    images.forEach((image, index) => {
      setTimeout(() => downloadImage(image), index * 200);
    });
  };

  return (
    <div className="card bg-base-200/50 border border-base-content/10 overflow-hidden mt-6">
      <div className="flex justify-between items-center px-6 py-4 bg-base-300/50 border-b border-base-content/10">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <Image className="w-5 h-5 text-secondary" />
          Images Found ({images.length})
        </h3>
        <button
          onClick={downloadAllImages}
          className="btn btn-secondary btn-sm gap-2"
        >
          <Download className="w-4 h-4" />
          Download All
        </button>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((image, index) => (
            <div
              key={`${image.filename}-${image.path}-${index}`}
              className="group relative bg-base-300 rounded-xl overflow-hidden aspect-square cursor-pointer hover:ring-2 hover:ring-primary transition-all"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.content}
                alt={image.path}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-xs text-white truncate">
                    {image.path.split("/").pop()}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  downloadImage(image);
                }}
                className="btn btn-circle btn-xs btn-ghost absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/50 hover:bg-primary"
              >
                <Download className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="modal modal-open"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="modal-box max-w-4xl bg-base-300 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={selectedImage.content}
              alt={selectedImage.path}
              className="w-full max-h-[70vh] object-contain"
            />
            <div className="p-4 flex justify-between items-center">
              <p className="text-sm truncate flex-1">{selectedImage.path}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => downloadImage(selectedImage)}
                  className="btn btn-primary btn-sm gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="btn btn-ghost btn-sm btn-circle"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
