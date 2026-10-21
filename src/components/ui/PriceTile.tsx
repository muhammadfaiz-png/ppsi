import React from 'react';
import { PriceDelta } from './PriceDelta';

export interface PriceTileProps {
  commodityName: string;
  grade: string;
  pricePerUnit: number;
  unit?: string;
  delta?: number;
  subdistrict?: string;
  isStale?: boolean;
  timeLabel?: string;
  className?: string;
  onClick?: () => void;
}

export const PriceTile: React.FC<PriceTileProps> = ({
  commodityName,
  grade,
  pricePerUnit,
  unit = 'kg',
  delta = 0,
  subdistrict,
  isStale = false,
  timeLabel = 'Hari ini',
  className = '',
  onClick,
}) => {
  const isToday = timeLabel.toLowerCase().includes('hari ini');

  return (
    <article
      onClick={onClick}
      className={`w-[210px] shrink-0 rounded-xl p-3.5 bg-surface-container-lowest shadow-sm flex flex-col justify-between cursor-pointer transition-all hover:shadow-md ${className}`}
    >
      <div>
        <div className="flex items-center justify-between gap-1 mb-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-label-sm text-label-sm ${
              isToday
                ? 'bg-secondary-fixed text-on-secondary-fixed'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">schedule</span>
            <span>{timeLabel}</span>
          </span>
          {subdistrict && (
            <span className="font-label-sm text-label-sm text-on-surface-variant truncate max-w-[80px]">
              {subdistrict}
            </span>
          )}
        </div>

        <h4 className="font-headline-sm text-headline-sm text-on-surface truncate">{commodityName}</h4>
        <p className="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">{grade}</p>
      </div>

      <div className="mt-3 pt-2 border-t border-surface-container-high">
        <div className="flex items-baseline justify-between gap-1">
          <div className="font-headline-md text-headline-md text-primary font-extrabold truncate">
            Rp {Number(pricePerUnit).toLocaleString('id-ID')}
            <span className="font-label-sm text-label-sm text-on-surface-variant font-normal"> /{unit}</span>
          </div>
        </div>
        <div className="mt-1 flex items-center justify-between">
          <PriceDelta delta={delta} />
          {isStale && (
            <span className="inline-flex items-center gap-0.5 text-secondary font-label-sm text-label-sm">
              <span className="material-symbols-outlined text-[14px]">warning</span>
              <span>Kedaluwarsa</span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
