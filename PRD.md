# PRODUCT REQUIREMENT DOCUMENT (PRD)
## Way Kanan Agro-Commerce — Platform Perdagangan Digital Agribisnis B2B & B2C[cite: 3]

| Metadatum | Keterangan |[cite: 3]
| :--- | :--- |[cite: 3]
| **Nama Dokumen** | Product Requirement Document (PRD) Way Kanan Agro-Commerce |[cite: 3]
| **Versi Dokumen** | 1.0 (MVP Core Specification) |[cite: 3]
| **Target Platform** | Responsive Web Application (Mobile & Desktop) |[cite: 3]
| **Tanggal Penyusunan** | Oktober 2026 |[cite: 3]
| **Status Dokumen** | Approved for Technical & Functional Development |[cite: 3]

---

### 1. Problem Statement
* **Pihak Dirugikan 1 — Petani & Gapoktan:** Petani dan Kelompok Tani (Gapoktan) di Kabupaten Way Kanan, Provinsi Lampung, mengalami kerugian ekonomi sistematis akibat asimetri informasi harga komoditas utama (singkong, kopi, karet, padi, dan jagung) serta keterbatasan akses langsung ke pasar B2B (pabrik pengolahan, distributor, dan UMKM olahan)[cite: 3]. Rantai distribusi konvensional yang didominasi oleh perantara berlapir-lapis sering kali menetapkan harga secara sepihak dan memberlakukan pemotongan mutu (rafaksi) tanpa kriteria standar yang transparan[cite: 3].
* **Pihak Dirugikan 2 — Pembeli B2B & Industri:** Pembeli skala industri, pabrik tapioka/roastery, serta UMKM olahan kesulitan memverifikasi ketersediaan stok, volume panen riil, tingkat mutu/spesifikasi komoditas, dan lokasi produsen secara real-time[cite: 3]. Ketidakpastian ini menyebabkan biaya pencarian pasokan (sourcing cost) tinggi dan risiko fluktuasi pasokan yang mengganggu operasi bisnis[cite: 3].
* **Pihak Dirugikan 3 — Pemerintah Daerah:** Pemerintah Daerah Kabupaten Way Kanan kehilangan visibilitas terhadap neraca pangan harian, potensi komoditas unggulan kecamatan, dan rekam jejak transaksi ekonomi pertanian daerah, sehingga perumusan kebijakan publik dan intervensi ekonomi menjadi kurang presisi[cite: 3].

---

### 2. Target User + 2 Persona
Platform ini ditujukan bagi empat kelompok pengguna utama: Pengurus Gapoktan/Koperasi Tani, Pengepul Lokal, Pembeli B2B/UMKM, dan Admin Platform/Pemkab[cite: 3].

#### Persona 1: Pengurus Gapoktan (Penjual B2B Utama)
* **Identitas:** Pak Joko (48 Tahun) — Ketua Gapoktan Singkong & Kopi, Kecamatan Banjit, Way Kanan[cite: 3].
* **Perilaku Digital:** Smartphone Android mid-range, terbiasa menggunakan WhatsApp & Facebook; tidak memiliki laptop dan enggan mengisi formulir registrasi yang rumit[cite: 3].
* **Kebutuhan Utama:** Memasarkan komoditas panen anggota secara bulky (tonase besar), mendapatkan kepastian pembeli B2B, dan memperoleh perbandingan harga pasar yang adil[cite: 3].
* **Kendala Utama:** Koneksi internet di area lahan/gudang terkadang lambat; tidak memiliki rekening bank atas nama kelompok tani (masih pribadi); trauma dengan penipuan online[cite: 3].
* **Alasan Menggunakan Platform:** Dapat mengunggah komoditas dalam waktu < 3 menit dan dihubungi langsung oleh pembeli terverifikasi via WhatsApp[cite: 3].

