'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';

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

const COMMODITIES = ['Singkong', 'Kopi Robusta', 'Karet', 'Padi', 'Jagung'];

export default function AdminDashboardPage() {
  const router = useRouter();

  // Authentication & Access Control
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  // Active Main Tab
  const [mainTab, setMainTab] = useState<'verifications' | 'reports' | 'prices' | 'audit'>('verifications');

  // Tab 1: Verifications State
  const [verifications, setVerifications] = useState<any[]>([]);
  const [verificationFilter, setVerificationFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [verificationCounts, setVerificationCounts] = useState<any>({ all: 0, pending: 0, verified: 0, rejected: 0 });
  const [isLoadingVerifications, setIsLoadingVerifications] = useState(false);

  // Document & Reject Modal
  const [previewDocProfile, setPreviewDocProfile] = useState<any>(null);
  const [rejectModalProfile, setRejectModalProfile] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  // Tab 2: Reports State
  const [reports, setReports] = useState<any[]>([]);
  const [suspendedListings, setSuspendedListings] = useState<any[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(false);

  // Tab 3: Price Update State
  const [selectedComm, setSelectedComm] = useState('Singkong');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState(SUBDISTRICTS[0]);
  const [inputPrice, setInputPrice] = useState('');
  const [isSubmittingPrice, setIsSubmittingPrice] = useState(false);

  // Tab 4: Audit Logs State
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  // Feedback Toasts
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  // 1. Check Auth on Mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (!data.authenticated || !data.user) {
          router.push('/masuk?callbackUrl=/admin');
          return;
        }
        if (data.user.role !== 'admin' && data.user.role !== 'officer') {
          setIsAuthorized(false);
          setIsLoadingAuth(false);
          return;
        }
        setCurrentUser(data.user);
        setIsAuthorized(true);
        setIsLoadingAuth(false);
      })
      .catch(() => {
        router.push('/masuk');
      });
  }, [router]);

  // 2. Fetch Data for Current Tab
  useEffect(() => {
    if (!isAuthorized) return;
    if (mainTab === 'verifications') {
      fetchVerifications();
    } else if (mainTab === 'reports') {
      fetchReports();
    } else if (mainTab === 'audit') {
      fetchAuditLogs();
    }
  }, [isAuthorized, mainTab, verificationFilter]);

  const fetchVerifications = async () => {
    setIsLoadingVerifications(true);
    try {
      const q = verificationFilter === 'all' ? '' : `?status=${verificationFilter}`;
      const res = await fetch(`/api/admin/verifications${q}`);
      const data = await res.json();
      setVerifications(data.profiles || []);
      setVerificationCounts(data.counts || { all: 0, pending: 0, verified: 0, rejected: 0 });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingVerifications(false);
    }
  };

  const fetchReports = async () => {
    setIsLoadingReports(true);
    try {
      const res = await fetch('/api/admin/reports');
      const data = await res.json();
      setReports(data.reports || []);
      setSuspendedListings(data.suspendedListings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const fetchAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const res = await fetch('/api/admin/audit-logs');
      const data = await res.json();
      setAuditLogs(data.logs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingAudit(false);
    }
  };

  // Actions: Approve Verification
  const handleApproveVerification = async (profileId: number) => {
    setActionLoadingId(profileId);
    try {
      const res = await fetch(`/api/admin/verifications/${profileId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setToastVariant('success');
      setToastMessage(data.message || 'Verifikasi berhasil disetujui');
      fetchVerifications();
    } catch (err: any) {
      setToastVariant('error');
      setToastMessage(err.message || 'Gagal memproses persetujuan');
    } finally {
      setActionLoadingId(null);
    }
  };

  // Actions: Reject Verification
  const handleRejectVerification = async () => {
    if (!rejectModalProfile || !rejectionReason.trim()) return;
    setIsRejecting(true);
    try {
      const res = await fetch(`/api/admin/verifications/${rejectModalProfile.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectionReason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setToastVariant('success');
      setToastMessage(data.message || 'Verifikasi ditolak');
      setRejectModalProfile(null);
      setRejectionReason('');
      fetchVerifications();
    } catch (err: any) {
      setToastVariant('error');
      setToastMessage(err.message || 'Gagal memproses penolakan');
    } finally {
      setIsRejecting(false);
    }
  };

  // Actions: Listing Status
  const handleListingStatus = async (listingId: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/listings/${listingId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setToastVariant('success');
      setToastMessage(data.message || 'Status listing berhasil diubah');
      fetchReports();
    } catch (err: any) {
      setToastVariant('error');
      setToastMessage(err.message || 'Gagal mengubah status');
    }
  };

  // Actions: User Status (Suspend account)
  const handleUserStatus = async (userId: number, status: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setToastVariant('success');
      setToastMessage(data.message || 'Status akun berhasil diubah');
      fetchReports();
    } catch (err: any) {
      setToastVariant('error');
      setToastMessage(err.message || 'Gagal mengubah status akun');
    }
  };

  // Actions: Resolve Report
  const handleResolveReport = async (reportId: number, action: 'resolve' | 'reject') => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setToastVariant('success');
      setToastMessage(data.message || 'Laporan berhasil diperbarui');
      fetchReports();
    } catch (err: any) {
      setToastVariant('error');
      setToastMessage(err.message || 'Gagal memproses laporan');
    }
  };

  // Actions: Price Submit
  const handlePriceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(inputPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      alert('Masukkan harga yang valid');
      return;
    }

    setIsSubmittingPrice(true);
    try {
      const res = await fetch('/api/prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commodityName: selectedComm,
          subdistrict: selectedSubdistrict,
          indicatedPrice: priceNum,
          unit: 'kg',
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setToastVariant('success');
      setToastMessage(`Harga ${selectedComm} di ${selectedSubdistrict} berhasil diperbarui menjadi Rp ${priceNum.toLocaleString('id-ID')}`);
      setInputPrice('');
    } catch (err: any) {
      setToastVariant('error');
      setToastMessage(err.message || 'Gagal memperbarui harga');
    } finally {
      setIsSubmittingPrice(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-surface p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-[32px]">lock</span>
        </div>
        <h1 className="font-headline-sm text-headline-sm text-on-surface">Akses Terbatas</h1>
        <p className="font-body-md text-on-surface-variant max-w-sm mt-1 mb-6">
          Halaman ini khusus untuk Tim Administrator dan Petugas Dinas Pertanian Way Kanan.
        </p>
        <Link
          href="/"
          className="min-h-[48px] px-6 rounded-xl bg-primary text-on-primary font-label-md inline-flex items-center"
        >
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface font-body-md text-body-md text-on-surface antialiased min-h-screen flex flex-col">
      {/* Header Admin */}
      <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(27,46,30,0.06)] pt-safe">
        <div className="h-16 px-margin flex items-center justify-between gap-space-sm max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2.5 min-w-0">
            <Link
              href="/"
              className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
              aria-label="Kembali ke Beranda"
            >
              <span className="material-symbols-outlined text-[20px]">arrow_back</span>
            </Link>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-headline-sm text-primary tracking-tight">
                  Panel Moderasi Admin
                </span>
                <span className="bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full uppercase">
                  {currentUser?.role}
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant block">
                Kabupaten Way Kanan
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/harga"
              className="px-3 py-1.5 rounded-xl bg-surface-container-high text-primary font-label-sm hover:bg-surface-container-highest transition-colors hidden sm:inline-flex"
            >
              Lihat Papan Harga
            </Link>
            <div className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
              {currentUser?.displayName?.charAt(0) || 'A'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="px-margin max-w-4xl mx-auto w-full py-5 flex-1 space-y-5 pb-20">
        {/* Navigation Tabs */}
        <SegmentedControl<'verifications' | 'reports' | 'prices' | 'audit'>
          options={[
            {
              value: 'verifications',
              label: 'Verifikasi Seller',
              icon: 'verified_user',
              count: verificationCounts.pending > 0 ? verificationCounts.pending : undefined,
            },
            {
              value: 'reports',
              label: 'Laporan & Moderasi',
              icon: 'report_problem',
              count: reports.filter((r) => r.status === 'pending').length || undefined,
            },
            { value: 'prices', label: 'Input Harga', icon: 'trending_up' },
            { value: 'audit', label: 'Log Audit', icon: 'history' },
          ]}
          value={mainTab}
          onChange={(val) => setMainTab(val)}
        />

        {/* =========================================================================
            TAB 1: VERIFIKASI SELLER
           ========================================================================= */}
        {mainTab === 'verifications' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Filter Pills */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: 'pending', label: `Menunggu (${verificationCounts.pending})` },
                { id: 'verified', label: `Terverifikasi (${verificationCounts.verified})` },
                { id: 'rejected', label: `Ditolak (${verificationCounts.rejected})` },
                { id: 'all', label: `Semua (${verificationCounts.all})` },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setVerificationFilter(f.id as any)}
                  className={`min-h-[44px] px-3.5 rounded-xl font-label-sm whitespace-nowrap transition-all ${
                    verificationFilter === f.id
                      ? 'bg-primary text-on-primary font-bold shadow-sm'
                      : 'bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* List of Seller Profiles */}
            {isLoadingVerifications ? (
              <div className="space-y-3 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-surface-container-lowest rounded-2xl shadow-sm" />
                ))}
              </div>
            ) : verifications.length === 0 ? (
              <EmptyState
                icon="fact_check"
                title="Tidak Ada Antrean Verifikasi"
                description={`Tidak ada profil penjual dengan status "${verificationFilter}".`}
              />
            ) : (
              <div className="space-y-3">
                {verifications.map((item) => (
                  <article
                    key={item.id}
                    className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-headline-sm text-headline-sm text-on-surface">
                            {item.organizationName}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full font-label-sm text-[12px] ${
                              item.verificationStatus === 'verified'
                                ? 'bg-[#E8F5E9] text-[#1E7E34]'
                                : item.verificationStatus === 'rejected'
                                ? 'bg-error-container text-on-error-container'
                                : 'bg-secondary-fixed text-on-secondary-fixed'
                            }`}
                          >
                            {item.verificationStatus === 'verified'
                              ? 'Terverifikasi'
                              : item.verificationStatus === 'rejected'
                              ? 'Ditolak'
                              : 'Menunggu'}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                          Kontak: {item.user?.displayName} ({item.user?.phoneNumber}) • Kecamatan: {item.subdistrict}
                        </p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Alamat: {item.addressDetail}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-label-sm text-label-sm bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">
                          {item.totalListings} Listing
                        </span>
                      </div>
                    </div>

                    {item.rejectionReason && (
                      <div className="p-2.5 rounded-xl bg-error-container/40 text-error text-body-sm">
                        <span className="font-bold">Alasan Penolakan: </span>
                        {item.rejectionReason}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between gap-2 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setPreviewDocProfile(item)}
                        className="min-h-[44px] px-3 rounded-xl bg-surface-container-low text-primary font-label-sm flex items-center gap-1.5 hover:bg-surface-container active:scale-95"
                      >
                        <span className="material-symbols-outlined text-[18px]">badge</span>
                        <span>Lihat Bukti KTP</span>
                      </button>

                      <div className="flex items-center gap-2 ml-auto">
                        {item.verificationStatus !== 'verified' && (
                          <Button
                            type="button"
                            variant="primary"
                            className="min-h-[44px] px-4 font-label-sm"
                            isLoading={actionLoadingId === item.id}
                            onClick={() => handleApproveVerification(item.id)}
                          >
                            Setujui
                          </Button>
                        )}

                        {item.verificationStatus !== 'rejected' && (
                          <Button
                            type="button"
                            variant="secondary"
                            className="min-h-[44px] px-4 font-label-sm text-error bg-surface-container-low hover:bg-error-container"
                            onClick={() => {
                              setRejectModalProfile(item);
                              setRejectionReason('');
                            }}
                          >
                            Tolak
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            TAB 2: LAPORAN & MODERASI LISTING
           ========================================================================= */}
        {mainTab === 'reports' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            {/* Suspended Listings Alert Section */}
            {suspendedListings.length > 0 && (
              <section className="bg-error-container/30 border border-error/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-error">
                  <span className="material-symbols-outlined text-[22px]">gpp_maybe</span>
                  <h3 className="font-headline-sm text-headline-sm font-bold">
                    Listing Ditangguhkan Otomatis (≥ 3 Laporan)
                  </h3>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Listing di bawah ini otomatis disuspensi sistem karena menerima beberapa laporan pelanggaran.
                </p>

                <div className="space-y-2">
                  {suspendedListings.map((item) => (
                    <div
                      key={item.id}
                      className="bg-surface-container-lowest rounded-xl p-3 shadow-sm flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-headline-sm text-headline-sm text-on-surface">
                          {item.title}
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">
                          Petani: {item.farmerProfile?.organizationName} ({item.farmerProfile?.user?.phoneNumber}) • {item.reportCount} Laporan
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleListingStatus(item.id, 'active')}
                          className="min-h-[40px] px-3 rounded-lg bg-primary text-on-primary font-label-sm shadow-sm"
                        >
                          Buka Suspensi
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUserStatus(item.farmerProfile.user.id, 'suspended')}
                          className="min-h-[40px] px-3 rounded-lg bg-error text-on-error font-label-sm shadow-sm"
                        >
                          Bekukan Akun
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* General User Reports */}
            <div className="space-y-3">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">
                Daftar Laporan Pengguna ({reports.length})
              </h3>

              {isLoadingReports ? (
                <div className="space-y-3 animate-pulse">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-28 bg-surface-container-lowest rounded-2xl shadow-sm" />
                  ))}
                </div>
              ) : reports.length === 0 ? (
                <EmptyState
                  icon="task_alt"
                  title="Tidak Ada Laporan Aktif"
                  description="Platform dalam keadaan aman. Belum ada laporan sengketa baru dari pengguna."
                />
              ) : (
                <div className="space-y-3">
                  {reports.map((r) => (
                    <article
                      key={r.id}
                      className="bg-surface-container-lowest rounded-2xl p-4 shadow-sm space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-headline-sm text-headline-sm text-on-surface">
                            Listing: {r.listing?.title}
                          </div>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">
                            Pelapor: {r.reporter?.displayName} ({r.reporter?.phoneNumber}) • Waktu:{' '}
                            {new Date(r.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>

                        <span
                          className={`font-label-sm text-[12px] px-2 py-0.5 rounded-full ${
                            r.status === 'resolved'
                              ? 'bg-[#E8F5E9] text-[#1E7E34]'
                              : r.status === 'rejected'
                              ? 'bg-surface-container text-on-surface-variant'
                              : 'bg-secondary-fixed text-on-secondary-fixed'
                          }`}
                        >
                          {r.status === 'resolved'
                            ? 'Selesai'
                            : r.status === 'rejected'
                            ? 'Ditolak'
                            : 'Menunggu'}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-surface-container-low text-on-surface font-body-md">
                        <span className="font-bold block text-label-sm text-on-surface-variant">
                          Keluhan / Alasan:
                        </span>
                        {r.reason}
                      </div>

                      {/* Moderation Actions for this report */}
                      <div className="pt-2 border-t border-surface-container-high/60 flex items-center justify-between gap-2 flex-wrap">
                        <Link
                          href={`/komoditas/${r.listing?.id}`}
                          target="_blank"
                          className="font-label-sm text-primary flex items-center gap-1 hover:underline"
                        >
                          <span>Lihat Halaman Produk</span>
                          <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                        </Link>

                        <div className="flex items-center gap-2 ml-auto">
                          {r.listing?.status !== 'suspended' && (
                            <button
                              type="button"
                              onClick={() => handleListingStatus(r.listing.id, 'suspended')}
                              className="px-3 py-1.5 rounded-lg bg-surface-container-low text-error font-label-sm hover:bg-error-container"
                            >
                              Tangguhkan Listing
                            </button>
                          )}

                          {r.status === 'pending' && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleResolveReport(r.id, 'reject')}
                                className="px-3 py-1.5 rounded-lg bg-surface-container-high font-label-sm hover:bg-surface-container-highest"
                              >
                                Abaikan
                              </button>
                              <button
                                type="button"
                                onClick={() => handleResolveReport(r.id, 'resolve')}
                                className="px-3 py-1.5 rounded-lg bg-primary text-on-primary font-label-sm shadow-sm"
                              >
                                Selesaikan
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 3: PEMBARUAN HARGA INDIKASI
           ========================================================================= */}
        {mainTab === 'prices' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm space-y-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Pembaruan Cepat Harga Indikasi Pasar
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Input data harga per komoditas dan kecamatan yang berlaku untuk panduan petani.
                </p>
              </div>

              <form onSubmit={handlePriceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-1">
                      Komoditas <span className="text-error">*</span>
                    </label>
                    <select
                      value={selectedComm}
                      onChange={(e) => setSelectedComm(e.target.value)}
                      className="w-full h-[52px] px-3.5 rounded-xl bg-surface-container-low font-body-lg text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      {COMMODITIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-label-md text-label-md text-on-surface block mb-1">
                      Kecamatan (Way Kanan) <span className="text-error">*</span>
                    </label>
                    <select
                      value={selectedSubdistrict}
                      onChange={(e) => setSelectedSubdistrict(e.target.value)}
                      className="w-full h-[52px] px-3.5 rounded-xl bg-surface-container-low font-body-lg text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      {SUBDISTRICTS.map((sub) => (
                        <option key={sub} value={sub}>
                          {sub}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-label-md text-label-md text-on-surface block mb-1">
                    Harga Indikasi Baru (Rp / Kg) <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-headline-sm text-primary font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={inputPrice}
                      onChange={(e) => setInputPrice(e.target.value)}
                      placeholder="Contoh: 1850"
                      className="w-full h-[52px] pl-12 pr-4 rounded-xl bg-surface-container-low font-headline-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full min-h-[52px] font-label-lg"
                  isLoading={isSubmittingPrice}
                >
                  Simpan Pembaruan Harga
                </Button>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================================
            TAB 4: LOG AUDIT
           ========================================================================= */}
        {mainTab === 'audit' && (
          <div className="space-y-3 animate-in fade-in duration-150">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">
              Jejak Audit & Keamanan Sistem
            </h3>

            {isLoadingAudit ? (
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-surface-container-lowest rounded-xl shadow-sm" />
                ))}
              </div>
            ) : auditLogs.length === 0 ? (
              <EmptyState
                icon="history"
                title="Belum Ada Log Audit"
                description="Aktivitas penting sistem akan tercatat di sini secara otomatis."
              />
            ) : (
              <div className="bg-surface-container-lowest rounded-2xl shadow-sm overflow-hidden divide-y divide-surface-container-high/60">
                {auditLogs.map((log) => (
                  <div key={log.id} className="p-3.5 flex items-start justify-between gap-3 text-body-sm">
                    <div>
                      <div className="font-bold text-on-surface">
                        {log.action} • <span className="text-primary font-normal">{log.entity} #{log.entityId}</span>
                      </div>
                      <p className="text-on-surface-variant text-[13px] mt-0.5">
                        Oleh: {log.actor?.displayName || 'Sistem'} ({log.actor?.role || 'System'})
                      </p>
                      {log.meta && (
                        <p className="text-on-surface-variant font-mono text-[11px] bg-surface-container-low p-1 rounded mt-1 max-w-lg overflow-x-auto">
                          {JSON.stringify(log.meta)}
                        </p>
                      )}
                    </div>
                    <span className="font-label-sm text-[12px] text-on-surface-variant shrink-0">
                      {new Date(log.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal: Preview Bukti Dokumen KTP */}
      <Sheet
        isOpen={Boolean(previewDocProfile)}
        onClose={() => setPreviewDocProfile(null)}
        title={`Bukti KTP: ${previewDocProfile?.organizationName || ''}`}
        footer={
          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => setPreviewDocProfile(null)}
          >
            Tutup
          </Button>
        }
      >
        <div className="space-y-3 py-2">
          {previewDocProfile && (
            <div className="rounded-xl overflow-hidden border border-surface-container-high bg-surface-container-low">
              <img
                src={`/api/admin/verifications/${previewDocProfile.id}/document`}
                alt="Dokumen KTP Petani"
                className="w-full h-auto max-h-[60vh] object-contain mx-auto"
              />
            </div>
          )}
          <p className="font-body-sm text-body-sm text-on-surface-variant text-center">
            Dokumen ini dienkripsi dan hanya dapat diakses melalui hak otorisasi Administrator.
          </p>
        </div>
      </Sheet>

      {/* Modal: Alasan Penolakan Verifikasi */}
      <Sheet
        isOpen={Boolean(rejectModalProfile)}
        onClose={() => setRejectModalProfile(null)}
        title={`Tolak Verifikasi: ${rejectModalProfile?.organizationName || ''}`}
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setRejectModalProfile(null)}
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-[2] bg-error text-on-error hover:bg-error/90"
              isLoading={isRejecting}
              onClick={handleRejectVerification}
            >
              Kirim Penolakan
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2">
          <p className="font-body-md text-on-surface">
            Tuliskan alasan penolakan dengan jelas agar pengurus kelompok tani memahami dokumen yang perlu diperbaiki.
          </p>
          <div>
            <label className="font-label-md text-label-md text-on-surface block mb-1">
              Alasan Penolakan <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Contoh: Foto KTP buram / Nama KTP tidak sesuai dengan kontak Gapoktan..."
              className="w-full p-3 rounded-xl bg-surface-container-low font-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              required
            />
          </div>
        </div>
      </Sheet>

      {/* Toast Notification */}
      <Toast
        message={toastMessage || ''}
        isVisible={Boolean(toastMessage)}
        variant={toastVariant}
        onClose={() => setToastMessage(null)}
      />
    </div>
  );
}
