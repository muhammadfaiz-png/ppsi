'use client';

import React from 'react';

export interface PhoneInputProps {
  value: string; // e.g. "081234567890" or "81234567890"
  onChange: (value: string) => void;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  error,
  placeholder = '812-3456-7890',
  disabled = false,
  className = '',
}) => {
  // Clean raw input (only digits, remove leading 0 or 62 if entered)
  const rawDigits = value.replace(/\D/g, '');
  const normalizedDigits = rawDigits.startsWith('62')
    ? rawDigits.slice(2)
    : rawDigits.startsWith('0')
    ? rawDigits.slice(1)
    : rawDigits;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    let clean = raw;
    if (clean.startsWith('62')) clean = clean.slice(2);
    if (clean.startsWith('0')) clean = clean.slice(1);
    // Limit to max 13 digits for Indonesian phone numbers
    const trimmed = clean.slice(0, 13);
    onChange(trimmed ? `0${trimmed}` : '');
  };

  const handleClear = () => {
    onChange('');
  };

  // Format into chunks: e.g. 812-3456-7890
  const formatDisplay = (digits: string) => {
    if (!digits) return '';
    const parts: string[] = [];
    if (digits.length > 0) parts.push(digits.slice(0, 3));
    if (digits.length > 3) parts.push(digits.slice(3, 7));
    if (digits.length > 7) parts.push(digits.slice(7, 12));
    return parts.join('-');
  };

  const digitCount = normalizedDigits.length;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div
        className={`min-h-[56px] rounded-xl bg-surface-container-lowest shadow-sm flex items-center overflow-hidden transition-all focus-within:ring-2 ${
          error ? 'ring-2 ring-error' : 'focus-within:ring-primary'
        }`}
      >
        <div className="bg-surface-container px-3.5 h-[56px] flex items-center gap-1.5 font-label-md text-on-surface select-none shrink-0 border-r border-surface-container-high">
          <span className="text-lg">🇮🇩</span>
          <span>+62</span>
        </div>

        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          disabled={disabled}
          value={formatDisplay(normalizedDigits)}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 h-[56px] px-3 font-body-lg text-on-surface bg-transparent focus:outline-none placeholder:text-outline"
        />

        {normalizedDigits.length > 0 && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="w-10 h-10 rounded-full mr-1 flex items-center justify-center text-on-surface-variant hover:text-on-surface"
            aria-label="Hapus nomor telepon"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
          </button>
        )}
      </div>

      <div className="flex items-center justify-between px-1 text-body-sm">
        {error ? (
          <span className="text-error flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">error</span>
            {error}
          </span>
        ) : (
          <span className="text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">info</span>
            Nomor aktif WhatsApp untuk terima kode masuk
          </span>
        )}
        <span
          className={`font-label-sm ${
            digitCount >= 9 && digitCount <= 13 ? 'text-primary' : 'text-on-surface-variant'
          }`}
        >
          {digitCount}/12 digit
        </span>
      </div>
    </div>
  );
};