#### Persona 2: Pembeli B2B / Pemilik UMKM Olahan (Pembeli)
* **Identitas:** Ibu Sri (35 Tahun) — Pemilik Usaha Keripik Singkong & Pengepul Hasil Bumi, Blambangan Umpu[cite: 3].
* **Perilaku Digital:** Aktif menggunakan Mobile Banking, Marketplace retail, dan WhatsApp Group dagang[cite: 3].
* **Kebutuhan Utama:** Mencari pasokan bahan baku singkong/kopi secara kontinu langsung dari produsen lokal dengan harga transparan dan spesifikasi mutu terjamin[cite: 3].
* **Kendala Utama:** Pasokan sering langka di luar musim panen puncak; kesulitan menemukan lokasi Gapoktan yang memiliki stok siap kirim[cite: 3].
* **Alasan Menggunakan Platform:** Dapat memfilter komoditas berdasarkan kecamatan terdekat dan langsung bernegosiasi via WhatsApp tanpa biaya perantara[cite: 3].

---

### 3. Goals dan Non-Goals

#### Goals (Cakupan Fokus MVP)
* **Katalog Terstruktur:** Membangun katalog digital komoditas lokal Kabupaten Way Kanan yang terstruktur berdasarkan jenis, grade, volume, dan lokasi kecamatan[cite: 3].
* **Negosiasi WhatsApp:** Memfasilitasi pencocokan langsung (direct matchmaking) antara penjual dan pembeli melalui integrasi tombol WhatsApp Chat[cite: 3].
* **Info Harga Harian:** Menyediakan Papan Informasi Harga Indikasi Harian per komoditas dan kecamatan yang diperbarui oleh Admin/Dinas secara teratur[cite: 3].
* **Verifikasi Penjual:** Menyediakan mekanisme verifikasi profil penjual (KTP/Surat Gapoktan) untuk membangun kepercayaan pembeli[cite: 3].
* **Dashboard Admin:** Menyediakan Dashboard Moderasi Admin untuk mengelola akun, listing produk, dan laporan sengketa pengguna[cite: 3].

#### Non-Goals (Di Luar Batasan MVP)
* **Tanpa Payment Gateway:** TIDAK memproses transaksi pembayaran otomatis, rekening bersama (escrow), atau payment gateway pada versi MVP[cite: 3].
* **Tanpa Logistik Otomatis:** TIDAK menyediakan sistem manajemen pengiriman, pelacakan armada truk, atau kalkulasi ongkir otomatis[cite: 3].
* **Tanpa Pungutan Pajak:** TIDAK memungut pajak daerah, retribusi, atau komisi transaksi secara otomatis dari nilai jual beli[cite: 3].
* **Tanpa Mobile App Native:** TIDAK membangun aplikasi native Android (APK) atau iOS; seluruh platform berbasis Responsive Web Application[cite: 3].

---

### 4. User Stories

| ID | Sebagai (Role) | Saya Ingin (Action) | Supaya (Benefit) |[cite: 3]
| :--- | :--- | :--- | :--- |[cite: 3]
| **US-01** | Pengurus Gapoktan | Mendaftar akun penjual menggunakan nomor telepon dan OTP WhatsApp | Saya bisa membuat akun tanpa memerlukan alamat email. |[cite: 3]
| **US-02** | Pengurus Gapoktan | Mengunggah listing komoditas beserta foto, volume stok, harga, dan spesifikasi | Pembeli dapat melihat ketersediaan barang saya secara transparan. |[cite: 3]
| **US-03** | Pembeli B2B | Mencari dan memfilter komoditas berdasarkan kategori, kecamatan, dan harga | Saya dapat menemukan bahan baku terdekat dengan efisien. |[cite: 3]
| **US-04** | Pembeli B2B | Mengklik tombol 'Hubungi Penjual' yang langsung mengarah ke chat WhatsApp | Saya bisa bernegosiasi harga dan sistem pembayaran secara independen. |[cite: 3]
| **US-05** | Publik / Petani | Melihat papan informasi harga indikasi komoditas harian per wilayah | Saya memiliki acuan harga pasar sebelum menjual hasil panen. |[cite: 3]
| **US-06** | Admin Platform | Memverifikasi dokumen profil penjual dan memoderasi listing komoditas | Platform terjaga dari potensi penipuan dan data produk tidak valid. |[cite: 3]

---

