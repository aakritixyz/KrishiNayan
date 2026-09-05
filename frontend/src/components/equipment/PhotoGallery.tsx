"use client";

import { AlertCircle } from "lucide-react";
import { useState } from "react";

type PhotoGalleryProps = {
  photos: string[];
  alt: string;
};

export default function PhotoGallery({ photos, alt }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="mt-5 rounded-[22px] bg-white p-2">
        <div className="flex aspect-video w-full items-center justify-center rounded-xl bg-forest/5 text-muted">
          <AlertCircle size={48} />
        </div>
      </div>
    );
  }

  return (
    <div className="mt-5 rounded-[22px] bg-white p-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-forest/5">
        <img
          src={photos[activeIndex]}
          alt={`${alt} - photo ${activeIndex + 1}`}
          className="h-full w-full object-cover"
        />
        {photos.length > 1 && (
          <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
            {photos.map((_, index) => (
              <button
                key={index}
                type="button"
                aria-label={`Show photo ${index + 1}`}
                onClick={() => setActiveIndex(index)}
                className={`h-1.5 rounded-full transition-all ${
                  index === activeIndex ? "w-5 bg-leaf" : "w-1.5 bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
        <span className="absolute right-2 top-2 rounded-full bg-forest-deep/70 px-2 py-0.5 text-[11px] font-semibold text-white">
          {activeIndex + 1}/{photos.length}
        </span>
      </div>

      {photos.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto">
          {photos.map((photo, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={`View photo ${index + 1}`}
              className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition ${
                index === activeIndex ? "border-leaf" : "border-transparent opacity-70"
              }`}
            >
              <img src={photo} alt={`${alt} thumbnail ${index + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
