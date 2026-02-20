import { ChevronLeftIcon, ChevronRightIcon, XIcon } from "lucide-react";
import { useEffect } from "react";

import type { Image } from "@/schema";

interface ImagePreviewDialogProps {
  images: Image[];
  currentIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function ImagePreviewDialog({
  images,
  currentIndex,
  onClose,
  onNavigate,
}: ImagePreviewDialogProps) {
  const image = currentIndex !== null ? images[currentIndex] : null;

  useEffect(() => {
    if (currentIndex !== null) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [currentIndex]);

  useEffect(() => {
    if (currentIndex === null) return;

    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === "ArrowRight" && currentIndex < images.length - 1) {
        onNavigate(currentIndex + 1);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIndex, images.length, onClose, onNavigate]);

  if (currentIndex === null || !image) return null;

  const imgUrl = `/api/image/${image.id}/${image.filename}`;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/85 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-50 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
      >
        <XIcon className="size-5" />
      </button>

      {/* Prev button */}
      {hasPrev && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex - 1);
          }}
          className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeftIcon className="size-6" />
        </button>
      )}

      {/* Next button */}
      {hasNext && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate(currentIndex + 1);
          }}
          className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-2.5 text-white transition-colors hover:bg-white/20"
        >
          <ChevronRightIcon className="size-6" />
        </button>
      )}

      {/* Content */}
      <div
        className="relative z-50 flex max-w-screen-xl w-full flex-col items-center gap-4 px-20"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={image.id}
          src={imgUrl}
          alt={image.character || image.filename}
          className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
        />

        {/* Metadata */}
        <div className="flex flex-col items-center gap-1 text-center">
          {image.character && (
            <p className="text-white font-medium text-sm">{image.character}</p>
          )}
          <p className="text-white/60 text-sm">{image.filename}</p>
          {image.tags && (
            <p className="text-white/40 text-xs max-w-2xl line-clamp-2">
              {image.tags}
            </p>
          )}
        </div>

        {/* Counter */}
        <p className="text-white/30 text-xs">
          {currentIndex + 1} / {images.length}
        </p>
      </div>
    </div>
  );
}