### 5. Daftar Fitur berdasarkan Fase

| Nama Fitur | MVP (Fase 1) | Versi 2 (Fase 2) | Pengembangan Lanjutan |[cite: 3]
| :--- | :---: | :---: | :---: |[cite: 3]
| Autentikasi WA OTP & Profil Pengguna | **YA** | - | - |[cite: 3]
| Katalog Komoditas & Listing Produk | **YA** | - | - |[cite: 3]
| Filter Pencarian Kategori & Kecamatan | **YA** | - | - |[cite: 3]
| Integration Direct WhatsApp Button | **YA** | - | - |[cite: 3]
| Board Harga Indikasi Harian | **YA** | - | - |[cite: 3]
| Dashboard Moderasi Admin | **YA** | - | - |[cite: 3]
| System Escrow & Payment Gateway | - | **YA** | - |[cite: 3]
| Modul Rating & Ulasan Transaksi | - | **YA** | - |[cite: 3]
| Kalkulator Logistik & Armada Pengangkut | - | **YA** | - |[cite: 3]
| Peta GIS Sebaran Musim Panen & Analytics AI | - | - | **YA** |[cite: 3]

---

### 6. Functional Requirement Detail per Fitur MVP

#### FR-01: Autentikasi Pengguna & Pendaftaran
* **Sistem Login:** Sistem wajib mendukung login dan registrasi berbasis nomor handphone[cite: 3].
* **Verifikasi OTP:** Verifikasi keamanan menggunakan OTP 6 digit yang dikirimkan via WhatsApp Gateway API (Fonnte/Wablas)[cite: 3].
* **Pilihan Peran:** Saat pendaftaran, pengguna memilih peran: 'Penjual (Gapoktan/Pengepul)' atau 'Pembeli B2B'[cite: 3].

#### FR-02: Manajemen Profil & Verifikasi Penjual
* **Input Profil:** Penjual wajib melengkapi data profil: Nama Kelompok/Usaha, Alamat Lengkap, Pilihan Kecamatan (14 Kecamatan Way Kanan), dan Foto Bukti Legalitas/KTP[cite: 3].
* **Status Verifikasi:** Status verifikasi default adalah 'Pending' sampai diverifikasi oleh Admin[cite: 3].

#### FR-03: Katalog & Listing Komoditas
* **Manajemen Listing:** Penjual terverifikasi dapat membuat, mengedit, dan mengubah status listing (Aktif / Terjual / Draf)[cite: 3].
* **Field Wajib:** Atribut wajib listing: Kategori Komoditas, Judul Produk, Kualitas/Grade (kadar air/kadar pati), Harga Indikasi per Satuan (Kg/Ton), Volume Stok Tersedia, Minimal Pemesanan, dan Maksimal 3 Foto Produk (maksimal 2MB per foto, otomatis dikompresi)[cite: 3].

#### FR-04: Pencarian & Filtering Produk
* **Search Bar:** Pengguna dapat melakukan pencarian komoditas berdasarkan kata kunci (keyword)[cite: 3].
* **Filter Kriteria:** Sistem menyediakan filter berdasarkan: Kategori (Pangan, Perkebunan, Hortikultura), Kecamatan, dan Rentang Harga[cite: 3].

#### FR-05: Negosiasi Direct WhatsApp
* **Tombol Kontak:** Halaman detail produk menampilkan tombol besar 'Hubungi via WhatsApp'[cite: 3].
* **Pre-filled Text:** Ketika diklik, sistem membuka aplikasi WhatsApp secara otomatis dengan pesan format standar: "Halo [Nama Penjual], saya tertarik dengan komoditas [Judul Listing] di Way Kanan Agro-Commerce. Apakah stok [Volume] masih tersedia?"[cite: 3]

#### FR-06: Papan Harga Indikasi Harian
* **Display Tabel:** Halaman publik yang menampilkan tabel harga indikasi komoditas utama (Singkong, Kopi, Karet, Padi, Jagung) per kecamatan[cite: 3].
* **Update Data:** Data diinput dan diperbarui secara manual oleh Admin/Petugas Dinas terkait minimal 1 minggu sekali[cite: 3].

