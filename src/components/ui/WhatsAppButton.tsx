import React from 'react';

export interface WhatsAppButtonProps {
  listingId?: number | string;
  href?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
  size?: 'default' | 'sm';
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  listingId,
  href,
  onClick,
  label = 'Hubungi Petani (WA)',
  className = '',
  size = 'default',
}) => {
  const targetHref = href || (listingId ? `/go/wa/${listingId}` : '#');
  const sizeClass = size === 'sm' ? 'min-h-[48px] px-space-md text-label-md' : 'w-full min-h-[52px] px-space-lg text-label-lg';

  return (
    <a
      href={targetHref}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
      className={`rounded-xl bg-[#25D366] text-on-surface font-label-lg flex items-center justify-center gap-space-sm shadow-sm active:scale-[0.98] transition-all hover:brightness-95 ${sizeClass} ${className}`}
    >
      <span className="material-symbols-outlined text-[24px] text-on-surface shrink-0" aria-hidden="true">
        chat
      </span>
      <span className="truncate">{label}</span>
    </a>
  );
};
