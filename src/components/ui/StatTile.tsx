import React from 'react';

export interface StatTileProps {
  label: string;
  value: string | number;
  icon: string;
  sublabel?: string;
  className?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  icon,
  sublabel,
  className = '',
}) => {
  return (
    <div
      className={`bg-surface-container-lowest rounded-xl p-3.5 shadow-sm flex flex-col justify-between gap-2 ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="w-8 h-8 rounded-lg bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-[18px]">{icon}</span>
        </span>
        {sublabel && (
          <span className="text-label-sm font-semibold text-tertiary truncate">{sublabel}</span>
        )}
      </div>
      <div>
        <div className="font-headline-sm text-headline-sm text-on-surface font-extrabold truncate">
          {value}
        </div>
        <div className="font-body-sm text-body-sm text-on-surface-variant truncate mt-0.5">
          {label}
        </div>
      </div>
    </div>
  );
};
