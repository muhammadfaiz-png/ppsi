'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { StackShell } from '@/components/shells/StackShell';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { Banner } from '@/components/ui/Banner';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

interface ListingDetail {
  id: number;
  title: string;
  description: string;
  specificationGrade: string;
  qualityParamName?: string;
  qualityParamValue?: string;
  pricePerUnit: number;
  unit: string;
  stockQuantity: number;
  minOrder: number;
  status: string;
  lastStockConfirmedAt: string;
  createdAt: string;
  commodity: {
    id: number;
    name: string;
    icon: string;
    category: {
      name: string;
    };
  };
  farmerProfile: {
    id: number;
    organizationName: string;
    subdistrict: string;
    addressDetail: string;
    verificationStatus: string;
    displayName: string;
  };
  photos: Array<{ id: number; photoUrl: string; order: number }>;
}

export default function CommodityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = useState<ListingDetail | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Report sheet state
  const [isReportSheetOpen, setIsReportSheetOpen] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportError, setReportError] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success');

  useEffect(() => {
    fetchListingDetail();
  }, [listingId]);

  const fetchListingDetail = async () => {
    try {
      const res = await fetch(`/api/listings/${listingId}`);
      if (!res.ok) {
        router.replace('/katalog');
        return;
      }
      const data = await res.json();
      setListing(data.listing);
    } catch (err) {
      console.error(err);
      router.replace('/katalog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share && listing) {
      try {
        await navigator.share({
          title: listing.title,
          text: `Cek ketersediaan komoditas ${listing.title} di Way Kanan Agro-Commerce`,
          url: window.location.href,
        });
      } catch {
        // Share cancelled or unsupported
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setToastMessage('Tautan berhasil disalin ke clipboard!');
      setToastVariant('success');
    }
  };

  const handleSendReport = async () => {
    if (!reportReason.trim()) {
      setReportError('Alasan laporan wajib diisi');
      return;
    }

    setIsSubmittingReport(true);
    setReportError('');

    try {
      const res = await fetch(`/api/listings/${listingId}/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reportReason }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 401) {
          router.push('/masuk');
          return;
        }
        setReportError(data.error || 'Gagal mengirimkan laporan');
        return;
      }

      setIsReportSheetOpen(false);
      setReportReason('');
      setToastMessage(data.message || 'Laporan Anda telah berhasil dikirimkan ke Admin.');
      setToastVariant('success');
    } catch {
      setReportError('Terjadi kendala jaringan');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isLoading || !listing) {
    return (
      <StackShell title="Detail Komoditas" backHref="/katalog">
        <div className="space-y-4 animate-pulse pt-2">
          <div className="aspect-[4/3] rounded-2xl bg-surface-container-high w-full" />
          <div className="h-6 w-3/4 bg-surface-container-high rounded-md" />
          <div className="h-8 w-1/2 bg-surface-container-high rounded-md" />
          <div className="h-32 rounded-xl bg-surface-container-high w-full" />
        </div>
      </StackShell>
    );
  }

  const isPendingConfirmation = listing.status === 'pending_confirmation';
  const isVerified = listing.farmerProfile.verificationStatus === 'verified';
  const photoList = listing.photos.length > 0 ? listing.photos.map((p) => p.photoUrl) : ['/images/products/placeholder.jpg'];
  const activePhoto = photoList[selectedPhotoIndex] || photoList[0];

  // Price calculations
  const priceNum = Number(listing.pricePerUnit);
  let tonPriceEquivalent = '';
  if (listing.unit.toLowerCase() === 'kg') {
    const tonPrice = priceNum * 1000;
    tonPriceEquivalent = `(± Rp ${tonPrice.toLocaleString('id-ID')} / Ton)`;
  }

  return (
    <StackShell
      title={listing.title}
      backHref="/katalog"
      actions={
        <button
          type="button"
          onClick={handleShare}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors"
          aria-label="Bagikan komoditas"
        >
          <span className="material-symbols-outlined text-[22px]">share</span>
        </button>
      }
      actionDock={<WhatsAppButton listingId={listing.id} />}
      secondaryAction={
        <button
          type="button"
          onClick={() => setIsReportSheetOpen(true)}
          className="text-error/80 hover:text-error font-label-sm text-label-sm inline-flex items-center gap-1 transition-colors py-1"
        >
          <span className="material-symbols-outlined text-[16px]">report_problem</span>
          <span>Laporkan Komoditas Ini</span>
        </button>
      }
    >
      <div className="space-y-5 pt-2">
        {/* Banner if pending confirmation */}
        {isPendingConfirmation && (
          <Banner
            variant="warning"
            title="Menunggu Konfirmasi Stok"
            description="Penjual belum memperbarui stok dalam 7 hari terakhir. Silakan tanyakan ketersediaan riil panen saat menghubungi lewat WhatsApp."
          />
        )}

        {/* 1. Photo Gallery 4:3 Ratio */}
        <div className="space-y-2">
          <div className="aspect-[4/3] w-full rounded-2xl bg-surface-container overflow-hidden shadow-sm relative">
            <img
              src={activePhoto}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
            {isVerified && (
              <span className="absolute top-3 left-3 inline-flex items-center gap-1 bg-[#E8F5E9] text-[#1E7E34] px-2.5 py-1 rounded-full font-label-sm text-label-sm shadow">
                <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <span>Petani Terverifikasi</span>
              </span>
            )}
          </div>

          {/* Thumbnails row if multiple photos */}
          {photoList.length > 1 && (
            <div className="flex gap-2">
              {photoList.map((photo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPhotoIndex(idx)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    selectedPhotoIndex === idx
                      ? 'border-primary shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={photo} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. Title & Commodity Badges */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-sm text-[12px] bg-surface-container px-2 py-0.5 rounded-full text-on-surface-variant font-semibold">
              {listing.commodity.category.name}
            </span>
            <span className="font-label-sm text-[12px] bg-primary-fixed/40 px-2 py-0.5 rounded-full text-primary font-bold">
              {listing.commodity.name}
            </span>
          </div>

          <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            {listing.title}
          </h2>

          <div className="flex items-center gap-1 text-on-surface-variant font-body-sm mt-1">
            <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
            <span>Kecamatan {listing.farmerProfile.subdistrict}, Way Kanan, Lampung</span>
          </div>
        </div>

        {/* 3. Price Display */}
        <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-1">
          <div className="font-label-sm text-[12px] text-on-surface-variant">Harga Indikasi Penjual</div>
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="font-headline-xl text-headline-xl text-primary font-extrabold">
              Rp {priceNum.toLocaleString('id-ID')}
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface-variant">/{listing.unit}</span>
            {tonPriceEquivalent && (
              <span className="font-label-md text-label-md text-on-surface-variant font-semibold">
                {tonPriceEquivalent}
              </span>
            )}
          </div>
          <p className="font-body-sm text-[13px] text-on-surface-variant pt-1 border-t border-surface-container-high/60">
            *Harga indikasi dapat dinegosiasikan langsung dengan pengurus kelompok tani.
          </p>
        </div>

        {/* 4. Three Highlight Tiles (Stock, Min Order, Updated) */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-surface-container-lowest rounded-xl p-3 text-center shadow-sm">
            <div className="font-label-sm text-[12px] text-on-surface-variant">Stok Tersedia</div>
            <div className="font-headline-sm text-headline-sm text-tertiary font-bold mt-0.5">
              {Number(listing.stockQuantity)} Ton
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-3 text-center shadow-sm">
            <div className="font-label-sm text-[12px] text-on-surface-variant">Min. Order</div>
            <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5">
              {Number(listing.minOrder)} Ton
            </div>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-3 text-center shadow-sm">
            <div className="font-label-sm text-[12px] text-on-surface-variant">Status Stok</div>
            <div className="font-headline-sm text-headline-sm text-primary font-bold mt-0.5 truncate">
              {isPendingConfirmation ? 'Tinjau' : 'Terkonfirmasi'}
            </div>
          </div>
        </div>

        {/* 5. Quality Specifications Table */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Spesifikasi & Mutu</h3>
          <div className="rounded-xl overflow-hidden border border-surface-container-high/40 text-body-md">
            <div className="flex justify-between p-3 bg-surface-container-low/50">
              <span className="text-on-surface-variant">Standar / Grade</span>
              <span className="font-label-md text-on-surface font-bold text-right">{listing.specificationGrade}</span>
            </div>
            {listing.qualityParamName && (
              <div className="flex justify-between p-3 bg-white">
                <span className="text-on-surface-variant">{listing.qualityParamName}</span>
                <span className="font-label-md text-on-surface font-bold text-right">
                  {listing.qualityParamValue || '-'}
                </span>
              </div>
            )}
            <div className="flex justify-between p-3 bg-surface-container-low/50">
              <span className="text-on-surface-variant">Kecamatan Asal</span>
              <span className="font-label-md text-on-surface font-bold text-right">{listing.farmerProfile.subdistrict}</span>
            </div>
            <div className="flex justify-between p-3 bg-white">
              <span className="text-on-surface-variant">Satuan Timbang</span>
              <span className="font-label-md text-on-surface font-bold text-right">{listing.unit.toUpperCase()}</span>
            </div>
          </div>
        </section>

        {/* 6. Full Description */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-2">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Keterangan Produk</h3>
          <p className="font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-line">
            {listing.description}
          </p>
        </section>

        {/* 7. Seller Identity Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Informasi Penjual</h3>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xl relative shrink-0">
              {listing.farmerProfile.organizationName.charAt(0).toUpperCase()}
              {isVerified && (
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-primary text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check
                  </span>
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-headline-sm text-headline-sm text-on-surface truncate">
                {listing.farmerProfile.organizationName}
              </h4>
              <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                {listing.farmerProfile.displayName || 'Pengurus Gapoktan'}
              </p>
              <div className="flex items-center gap-1 text-label-sm text-primary font-semibold mt-0.5">
                <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                  verified
                </span>
                <span>Terdaftar & Diverifikasi Admin</span>
              </div>
            </div>
          </div>

          <p className="font-body-sm text-[13px] text-on-surface-variant pt-2 border-t border-surface-container-high/60">
            Nomor kontak dilindungi. Gunakan tombol hijau di bawah untuk menghubungi via WhatsApp resmi.
          </p>
        </section>

        {/* 8. Safe Transaction Advice */}
        <section className="bg-surface-container-low rounded-xl p-3.5 text-body-sm text-on-surface-variant space-y-1">
          <div className="font-label-sm text-on-surface font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-primary">security</span>
            <span>Tips Transaksi Aman Agribisnis</span>
          </div>
          <div>• Lakukan kesepakatan timbang tara & kadar air di lokasi gudang.</div>
          <div>• Cek kondisi fisik komoditas sebelum menyerahkan pembayaran tunai/transfer.</div>
          <div>• Platform ini murni direktori informasi, tidak memungut komisi transaksi.</div>
        </section>
      </div>

      {/* Report Listing Bottom Sheet */}
      <Sheet
        isOpen={isReportSheetOpen}
        onClose={() => setIsReportSheetOpen(false)}
        title="Laporkan Komoditas"
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsReportSheetOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="danger"
              className="flex-[2]"
              isLoading={isSubmittingReport}
              loadingText="Mengirim Laporan..."
              onClick={handleSendReport}
            >
              Kirim Laporan
            </Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          <p className="font-body-md text-on-surface-variant">
            Bantu kami menjaga Way Kanan Agro dari informasi tidak valid atau indikasi penipuan.
          </p>

          <div className="space-y-2">
            <label className="font-label-md text-label-md text-on-surface block">
              Pilih Alasan Cepat:
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                'Stok sudah habis tapi listing aktif',
                'Harga berbeda saat dinegosiasi di WhatsApp',
                'Spesifikasi mutu (kadar air/pati) tidak sesuai',
                'Nomor penjual tidak aktif / tidak merespons',
                'Indikasi penipuan transaksi',
              ].map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setReportReason(reason)}
                  className={`text-label-sm text-left px-3 py-2 rounded-xl transition-all ${
                    reportReason === reason
                      ? 'bg-error-container text-on-error-container font-bold ring-1 ring-error'
                      : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface block">
              Keterangan Tambahan <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Jelaskan kendala yang Anda temui..."
              className="w-full p-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md focus:bg-surface-container focus:ring-2 focus:ring-error focus:outline-none"
            />
            {reportError && (
              <span className="text-error text-body-sm flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">error</span>
                {reportError}
              </span>
            )}
          </div>
        </div>
      </Sheet>

      {/* Toast */}
      <Toast
        isVisible={!!toastMessage}
        variant={toastVariant}
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />
    </StackShell>
  );
}
