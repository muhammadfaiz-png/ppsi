'use client';

import React, { useRef, useState } from 'react';
import imageCompression from 'browser-image-compression';

export interface PhotoSlotProps {
  photos: string[];
  onChange: (photos: string[]) => void;
  maxPhotos?: number;
  className?: string;
}

export const PhotoSlot: React.FC<PhotoSlotProps> = ({
  photos,
  onChange,
  maxPhotos = 3,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    setIsCompressing(true);
    const newPhotos: string[] = [];

    for (const file of filesToProcess) {
      try {
        const options = {
          maxSizeMB: 0.2, // < 200KB client compression
          maxWidthOrHeight: 1200,
          useWebWorker: true,
        };
        const compressedFile = await imageCompression(file, options);
        const dataUrl = await imageCompression.getDataUrlFromFile(compressedFile);
        newPhotos.push(dataUrl);
      } catch (err) {
        console.error('Gagal mengompresi gambar:', err);
      }
    }

    onChange([...photos, ...newPhotos]);
    setIsCompressing(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = (index: number) => {
    const updated = photos.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="grid grid-cols-3 gap-space-sm">
        {photos.map((src, idx) => (
          <div
            key={idx}
            className="aspect-square rounded-xl bg-surface-container relative overflow-hidden group shadow-sm"
          >
            <img
              src={src}
              alt={`Foto komoditas ${idx + 1}`}
              className="w-full h-full object-cover"
            />
            <span className="absolute top-1.5 left-1.5 bg-inverse-surface/85 text-inverse-on-surface font-label-sm text-[12px] px-1.5 py-0.5 rounded">
              {idx === 0 ? 'Utama' : `Foto ${idx + 1}`}
            </span>
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-error text-on-error flex items-center justify-center shadow"
              aria-label="Hapus foto"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
            <div className="absolute bottom-1.5 right-1.5 w-6 h-6 rounded-full bg-primary text-on-primary flex items-center justify-center shadow">
              <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                check
              </span>
            </div>
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            type="button"
            disabled={isCompressing}
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square rounded-xl bg-surface-container-low hover:bg-surface-container flex flex-col items-center justify-center gap-1 text-on-surface-variant transition-all active:scale-95 disabled:opacity-50"
          >
            {isCompressing ? (
              <span className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span className="material-symbols-outlined text-[28px] text-primary">add_a_photo</span>
                <span className="font-label-sm text-label-sm text-center px-1">Tambah Foto</span>
              </>
            )}
          </button>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
        <span className="material-symbols-outlined text-[14px]">bolt</span>
        Maksimal 3 foto. Foto otomatis dikompresi di browser (&lt;200KB) hemat kuota.
      </p>
    </div>
  );
};
