'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { get, set, del } from 'idb-keyval';
import { StackShell } from '@/components/shells/StackShell';
import { Button } from '@/components/ui/Button';
import { PhotoSlot } from '@/components/ui/PhotoSlot';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Toast } from '@/components/ui/Toast';

const COMMODITY_CHOICES = [
  {
    name: 'Singkong',
    icon: 'spa',
    category: 'Pangan',
    qualityName: 'Kadar Pati',
    qualityPresets: ['> 25% (Super)', '20 - 25% (Standar Pabrik)', '< 20% (Biasa)'],
    defaultGrade: 'Grade A Super',
    defaultTitle: 'Singkong Gajah Siap Panen',
  },
  {
    name: 'Kopi Robusta',
    icon: 'coffee',
    category: 'Perkebunan',
    qualityName: 'Kadar Air & Defect',
    qualityPresets: ['12 - 13% (Standar Ekspor)', '14 - 16% (Pasar Lokal)', 'Petik Merah Pilihan'],
    defaultGrade: 'Grade 1 Petik Merah',
    defaultTitle: 'Kopi Robusta Petik Merah Banjit',
  },
  {
    name: 'Karet',
    icon: 'water_drop',
    category: 'Perkebunan',
    qualityName: 'Kadar Karet Kering (DRC)',
    qualityPresets: ['DRC > 50% (Lateks Pekat)', 'DRC 40 - 50% (Bahan Olah)', 'DRC < 40% (Campur)'],
    defaultGrade: 'Lateks Segar Berkualitas',
    defaultTitle: 'Getah Karet / Bokar Segar',
  },
  {
    name: 'Padi',
    icon: 'grass',
    category: 'Pangan',
    qualityName: 'Kadar Air & Kebersihan',
    qualityPresets: ['< 14% (Kering Giling)', '15 - 18% (Kering Panen)', 'Beras Premium'],
    defaultGrade: 'Gabah Kering Giling (GKG)',
    defaultTitle: 'Gabah Padi Ciherang Siap Giling',
  },
  {
    name: 'Jagung',
    icon: 'grain',
    category: 'Pangan',
    qualityName: 'Kadar Air & Pipil',
    qualityPresets: ['< 14% (Kering Standar Pakan)', '15 - 17% (Kering Panen)', 'Kering Pipil Super'],
    defaultGrade: 'Jagung Pipil Kering Super',
    defaultTitle: 'Jagung Pipil Kering Pakan Ternak',
  },
];

const DRAFT_KEY = 'wk_draft_listing';

