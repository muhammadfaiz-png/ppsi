# Catatan Keputusan Desain & Arsitektur (DECISIONS.md)
## Way Kanan Agro-Commerce

Dokumen ini mencatat keputusan arsitektur, resolusi konflik antara PRD dan SKILL.md, penyesuaian skema data, serta jawaban atas pertanyaan terbuka PRD (Q-01 hingga Q-10).

---

### 1. Prinsip Utama Resolusi Aturan
- **Perilaku, Lingkup, dan Keamanan:** Mengikuti `PRD.md` (Product Requirement Document).
- **Visual, Desain Antarmuka, dan Token:** Mengikuti `SKILL.md` (way-kanan-agro-design).
- **Batasan MVP:** Tanpa payment gateway/escrow, tanpa logistik/ongkir otomatis, tanpa komisi, tanpa rating/ulasan, tanpa aplikasi native, tanpa manifest/fitur "Install PWA" (Serwist hanya untuk caching service worker & offline fallback).

---

### 2. Resolusi Pertanyaan Terbuka PRD (Q-01 s/d Q-10)

| Pertanyaan PRD | Keputusan MVP & Rasional |
|---|---|
| **Q-01: Wewenang Verifikasi Profil Penjual** (Admin vs PPL Dinas) | Untuk versi MVP, verifikasi profil penjual dilakukan langsung oleh **Admin Platform** independen melalui dokumen KTP/Surat Keterangan yang diunggah ke penyimpanan privat. Status verifikasi: `pending`, `verified`, `rejected`. |
| **Q-02: Pilihan Standar Mutu/Grade Komoditas** | Ditentukan parameter mutu spesifik per komoditas dengan dropdown preset & input nilai:<br>• **Singkong**: Kadar Pati (contoh: > 25%, 20–25%, < 20%)<br>• **Kopi Robusta**: Kadar Air (contoh: 12–13%, 14–16%) & Defect<br>• **Karet/Lateks**: DRC (Dry Rubber Content %)<br>• **Padi & Jagung**: Kadar Air (%) & Tingkat Kebersihan |
| **Q-03: Alokasi Biaya Kuota OTP WhatsApp API** | Menggunakan arsitektur interface `IWhatsAppGateway` dengan dua driver:<br>1. Driver `console`: Mode development/demo default, OTP dan pesan notifikasi dicetak ke console/log server tanpa biaya API.<br>2. Driver `fonnte`: Mode production terintegrasi API Fonnte via token terkonfigurasi. |
| **Q-04: Petugas Dinas untuk Papan Harga Indikasi** | Penambahan role khusus **`officer`** (Petugas Dinas/Pasar) yang memiliki hak akses eksklusif untuk memperbarui Papan Harga Indikasi per kecamatan. Nama instansi dibuat dinamis melalui konfigurasi `PRICE_SOURCE_AGENCY` (default: "Dinas Ketahanan Pangan & Pertanian Kab. Way Kanan"). |
| **Q-05: Batasan Tanggung Jawab Hukum Platform** | Platform bertindak sebagai direktori katalog komoditas & matchmaking kontak WhatsApp. Semua detail produk memuat penafian (disclaimer): transaksi pembayaran dan pengiriman disepakati langsung oleh kedua pihak di luar platform. Platform tidak mengelola escrow atau penjaminan barang. |
| **Q-06: Kesiapan Rekening Bank Kelompok Gapoktan** | MVP tidak menyertakan sistem pembayaran digital / escrow internal. Pembeli dan penjual bernegosiasi serta bertransaksi secara mandiri, sehingga ketiadaan rekening kelompok tidak menghambat operasional MVP. |
| **Q-07: Sanksi Pelanggaran Stok / Informasi Palsu** | Sistem pelaporan mandiri: jika sebuah listing menerima $\ge 3$ laporan unik dari pengguna terdaftar, sistem secara otomatis mengubah status listing menjadi `suspended` dan mencatat peristiwa ke `audit_logs` untuk ditinjau oleh Admin. Admin berwenang membekukan (`suspended`) akun pelanggar. |
| **Q-08: Cetak Surat Jalan / Bukti Asal Barang** | Dikecualikan dari MVP (Non-Goals) untuk menjaga alur tetap sederhana bagi petani. Transaksi dan pengangkutan diselesaikan secara konvensional antar pihak. |
| **Q-09: Regulasi & Dukungan Dinas** | Difasilitasi melalui role `officer` untuk publikasi harga resmi mingguan, lencana verifikasi bertingkat, serta catatan transparansi harga 14 kecamatan. |
| **Q-10: Integrasi Data Ekspor Komoditas** | Dikecualikan dari MVP (Non-Goals). Fokus MVP adalah pasar B2B lokal dan regional Lampung/Sumatera Selatan. |

---

### 3. Penyesuaian Model Data (Prisma Schema)

1. **`users`**:
   - Ditambahkan field `display_name` (nama pengguna / kontak).
   - Penyesuaian `role` enum: `farmer`, `buyer`, `admin`, `officer`.
   - `status`: `active`, `suspended`.
