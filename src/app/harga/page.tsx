'use client';

import React, { useState, useEffect } from 'react';
import { TabShell } from '@/components/shells/TabShell';
import { Chip } from '@/components/ui/Chip';
import { Banner } from '@/components/ui/Banner';
import { PriceDelta } from '@/components/ui/PriceDelta';
import { Sparkline } from '@/components/ui/Sparkline';
import { Button } from '@/components/ui/Button';

import { Sheet } from '@/components/ui/Sheet';
import { Toast } from '@/components/ui/Toast';

const COMMODITIES = [
  { name: 'Singkong', icon: 'spa' },
  { name: 'Kopi Robusta', icon: 'coffee' },
  { name: 'Karet', icon: 'water_drop' },
  { name: 'Padi', icon: 'grass' },
  { name: 'Jagung', icon: 'grain' },
];

const SUBDISTRICTS = [
  'Banjit',
  'Baradatu',
  'Bahuga',
  'Blambangan Umpu',
  'Buay Bahuga',
  'Bumi Agung',
  'Gunung Labuhan',
  'Kasui',
  'Negeri Agung',
  'Negeri Besar',
  'Pakuan Ratu',
  'Rebang Tangkas',
  'Way Tuba',
  'Umpu Semenguk',
];

export default function PriceBoardPage() {
  const [selectedCommodity, setSelectedCommodity] = useState('Singkong');
  const [priceData, setPriceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Update modal state for Officer / Admin
  const [isUpdateSheetOpen, setIsUpdateSheetOpen] = useState(false);
  const [updateSubdistrict, setUpdateSubdistrict] = useState(SUBDISTRICTS[0]);
  const [updatePrice, setUpdatePrice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchPriceData();
  }, [selectedCommodity]);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => { });
  }, []);

  const fetchPriceData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/prices?commodity=${encodeURIComponent(selectedCommodity)}`);
      const data = await res.json();
      setPriceData(data);
    } catch (err) {
      console.error('Gagal mengambil data harga:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updatePrice || parseFloat(updatePrice) <= 0) {
      alert('Masukkan harga yang valid');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodityName: selectedCommodity,
          subdistrict: updateSubdistrict,
          indicatedPrice: parseFloat(updatePrice),
          unit: priceData?.commodity?.unit || 'kg',
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || 'Gagal memperbarui harga');
      }

      setToastMessage(`Harga ${selectedCommodity} di ${updateSubdistrict} berhasil diperbarui!`);
      setIsUpdateSheetOpen(false);
      setUpdatePrice('');
      fetchPriceData();
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isOfficerOrAdmin = currentUser?.role === 'officer' || currentUser?.role === 'admin';
  const stats = priceData?.stats;
  const subdistricts = priceData?.subdistricts || [];

  return (
    <TabShell activeTab="prices">
      <div className="space-y-5 pb-8">
        {/* 1. Header & Source Banner */}
        <header className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-primary font-label-sm">
            <span className="material-symbols-outlined text-[18px]">trending_up</span>
            <span>Informasi Pasar Daerah</span>
          </div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            Papan Harga Indikasi Harian
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Rujukan harga komoditas pertanian dan perkebunan di 14 kecamatan Kabupaten Way Kanan.
          </p>

          <Banner
            variant="info"
            title="Sumber Data Resmi"
            description={`Data diperbarui berkala oleh ${stats?.sourceAgency || 'Dinas Ketahanan Pangan & Pertanian Way Kanan'
              }. Tanggal pembaruan: ${stats?.lastUpdatedDate
                ? new Date(stats.lastUpdatedDate).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })
                : 'Hari ini'
              }`}
          />
        </header>

        {/* 2. Commodity Chips Selector */}
        <div className="overflow-x-auto -mx-margin px-margin flex gap-2 py-1">
          {COMMODITIES.map((comm) => (
            <Chip
              key={comm.name}
              label={comm.name}
              icon={comm.icon}
              active={selectedCommodity === comm.name}
              onClick={() => setSelectedCommodity(comm.name)}
            />
          ))}
        </div>

        {/* 3. Trend Card with 8-week Sparkline */}
        {isLoading || !stats ? (
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm animate-pulse space-y-3">
            <div className="h-6 w-32 bg-surface-container-high rounded" />
            <div className="h-10 w-48 bg-surface-container-high rounded" />
            <div className="h-20 w-full bg-surface-container-high rounded" />
          </div>
        ) : (
          <section className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm space-y-3">
            <div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">
                Rata-rata Harga {selectedCommodity} di Way Kanan
              </div>
              <div className="flex items-baseline justify-between mt-1">
                <div className="flex items-baseline gap-2">
                  <span className="font-headline-xl text-headline-xl text-primary font-extrabold">
                    Rp {Number(stats.avgPrice).toLocaleString('id-ID')}
                  </span>
                  <span className="font-label-md text-label-md text-on-surface-variant font-normal">
                    /{priceData?.commodity?.unit || 'kg'}
                  </span>
                </div>
                <PriceDelta delta={stats.avgDelta} showPercent={false} />
              </div>
            </div>

            {/* Sparkline SVG 8 Minggu */}
            <div className="pt-2 border-t border-surface-container-high/60">
              <div className="flex items-center justify-between text-label-sm text-on-surface-variant mb-1 font-semibold">
                <span>Tren 8 Minggu Terakhir</span>
                <span>Satuan Rp/{priceData?.commodity?.unit || 'kg'}</span>
              </div>
              <Sparkline data={stats.sparkline} height={80} />
            </div>

            {/* Range Lowest & Highest */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-container-high/60">
              <div className="bg-surface-container-low/60 rounded-xl p-2.5">
                <div className="font-label-sm text-[12px] text-on-surface-variant">Harga Terendah</div>
                <div className="font-headline-sm text-headline-sm text-on-surface font-bold mt-0.5">
                  Rp {Number(stats.minPrice).toLocaleString('id-ID')}
                </div>
              </div>
              <div className="bg-surface-container-low/60 rounded-xl p-2.5">
                <div className="font-label-sm text-[12px] text-on-surface-variant">Harga Tertinggi</div>
                <div className="font-headline-sm text-headline-sm text-primary font-bold mt-0.5">
                  Rp {Number(stats.maxPrice).toLocaleString('id-ID')}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Subdistricts Price List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Daftar per Kecamatan</h2>
              <span className="font-label-sm text-label-sm text-on-surface-variant">14 Kecamatan</span>
            </div>
            {isOfficerOrAdmin && (
              <button
                type="button"
                onClick={() => setIsUpdateSheetOpen(true)}
                className="min-h-[44px] px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-label-sm flex items-center gap-1.5 shadow-sm active:scale-95 hover:bg-primary/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                <span>Perbarui Harga</span>
              </button>
            )}
          </div>

          <div className="flex flex-col gap-2">
            {subdistricts.map((item: any) => (
              <div
                key={item.subdistrict}
                className="bg-surface-container-lowest rounded-xl p-3.5 shadow-sm flex items-center justify-between transition-all hover:bg-surface-container-low/60"
              >
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      {item.subdistrict}
                    </h3>
                    {item.isStale && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-[12px]">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        <span>Data &gt; 14 hari</span>
                      </span>
                    )}
                  </div>
                  <div className="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                    <span>
                      Diperbarui{' '}
                      {new Date(item.effectiveDate).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-headline-sm text-headline-sm text-primary font-extrabold">
                    Rp {Number(item.indicatedPrice).toLocaleString('id-ID')}
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                      {' '}
                      /{item.unit}
                    </span>
                  </div>
                  <PriceDelta delta={item.delta} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Important Notes & Report Discrepancy Button */}
        <section className="bg-surface-container-low rounded-2xl p-4 text-center space-y-3">
          <div className="flex items-center justify-center gap-1.5 text-primary">
            <span className="material-symbols-outlined text-[20px]">info</span>
            <span className="font-label-md text-label-md font-bold">Catatan Indikasi Harga</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto leading-relaxed">
            Harga indikasi di atas merupakan estimasi harga transaksi rata-rata di tingkat kelompok tani Way Kanan. Transaksi riil dapat berbeda tergantung pada kadar air, kadar pati, potongan timbangan (rafaksi), dan biaya angkut.
          </p>

          <a
            href={`https://wa.me/6281234567890?text=${encodeURIComponent(
              `Halo Petugas Dinas / Admin Way Kanan Agro, saya ingin menyampaikan laporan perbedaan harga pasar komoditas ${selectedCommodity} di kecamatan saya.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-h-[48px] rounded-xl bg-surface-container-high text-primary font-label-md inline-flex items-center justify-center gap-2 hover:bg-surface-container-highest transition-colors active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">campaign</span>
            <span>Laporkan Perbedaan Harga Pasar via WhatsApp</span>
          </a>
        </section>
      </div>

      {/* Sheet Modal: Update Harga Dinas/Admin */}
      <Sheet
        isOpen={isUpdateSheetOpen}
        onClose={() => setIsUpdateSheetOpen(false)}
        title={`Perbarui Harga: ${selectedCommodity}`}
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsUpdateSheetOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-[2]"
              isLoading={isSubmitting}
              onClick={handlePriceSubmit}
            >
              Simpan Harga
            </Button>
          </div>
        }
      >
        <form onSubmit={handlePriceSubmit} className="space-y-4 py-2">
          <div>
            <label className="font-label-md text-label-md text-on-surface block mb-1">
              Kecamatan <span className="text-error">*</span>
            </label>
            <select
              value={updateSubdistrict}
              onChange={(e) => setUpdateSubdistrict(e.target.value)}
              className="w-full h-[52px] px-3 rounded-xl bg-surface-container-low font-body-lg text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
            >
              {SUBDISTRICTS.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-label-md text-label-md text-on-surface block mb-1">
              Harga Indikasi per {priceData?.commodity?.unit || 'kg'} <span className="text-error">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-headline-sm text-primary font-bold">
                Rp
              </span>
              <input
                type="number"
                value={updatePrice}
                onChange={(e) => setUpdatePrice(e.target.value)}
                placeholder="Contoh: 1850"
                className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-surface-container-low font-headline-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                required
              />
            </div>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Masukkan harga indikasi transaksi terbaru yang berlaku di lapangan.
            </p>
          </div>
        </form>
      </Sheet>

      {/* Toast Notification */}
      <Toast
        message={toastMessage || ''}
        isVisible={Boolean(toastMessage)}
        variant="success"
        onClose={() => setToastMessage(null)}
      />
    </TabShell>
  );
}
