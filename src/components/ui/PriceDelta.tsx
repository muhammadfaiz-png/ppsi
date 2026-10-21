import React from 'react';

export interface PriceDeltaProps {
  delta: number;
  showPercent?: boolean;
  className?: string;
}

export const PriceDelta: React.FC<PriceDeltaProps> = ({ delta, showPercent = false, className = '' }) => {
  if (delta > 0) {
    return (
      <span className={`inline-flex items-center gap-0.5 text-tertiary font-label-sm ${className}`}>
        <span className="material-symbols-outlined text-[16px] text-tertiary shrink-0">arrow_upward</span>
        <span>+{Math.abs(delta).toLocaleString('id-ID')}{showPercent ? '%' : ''}</span>
      </span>
    );
  }

  if (delta < 0) {
    return (
      <span className={`inline-flex items-center gap-0.5 text-error font-label-sm ${className}`}>
        <span className="material-symbols-outlined text-[16px] text-error shrink-0">arrow_downward</span>
        <span>-{Math.abs(delta).toLocaleString('id-ID')}{showPercent ? '%' : ''}</span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-0.5 text-on-surface-variant font-label-sm ${className}`}>
      <span className="material-symbols-outlined text-[16px] text-on-surface-variant shrink-0">horizontal_rule</span>
      <span>Tetap</span>
    </span>
  );
};
