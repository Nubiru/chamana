'use client';

import { Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface ProductImageGalleryProps {
  images: string[];
  nombre: string;
  catColor: string;
}

export function ProductImageGallery({ images, nombre, catColor }: ProductImageGalleryProps) {
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);

  return (
    <div className="space-y-3">
      <div
        className="aspect-square earth-gradient rounded-2xl flex items-center justify-center relative overflow-hidden"
        style={{ '--cat-color': catColor } as React.CSSProperties}
      >
        {images.length > 0 ? (
          <Image
            src={images[selectedImageIdx]}
            alt={`${nombre} - Foto ${selectedImageIdx + 1}`}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain"
            priority
          />
        ) : (
          <div className="text-center">
            <Sparkles className="h-16 w-16 mx-auto text-foreground/10 mb-2" />
            <span className="text-7xl font-titles text-foreground/10">{nombre.charAt(0)}</span>
          </div>
        )}
      </div>

      {/* Thumbnail row */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={src}
              type="button"
              onClick={() => setSelectedImageIdx(idx)}
              className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                idx === selectedImageIdx
                  ? 'border-primary ring-1 ring-primary'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image
                src={src}
                alt={`${nombre} - Miniatura ${idx + 1}`}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
