'use client';

import React, { useEffect } from 'react';

export interface ToastProps {
  message: string;
  variant?: 'normal' | 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  variant = 'normal',
  isVisible,
  onClose,
  duration = 3000,
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible) return null;

  let bgStyles = 'bg-inverse-surface text-inverse-on-surface';
  let iconName = 'info';

  if (variant === 'success') {
    bgStyles = 'bg-primary text-on-primary';
    iconName = 'task_alt';
  } else if (variant === 'error') {
    bgStyles = 'bg-error text-on-error';
    iconName = 'error';
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed top-20 inset-x-margin z-50 max-w-sm mx-auto rounded-xl p-space-md shadow-xl flex items-center gap-space-sm animate-in fade-in slide-in-from-top-4 duration-200 ${bgStyles}`}
    >
      <span className="material-symbols-outlined text-[20px] shrink-0">{iconName}</span>
      <span className="font-body-md text-body-md flex-1">{message}</span>
      <button
        type="button"
        onClick={onClose}
        className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity"
        aria-label="Tutup notifikasi"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>
    </div>
  );
};
