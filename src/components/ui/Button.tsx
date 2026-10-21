import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'quickAction';
  size?: 'default' | 'sm' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  icon?: string;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'default',
  isLoading = false,
  loadingText,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-label-md transition-all active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none rounded-xl';

  let variantStyles = '';
  switch (variant) {
    case 'primary':
      variantStyles = 'bg-primary text-on-primary font-label-lg shadow-md hover:bg-primary-container';
      break;
    case 'secondary':
      variantStyles = 'bg-surface-container-high text-primary hover:bg-surface-container-highest';
      break;
    case 'tertiary':
      variantStyles = 'bg-surface-container-lowest text-primary shadow-sm hover:bg-surface-container-low';
      break;
    case 'danger':
      variantStyles = 'bg-error text-on-error font-label-md hover:opacity-90';
      break;
    case 'quickAction':
      variantStyles = 'min-h-[48px] rounded-lg bg-surface-container-low text-primary text-label-sm flex-col gap-1 p-2 hover:bg-surface-container';
      break;
  }

  let sizeStyles = 'min-h-[52px] px-space-lg';
  if (size === 'sm') sizeStyles = 'min-h-[48px] px-space-md text-label-sm';
  if (size === 'lg') sizeStyles = 'w-full min-h-[54px] px-space-xl text-label-lg';

  return (
    <button
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-space-sm">
          <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
          <span>{loadingText || 'Memproses...'}</span>
        </span>
      ) : (
        <span className="flex items-center justify-center gap-space-sm">
          {icon && (
            <span className="material-symbols-outlined text-[20px] shrink-0" aria-hidden="true">
              {icon}
            </span>
          )}
          <span>{children}</span>
        </span>
      )}
    </button>
  );
};