#### FR-07: Admin Moderasi Dashboard
* **Verifikasi Seller:** Admin dapat melihat antrean verifikasi penjual baru beserta dokumen pendukung[cite: 3].
* **Moderasi Konten:** Admin berhak menyetujui, menolak, atau menangguhkan akun dan listing produk yang melanggar aturan[cite: 3].

---

### 7. Sketsa Data Model (Entitas + Field Kunci)
Model data dirancang mengutamakan integritas relasional, kecepatan query, dan minimalisasi penyimpanan data sensitif[cite: 3]:

* **1. Entitas `users`:** `id` (PK, BigInt AutoIncrement), `phone_number` (VarChar 20, Unique), `role` (Enum: 'farmer', 'buyer', 'admin'), `status` (Enum: 'active', 'suspended'), `created_at` (Timestamp)[cite: 3].
* **2. Entitas `farmer_profiles`:** `id` (PK, BigInt), `user_id` (FK to `users.id`), `organization_name` (VarChar 100), `subdistrict` (VarChar 50), `address_detail` (Text), `id_card_photo` (VarChar 255), `is_verified` (Boolean), `updated_at` (Timestamp)[cite: 3].
* **3. Entitas `categories`:** `id` (PK, Int), `name` (VarChar 50 - Pangan, Perkebunan, Hortikultura)[cite: 3].
* **4. Entitas `commodities`:** `id` (PK, Int), `category_id` (FK to `categories.id`), `name` (VarChar 50 - Singkong, Kopi Robusta, Karet, Padi, Jagung), `unit` (VarChar 10 - Kg, Ton)[cite: 3].
* **5. Entitas `product_listings`:** `id` (PK, BigInt), `profile_id` (FK to `farmer_profiles.id`), `commodity_id` (FK to `commodities.id`), `title` (VarChar 100), `description` (Text), `specification_grade` (VarChar 50), `price_per_unit` (Decimal 12,2), `stock_quantity` (Decimal 10,2), `min_order` (Decimal 10,2), `status` (Enum: 'active', 'sold_out', 'archived'), `created_at` (Timestamp)[cite: 3].
* **6. Entitas `price_boards`:** `id` (PK, Int), `commodity_id` (FK to `commodities.id`), `subdistrict` (VarChar 50), `indicated_price` (Decimal 12,2), `effective_date` (Date), `updated_by` (FK to `users.id`)[cite: 3].
* **7. Entitas `reports`:** `id` (PK, BigInt), `reporter_id` (FK to `users.id`), `listing_id` (FK to `product_listings.id`), `reason` (Text), `status` (Enum: 'pending', 'resolved', 'rejected'), `created_at` (Timestamp)[cite: 3].

---

### 8. Edge Case dan Failure State

| Skenario Kegagalan / Edge Case | Dampak Sistem & Pengguna | Penanganan (Handling Strategy) |[cite: 3]
| :--- | :--- | :--- |[cite: 3]
| Gagal Pengiriman OTP WhatsApp (API Down / Nomor Invalid) | Pengguna tidak dapat menyelesaikan proses registrasi atau login. | Sediakan tombol 'Kirim Ulang OTP' setelah countdown 60 detik. Sediakan pilihan fallback kontak 'Bantuan Admin via WhatsApp' untuk verifikasi manual. |[cite: 3]
| Koneksi Internet Lambat di Area Kebun (<2G/Spotty) | Halaman gagal memuat penuh, gambar komoditas tidak muncul. | Terapkan kompresi otomatis gambar di client-side (<200KB), gunakan lazy loading, dan caching data dasar menggunakan Service Worker. |[cite: 3]
| Stok Komoditas Habis Tapi Listing Masih Aktif | Pembeli merasa tertipu saat menghubungi penjual via WhatsApp. | Sistem mengirimkan notifikasi konfirmasi stok otomatis ke WA penjual setiap 7 hari. Jika tidak ada konfirmasi dalam 48 jam, status otomatis menjadi 'Pending Confirmation'. |[cite: 3]
| Listing Produk Palsu atau Indikasi Penipuan | Pembeli mengalami kerugian material akibat transaksi offline. | Sediakan tombol 'Laporkan Produk' di halaman detail. Jika listing menerima >= 3 laporan unik, sistem otomatis menangguhkan listing hingga direview Admin. |[cite: 3]
| Perubahan Nomor WhatsApp Penjual | Pesan dari pembeli tidak terkirim atau salah sasaran. | Penjual wajib melalui prosedur verifikasi OTP nomor baru sebelum perubahan nomor kontak disimpan di profil. |[cite: 3]

