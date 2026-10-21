'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { StackShell } from '@/components/shells/StackShell';
import { OtpInput } from '@/components/ui/OtpInput';
import { Button } from '@/components/ui/Button';
import { Banner } from '@/components/ui/Banner';

export default function VerificationPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('farmer');
  const [displayName, setDisplayName] = useState('');
  const [otp, setOtp] = useState('');
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    const storedPhone = sessionStorage.getItem('auth_phone');
    const storedRole = sessionStorage.getItem('auth_role') || 'farmer';
    const storedName = sessionStorage.getItem('auth_name') || '';
    const storedDebug = sessionStorage.getItem('auth_debug_code');

    if (!storedPhone) {
      router.replace('/masuk');
      return;
    }

    setPhone(storedPhone);
    setRole(storedRole);
    setDisplayName(storedName);
    if (storedDebug) setDebugCode(storedDebug);
  }, [router]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setError('Silakan masukkan 6 digit kode masuk');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phone,
          code: otp,
          role,
          displayName,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || 'Kode verifikasi tidak sesuai');
        setIsLoading(false);
        return;
      }

      // Clear auth intent
      sessionStorage.removeItem('auth_phone');
      sessionStorage.removeItem('auth_debug_code');

      // Navigate to destination
      router.push(data.redirectTo || '/katalog');
    } catch {
      setError('Terjadi kendala jaringan. Silakan coba kembali.');
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setResendSuccess(false);

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phone, purpose: 'login' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || 'Gagal mengirim ulang kode');
        return;
      }

      if (data.debugCode) {
        setDebugCode(data.debugCode);
      }
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 4000);
    } catch {
      setError('Gagal menghubungi server untuk mengirim ulang');
    }
  };

  return (
    <StackShell
      title="Verifikasi Masuk"
      backHref="/masuk"
      actionDock={
        <Button
          type="button"
          size="lg"
          isLoading={isLoading}
          loadingText="Memverifikasi Akun..."
          icon="lock_open"
          onClick={handleVerify}
          disabled={otp.length !== 6}
        >
          Verifikasi & Masuk
        </Button>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Step indicator */}
        <div className="flex items-center justify-between pb-2">
          <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">
            Langkah 2 dari 2
          </span>
          <span className="font-label-sm text-label-sm text-on-surface-variant">Konfirmasi OTP</span>
        </div>

        {/* Target Phone Card */}
        <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-fixed/40 text-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">chat</span>
            </div>
            <div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">Kode dikirimkan ke WhatsApp:</div>
              <div className="font-headline-sm text-headline-sm text-on-surface">
                +62 {phone.startsWith('0') ? phone.slice(1) : phone}
              </div>
            </div>
          </div>
          <Link
            href="/masuk"
            className="text-primary font-label-md text-label-md hover:underline px-2 py-1"
          >
            Ubah
          </Link>
        </div>

        {/* Developer / Demo OTP helper pill */}
        {debugCode && (
          <div className="bg-secondary-fixed/50 text-on-secondary-fixed p-3 rounded-xl flex items-center justify-between font-label-sm">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              <span>Kode Dev/Console: <strong>{debugCode}</strong></span>
            </span>
            <button
              type="button"
              onClick={() => setOtp(debugCode)}
              className="text-primary underline font-bold px-1"
            >
              Tempel Kode
            </button>
          </div>
        )}

        {resendSuccess && (
          <Banner
            variant="success"
            title="Kode Baru Terkirim"
            description="Kode verifikasi baru telah dikirimkan ke pesan WhatsApp Anda."
          />
        )}

        {/* 6 Real OTP input boxes */}
        <div className="pt-2">
          <OtpInput
            value={otp}
            onChange={(val) => {
              setOtp(val);
              if (error) setError('');
            }}
            error={error}
            onResend={handleResend}
          />
        </div>

        <Banner
          variant="info"
          title="Tidak menerima pesan WhatsApp?"
          description="Pastikan koneksi internet ponsel Anda aktif dan nomor handphone terdaftar di WhatsApp. Jika masih terkendala, hubungi Admin melalui tombol bantuan di bawah."
        />
      </div>
    </StackShell>
  );
}
