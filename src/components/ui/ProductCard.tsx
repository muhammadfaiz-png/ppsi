import React from 'react';
import Link from 'next/link';
import { WhatsAppButton } from './WhatsAppButton';

export interface ProductCardProps {
  id: number | string;
  title: string;
  organizationName: string;
  subdistrict: string;
  pricePerUnit: number;
  unit?: string;
  stockQuantity: number;
  minOrder?: number;
  photoUrl?: string;
  isVerified?: boolean;
  status?: string;
  variant?: 'catalog' | 'featured' | 'seller';
  lastStockConfirmedDaysAgo?: number;
  onEdit?: () => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  organizationName,
  subdistrict,
  pricePerUnit,
  unit = 'kg',
  stockQuantity,
  minOrder,
  photoUrl,
  isVerified = true,
  status = 'active',
  variant = 'catalog',
  lastStockConfirmedDaysAgo,
  onEdit,
  className = '',
}) => {
  const defaultImage = '/images/products/placeholder.jpg';
  const displayImage = photoUrl || defaultImage;
  const isPendingConfirmation = status === 'pending_confirmation';
  const isSoldOut = status === 'sold_out';

  // Ton equivalent calculation (1 Ton = 1000 kg)
  let tonEquivalentText = '';
  if (unit.toLowerCase() === 'kg') {
    const tonPrice = Number(pricePerUnit) * 1000;
    tonEquivalentText = `(± Rp ${tonPrice.toLocaleString('id-ID')} / Ton)`;
  }

  // Large Featured variant (Home page hero cards)
  if (variant === 'featured') {
    return (
      <article
        className={`bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md transition-all hover:shadow-md ${className}`}
      >
        <Link href={`/komoditas/${id}`} className="block relative overflow-hidden rounded-xl">
          <div className="h-44 w-full bg-surface-container relative">
            <img
              src={displayImage}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            {isVerified && (
              <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 bg-primary text-on-primary px-2.5 py-1 rounded-full font-label-sm text-label-sm shadow">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <span>Petani Terverifikasi</span>
              </span>
            )}
            <span className="absolute bottom-2.5 right-2.5 bg-inverse-surface/85 text-inverse-on-surface px-2 py-0.5 rounded-md font-label-sm text-[12px]">
              Stok: {Number(stockQuantity).toLocaleString('id-ID')} Ton
            </span>
          </div>
        </Link>

        <div>
          <Link href={`/komoditas/${id}`}>
            <h3 className="font-headline-sm text-headline-sm text-on-surface hover:text-primary transition-colors line-clamp-1">
              {title}
            </h3>
          </Link>
          <p className="font-body-sm text-body-sm font-semibold text-on-surface truncate mt-0.5">
            {organizationName}
          </p>
          <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-0.5 mt-0.5">
            <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
            <span>{subdistrict}, Way Kanan</span>
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 bg-surface-container-low/70 rounded-lg p-2.5">
          <div>
            <div className="font-label-sm text-[12px] text-on-surface-variant">Harga Indikasi</div>
            <div className="font-headline-sm text-headline-sm text-primary font-bold">
              Rp {Number(pricePerUnit).toLocaleString('id-ID')}
              <span className="font-label-sm text-on-surface-variant font-normal"> /{unit}</span>
            </div>
          </div>
          <div>
            <div className="font-label-sm text-[12px] text-on-surface-variant">Min. Order</div>
            <div className="font-headline-sm text-headline-sm text-on-surface font-bold">
              {minOrder ? `${minOrder} ${unit === 'kg' ? 'Ton' : 'Unit'}` : 'Nego'}
            </div>
          </div>
        </div>

        {isPendingConfirmation && (
          <div className="bg-secondary-fixed/50 text-on-secondary-fixed px-3 py-1.5 rounded-lg font-label-sm text-label-sm flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[16px]">schedule</span>
            <span>Menunggu Konfirmasi Stok</span>
          </div>
        )}

        <WhatsAppButton listingId={id} />
      </article>
    );
  }

  // Standard Catalog variant
  return (
    <article
      className={`bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md transition-all hover:shadow-md ${className}`}
    >
      <div className="flex gap-space-md">
        <Link href={`/komoditas/${id}`} className="shrink-0">
          <div className="w-24 h-24 rounded-lg bg-surface-container overflow-hidden relative">
            <img
              src={displayImage}
              alt={title}
              loading="lazy"
              className="w-full h-full object-cover"
            />
            {isSoldOut && (
              <div className="absolute inset-0 bg-inverse-surface/60 flex items-center justify-center">
                <span className="font-label-sm text-[12px] text-white bg-error px-1.5 py-0.5 rounded">
                  Habis
                </span>
              </div>
            )}
          </div>
        </Link>

        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {isVerified && (
                <span className="inline-flex items-center gap-1 bg-[#E8F5E9] text-[#1E7E34] px-2 py-0.5 rounded-full font-label-sm text-[12px]">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    verified
                  </span>
                  <span>Terverifikasi</span>
                </span>
              )}
              {isPendingConfirmation && (
                <span className="inline-flex items-center gap-1 bg-secondary-fixed text-on-secondary-fixed px-2 py-0.5 rounded-full font-label-sm text-[12px]">
                  <span className="material-symbols-outlined text-[14px]">schedule</span>
                  <span>Tinjau Stok</span>
                </span>
              )}
            </div>

            <Link href={`/komoditas/${id}`}>
              <h3 className="font-headline-sm text-headline-sm text-on-surface truncate mt-1 hover:text-primary transition-colors">
                {title}
              </h3>
            </Link>
            <p className="font-body-sm text-body-sm font-semibold text-on-surface truncate mt-0.5">
              {organizationName}
            </p>
            <p className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-0.5 mt-0.5">
              <span className="material-symbols-outlined text-[14px] text-primary">location_on</span>
              <span>{subdistrict}, Way Kanan</span>
            </p>
          </div>

          <div className="flex items-baseline justify-between mt-2 pt-1 border-t border-surface-container-high/60">
            <div>
              <span className="font-headline-md text-headline-md text-primary font-extrabold">
                Rp {Number(pricePerUnit).toLocaleString('id-ID')}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant font-normal"> /{unit}</span>
            </div>
            <span className="font-label-md text-label-md bg-surface-container-high px-2 py-0.5 rounded-md shrink-0">
              Stok: {Number(stockQuantity).toLocaleString('id-ID')} Ton
            </span>
          </div>
        </div>
      </div>

      {variant === 'seller' ? (
        <div className="flex gap-2">
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 min-h-[48px] rounded-xl bg-surface-container-high text-primary font-label-md inline-flex items-center justify-center gap-1"
            >
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span>Edit Listing</span>
            </button>
          )}
          <Link
            href={`/komoditas/${id}`}
            className="flex-1 min-h-[48px] rounded-xl bg-surface-container-lowest text-primary border border-surface-container-high font-label-md inline-flex items-center justify-center gap-1"
          >
            <span className="material-symbols-outlined text-[18px]">visibility</span>
            <span>Lihat Publik</span>
          </Link>
        </div>
      ) : (
        <WhatsAppButton listingId={id} />
      )}
    </article>
  );
};
