import React from 'react';

export interface BannerProps {
  variant?: 'info' | 'warning' | 'error' | 'success';
  title?: string;
  description: React.ReactNode;
  icon?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const Banner: React.FC<BannerProps> = ({
  variant = 'info',
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  let containerStyles = 'bg-surface-container-low text-on-surface';
  let iconCircleStyles = 'bg-surface-container-high text-primary';
  let defaultIcon = 'info';

  switch (variant) {
    case 'info':
      containerStyles = 'bg-surface-container-low text-on-surface';
      iconCircleStyles = 'bg-primary-fixed/50 text-primary';
      defaultIcon = 'shield_person';
      break;
    case 'warning':
      containerStyles = 'bg-secondary-fixed/50 text-on-secondary-fixed';
      iconCircleStyles = 'bg-secondary-container text-on-secondary-container';
      defaultIcon = 'schedule';
      break;
    case 'error':
      containerStyles = 'bg-error-container text-on-error-container';
      iconCircleStyles = 'bg-error text-on-error';
      defaultIcon = 'error';
      break;
    case 'success':
      containerStyles = 'bg-surface-container-high text-on-surface';
      iconCircleStyles = 'bg-primary text-on-primary';
      defaultIcon = 'verified';
      break;
  }

  const iconName = icon || defaultIcon;

  return (
    <div
      role="alert"
      className={`rounded-xl p-space-md flex items-start gap-space-sm ${containerStyles} ${className}`}
    >
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${iconCircleStyles}`}
      >
        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
          {iconName}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        {title && <h4 className="font-label-md text-label-md mb-0.5">{title}</h4>}
        <div className="font-body-sm text-body-sm leading-snug">{description}</div>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className="mt-2 min-h-[48px] px-3 rounded-lg bg-surface-container-lowest text-primary font-label-sm inline-flex items-center gap-1 shadow-sm hover:underline"
          >
            <span>{action.label}</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        )}
      </div>
    </div>
  );
};
