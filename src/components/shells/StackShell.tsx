'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export interface StackShellProps {
  title: string;
  children: React.ReactNode;
  backHref?: string;
  onBack?: () => void;
  actions?: React.ReactNode;
  actionDock?: React.ReactNode;
  secondaryAction?: React.ReactNode;
}

export const StackShell: React.FC<StackShellProps> = ({
  title,
  children,
  backHref,
  onBack,
  actions,
  actionDock,
  secondaryAction,
}) => {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col min-h-screen">
      {/* Header Stack */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(27,46,30,0.06)] pt-safe">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm max-w-2xl mx-auto w-full">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleBack}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors active:scale-95"
              aria-label="Kembali ke halaman sebelumnya"
            >
              <span className="material-symbols-outlined text-[24px]">arrow_back</span>
            </button>
            <h1 className="font-headline-sm text-headline-sm text-on-surface truncate">
              {title}
            </h1>
          </div>

          {actions && <div className="flex items-center gap-1 shrink-0">{actions}</div>}
        </div>
      </header>

      {/* Main Content Area */}
      <main
        className={`pt-20 px-margin max-w-2xl mx-auto w-full flex flex-col flex-1 ${
          actionDock ? 'pb-36' : 'pb-12'
        }`}
      >
        {children}
      </main>

      {/* Sticky Action Dock */}
      {actionDock && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md px-margin py-3 pb-safe shadow-[0_-4px_16px_rgba(13,99,27,0.08)]">
          <div className="max-w-2xl mx-auto w-full flex flex-col gap-2">
            {actionDock}
            {secondaryAction && <div className="text-center">{secondaryAction}</div>}
          </div>
        </div>
      )}
    </div>
  );
};