---

### 9. Success Metrics

#### Kinerja Produk & Adopsi Pengguna (Target Pilot 3 Bulan)
* **Jumlah Penjual Terverifikasi:** Minimal 50 Pengurus Gapoktan/Pengepul terdaftar dan profilnya terverifikasi oleh Admin[cite: 3].
* **Listing Produk Aktif:** Minimal 100 listing komoditas aktif terbarukan di platform[cite: 3].
* **Inquiry Conversion Rate:** Minimal 30% dari total pengunjung halaman detail komoditas mengklik tombol 'Hubungi via WhatsApp'[cite: 3].
* **Retensi Penjual Bulanan:** Minimal 40% penjual terdaftar melakukan update stok atau menambah listing baru dalam kurun 30 hari[cite: 3].

#### Kinerja Ekonomi & Operasional
* **Waktu Respon Penjual:** Rata-rata penjual merespons pesan WhatsApp pembeli dalam kurun waktu < 3 jam[cite: 3].
* **Cakupan Wilayah Pilot:** Listing komoditas aktif mencakup minimal 3 kecamatan sentra utama (Banjit, Blambangan Umpu, Buay Bahuga)[cite: 3].
* **Target GMV Terfasilitasi:** Estimasi nilai transaksi terhubung (GMV terfasilitasi) mencapai Rp 500.000.000 dalam kurun pilot 3 bulan[cite: 3].

---

### 10. Open Questions (Pertanyaan Terbuka untuk Validasi)
1. **Q-01:** Apakah verifikasi profil penjual cukup dilakukan oleh Admin Platform independen, atau wajib mendapatkan pengesahan resmi dari PPL (Penyuluh Pertanian Lapangan) Dinas Pertanian setempat?[cite: 3]
2. **Q-02:** Bagaimana menentukan pilihan standar mutu/grade komoditas singkong (misal: persentase kadar air/kadar pati) pada form pengisian produk agar mudah dipahami oleh pengurus Gapoktan?[cite: 3]
3. **Q-03:** Berapa alokasi anggaran operasional harian/bulanan yang disiapkan untuk kuota pengiriman OTP via WhatsApp API?[cite: 3]
4. **Q-04:** Siapa unit/petugas teknis spesifik di Dinas Terkait yang bertanggung jawab memperbarui data Papan Harga Indikasi Harian secara konsisten setiap minggu?[cite: 3]
5. **Q-05:** Sejauh mana batasan tanggung jawab hukum pengelola platform jika terjadi wanprestasi atau sengketa kualitas barang pada transaksi offline antar pengguna?[cite: 3]
6. **Q-06:** Apakah Gapoktan di kecamatan target sudah memiliki rekening bank kelompok atas nama organisasi untuk memfasilitasi transaksi B2B skala besar?[cite: 3]
7. **Q-07:** Bagaimana mekanisme penanganan sanksi bagi pengguna yang terbukti memberikan informasi stok atau harga palsu di platform?[cite: 3]
8. **Q-08:** Apakah diperlukan fitur cetak Surat Jalan / Bukti Asal Barang sederhana dari platform untuk membantu pengiriman komoditas antar kecamatan?[cite: 3]
9. **Q-09:** Sejauh mana Pemkab Way Kanan dapat memberikan dukungan regulasi atau surat himbauan bagi Koperasi dan Gapoktan untuk mengunggah stoknya ke platform?[cite: 3]
10. **Q-10:** Apakah ada kebutuhan integrasi data ekspor komoditas (misal kopi/lada) jika ada pembeli grosir dari luar Provinsi Lampung?[cite: 3]