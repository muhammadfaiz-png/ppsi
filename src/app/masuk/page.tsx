'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StackShell } from '@/components/shells/StackShell';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { Button } from '@/components/ui/Button';
import { Banner } from '@/components/ui/Banner';

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<'farmer' | 'buyer'>('farmer');
  const [phone, setPhone] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const clean = phone.replace(/\D/g, '');
    if (clean.length < 9) {
      setError('Harap masukkan nomor handphone yang valid (minimal 9 digit)');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: clean, purpose: 'login' }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Gagal mengirim kode masuk');
        setIsLoading(false);
        return;
      }

      // Store temporary auth intent in sessionStorage
      sessionStorage.setItem('auth_phone', clean);
      sessionStorage.setItem('auth_role', role);
      sessionStorage.setItem('auth_name', displayName || (role === 'farmer' ? 'Petani Way Kanan' : 'Pembeli'));
      if (data.debugCode) {
        sessionStorage.setItem('auth_debug_code', data.debugCode);
      }

      router.push('/verifikasi');
    } catch {
      setError('Terjadi kendala jaringan saat menghubungkan ke server');
      setIsLoading(false);
    }
  };

  return (
    <StackShell
      title="Masuk / Daftar"
      backHref="/"
      actionDock={
        <Button
          type="button"
          size="lg"
          isLoading={isLoading}
          loadingText="Mengirim Kode WhatsApp..."
          icon="send"
          onClick={handleSubmit}
        >
          Kirim Kode Masuk via WhatsApp
        </Button>
      }
      secondaryAction={
        <a
          href="https://wa.me/6281234567890?text=Halo%20Admin%2C%20saya%20butuh%20bantuan%20masuk%20Way%20Kanan%20Agro-Commerce"
          target="_blank"
          rel="noopener noreferrer"
          className="text-label-sm text-on-surface-variant hover:text-primary transition-colors inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-[16px]">support_agent</span>
          <span>Butuh bantuan pendaftaran? Hubungi Admin via WhatsApp</span>
        </a>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Step indicator */}
        <div className="flex items-center justify-between pb-2">
          <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
            Langkah 1 dari 2
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Pilih Peran & Nomor</span>
        </div>

        <div>
          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            Selamat Datang di Way Kanan Agro
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Masuk atau daftar tanpa perlu alamat email. Kode verifikasi akan dikirimkan langsung ke nomor WhatsApp Anda.
          </p>
        </div>

        {/* Role Cards (Radio selection) */}
        <div className="space-y-3">
          <label className="font-label-md text-label-md text-on-surface block">
            Daftar Sebagai <span className="text-error">*</span>
          </label>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Pilihan Peran">
            {/* Penjual */}
            <div
              role="radio"
              aria-checked={role === 'farmer'}
              onClick={() => setRole('farmer')}
              className={`p-4 rounded-xl cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                role === 'farmer'
                  ? 'bg-surface-container-low shadow-md ring-2 ring-primary'
                  : 'bg-surface-container-lowest shadow-sm hover:bg-surface-container-low/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-lg bg-primary-fixed/40 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">storefront</span>
                </span>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    role === 'farmer' ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'
                  }`}
                >
                  {role === 'farmer' && (
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  )}
                </span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Penjual</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                  Gapoktan, koperasi tani, atau pengepul hasil panen Way Kanan
                </p>
              </div>
            </div>

            {/* Pembeli */}
            <div
              role="radio"
              aria-checked={role === 'buyer'}
              onClick={() => setRole('buyer')}
              className={`p-4 rounded-xl cursor-pointer flex flex-col justify-between gap-3 transition-all ${
                role === 'buyer'
                  ? 'bg-surface-container-low shadow-md ring-2 ring-primary'
                  : 'bg-surface-container-lowest shadow-sm hover:bg-surface-container-low/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-10 h-10 rounded-lg bg-primary-fixed/40 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
                </span>
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    role === 'buyer' ? 'bg-primary text-on-primary' : 'bg-surface-container text-outline'
                  }`}
                >
                  {role === 'buyer' && (
                    <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check
                    </span>
                  )}
                </span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">Pembeli</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                  Industri, pabrik olahan, roastery, UMKM, atau pedagang grosir
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Name input */}
        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface block">
            Nama Lengkap / Nama Usaha <span className="text-on-surface-variant font-normal">(Opsional)</span>
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={role === 'farmer' ? 'Contoh: Gapoktan Makmur Jaya' : 'Contoh: Ibu Sri (UMKM Keripik)'}
            className="w-full h-[52px] px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-lg focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
          />
        </div>

        {/* Phone number input */}
        <div className="space-y-1.5">
          <label className="font-label-md text-label-md text-on-surface block">
            Nomor Handphone (WhatsApp) <span className="text-error">*</span>
          </label>
          <PhoneInput value={phone} onChange={setPhone} error={error} />
        </div>

        {/* Security & Scope Banner */}
        <Banner
          variant="info"
          title="Keamanan & Privasi Nomor"
          description="Gratis tanpa biaya perantara. Nomor handphone Anda hanya dipakai untuk mengirimkan kode masuk dan menghubungkan negosiasi di WhatsApp. Platform tidak memproses pembayaran."
        />
      </div>
    </StackShell>
  );
}
