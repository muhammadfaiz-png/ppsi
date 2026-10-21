import React from 'react';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  count?: number;
  icon?: string;
}

export interface SegmentedControlProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  name?: string;
}

export function SegmentedControl<T extends string = string>({
  options,
  value,
  onChange,
  className = '',
  name,
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={name}
      className={`p-1 bg-surface-container-high rounded-xl flex items-center gap-1 ${className}`}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={`flex-1 min-h-[48px] px-3 rounded-lg font-label-md inline-flex items-center justify-center gap-1.5 transition-all text-center ${
              isSelected
                ? 'bg-surface-container-lowest text-primary shadow-sm font-bold'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {option.icon && (
              <span className="material-symbols-outlined text-[18px] shrink-0">{option.icon}</span>
            )}
            <span className="truncate">{option.label}</span>
            {option.count !== undefined && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-label-sm ${
                  isSelected
                    ? 'bg-primary-fixed/50 text-on-primary-fixed-variant'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {option.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
