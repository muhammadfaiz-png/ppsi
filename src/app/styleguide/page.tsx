'use client';

import React, { useState } from 'react';
import { TabShell } from '@/components/shells/TabShell';
import { Button } from '@/components/ui/Button';
import { WhatsAppButton } from '@/components/ui/WhatsAppButton';
import { ProductCard } from '@/components/ui/ProductCard';
import { PriceTile } from '@/components/ui/PriceTile';
import { PriceDelta } from '@/components/ui/PriceDelta';
import { Chip } from '@/components/ui/Chip';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { StatTile } from '@/components/ui/StatTile';
import { Banner } from '@/components/ui/Banner';
import { Sheet } from '@/components/ui/Sheet';
import { Toast } from '@/components/ui/Toast';
import { Skeleton, ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { OtpInput } from '@/components/ui/OtpInput';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { PhotoSlot } from '@/components/ui/PhotoSlot';
import { Timeline } from '@/components/ui/Timeline';

export default function StyleguidePage() {
  const [phone, setPhone] = useState('081234567890');
  const [otp, setOtp] = useState('123456');
  const [photos, setPhotos] = useState<string[]>([]);
  const [segment, setSegment] = useState<'semua' | 'aktif'>('semua');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  return (
    <TabShell activeTab="home">
      <div className="space-y-8 pb-12">
        <header className="pb-4 border-b border-surface-container-high">
          <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-bold">
            Sistem Desain
          </span>
          <h1 className="font-headline-xl text-headline-xl text-on-surface mt-1">
            Pustaka Komponen UI
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-1">
            Komponen resmi Way Kanan Agro-Commerce sesuai SKILL.md. Tonal, touch target ≥48px, teks ≥12px.
          </p>
        </header>

        {/* 1. Tombol & WhatsApp CTA */}
        <section className="space-y-3">
          <h2 className="font-headline-sm text-headline-sm">1. Tombol & Aksi Utama</h2>
          <div className="flex flex-col gap-3">
            <Button variant="primary" size="lg" icon="check_circle">
              Aksi Utama (Primary 54px)
            </Button>
            <WhatsAppButton label="Hubungi Petani (WA) — Teks Gelap" />
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1">
                Sekunder
              </Button>
              <Button variant="tertiary" className="flex-1">
                Tersier
              </Button>
            </div>
            <Button variant="danger" size="default" icon="delete">
              Aksi Berbahaya / Hapus
            </Button>
            <Button variant="primary" isLoading loadingText="Mengunggah Panen...">
              Loading State
            </Button>
          </div>
        </section>

        {/* 2. Chip & Kontrol Segmen */}
        <section className="space-y-3">
          <h2 className="font-headline-sm text-headline-sm">2. Chip & Kontrol Segmen</h2>
          <div className="flex flex-wrap gap-2">
            <Chip label="Semua Komoditas" icon="grid_view" active />
            <Chip label="Singkong" icon="spa" />
            <Chip label="Kopi Robusta" icon="coffee" count={5} />
            <Chip label="Banjit" onRemove={() => alert('Hapus filter')} />
          </div>
          <div className="mt-3">
            <SegmentedControl
              options={[
                { value: 'semua', label: 'Semua Listing', count: 12 },
                { value: 'aktif', label: 'Aktif Tayang', count: 8 },
              ]}
              value={segment}
              onChange={setSegment}
            />
          </div>
        </section>

        {/* 3. Banner & Status Tonal */}
        <section className="space-y-3">
          <h2 className="font-headline-sm text-headline-sm">3. Banner Tonal Tanpa Border</h2>
          <Banner
            variant="info"
            title="Penjual Terverifikasi"
            description="Semua petani dengan tanda hijau telah diperiksa dokumen KTP-nya oleh Admin."
          />
          <Banner
            variant="warning"
            title="Menunggu Konfirmasi Stok"
            description="Stok belum diperbarui lebih dari 7 hari oleh petani."
          />
          <Banner
            variant="error"
            title="Verifikasi Ditolak: KTP Buram"
            description="Foto KTP tidak terbaca jelas. Silakan unggah ulang dokumen asli."
            action={{
              label: 'Perbaiki Dokumen',
              onClick: () => setIsSheetOpen(true),
            }}
          />
        </section>

        {/* 4. Telemetri & Harga */}
        <section className="space-y-3">
          <h2 className="font-headline-sm text-headline-sm">4. Ubin Statistik & Indikasi Harga</h2>
          <div className="grid grid-cols-3 gap-2">
            <StatTile label="Pengunjung" value="1.240" icon="visibility" />
            <StatTile label="Klik WA" value="412" icon="chat" sublabel="33%" />
            <StatTile label="Listing" value="18" icon="inventory_2" />
          </div>

          <div className="overflow-x-auto -mx-margin px-margin flex gap-3 py-2">
            <PriceTile
              commodityName="Singkong"
              grade="Grade A Super"
              pricePerUnit={1800}
              delta={50}
              subdistrict="Banjit"
              timeLabel="Hari ini"
            />
            <PriceTile
              commodityName="Kopi Robusta"
              grade="Fine Robusta"
              pricePerUnit={42000}
              delta={-500}
              subdistrict="Baradatu"
              timeLabel="Kemarin"
            />
            <PriceTile
              commodityName="Karet"
              grade="Lateks DRC 60%"
              pricePerUnit={12500}
              delta={0}
              subdistrict="Bumi Agung"
              isStale
              timeLabel="18 hari lalu"
            />
          </div>
        </section>

        {/* 5. Kartu Produk */}
        <section className="space-y-3">
          <h2 className="font-headline-sm text-headline-sm">5. Kartu Produk (Katalog)</h2>
          <ProductCard
            id={1}
            title="Singkong Segar Grade A Kadar Pati Tinggi"
            organizationName="Gapoktan Makmur Jaya Banjit"
            subdistrict="Banjit"
            pricePerUnit={1800}
            stockQuantity={25}
            minOrder={2}
            isVerified
          />
        </section>

        {/* 6. Form Input & OTP */}
        <section className="space-y-3">
          <h2 className="font-headline-sm text-headline-sm">6. Input Nomor HP & OTP 6-Digit</h2>
          <PhoneInput value={phone} onChange={setPhone} />
          <div className="pt-2">
            <OtpInput value={otp} onChange={setOtp} />
          </div>
        </section>

        {/* 7. Slot Foto Kompresi */}
        <section className="space-y-3">
          <h2 className="font-headline-sm text-headline-sm">7. Slot Unggah Foto (&lt;200KB)</h2>
          <PhotoSlot photos={photos} onChange={setPhotos} />
        </section>

        {/* 8. Linimasa Verifikasi */}
        <section className="space-y-3">
          <h2 className="font-headline-sm text-headline-sm">8. Linimasa Verifikasi Penjual</h2>
          <Timeline
            steps={[
              {
                title: 'Akun Dibuat',
                description: 'Nomor WhatsApp terverifikasi dengan kode OTP.',
                status: 'completed',
                date: '10 Okt 2026',
              },
              {
                title: 'Verifikasi Dokumen KTP',
                description: 'Sedang diperiksa oleh Admin Platform Way Kanan.',
                status: 'current',
                date: 'Hari ini',
              },
              {
                title: 'Izin Terbit Listing',
                description: 'Dapat menerbitkan komoditas ke katalog publik.',
                status: 'upcoming',
              },
            ]}
          />
        </section>

        {/* 9. State Loading & Kosong */}
        <section className="space-y-3">
          <h2 className="font-headline-sm text-headline-sm">9. Skeleton Loading & State Kosong</h2>
          <ProductCardSkeleton />
          <EmptyState
            icon="search_off"
            title="Tidak Ada Komoditas"
            description="Tidak ada komoditas singkong di kecamatan yang dipilih. Coba reset filter."
            action={{
              label: 'Reset Filter',
              onClick: () => setShowToast(true),
            }}
          />
        </section>

        {/* Interaktif Modal & Toast */}
        <div className="pt-4 flex gap-2">
          <Button variant="secondary" className="flex-1" onClick={() => setIsSheetOpen(true)}>
            Buka Bottom Sheet
          </Button>
          <Button variant="primary" className="flex-1" onClick={() => setShowToast(true)}>
            Tampilkan Toast
          </Button>
        </div>

        {/* Bottom Sheet */}
        <Sheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          title="Filter Komoditas"
          footer={
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsSheetOpen(false)}
              >
                Reset
              </Button>
              <Button
                variant="primary"
                className="flex-[2]"
                onClick={() => {
                  setIsSheetOpen(false);
                  setShowToast(true);
                }}
              >
                Terapkan Filter
              </Button>
            </div>
          }
        >
          <p className="font-body-md text-on-surface-variant">
            Pilih kategori dan batas harga untuk mempersempit hasil pencarian komoditas di Way Kanan.
          </p>
        </Sheet>

        {/* Toast */}
        <Toast
          isVisible={showToast}
          variant="success"
          message="Filter berhasil diterapkan!"
          onClose={() => setShowToast(false)}
        />
      </div>
    </TabShell>
  );
}
