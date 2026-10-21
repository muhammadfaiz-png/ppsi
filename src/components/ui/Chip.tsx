import React from 'react';

export interface ChipProps {
  label: string;
  icon?: string;
  active?: boolean;
  onRemove?: () => void;
  onClick?: () => void;
  count?: number;
  className?: string;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  icon,
  active = false,
  onRemove,
  onClick,
  count,
  className = '',
}) => {
  // If it's a removable filter chip (capsule style)
  if (onRemove) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 pl-3 pr-1.5 py-1 min-h-[48px] rounded-full bg-surface-container-lowest text-on-surface text-label-md font-semibold shadow-sm transition-all ${className}`}
      >
        <span>{label}</span>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-surface-container text-on-surface-variant transition-colors"
          aria-label={`Hapus filter ${label}`}
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      </span>
    );
  }

  // Standard category / filter chip
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[48px] px-4 rounded-xl inline-flex items-center justify-center gap-2 font-label-md transition-all active:scale-95 ${
        active
          ? 'bg-primary text-on-primary shadow-md'
          : 'bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container-low'
      } ${className}`}
    >
      {icon && (
        <span
          className="material-symbols-outlined text-[20px] shrink-0"
          style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
        >
          {icon}
        </span>
      )}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`ml-1 px-1.5 py-0.5 rounded-full text-label-sm ${
            active ? 'bg-primary-container text-on-primary-container' : 'bg-surface-container-high text-on-surface-variant'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
