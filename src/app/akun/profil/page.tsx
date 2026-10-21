'use client';

import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { StackShell } from '@/components/shells/StackShell';
import { Button } from '@/components/ui/Button';
import { Banner } from '@/components/ui/Banner';
import { Timeline, TimelineStep } from '@/components/ui/Timeline';
import { Sheet } from '@/components/ui/Sheet';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { OtpInput } from '@/components/ui/OtpInput';
import { Toast } from '@/components/ui/Toast';

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

interface UserData {
  id: number;
  phoneNumber: string;
  displayName: string;
  role: string;
  farmerProfile?: {
    id: number;
    organizationName: string;
    subdistrict: string;
    addressDetail: string;
    idCardPhoto?: string;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    rejectionReason?: string;
  } | null;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVariant, setToastVariant] = useState<'success' | 'error'>('success');

  // Form fields
  const [displayName, setDisplayName] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [subdistrict, setSubdistrict] = useState('Banjit');
  const [addressDetail, setAddressDetail] = useState('');
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Change phone modal state
  const [isPhoneSheetOpen, setIsPhoneSheetOpen] = useState(false);
  const [newPhone, setNewPhone] = useState('');
  const [phoneOtp, setPhoneOtp] = useState('');
  const [phoneOtpStep, setPhoneOtpStep] = useState<1 | 2>(1);
  const [phoneOtpError, setPhoneOtpError] = useState('');
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [phoneDebugCode, setPhoneDebugCode] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.authenticated && data.user) {
        setUser(data.user);
        setDisplayName(data.user.displayName || '');
        if (data.user.farmerProfile) {
          setOrganizationName(data.user.farmerProfile.organizationName || '');
          setSubdistrict(data.user.farmerProfile.subdistrict || 'Banjit');
          setAddressDetail(data.user.farmerProfile.addressDetail || '');
          if (data.user.farmerProfile.idCardPhoto) {
            setIdCardPreview(data.user.farmerProfile.idCardPhoto);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKtpSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const options = {
        maxSizeMB: 0.2, // Compress under 200KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      const compressed = await imageCompression(file, options);
      const dataUrl = await imageCompression.getDataUrlFromFile(compressed);
      setIdCardPreview(dataUrl);
    } catch (err) {
      console.error(err);
      setToastMessage('Gagal mengompresi foto KTP');
      setToastVariant('error');
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    if (!organizationName.trim()) {
      setToastMessage('Nama kelompok atau usaha wajib diisi');
      setToastVariant('error');
      return;
    }
    if (!addressDetail.trim()) {
      setToastMessage('Alamat lengkap wajib diisi');
      setToastVariant('error');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/farmer/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName: displayName || organizationName,
          organizationName,
          subdistrict,
          addressDetail,
          idCardPhotoBase64: idCardPreview?.startsWith('data:') ? idCardPreview : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setToastMessage(data.error || 'Gagal menyimpan profil');
        setToastVariant('error');
        return;
      }

      setToastMessage(data.message || 'Profil berhasil disimpan!');
      setToastVariant('success');
      await fetchProfile();
    } catch {
      setToastMessage('Terjadi kendala jaringan');
      setToastVariant('error');
    } finally {
      setIsSaving(false);
    }
  };

  // Change phone: Step 1 -> Request OTP
  const handleRequestPhoneOtp = async () => {
    setPhoneOtpError('');
    const clean = newPhone.replace(/\D/g, '');
    if (clean.length < 9) {
      setPhoneOtpError('Nomor baru tidak valid');
      return;
    }

    setPhoneOtpLoading(true);
    try {
      const res = await fetch('/api/user/change-phone/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPhoneNumber: clean }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setPhoneOtpError(data.error || 'Gagal mengirim kode ke nomor baru');
        return;
      }

      if (data.debugCode) setPhoneDebugCode(data.debugCode);
      setPhoneOtpStep(2);
    } catch {
      setPhoneOtpError('Gagal menghubungi server');
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  // Change phone: Step 2 -> Verify OTP and Update
  const handleVerifyPhoneOtp = async () => {
    setPhoneOtpError('');
    if (phoneOtp.length !== 6) {
      setPhoneOtpError('Kode OTP harus 6 digit');
      return;
    }

    setPhoneOtpLoading(true);
    try {
      const res = await fetch('/api/user/change-phone/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newPhoneNumber: newPhone.replace(/\D/g, ''),
          code: phoneOtp,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setPhoneOtpError(data.error || 'Kode verifikasi salah');
        return;
      }

      setIsPhoneSheetOpen(false);
      setPhoneOtpStep(1);
      setNewPhone('');
      setPhoneOtp('');
      setToastMessage('Nomor WhatsApp berhasil diperbarui!');
      setToastVariant('success');
      await fetchProfile();
    } catch {
      setPhoneOtpError('Gagal memverifikasi kode');
    } finally {
      setPhoneOtpLoading(false);
    }
  };

  const profile = user?.farmerProfile;
  const status = profile?.verificationStatus || 'pending';

  // Build verification timeline steps
  const timelineSteps: TimelineStep[] = [
    {
      title: '1. Pendaftaran Nomor WhatsApp',
      description: 'Nomor aktif terverifikasi lewat kode masuk WhatsApp.',
      status: 'completed',
      date: 'Terverifikasi',
    },
    {
      title: '2. Pemeriksaan Dokumen KTP',
      description:
        status === 'verified'
          ? 'Dokumen KTP sah dan telah disetujui Admin.'
          : status === 'rejected'
          ? `Verifikasi ditolak: ${profile?.rejectionReason || 'Dokumen belum memenuhi syarat'}`
          : 'Dokumen sedang ditinjau oleh Admin Platform.',
      status: status === 'verified' ? 'completed' : status === 'rejected' ? 'current' : 'current',
      date: status === 'verified' ? 'Selesai' : status === 'rejected' ? 'Perlu Perbaikan' : 'Menunggu',
    },
    {
      title: '3. Hak Publikasi Katalog',
      description:
        status === 'verified'
          ? 'Akun Anda aktif penuh dan dapat menerbitkan komoditas panen.'
          : 'Fitur terbit listing aktif setelah status terverifikasi oleh Admin.',
      status: status === 'verified' ? 'completed' : 'upcoming',
    },
  ];

  return (
    <StackShell
      title="Profil & Verifikasi Usaha"
      backHref={user?.role === 'farmer' ? '/dashboard' : '/katalog'}
      actionDock={
        <Button
          type="button"
          size="lg"
          isLoading={isSaving}
          loadingText="Menyimpan Dokumen..."
          icon="verified_user"
          onClick={handleSaveProfile}
        >
          Simpan & Ajukan Verifikasi
        </Button>
      }
    >
      <div className="space-y-6 pt-2">
        {/* Status Banner */}
        {status === 'verified' && (
          <Banner
            variant="success"
            title="Profil Usaha Terverifikasi"
            description="Kelompok tani Anda telah diverifikasi oleh Admin. Semua produk yang Anda pasang akan mendapatkan lencana Terverifikasi di katalog publik."
          />
        )}
        {status === 'pending' && (
          <Banner
            variant="warning"
            title="Menunggu Verifikasi Admin"
            description="Data profil dan foto KTP Anda sedang diperiksa. Anda tetap dapat menyusun dan menyimpan draf komoditas sebelum verifikasi selesai."
          />
        )}
        {status === 'rejected' && (
          <Banner
            variant="error"
            title="Verifikasi Ditolak"
            description={profile?.rejectionReason || 'Foto KTP tidak terbaca jelas. Silakan unggah ulang foto asli.'}
          />
        )}

        {/* Account Summary & Change Phone */}
        <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Data Akun</h3>
            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded-full bg-surface-container text-primary font-bold">
              {user?.role === 'farmer' ? 'Penjual' : 'Pembeli'}
            </span>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-surface-container-high">
            <div>
              <div className="font-label-sm text-label-sm text-on-surface-variant">Nomor WhatsApp Aktif</div>
              <div className="font-headline-sm text-headline-sm text-on-surface">
                +62 {user?.phoneNumber.startsWith('0') ? user?.phoneNumber.slice(1) : user?.phoneNumber}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsPhoneSheetOpen(true);
                setPhoneOtpStep(1);
                setPhoneOtpError('');
              }}
              className="min-h-[48px] px-3 rounded-lg bg-surface-container-high text-primary font-label-sm hover:bg-surface-container-highest transition-colors inline-flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
              <span>Ganti Nomor</span>
            </button>
          </div>
        </section>

        {/* Verification Timeline */}
        <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-3">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Linimasa Verifikasi</h3>
          <Timeline steps={timelineSteps} />
        </section>

        {/* Business Profile Data */}
        <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-4">
          <h3 className="font-headline-sm text-headline-sm text-on-surface">Data Usaha Tani</h3>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface block">
              Nama Kelompok Tani / Usaha <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              placeholder="Contoh: Gapoktan Makmur Jaya"
              className="w-full h-[52px] px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-lg focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface block">
              Nama Kontak / Penanggung Jawab
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Contoh: Pak Joko Susanto"
              className="w-full h-[52px] px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-lg focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface block">
              Kecamatan di Kabupaten Way Kanan <span className="text-error">*</span>
            </label>
            <div className="relative">
              <select
                value={subdistrict}
                onChange={(e) => setSubdistrict(e.target.value)}
                className="w-full h-[52px] px-space-md pr-10 rounded-xl bg-surface-container-low text-on-surface font-body-lg appearance-none focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {SUBDISTRICTS.map((sub) => (
                  <option key={sub} value={sub}>
                    Kecamatan {sub}
                  </option>
                ))}
              </select>
              <span className="material-symbols-outlined text-[24px] text-on-surface-variant absolute right-3 top-3.5 pointer-events-none">
                arrow_drop_down
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-label-md text-label-md text-on-surface block">
              Alamat Lengkap / Lokasi Gudang <span className="text-error">*</span>
            </label>
            <textarea
              rows={3}
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              placeholder="Contoh: Jl. Lintas Banjit No. 12, RT 02/RW 01, Desa Rantau Jaya"
              className="w-full p-space-md rounded-xl bg-surface-container-low text-on-surface font-body-md focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
        </section>

        {/* KTP Document Upload Area */}
        <section className="bg-surface-container-lowest rounded-xl p-4 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Dokumen Identitas KTP</h3>
            <span className="font-label-sm text-label-sm text-primary font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Privat (Hanya Admin)
            </span>
          </div>

          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Foto KTP asli penanggung jawab kelompok tani diperlukan untuk mencegah penipuan dan mendapatkan status Terverifikasi.
          </p>

          {/* Viewfinder aspect 16:10 */}
          <div className="relative aspect-[16/10] rounded-2xl bg-surface-container-low overflow-hidden flex items-center justify-center border-2 border-dashed border-outline-variant">
            {idCardPreview ? (
              <img
                src={idCardPreview}
                alt="Dokumen KTP Penjual"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-4 flex flex-col items-center">
                <span className="material-symbols-outlined text-[44px] text-primary mb-1">
                  badge
                </span>
                <span className="font-headline-sm text-headline-sm text-on-surface">Posisikan KTP di sini</span>
                <span className="font-body-sm text-on-surface-variant mt-1 max-w-xs">
                  Pastikan NIK, nama, dan foto terlihat jelas tanpa pantulan cahaya
                </span>
              </div>
            )}

            {/* Corner viewfinders */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br" />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="primary"
              className="flex-1"
              isLoading={isCompressing}
              loadingText="Mengompresi KTP..."
              icon="photo_camera"
              onClick={() => fileInputRef.current?.click()}
            >
              {idCardPreview ? 'Ganti Foto KTP' : 'Foto / Unggah KTP'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleKtpSelect}
              className="hidden"
            />
          </div>

          <div className="bg-surface-container-low/70 rounded-lg p-3 text-body-sm text-on-surface-variant space-y-1">
            <div className="font-label-sm text-on-surface font-semibold">Panduan Foto KTP:</div>
            <div>• Gunakan KTP asli (bukan fotokopi hitam putih)</div>
            <div>• Seluruh 4 sudut KTP masuk ke dalam bingkai foto</div>
            <div>• Kompresi otomatis browser menjaga ukuran berkas &lt;200KB</div>
          </div>
        </section>
      </div>

      {/* Change Phone Bottom Sheet with OTP verification */}
      <Sheet
        isOpen={isPhoneSheetOpen}
        onClose={() => setIsPhoneSheetOpen(false)}
        title="Ganti Nomor WhatsApp"
      >
        <div className="space-y-4 py-2">
          {phoneOtpStep === 1 ? (
            <>
              <p className="font-body-md text-on-surface-variant">
                Masukkan nomor WhatsApp baru Anda. Kami akan mengirimkan kode OTP 6 digit ke nomor baru sebelum perubahan disimpan.
              </p>
              <PhoneInput value={newPhone} onChange={setNewPhone} error={phoneOtpError} />
              <Button
                type="button"
                variant="primary"
                size="lg"
                isLoading={phoneOtpLoading}
                loadingText="Mengirim Kode..."
                onClick={handleRequestPhoneOtp}
              >
                Kirim Kode OTP ke Nomor Baru
              </Button>
            </>
          ) : (
            <>
              <div className="bg-surface-container p-3 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-label-sm text-on-surface-variant">Nomor Baru:</div>
                  <div className="font-headline-sm text-on-surface">+62 {newPhone.replace(/\D/g, '')}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPhoneOtpStep(1)}
                  className="text-primary font-label-sm hover:underline"
                >
                  Ubah
                </button>
              </div>

              {phoneDebugCode && (
                <div className="bg-secondary-fixed/50 text-on-secondary-fixed p-2.5 rounded-lg text-label-sm flex items-center justify-between">
                  <span>Kode Dev: <strong>{phoneDebugCode}</strong></span>
                  <button
                    type="button"
                    onClick={() => setPhoneOtp(phoneDebugCode)}
                    className="text-primary underline font-bold"
                  >
                    Tempel
                  </button>
                </div>
              )}

              <OtpInput
                value={phoneOtp}
                onChange={setPhoneOtp}
                error={phoneOtpError}
                onResend={handleRequestPhoneOtp}
              />

              <Button
                type="button"
                variant="primary"
                size="lg"
                isLoading={phoneOtpLoading}
                loadingText="Memverifikasi Nomor..."
                onClick={handleVerifyPhoneOtp}
                disabled={phoneOtp.length !== 6}
              >
                Konfirmasi & Simpan Nomor
              </Button>
            </>
          )}
        </div>
      </Sheet>

      {/* Toast Notification */}
      <Toast
        isVisible={!!toastMessage}
        variant={toastVariant}
        message={toastMessage}
        onClose={() => setToastMessage('')}
      />
    </StackShell>
  );
}
