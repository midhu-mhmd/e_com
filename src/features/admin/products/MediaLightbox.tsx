import React, { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ExternalLink, Play } from "lucide-react";

export interface MediaItem {
  id: number;
  type: "image" | "video";
  src: string;
  title?: string;
}

interface Props {
  items: MediaItem[];
  index: number;
  onClose: () => void;
  onChange: (index: number) => void;
}

function getEmbedUrl(url: string): string | null {
  const ytMatch = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  return null;
}

const MediaLightbox: React.FC<Props> = ({ items, index, onClose, onChange }) => {
  const item = items[index];
  const hasPrev = index > 0;
  const hasNext = index < items.length - 1;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onChange(index - 1);
      if (e.key === "ArrowRight" && hasNext) onChange(index + 1);
    },
    [onClose, onChange, index, hasPrev, hasNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  const renderMedia = () => {
    if (item.type === "image") {
      return (
        <img
          src={item.src}
          alt={item.title || "Media"}
          className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-2xl"
        />
      );
    }

    const embedUrl = getEmbedUrl(item.src);
    if (embedUrl) {
      return (
        <iframe
          src={embedUrl}
          className="w-full aspect-video max-w-3xl rounded-xl shadow-2xl"
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
      );
    }

    // Direct video file
    return (
      <video
        src={item.src}
        controls
        autoPlay
        className="max-w-full max-h-[75vh] rounded-xl shadow-2xl"
      />
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/92 flex items-center justify-center p-4 md:p-8"
      onClick={onClose}
    >
      <div
        className="relative flex flex-col items-center gap-4   w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar */}
        <div className="flex items-center justify-between w-full">
          <p className="text-white/60 text-xs font-medium truncate">
            {item.title || (item.type === "image" ? "Image" : "Video")}
            <span className="ml-2 opacity-50">
              {index + 1} / {items.length}
            </span>
          </p>
          <div className="flex items-center gap-1">
            <a
              href={item.src}
              target="_blank"
              rel="noreferrer"
              className="text-white/50 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Open original"
            >
              <ExternalLink size={15} />
            </a>
            <button
              onClick={onClose}
              className="text-white/50 hover:text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Media + nav arrows */}
        <div className="relative flex items-center justify-center w-full">
          {hasPrev && (
            <button
              onClick={() => onChange(index - 1)}
              className="absolute left-0 -translate-x-3 z-10 bg-black/60 hover:bg-black text-white p-2.5 rounded-full transition-colors shadow-lg"
            >
              <ChevronLeft size={22} />
            </button>
          )}
          {renderMedia()}
          {hasNext && (
            <button
              onClick={() => onChange(index + 1)}
              className="absolute right-0 translate-x-3 z-10 bg-black/60 hover:bg-black text-white p-2.5 rounded-full transition-colors shadow-lg"
            >
              <ChevronRight size={22} />
            </button>
          )}
        </div>

        {/* Thumbnail strip */}
        {items.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 max-w-full">
            {items.map((it, i) => (
              <button
                key={it.id}
                onClick={() => onChange(i)}
                className={`w-14 h-14 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                  i === index
                    ? "border-white"
                    : "border-transparent opacity-50 hover:opacity-100"
                }`}
              >
                {it.type === "image" ? (
                  <img src={it.src} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-zinc-700 flex items-center justify-center">
                    <Play size={16} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaLightbox;