2. **`farmer_profiles`**:
   - `verification_status`: enum `pending`, `verified`, `rejected` (menggantikan boolean `is_verified`).
   - Ditambahkan: `rejection_reason` (Text opsional, wajib diisi admin saat menolak), `verified_by` (FK ke `users.id`), `verified_at` (Timestamp).
3. **`product_listings`**:
   - Ditambahkan `unit`: enum `kg`, `ton`.
   - Ditambahkan `last_stock_confirmed_at` (Timestamp, untuk pelacakan 7 hari).
   - Status listing enum diperluas: `draft`, `active`, `sold_out`, `pending_confirmation`, `suspended`, `archived`.
4. **`price_boards`**:
   - Ditambahkan field `unit` (default: `kg`, dengan padanan harga Ton di UI).
5. **Tabel Baru Ditambahkan**:
   - `listing_photos`: Menyimpan URL/path foto (maksimal 3 foto per listing, rasio 4:3 / 1:1, ukuran dikompresi di browser).
   - `otp_codes`: Menyimpan `phone_number`, `code_hash` (keamanan sha256/bcrypt), `expires_at`, `attempts` (maks 5), `consumed_at`, dan `purpose` (`login`, `change_phone`).
   - `audit_logs`: Mencatat `actor_id`, `action`, `entity`, `entity_id`, `meta` (JSON), `created_at`.
   - `listing_events`: Mencatat telemetri konversi: `type` (`view`, `wa_click`), `listing_id`, `created_at`.
6. **Integritas Relasi**:
   - `reports`: Constraint `UNIQUE(reporter_id, listing_id)` mencegah spam laporan ganda oleh pelapor yang sama.
   - Master data 14 kecamatan Way Kanan dan 5 komoditas kanonik.

---

### 4. Keputusan Keamanan & Privasi

1. **Nomor WhatsApp Penjual:**
   - Tidak pernah dicetak dalam dokumen HTML publik untuk mencegah scraping bot & penipuan.
   - Kontak penjual difasilitasi melalui endpoint server `/go/wa/[listingId]`. Endpoint ini memverifikasi bahwa listing aktif, mencatat event `wa_click` ke `listing_events`, lalu melakukan HTTP 302 / client redirect ke `https://wa.me/62...` dengan teks salam terenkripsi format PRD FR-05.
2. **Penyimpanan Foto KTP:**
   - Berkas KTP disimpan dalam folder privat (`/uploads/private/id_cards/`) dan tidak dapat diakses secara publik.
   - Berkas hanya dapat dibuka oleh role `admin` melalui route terautentikasi `/api/admin/verifications/[id]/document`.
3. **Autentikasi & Sesi:**
   - Stateless JWT ditandatangani menggunakan pustaka `jose` (HS256) dengan secret `JWT_SECRET`.
   - Token disimpan dalam cookie `httpOnly`, `sameSite=lax`, `secure` (production), dengan masa aktif sesi 30 hari.
4. **Rate Limiting OTP:**
   - Maksimal 1 permintaan OTP per nomor per 60 detik (cooldown).
   - Masa berlaku kode OTP adalah 5 menit.
   - Maksimal percobaan salah 5 kali sebelum kode dibatalkan (invalid).
   - Rate limit IP untuk mencegah brute-force.

---

### 5. Keputusan Desain & Aksesibilitas (SKILL.md)

1. **Palet Warna & Tonal Hierarchy:**
   - Menggunakan konfigurasi Tailwind CSS v3.4 yang dikompilasi persis dari `SKILL.md §2`.
   - Tidak ada border 1px dekoratif; kedalaman diwujudkan dengan penumpukan lapisan tonal (`surface` -> `surface-container-lowest` -> `surface-container-low` -> `surface-container-high`).
   - Tombol WhatsApp menggunakan warna `#25D366` dengan **teks gelap** (`text-on-surface` / `#0d1f11`) untuk memastikan kontras rasio terbaca jelas di bawah terik sinar matahari kebun.
2. **Ikon Kanonik Komoditas:**
   - Singkong: `spa`
   - Kopi Robusta: `coffee`
   - Karet / Lateks: `water_drop`
   - Padi: `grass`
   - Jagung: `grain`
   - Petani / Identitas Profil: `agriculture`
3. **Form Pendaftaran Produk (3 Langkah):**
   - Dipecah menjadi 1 langkah per layar (bukan ditumpuk dalam 1 halaman panjang):
     1. Langkah 1: Kategori, Komoditas, Judul.
     2. Langkah 2: Stok, Satuan, Harga Indikasi, Min. Order.
     3. Langkah 3: Parameter Mutu, 3 Foto Komoditas, Deskripsi, Pratinjau Tampilan Pembeli.
4. **Dukungan Offline:**
   - Draf formulir pasang hasil panen disimpan ke IndexedDB lokal (`idb-keyval`). Jika koneksi terputus, penjual tetap dapat menyusun draf dan melakukan sinkronisasi otomatis saat kembali online.
   - Caching Service Worker menggunakan Serwist untuk aset statis dan strategi stale-while-revalidate untuk katalog dan papan harga.
