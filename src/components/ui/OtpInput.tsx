'use client';

import React, { useRef, useState, useEffect } from 'react';

export interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
  error?: string;
  onResend?: () => void;
  resendCountdown?: number;
  adminHelpPhone?: string;
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  error,
  onResend,
  resendCountdown = 60,
  adminHelpPhone = '6281234567890',
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);
  const [countdown, setCountdown] = useState(resendCountdown);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const digits = value.padEnd(6, ' ').slice(0, 6).split('');

  const handleChange = (index: number, char: string) => {
    // Only accept numeric digit
    const clean = char.replace(/\D/g, '');
    if (!clean) {
      // Clear this digit
      const newChars = [...digits];
      newChars[index] = ' ';
      onChange(newChars.join('').trimEnd());
      return;
    }

    const lastChar = clean[clean.length - 1];
    const newChars = [...digits];
    newChars[index] = lastChar;
    const combined = newChars.join('').trimEnd();
    onChange(combined);

    // Auto-advance
    if (index < 5 && lastChar) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!digits[index] || digits[index] === ' ') {
        if (index > 0) {
          inputsRef.current[index - 1]?.focus();
        }
      } else {
        const newChars = [...digits];
        newChars[index] = ' ';
        onChange(newChars.join('').trimEnd());
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (paste) {
      onChange(paste);
      const nextIndex = Math.min(paste.length, 5);
      inputsRef.current[nextIndex]?.focus();
    }
  };

  const handleResendClick = () => {
    if (countdown === 0 && onResend) {
      onResend();
      setCountdown(resendCountdown);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2 max-w-sm mx-auto w-full">
        {[0, 1, 2, 3, 4, 5].map((idx) => {
          const val = digits[idx] === ' ' ? '' : digits[idx];
          return (
            <input
              key={idx}
              ref={(el) => {
                inputsRef.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={val}
              onChange={(e) => handleChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              onPaste={handlePaste}
              className={`flex-1 max-w-[50px] h-[58px] rounded-xl font-headline-xl text-center transition-all focus:outline-none ${
                error
                  ? 'bg-error-container/40 text-error focus:ring-2 focus:ring-error'
                  : 'bg-surface-container-lowest text-on-surface shadow-sm focus:ring-2 focus:ring-primary focus:bg-surface-container'
              }`}
            />
          );
        })}
      </div>

      {error && (
        <div className="flex items-center justify-center gap-1.5 text-error font-body-sm text-center">
          <span className="material-symbols-outlined text-[16px]">error</span>
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col items-center gap-3 mt-2">
        {countdown > 0 ? (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm">
            <span className="material-symbols-outlined text-[16px]">timer</span>
            <span>Kirim ulang kode dalam {countdown} detik</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleResendClick}
            className="min-h-[48px] px-4 rounded-xl text-primary font-label-md hover:bg-surface-container-high transition-colors active:scale-95 inline-flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">replay</span>
            <span>Kirim Ulang Kode via WhatsApp</span>
          </button>
        )}

        <a
          href={`https://wa.me/${adminHelpPhone}?text=${encodeURIComponent(
            'Halo Admin Way Kanan Agro-Commerce, saya memerlukan bantuan verifikasi kode OTP masuk.'
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="min-h-[48px] px-3 inline-flex items-center gap-1.5 text-on-surface-variant text-body-sm hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">support_agent</span>
          <span>Kendala verifikasi? Hubungi Bantuan Admin via WhatsApp</span>
        </a>
      </div>
    </div>
  );
};