export default function JualPage() {
  const router = useRouter();

  // Wizard Step: 1, 2, or 3
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form Fields
  const [commodityName, setCommodityName] = useState('Singkong');
  const [title, setTitle] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [unit, setUnit] = useState<'kg' | 'ton'>('kg');
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [minOrder, setMinOrder] = useState('');
  const [specificationGrade, setSpecificationGrade] = useState('Grade A');
  const [qualityParamValue, setQualityParamValue] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  // UI States
  const [isOnline, setIsOnline] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success');
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load User & Restore Draft from IndexedDB
  useEffect(() => {
    setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Fetch user
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.push('/masuk?callbackUrl=/jual');
          return;
        }
        setCurrentUser(data.user);
      })
      .catch(() => {});

    // Restore draft from IndexedDB
    get(DRAFT_KEY)
      .then((savedDraft) => {
        if (savedDraft) {
          if (savedDraft.commodityName) setCommodityName(savedDraft.commodityName);
          if (savedDraft.title) setTitle(savedDraft.title);
          if (savedDraft.stockQuantity) setStockQuantity(savedDraft.stockQuantity);
          if (savedDraft.unit) setUnit(savedDraft.unit);
          if (savedDraft.pricePerUnit) setPricePerUnit(savedDraft.pricePerUnit);
          if (savedDraft.minOrder) setMinOrder(savedDraft.minOrder);
          if (savedDraft.specificationGrade) setSpecificationGrade(savedDraft.specificationGrade);
          if (savedDraft.qualityParamValue) setQualityParamValue(savedDraft.qualityParamValue);
          if (savedDraft.photos && Array.isArray(savedDraft.photos)) setPhotos(savedDraft.photos);
          if (savedDraft.description) setDescription(savedDraft.description);
          if (savedDraft.step) setStep(savedDraft.step);
        }
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [router]);

  // Save draft whenever state changes
  useEffect(() => {
    const draftData = {
      commodityName,
      title,
      stockQuantity,
      unit,
      pricePerUnit,
      minOrder,
      specificationGrade,
      qualityParamValue,
      photos,
      description,
      step,
      updatedAt: Date.now(),
    };
    set(DRAFT_KEY, draftData).catch(() => {});
  }, [
    commodityName,
    title,
    stockQuantity,
    unit,
    pricePerUnit,
    minOrder,
    specificationGrade,
    qualityParamValue,
    photos,
    description,
    step,
  ]);

  const currentCommodityConfig =
    COMMODITY_CHOICES.find((c) => c.name === commodityName) || COMMODITY_CHOICES[0];

  // Select Commodity Handler
  const handleSelectCommodity = (name: string) => {
    setCommodityName(name);
    const cfg = COMMODITY_CHOICES.find((c) => c.name === name);
    if (cfg) {
      setSpecificationGrade(cfg.defaultGrade);
      setQualityParamValue(cfg.qualityPresets[0]);
      if (!title || COMMODITY_CHOICES.some((c) => c.defaultTitle === title)) {
        setTitle(cfg.defaultTitle);
      }
    }
  };

  // Step Navigations & Validations
  const handleNextStep = () => {
    if (step === 1) {
      if (!title.trim() || title.trim().length < 3) {
        setToastVariant('error');
        setToastMessage('Masukkan judul komoditas panen minimal 3 karakter');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const stock = parseFloat(stockQuantity);
      const price = parseFloat(pricePerUnit);
      const min = parseFloat(minOrder);

      if (isNaN(stock) || stock <= 0) {
        setToastVariant('error');
        setToastMessage('Masukkan jumlah volume stok panen yang valid');
        return;
      }
      if (isNaN(price) || price <= 0) {
        setToastVariant('error');
        setToastMessage('Masukkan harga indikasi yang valid');
        return;
      }
      if (isNaN(min) || min <= 0) {
        setToastVariant('error');
        setToastMessage('Masukkan minimal pemesanan yang valid');
        return;
      }
      setStep(3);
    }
  };

  // Submit Listing (Active or Draft)
  const handleSubmitListing = async (submitStatus: 'active' | 'draft') => {
    setIsSubmitting(true);
    try {
      const payload = {
        commodityName,
        title: title.trim(),
        description: description.trim(),
        specificationGrade: specificationGrade.trim() || 'Standar',
        qualityParamName: currentCommodityConfig.qualityName,
        qualityParamValue: qualityParamValue.trim(),
        pricePerUnit: parseFloat(pricePerUnit),
        unit,
        stockQuantity: parseFloat(stockQuantity),
        minOrder: parseFloat(minOrder),
        status: submitStatus,
        photos,
      };

      const res = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal menyimpan listing');
      }

      // Clear draft in IndexedDB
      await del(DRAFT_KEY);

      setToastVariant('success');
      setToastMessage(
        submitStatus === 'draft'
          ? 'Listing berhasil disimpan sebagai draf!'
          : 'Hasil panen berhasil diterbitkan ke katalog publik!'
      );

      setTimeout(() => {
        router.push(submitStatus === 'draft' ? '/dashboard' : `/komoditas/${resData.listing.id}`);
      }, 1200);
    } catch (err: any) {
      setToastVariant('error');
      setToastMessage(err.message || 'Terjadi kesalahan saat memproses listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate live estimate preview
  const numPrice = parseFloat(pricePerUnit) || 0;
  const estimateSecondary =
    unit === 'kg'
      ? `± Rp ${(numPrice * 1000).toLocaleString('id-ID')} / Ton`
      : `± Rp ${Math.round(numPrice / 1000).toLocaleString('id-ID')} / kg`;

  return (
    <StackShell
      title="Pasang Hasil Panen"
      onBack={() => {
        if (step > 1) {
          setStep((prev) => (prev - 1) as any);
        } else {
          router.push('/dashboard');
        }
      }}
      actionDock={
        step < 3 ? (
          <Button
            type="button"
            variant="primary"
            className="w-full min-h-[54px] rounded-xl font-label-lg"
            onClick={handleNextStep}
          >
            Lanjut ke Langkah {step + 1}
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="primary"
              className="w-full min-h-[54px] rounded-xl font-label-lg"
              isLoading={isSubmitting}
              onClick={() => handleSubmitListing('active')}
            >
              Terbitkan Listing Sekarang
            </Button>
            <Button
              type="button"
              variant="secondary"
              className="w-full min-h-[48px] rounded-xl font-label-md"
              disabled={isSubmitting}
              onClick={() => handleSubmitListing('draft')}
            >
              Simpan sebagai Draf
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-5 pb-6">
        {/* Offline Banner Indicator */}
        {!isOnline && (
          <div className="rounded-xl bg-surface-container-high p-space-md flex items-center gap-space-sm text-on-surface shadow-sm animate-pulse">
            <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">wifi_off</span>
            </div>
            <div className="flex-1 text-body-sm">
              <span className="font-bold block">Mode Tanpa Koneksi (Offline)</span>
              Sinyal lemah di kebun? Tenang, draf Anda tersimpan aman dan siap diterbitkan saat terhubung kembali.
            </div>
          </div>
        )}

        {/* 3-Step Wizard Progress Bar */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-label-sm font-semibold text-on-surface-variant">
            <span className={step >= 1 ? 'text-primary font-bold' : ''}>1. Komoditas & Judul</span>
            <span className={step >= 2 ? 'text-primary font-bold' : ''}>2. Stok & Harga</span>
            <span className={step >= 3 ? 'text-primary font-bold' : ''}>3. Mutu & Foto</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 h-2 rounded-full bg-surface-container-high overflow-hidden">
            <div className={`h-full transition-all duration-300 ${step >= 1 ? 'bg-primary' : ''}`} />
            <div className={`h-full transition-all duration-300 ${step >= 2 ? 'bg-primary' : ''}`} />
            <div className={`h-full transition-all duration-300 ${step >= 3 ? 'bg-primary' : ''}`} />
          </div>
        </div>

        {/* =========================================================================
            LANGKAH 1: KOMODITAS & JUDUL
           ========================================================================= */}
        {step === 1 && (
          <section className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                Pilih Komoditas Hasil Panen
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                Pilih salah satu dari 5 komoditas unggulan Kabupaten Way Kanan.
              </p>
            </div>

            {/* 5 Canonical Commodity Selectors */}
            <div className="grid grid-cols-1 gap-2.5">
              {COMMODITY_CHOICES.map((comm) => {
                const isSelected = commodityName === comm.name;
                return (
                  <button
                    key={comm.name}
                    type="button"
                    onClick={() => handleSelectCommodity(comm.name)}
                    className={`w-full min-h-[58px] p-3 rounded-2xl flex items-center justify-between text-left transition-all active:scale-[0.99] ${
                      isSelected
                        ? 'bg-surface-container-low shadow-md ring-2 ring-primary'
                        : 'bg-surface-container-lowest shadow-sm hover:bg-surface-container-low/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-primary text-on-primary' : 'bg-surface-container text-primary'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[24px]">{comm.icon}</span>
                      </div>
                      <div>
                        <div className="font-headline-sm text-headline-sm text-on-surface">
                          {comm.name}
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Kategori: {comm.category}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-primary text-on-primary'
                          : 'border-2 border-outline-variant bg-surface'
                      }`}
                    >
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Listing Title Input */}
            <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-2">
              <label className="font-label-md text-label-md text-on-surface block">
                Judul Listing Panen <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Contoh: Singkong Gajah Super Panen Banjit"
                className="w-full h-[52px] px-3.5 rounded-xl bg-surface-container-low font-body-lg text-on-surface focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
              <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">info</span>
                <span>Buat judul yang jelas agar pembeli pabrik & UMKM mudah menemukan komoditas Anda.</span>
              </p>
            </div>
          </section>
        )}

        {/* =========================================================================
            LANGKAH 2: STOK & HARGA
           ========================================================================= */}
        {step === 2 && (
          <section className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                Jumlah Stok & Penentuan Harga
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                Tentukan perkiraan volume panen dan harga indikasi per satuan.
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-4">
              {/* Unit Switcher */}
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Satuan Komoditas <span className="text-error">*</span>
                </label>
                <SegmentedControl<'kg' | 'ton'>
                  options={[
                    { value: 'kg', label: 'Kilogram (Kg)' },
                    { value: 'ton', label: 'Tonase (Ton)' },
                  ]}
                  value={unit}
                  onChange={(val) => setUnit(val)}
                  className="h-[52px]"
                />
              </div>

              {/* Stock Quantity */}
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Perkiraan Total Stok Tersedia ({unit === 'kg' ? 'Kg' : 'Ton'}){' '}
                  <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder={`Contoh: ${unit === 'kg' ? '20000' : '20'}`}
                  className="w-full h-[52px] px-3.5 rounded-xl bg-surface-container-low font-headline-sm text-on-surface focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />
              </div>

              {/* Price Per Unit */}
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Harga Indikasi per {unit === 'kg' ? 'Kg' : 'Ton'} <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-headline-sm text-primary font-bold">
                    Rp
                  </span>
                  <input
                    type="number"
                    value={pricePerUnit}
                    onChange={(e) => setPricePerUnit(e.target.value)}
                    placeholder={`Contoh: ${unit === 'kg' ? '1800' : '1800000'}`}
                    className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-surface-container-low font-headline-sm text-on-surface focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
                    required
                  />
                </div>
                {numPrice > 0 && (
                  <p className="font-label-sm text-label-sm text-primary font-semibold mt-1">
                    Estimasi konversi: {estimateSecondary} (Harga indikasi, bisa dinegosiasi).
                  </p>
                )}
              </div>

              {/* Min Order */}
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Minimal Pemesanan ({unit === 'kg' ? 'Kg' : 'Ton'}) <span className="text-error">*</span>
                </label>
                <input
                  type="number"
                  value={minOrder}
                  onChange={(e) => setMinOrder(e.target.value)}
                  placeholder={`Contoh: ${unit === 'kg' ? '1000' : '1'}`}
                  className="w-full h-[52px] px-3.5 rounded-xl bg-surface-container-low font-headline-sm text-on-surface focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
                  required
                />

                {/* Quick Presets */}
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {(unit === 'kg' ? ['500', '1000', '5000'] : ['1', '5', '10']).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setMinOrder(preset)}
                      className="min-h-[44px] rounded-lg bg-surface-container-low text-primary font-label-sm text-center hover:bg-surface-container transition-colors"
                    >
                      {preset} {unit}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* =========================================================================
            LANGKAH 3: MUTU, FOTO, & DESKRIPSI + PRATINJAU
           ========================================================================= */}
        {step === 3 && (
          <section className="space-y-4 animate-in fade-in duration-200">
            <div>
              <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
                Spesifikasi Mutu & Foto Komoditas
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
                Lengkapi foto panen dan keterangan mutu untuk meyakinkan pembeli B2B.
              </p>
            </div>

            <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-4">
              {/* Specification Grade */}
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Kualitas / Grade Mutu
                </label>
                <input
                  type="text"
                  value={specificationGrade}
                  onChange={(e) => setSpecificationGrade(e.target.value)}
                  placeholder="Contoh: Grade A Super / Petik Merah"
                  className="w-full h-[52px] px-3.5 rounded-xl bg-surface-container-low font-body-lg text-on-surface focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Quality Parameter Presets */}
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Parameter {currentCommodityConfig.qualityName}
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentCommodityConfig.qualityPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setQualityParamValue(preset)}
                      className={`px-3 py-1.5 rounded-xl text-label-sm transition-all ${
                        qualityParamValue === preset
                          ? 'bg-primary text-on-primary font-bold shadow-sm'
                          : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  value={qualityParamValue}
                  onChange={(e) => setQualityParamValue(e.target.value)}
                  placeholder="Atau ketik nilai parameter mutu khusus..."
                  className="w-full h-[52px] px-3.5 rounded-xl bg-surface-container-low font-body-lg text-on-surface focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>

              {/* Photo Upload Slot (Max 3) */}
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Foto Komoditas Panen (Maksimal 3 Foto)
                </label>
                <PhotoSlot photos={photos} onChange={setPhotos} maxPhotos={3} />
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-primary">photo_camera</span>
                  <span>Hemat kuota: foto otomatis dikompresi di browser Anda (&lt; 200KB).</span>
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="font-label-md text-label-md text-on-surface block mb-1">
                  Deskripsi / Catatan Pengiriman
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan kondisi akses jalan truk, cara timbang, metode pembayaran, atau jadwal tebang panen..."
                  className="w-full p-3 rounded-xl bg-surface-container-low font-body-md text-on-surface focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
            </div>

            {/* PRATINJAU TAMPILAN PEMBELI ("Siap Tayang") */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-primary font-label-md">
                <span className="material-symbols-outlined text-[20px]">visibility</span>
                <span>Pratinjau Tampilan Pembeli (Siap Tayang)</span>
              </div>

              <article className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm border-2 border-primary/20 space-y-3">
                <div className="flex gap-3">
                  <div className="w-24 h-24 rounded-xl bg-surface-container shrink-0 overflow-hidden relative">
                    {photos.length > 0 ? (
                      <img
                        src={photos[0]}
                        alt="Pratinjau panen"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[32px]">
                          {currentCommodityConfig.icon}
                        </span>
                      </div>
                    )}
                    <span className="absolute bottom-1 right-1 bg-inverse-surface/80 text-inverse-on-surface text-[10px] px-1 rounded font-bold">
                      Pratinjau
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <span className="inline-flex items-center gap-1 bg-[#E8F5E9] text-[#1E7E34] px-2 py-0.5 rounded-full font-label-sm text-[12px]">
                        <span
                          className="material-symbols-outlined text-[14px]"
                          style={{ fontVariationSettings: "'FILL' 1" }}
                        >
                          verified
                        </span>
                        Petani Terverifikasi
                      </span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface truncate mt-1">
                        {title || 'Judul Listing Hasil Panen'}
                      </h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                        {currentUser?.displayName || 'Gapoktan Way Kanan'} • Banjit
                      </p>
                    </div>

                    <div className="flex items-baseline justify-between mt-1">
                      <div className="font-headline-md text-headline-md text-primary font-extrabold">
                        Rp {numPrice.toLocaleString('id-ID')}
                        <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                          {' '}
                          /{unit}
                        </span>
                      </div>
                      <span className="font-label-md text-label-md bg-surface-container-high px-2 py-0.5 rounded-md">
                        Stok: {stockQuantity || '0'} {unit}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-surface-container-high flex items-center justify-between text-label-sm text-on-surface-variant">
                  <span>Mutu: {specificationGrade}</span>
                  <span>Min. Order: {minOrder || '0'} {unit}</span>
                </div>
              </article>
            </div>
          </section>
        )}
      </div>

      {/* Toast Notification */}
      <Toast
        message={toastMessage || ''}
        isVisible={Boolean(toastMessage)}
        variant={toastVariant}
        onClose={() => setToastMessage(null)}
      />
    </StackShell>
  );
}
