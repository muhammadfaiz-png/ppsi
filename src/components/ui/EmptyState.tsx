import React from 'react';

export interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'search_off',
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`py-12 px-margin text-center flex flex-col items-center justify-center max-w-sm mx-auto ${className}`}
    >
      <div className="w-20 h-20 rounded-full bg-surface-container-low text-on-surface-variant flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[44px]">{icon}</span>
      </div>
      <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1">{title}</h3>
      <p className="font-body-md text-body-md text-on-surface-variant mb-6">{description}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="min-h-[48px] px-space-lg rounded-xl bg-surface-container-high text-primary font-label-md inline-flex items-center gap-2 hover:bg-surface-container-highest transition-colors active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">restart_alt</span>
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
};
