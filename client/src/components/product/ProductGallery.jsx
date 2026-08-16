import { useState } from "react";
import { ImageOff, ChevronLeft, ChevronRight } from "lucide-react";

const ProductGallery = ({ images = [], productName = "Product" }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [imgError, setImgError] = useState({});

  const hasImages = images.length > 0;

  const goPrev = () =>
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const goNext = () =>
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="flex flex-col gap-3">
      {/* Main image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-border bg-muted">
        {hasImages && !imgError[activeIndex] ? (
          <img
            src={images[activeIndex]}
            alt={`${productName} — view ${activeIndex + 1}`}
            onError={() => setImgError((prev) => ({ ...prev, [activeIndex]: true }))}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-10 w-10 text-ink-300" />
          </div>
        )}

        {images.length > 1 && (
          <>
            <button
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
            >
              <ChevronLeft className="h-4 w-4 text-ink-700" />
            </button>
            <button
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow-sm hover:bg-white"
            >
              <ChevronRight className="h-4 w-4 text-ink-700" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActiveIndex(i)}
              className={`h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === activeIndex ? "border-brand-600" : "border-transparent"
              }`}
            >
              {!imgError[i] ? (
                <img
                  src={img}
                  alt={`${productName} thumbnail ${i + 1}`}
                  onError={() => setImgError((prev) => ({ ...prev, [i]: true }))}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <ImageOff className="h-4 w-4 text-ink-300" />
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
