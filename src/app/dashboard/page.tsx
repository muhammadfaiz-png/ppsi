'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TabShell } from '@/components/shells/TabShell';
import { StatTile } from '@/components/ui/StatTile';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';

export default function FarmerDashboardPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'sold_out' | 'draft'>('active');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/farmer/listings');
      if (res.status === 401) {
        router.push('/masuk?callbackUrl=/dashboard');
        return;
      }
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error('Gagal mengambil data dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [router]);

  // Handle 7-Day Stock Confirmation
  const handleConfirmStock = async (listingId: number, isAvailable: boolean) => {
    setActionLoadingId(listingId);
    try {
      const res = await fetch(`/api/farmer/listings/${listingId}/confirm-stock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Gagal mengonfirmasi stok');

      setToastVariant('success');
      setToastMessage(resData.message || 'Status stok berhasil dikonfirmasi');
      fetchDashboardData();
    } catch (err: any) {
      setToastVariant('error');
      setToastMessage(err.message || 'Gagal memproses konfirmasi');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Handle Listing Status Change (Mark Sold Out, Reactivate, Archive)
  const handleUpdateStatus = async (listingId: number, newStatus: string) => {
    setActionLoadingId(listingId);
    try {
      const res = await fetch(`/api/farmer/listings/${listingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const resData = await res.json();
      if (!res.ok) throw new Error(resData.error || 'Gagal mengubah status');

      setToastVariant('success');
      setToastMessage(
        newStatus === 'sold_out'
          ? 'Listing ditandai sebagai Terjual'
          : newStatus === 'active'
          ? 'Listing berhasil diaktifkan kembali'
          : 'Listing berhasil diarsipkan'
      );
      fetchDashboardData();
    } catch (err: any) {
      setToastVariant('error');
      setToastMessage(err.message || 'Gagal memperbarui status');
    } finally {
      setActionLoadingId(null);
    }
  };

  const profile = dashboardData?.profile;
  const stats = dashboardData?.stats;
  const allListings = dashboardData?.listings || [];
  const pendingConfirmations = dashboardData?.pendingConfirmationListings || [];

  // Filter listings by active tab
  const filteredListings = allListings.filter((l: any) => {
    if (activeTab === 'active') {
      return l.status === 'active' || l.status === 'pending_confirmation';
    }
    return l.status === activeTab;
  });

  return (
    <TabShell activeTab="dashboard">
      <div className="space-y-5 pb-8">
        {/* Header Greeting */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
              Dashboard Penjual
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Kelola stok panen dan pembaruan hasil tani Anda.
            </p>
          </div>

          <Link
            href="/jual"
            className="hidden sm:inline-flex min-h-[48px] px-4 rounded-xl bg-secondary-container text-on-secondary-container font-label-md items-center gap-1.5 shadow-sm hover:brightness-105 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">add_circle</span>
            <span>+ Pasang Panen</span>
          </Link>
        </header>

        {/* 1. Seller Profile Card */}
        {isLoading ? (
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm animate-pulse space-y-3">
            <div className="flex gap-3 items-center">
              <div className="w-14 h-14 rounded-full bg-surface-container-high" />
              <div className="space-y-2 flex-1">
                <div className="h-5 w-40 bg-surface-container-high rounded" />
                <div className="h-4 w-28 bg-surface-container-high rounded" />
              </div>
            </div>
          </div>
        ) : (
          <section className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                {profile?.organizationName ? profile.organizationName.charAt(0).toUpperCase() : 'P'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface truncate">
                    {profile?.organizationName || 'Kelompok Tani Way Kanan'}
                  </h2>
                  {profile?.verificationStatus === 'verified' && (
                    <span className="inline-flex items-center gap-0.5 bg-[#E8F5E9] text-[#1E7E34] px-2 py-0.5 rounded-full font-label-sm text-[12px]">
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                      Terverifikasi
                    </span>
                  )}
                </div>

                <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5 truncate">
                  <span className="material-symbols-outlined text-[16px] text-primary">location_on</span>
                  <span>{profile?.subdistrict || 'Way Kanan'}, Lampung</span>
                  <span>•</span>
                  <span>{profile?.user?.phoneNumber || ''}</span>
                </p>
              </div>

              <Link
                href="/akun/profil"
                className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center text-primary hover:bg-surface-container-highest transition-colors shrink-0"
                aria-label="Edit Profil Penjual"
              >
                <span className="material-symbols-outlined text-[20px]">edit</span>
              </Link>
            </div>

            {/* Verification Status Banner if pending or rejected */}
            {profile?.verificationStatus === 'pending' && (
              <div className="rounded-xl bg-secondary-fixed/50 text-on-secondary-fixed p-3 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[20px] text-secondary shrink-0 mt-0.5">
                  schedule
                </span>
                <div className="flex-1 text-body-sm">
                  <span className="font-bold block">Menunggu Verifikasi Admin</span>
                  Dokumen profil Anda sedang diperiksa tim admin. Anda tetap dapat membuat draf dan memasang hasil panen.
                </div>
              </div>
            )}

            {profile?.verificationStatus === 'rejected' && (
              <div className="rounded-xl bg-error-container text-on-error-container p-3 flex items-start justify-between gap-2.5">
                <div className="flex items-start gap-2 text-body-sm">
                  <span className="material-symbols-outlined text-[20px] shrink-0 mt-0.5">error</span>
                  <div>
                    <span className="font-bold block">Verifikasi Perlu Diperbaiki</span>
                    {profile?.rejectionReason || 'Dokumen belum memenuhi kriteria kelayakan.'}
                  </div>
                </div>
                <Link
                  href="/akun/profil"
                  className="px-2.5 py-1 rounded-lg bg-surface-container-lowest text-error font-label-sm shrink-0 shadow-sm"
                >
                  Perbaiki
                </Link>
              </div>
            )}
          </section>
        )}

        {/* 2. Three Stat Tiles */}
        <div className="grid grid-cols-3 gap-2.5">
          <StatTile
            label="Listing Aktif"
            value={stats ? `${stats.activeCount}` : '0'}
            icon="inventory_2"
          />
          <StatTile
            label="Total Stok"
            value={stats ? `${stats.totalStockTon} T` : '0 T'}
            icon="scale"
          />
          <StatTile
            label="Kontak WA"
            value={stats ? `${stats.totalWaClicks}` : '0'}
            icon="chat"
          />
        </div>

        {/* 3. Seven-Day Stock Confirmation Alert Card */}
        {pendingConfirmations.length > 0 && (
          <section className="bg-secondary-container text-on-secondary-container rounded-2xl p-space-md shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-surface-container-lowest/80 text-secondary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">notifications_active</span>
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm leading-tight">
                  Konfirmasi Stok Rutin (7 Hari)
                </h3>
                <p className="font-body-sm text-body-sm text-on-secondary-container/90">
                  Pembeli B2B memerlukan kepastian stok panen terkini.
                </p>
              </div>
            </div>

            {pendingConfirmations.slice(0, 2).map((item: any) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest rounded-xl p-3 shadow-sm space-y-2 text-on-surface"
              >
                <div className="flex items-center justify-between">
                  <div className="font-headline-sm text-headline-sm truncate pr-2">
                    {item.title}
                  </div>
                  <span className="font-label-sm text-label-sm bg-surface-container px-2 py-0.5 rounded text-on-surface-variant shrink-0">
                    Stok: {item.stockQuantity} {item.unit}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Apakah stok komoditas ini masih tersedia di kebun/gudang Anda?
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={actionLoadingId === item.id}
                    onClick={() => handleConfirmStock(item.id, true)}
                    className="min-h-[44px] rounded-xl bg-primary-container text-on-primary font-label-md flex items-center justify-center gap-1 active:scale-95 transition-all shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span>Ya, Masih Ada</span>
                  </button>

                  <button
                    type="button"
                    disabled={actionLoadingId === item.id}
                    onClick={() => handleConfirmStock(item.id, false)}
                    className="min-h-[44px] rounded-xl bg-surface-container-low text-error font-label-md flex items-center justify-center gap-1 active:scale-95 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    <span>Sudah Habis</span>
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* 4. Tab SegmentedControl: Aktif / Terjual / Draf */}
        <section className="space-y-3">
          <SegmentedControl<'active' | 'sold_out' | 'draft'>
            options={[
              { value: 'active', label: 'Aktif', count: stats?.activeCount || 0 },
              { value: 'sold_out', label: 'Terjual', count: stats?.soldCount || 0 },
              { value: 'draft', label: 'Draf', count: stats?.draftCount || 0 },
            ]}
            value={activeTab}
            onChange={(val) => setActiveTab(val)}
          />

          {/* Listing Cards List */}
          {isLoading ? (
            <div className="space-y-3 animate-pulse">
              {[1, 2].map((i) => (
                <div key={i} className="h-32 bg-surface-container-lowest rounded-2xl shadow-sm" />
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <EmptyState
              title={`Belum Ada Listing ${
                activeTab === 'active' ? 'Aktif' : activeTab === 'sold_out' ? 'Terjual' : 'Draf'
              }`}
              description={
                activeTab === 'active'
                  ? 'Pasang hasil panen Anda sekarang agar segera dihubungi pembeli B2B via WhatsApp.'
                  : 'Listing komoditas Anda akan tercatat di sini.'
              }
              action={
                activeTab === 'active'
                  ? {
                      label: '+ Pasang Hasil Panen',
                      onClick: () => router.push('/jual'),
                    }
                  : undefined
              }
            />
          ) : (
            <div className="space-y-3">
              {filteredListings.map((listing: any) => (
                <article
                  key={listing.id}
                  className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm space-y-3 transition-all hover:bg-surface-container-low/40"
                >
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-xl bg-surface-container shrink-0 overflow-hidden relative">
                      {listing.photoUrl ? (
                        <img
                          src={listing.photoUrl}
                          alt={listing.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-primary">
                          <span className="material-symbols-outlined text-[28px]">
                            {listing.commodityIcon}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-label-sm text-label-sm text-on-surface-variant">
                            {listing.commodityName} • {listing.specificationGrade}
                          </span>
                          <span
                            className={`font-label-sm text-[12px] px-2 py-0.5 rounded-full ${
                              listing.status === 'active'
                                ? 'bg-primary-fixed/40 text-on-primary-fixed-variant'
                                : listing.status === 'sold_out'
                                ? 'bg-surface-container text-on-surface-variant'
                                : 'bg-secondary-fixed/50 text-on-secondary-fixed'
                            }`}
                          >
                            {listing.status === 'active'
                              ? 'Aktif'
                              : listing.status === 'sold_out'
                              ? 'Terjual'
                              : 'Draf'}
                          </span>
                        </div>
                        <h3 className="font-headline-sm text-headline-sm text-on-surface truncate mt-0.5">
                          {listing.title}
                        </h3>
                      </div>

                      <div className="flex items-baseline justify-between mt-1">
                        <div className="font-headline-sm text-headline-sm text-primary font-bold">
                          Rp {Number(listing.pricePerUnit).toLocaleString('id-ID')}
                          <span className="font-label-sm text-label-sm text-on-surface-variant font-normal">
                            {' '}
                            /{listing.unit}
                          </span>
                        </div>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">
                          Stok: {listing.stockQuantity} {listing.unit}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry info & last confirmed */}
                  <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between text-label-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      <span>{listing.views} Dilihat</span>
                      <span className="mx-1">•</span>
                      <span className="material-symbols-outlined text-[16px] text-primary">chat</span>
                      <span>{listing.waClicks} Chat WA</span>
                    </span>

                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                      <span>
                        {new Date(listing.lastStockConfirmedAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </span>
                  </div>

                  {/* 3-Column Quick Actions */}
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {listing.status === 'active' ? (
                      <button
                        type="button"
                        disabled={actionLoadingId === listing.id}
                        onClick={() => handleUpdateStatus(listing.id, 'sold_out')}
                        className="min-h-[44px] rounded-lg bg-surface-container-low text-on-surface font-label-sm flex items-center justify-center gap-1 hover:bg-surface-container transition-colors active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[18px]">check</span>
                        <span>Terjual</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={actionLoadingId === listing.id}
                        onClick={() => handleUpdateStatus(listing.id, 'active')}
                        className="min-h-[44px] rounded-lg bg-primary-container text-on-primary font-label-sm flex items-center justify-center gap-1 hover:brightness-105 transition-colors active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[18px]">refresh</span>
                        <span>Aktifkan</span>
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={actionLoadingId === listing.id}
                      onClick={() => handleConfirmStock(listing.id, true)}
                      className="min-h-[44px] rounded-lg bg-surface-container-low text-primary font-label-sm flex items-center justify-center gap-1 hover:bg-surface-container transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">done_all</span>
                      <span>Konfirmasi</span>
                    </button>

                    <Link
                      href={`/komoditas/${listing.id}`}
                      className="min-h-[44px] rounded-lg bg-surface-container-low text-on-surface-variant font-label-sm flex items-center justify-center gap-1 hover:bg-surface-container transition-colors active:scale-95"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                      <span>Lihat</span>
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* 5. Farmer Assistance Card */}
        <section className="bg-surface-container-low rounded-2xl p-4 flex items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">support_agent</span>
            </div>
            <div>
              <div className="font-label-md text-label-md font-bold text-on-surface">
                Butuh Bantuan Pemasaran?
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Hubungi Petugas Admin Way Kanan Agro via WhatsApp jika ada kendala.
              </p>
            </div>
          </div>

          <a
            href="https://wa.me/6281234567890?text=Halo%20Admin%20Way%20Kanan%20Agro%2C%20saya%20butuh%20bantuan%20terkait%20akun%20penjual%20saya."
            target="_blank"
            rel="noopener noreferrer"
            className="min-h-[44px] px-3.5 rounded-xl bg-surface-container-high text-primary font-label-sm flex items-center gap-1 shrink-0 hover:bg-surface-container-highest transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">chat</span>
            <span>Bantuan</span>
          </a>
        </section>
      </div>

      {/* Toast Notification */}
      <Toast
        message={toastMessage || ''}
        isVisible={Boolean(toastMessage)}
        variant={toastVariant}
        onClose={() => setToastMessage(null)}
      />
    </TabShell>
  );
}
