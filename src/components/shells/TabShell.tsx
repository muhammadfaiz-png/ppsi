'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export interface TabShellProps {
  children: React.ReactNode;
  user?: {
    id?: number;
    userId?: number;
    displayName: string;
    role: string;
  } | null;
  activeTab?: 'home' | 'catalog' | 'prices' | 'account' | 'dashboard';
}

export const TabShell: React.FC<TabShellProps> = ({
  children,
  user,
  activeTab,
}) => {
  const pathname = usePathname();

  // Determine active tab if not explicitly passed
  let currentTab = activeTab;
  if (!currentTab) {
    if (pathname === '/' || pathname === '/beranda') currentTab = 'home';
    else if (pathname?.startsWith('/katalog')) currentTab = 'catalog';
    else if (pathname?.startsWith('/harga')) currentTab = 'prices';
    else if (pathname?.startsWith('/dashboard')) currentTab = 'dashboard';
    else if (pathname?.startsWith('/akun')) currentTab = 'account';
    else currentTab = 'home';
  }

  const isFarmer = user?.role === 'farmer';

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col min-h-screen">
      {/* Header tab */}
      <header className="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(27,46,30,0.06)] pt-safe">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm max-w-2xl mx-auto w-full">
          <Link href="/" className="flex items-center gap-space-sm min-w-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                agriculture
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight truncate leading-tight">
                Way Kanan Agro
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant truncate leading-none">
                Kab. Way Kanan, Lampung
              </span>
            </div>
          </Link>

          <div>
            {user ? (
              <Link
                href={isFarmer ? '/dashboard' : '/akun/profil'}
                className="min-h-[48px] px-2.5 rounded-xl bg-surface-container-high text-primary font-label-md flex items-center gap-2 hover:bg-surface-container-highest transition-colors"
                aria-label="Profil Akun"
              >
                <div className="w-7 h-7 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                  {user.displayName.charAt(0).toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate text-label-sm font-semibold hidden sm:inline">
                  {user.displayName.split(' ')[0]}
                </span>
              </Link>
            ) : (
              <Link
                href="/masuk"
                className="min-h-[48px] px-space-md rounded-xl bg-surface-container-high text-primary font-label-md flex items-center hover:bg-surface-container-highest transition-colors"
              >
                Masuk
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="pt-20 pb-28 min-h-screen px-margin max-w-2xl mx-auto w-full flex flex-col flex-1">
        {children}
      </main>

      {/* FAB "+ Jual" for farmer only */}
      {isFarmer && (
        <Link
          href="/jual"
          className="fixed bottom-20 right-margin z-50 min-h-[52px] px-space-lg rounded-xl bg-secondary-container text-on-secondary-container font-label-lg text-label-lg shadow-[0_4px_14px_rgba(131,84,0,0.28)] flex items-center gap-2 transition-all active:scale-95 hover:brightness-105"
        >
          <span className="material-symbols-outlined text-[24px]">add_circle</span>
          <span>+ Jual</span>
        </Link>
      )}

      {/* Bottom Navigation (4 tabs) */}
      <nav
        aria-label="Navigasi Utama"
        className="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(27,46,30,0.08)]"
      >
        <div className="h-16 px-gutter-sm flex items-center justify-around max-w-2xl mx-auto w-full">
          {/* Tab 1: Beranda */}
          <Link
            href="/"
            aria-current={currentTab === 'home' ? 'page' : undefined}
            className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-space-xs transition-colors ${
              currentTab === 'home'
                ? 'text-primary font-bold bg-primary-fixed/30'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={currentTab === 'home' ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              home
            </span>
            <span className="font-label-sm text-label-sm leading-none">Beranda</span>
          </Link>

          {/* Tab 2: Katalog */}
          <Link
            href="/katalog"
            aria-current={currentTab === 'catalog' ? 'page' : undefined}
            className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-space-xs transition-colors ${
              currentTab === 'catalog'
                ? 'text-primary font-bold bg-primary-fixed/30'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={currentTab === 'catalog' ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              grid_view
            </span>
            <span className="font-label-sm text-label-sm leading-none">Katalog</span>
          </Link>

          {/* Tab 3: Harga */}
          <Link
            href="/harga"
            aria-current={currentTab === 'prices' ? 'page' : undefined}
            className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-space-xs transition-colors ${
              currentTab === 'prices'
                ? 'text-primary font-bold bg-primary-fixed/30'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className="material-symbols-outlined text-[22px]"
              style={currentTab === 'prices' ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              trending_up
            </span>
            <span className="font-label-sm text-label-sm leading-none">Harga</span>
          </Link>

          {/* Tab 4: Dashboard (Farmer) or Akun (Buyer/Guest) */}
          {isFarmer ? (
            <Link
              href="/dashboard"
              aria-current={currentTab === 'dashboard' ? 'page' : undefined}
              className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-space-xs transition-colors ${
                currentTab === 'dashboard'
                  ? 'text-primary font-bold bg-primary-fixed/30'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={currentTab === 'dashboard' ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                storefront
              </span>
              <span className="font-label-sm text-label-sm leading-none">Dashboard</span>
            </Link>
          ) : (
            <Link
              href={user ? '/akun/profil' : '/masuk'}
              aria-current={currentTab === 'account' ? 'page' : undefined}
              className={`min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-space-xs transition-colors ${
                currentTab === 'account'
                  ? 'text-primary font-bold bg-primary-fixed/30'
                  : 'text-on-surface-variant hover:text-primary'
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px]"
                style={currentTab === 'account' ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                account_circle
              </span>
              <span className="font-label-sm text-label-sm leading-none">Akun</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
};
