---
name: way-kanan-agro-design
description: Design system and UI/UX guide for "Way Kanan Agro-Commerce", a mobile-first, Bahasa Indonesia agribusiness marketplace (singkong, kopi robusta, karet, padi, jagung) where buyers contact farmer groups directly via WhatsApp. Use this skill whenever the user asks to design, generate, extend, review, or code ANY screen, component, HTML/Tailwind page, or Google Stitch prompt for Way Kanan Agro, a Gapoktan/petani marketplace, katalog komoditas, papan harga indikasi, dashboard penjual, verifikasi penjual, login OTP WhatsApp, or any low-literacy / low-bandwidth farmer-facing mobile web UI. Also use it when the user says "buat halaman baru", "tambah layar", "samakan gayanya dengan yang sudah ada", or "buat konsisten dengan desain sebelumnya", even if they never name the product.
---

# Way Kanan Agro-Commerce — Design System

Panduan ini merangkum sistem desain yang sudah terbentuk dari 9 layar (Beranda, Katalog, Detail Komoditas, Papan Harga, Dashboard Penjual, Form Pasang Panen, Profil & Verifikasi, Masuk/Daftar, Verifikasi OTP). Gunakan sebagai sumber kebenaran saat membuat layar baru agar hasilnya terasa satu produk.

## 1. Konteks dan prinsip

**Produk.** Katalog komoditas Kabupaten Way Kanan (Lampung) yang mempertemukan Gapoktan/pengepul dengan pembeli B2B/UMKM. Transaksi terjadi **di luar platform** lewat WhatsApp.

**Batasan produk (dari PRD)**: tanpa payment gateway/escrow, tanpa logistik/ongkir, tanpa komisi, tanpa aplikasi native (web responsif saja). Setiap layar harus konsisten dengan batasan ini.

**Pengguna utama.** Pak Joko (48 th, ketua Gapoktan, Android kelas menengah, sinyal sering lemah, enggan mengisi form rumit, trauma penipuan online) dan Ibu Sri (35 th, pemilik UMKM/pengepul, terbiasa mobile banking dan marketplace).

**Prinsip desain — dan alasannya:**

1. **Satu aksi utama per layar.** Pengguna enggan form panjang; aksi utama harus jelas dan mudah dijangkau jempol.
2. **Terbaca di bawah matahari.** Kontras tinggi, teks ≥ 15px, target sentuh ≥ 48px. Pengguna sering di kebun/gudang.
3. **Ikon selalu berpasangan dengan teks; status tidak hanya warna.** Literasi digital beragam dan sebagian pengguna buta warna. Harga naik = panah + angka + warna.
4. **Kepercayaan harus terlihat.** Lencana *Terverifikasi*, label "terakhir diperbarui", catatan keamanan singkat. Kekhawatiran terbesar pengguna adalah penipuan.
5. **Ringan dan tahan sinyal lemah.** Skeleton loader, lazy loading, draf offline, animasi seperlunya.
6. **Tonal, bukan garis.** Pemisahan antar elemen memakai lapisan warna permukaan, bukan border 1px (lihat §3.1).
7. **Jujur terhadap lingkup MVP.** Jangan menampilkan fitur atau klaim yang tidak ada di PRD (lihat §8).

## 2. Setup teknis

Semua layar memakai Tailwind (CDN), font **Plus Jakarta Sans**, dan ikon **Material Symbols Outlined**. Gunakan kerangka ini persis; token di bawah bergantung padanya.

```html
<!DOCTYPE html>
<html lang="id"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover"/>
<meta name="shell-type" content="mobile_tab"/> <!-- mobile_tab = ada bottom nav; mobile_stack = layar detail/form -->
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet"/>
<style>
  html,body{width:100%;margin:0;padding:0;background:#eaffe8;color:#0d1f11}
  body{overscroll-behavior:none}
  .pb-safe{padding-bottom:env(safe-area-inset-bottom,0px)}
  .pt-safe{padding-top:env(safe-area-inset-top,0px)}
  main>:first-child{margin-top:0!important} main>:last-child{margin-bottom:0!important}
  ::-webkit-scrollbar{display:none}
</style>
<script src="https://cdn.tailwindcss.com"></script>
<script id="tailwind-config">
const F = ["Plus Jakarta Sans", "sans-serif"];
tailwind.config = { darkMode: "class", theme: { extend: {
  colors: {
    "primary":"#0d631b","on-primary":"#ffffff","primary-container":"#2e7d32","on-primary-container":"#cbffc2",
    "primary-fixed":"#a3f69c","primary-fixed-dim":"#88d982","on-primary-fixed":"#002204","on-primary-fixed-variant":"#005312",
    "secondary":"#835400","on-secondary":"#ffffff","secondary-container":"#fcab28","on-secondary-container":"#694300",
    "secondary-fixed":"#ffddb5","secondary-fixed-dim":"#ffb957","on-secondary-fixed":"#2a1800","on-secondary-fixed-variant":"#643f00",
    "tertiary":"#00632a","on-tertiary":"#ffffff","tertiary-container":"#007f38","on-tertiary-container":"#c8ffcb",
    "tertiary-fixed":"#66ff8e","tertiary-fixed-dim":"#3de273","on-tertiary-fixed":"#002109","on-tertiary-fixed-variant":"#005322",
    "error":"#ba1a1a","on-error":"#ffffff","error-container":"#ffdad6","on-error-container":"#93000a",
    "background":"#eaffe8","on-background":"#0d1f11","surface":"#eaffe8","surface-bright":"#eaffe8","surface-dim":"#c9e0c8","surface-tint":"#1b6d24",
    "surface-container-lowest":"#ffffff","surface-container-low":"#e2fae1","surface-container":"#ddf4db",
    "surface-container-high":"#d7eed6","surface-container-highest":"#d1e9d0","surface-variant":"#d1e9d0",
    "on-surface":"#0d1f11","on-surface-variant":"#40493d","outline":"#707a6c","outline-variant":"#bfcaba",
    "inverse-surface":"#223524","inverse-on-surface":"#e0f7de","inverse-primary":"#88d982"
  },
  borderRadius: { DEFAULT:"0.25rem", lg:"0.5rem", xl:"0.75rem", full:"9999px" },
  spacing: { "space-xs":"0.25rem","space-sm":"0.5rem","space-md":"0.75rem","space-lg":"1rem","space-xl":"1.5rem",
             "margin-sm":"0.75rem","margin":"1rem","margin-lg":"1.5rem","gutter-sm":"0.75rem","gutter":"1rem" },
  fontFamily: Object.fromEntries(["headline-xl","headline-lg","headline-lg-mobile","headline-md","headline-sm",
    "body-xl","body-lg","body-md","body-sm","label-lg","label-md","label-sm"].map(k=>[k,F])),
  fontSize: {
    "headline-xl":["32px",{lineHeight:"40px",fontWeight:"800"}], "headline-lg":["26px",{lineHeight:"34px",fontWeight:"700"}],
    "headline-lg-mobile":["22px",{lineHeight:"28px",fontWeight:"700"}], "headline-md":["20px",{lineHeight:"26px",fontWeight:"700"}],
    "headline-sm":["18px",{lineHeight:"24px",fontWeight:"700"}], "body-xl":["18px",{lineHeight:"26px",fontWeight:"500"}],
    "body-lg":["16px",{lineHeight:"24px",fontWeight:"500"}], "body-md":["15px",{lineHeight:"22px",fontWeight:"400"}],
    "body-sm":["13px",{lineHeight:"18px",fontWeight:"500"}], "label-lg":["16px",{lineHeight:"20px",fontWeight:"700"}],
    "label-md":["14px",{lineHeight:"18px",fontWeight:"600"}], "label-sm":["12px",{lineHeight:"16px",fontWeight:"700"}]
  }
}}};
</script></head>
<body class="bg-surface font-body-md text-body-md text-on-surface antialiased flex flex-col min-h-screen">
```

**Catatan penting:** tulis hex lengkap dengan `#` (`"#a3f69c"`). Pada sebagian layar sumber `primary-fixed` tertulis tanpa `#` sehingga kelas `bg-primary-fixed` tidak berfungsi.

## 3. Token desain

### 3.1 Warna — dipakai untuk apa

| Peran | Token | Pemakaian |
|---|---|---|
| Aksi utama, harga, aksen | `primary` `#0d631b` | Tombol utama, angka harga, ikon verified, tautan |
| Aksen kuat | `primary-container` `#2e7d32` | Chip aktif, avatar, ubin ikon, tombol "Ya, Masih Ada" |
| Positif lembut | `primary-fixed` `#a3f69c` | Pil kenaikan harga, lencana panel, latar ikon statistik |
| Perhatian / aksi jual | `secondary-container` `#fcab28` (amber) | Tombol **+ Jual**, kartu konfirmasi stok, status "Tinjau", ikon offline |
| Peringatan lembut | `secondary-fixed` `#ffddb5` | Data kedaluwarsa, tips keamanan, banner menunggu |
| Angka positif | `tertiary` `#00632a` | Stok tersedia, kenaikan harga (teks) |
| Gagal / turun | `error`, `error-container` | OTP salah, verifikasi ditolak, harga turun, laporkan |
| Kontak WhatsApp | `#25D366` | **Hanya** tombol hubungi penjual (tint `#E8F5E9`/`#E8F8EE`, teks `#1E7E34` untuk lencana) |
| Overlay / toast | `inverse-surface` | Scrim modal (`/60`), toast, caption di atas foto (`/85`) |

**Lapisan permukaan (aturan "tonal, bukan garis").** Bangun kedalaman dengan menumpuk:
`surface` (latar halaman) → `surface-container-lowest` (kartu putih) → `surface-container-low` (kotak sisipan dalam kartu) → `surface-container` / `-high` (chip, input, track). Hindari border; satu-satunya pengecualian lazim adalah pemisah footer di dalam kartu (`border-t border-surface-container-high`). Alasannya: tampilan lebih bersih dan tidak ramai di layar kecil.

### 3.2 Tipografi

Pasangkan **kelas font dan ukuran** bersamaan: `font-headline-sm text-headline-sm`.

| Token | Ukuran/line-height | Berat | Dipakai untuk |
|---|---|---|---|
| headline-xl | 32/40 | 800 | Harga besar di detail/papan harga, digit OTP |
| headline-lg | 26/34 | 700 | Judul halaman desktop |
| headline-lg-mobile | 22/28 | 700 | Judul halaman/section utama mobile |
| headline-md | 20/26 | 700 | Harga di kartu, input angka |
| headline-sm | 18/24 | 700 | Judul kartu, judul section, nama app |
| body-xl / body-lg | 18 / 16 | 500 | Input, paragraf penekanan |
| body-md | 15/22 | 400 | Teks isi |
| body-sm | 13/18 | 500 | Keterangan, helper text |
| label-lg | 16/20 | 700 | Teks tombol |
| label-md | 14/18 | 600 | Label field, chip, nilai spesifikasi |
| label-sm | 12/16 | 700 | Lencana, kapsul, caption (jangan lebih kecil dari ini) |

### 3.3 Spasi, radius, elevasi

- **Padding halaman:** `px-margin` (16px). Jarak antar section: `mt-space-lg` / `space-y-6`. Gunakan token spasi, bukan angka mentah (`p-4`, `gap-3.5`) pada layar baru.
- **Radius:** kartu & tombol `rounded-xl`; kotak sisipan & tombol kecil `rounded-lg`; kontainer besar `rounded-2xl`; bottom sheet `rounded-t-3xl`; lencana & avatar `rounded-full`.
- **Elevasi:** kartu `shadow-sm` (hover `shadow-md`); header `shadow-[0_1px_8px_rgba(27,46,30,0.06)]`; bottom nav `shadow-[0_-2px_12px_rgba(27,46,30,0.08)]`; dock CTA `shadow-[0_-4px_16px_rgba(13,99,27,0.08)]`; FAB `shadow-[0_4px_14px_rgba(131,84,0,0.28)]`; modal `shadow-2xl`.
- **Kaca (glass):** header dan nav `bg-surface/90 backdrop-blur-xl`.
- **Gerak:** `transition-all`/`transition-colors`; tekan `active:scale-95` (kecil) atau `active:scale-[0.98]` (tombol lebar); `animate-pulse` hanya untuk titik status "live" dan skeleton; `animate-spin` untuk sinkronisasi/loading; sheet `translate-y` 300ms; gambar fade 150ms. Jaga ringan untuk HP kelas menengah.

## 4. Shell dan layout

Pilih satu shell sebelum menyusun isi.

| Shell | Dipakai untuk | Ciri |
|---|---|---|
| `mobile_tab` | Beranda, Katalog, Harga, Dashboard/Akun | Header logo + bottom nav 4 tab + FAB (untuk penjual); `main` `pt-16 pb-28` |
| `mobile_stack` | Detail, form, login, OTP, profil | Header dengan tombol kembali; tanpa bottom nav; dock aksi di bawah bila ada CTA utama (`main` `pb-32`) |

**Header tab**
```html
<header class="fixed top-0 w-full z-50 bg-surface/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(27,46,30,0.06)] pt-safe">
  <div class="h-16 px-margin flex items-center justify-between gap-space-sm">
    <div class="flex items-center gap-space-sm min-w-0">
      <img src="logo.svg" alt="Logo Way Kanan Agro-Commerce" class="h-8 w-auto"/>
      <div class="flex flex-col min-w-0">
        <span class="font-headline-sm text-headline-sm text-primary tracking-tight truncate">Way Kanan Agro</span>
        <span class="font-label-sm text-label-sm text-on-surface-variant truncate">Kab. Way Kanan, Lampung</span>
      </div>
    </div>
    <!-- Tamu: tombol Masuk. Login: avatar 32px bg-primary + ikon person -->
    <a href="#" class="min-h-[48px] px-space-md rounded-xl bg-surface-container-high text-primary font-label-md text-label-md flex items-center">Masuk</a>
  </div>
</header>
```
Header stack: tombol kembali (`arrow_back`, 48px) + judul `truncate` + maksimal dua aksi ikon 44px (bagikan, simpan).

**Bottom nav** — empat tab: Beranda (`home`), Katalog (`grid_view`), Harga (`trending_up`), Akun (`account_circle`). Untuk penjual tab keempat menjadi Dashboard (`storefront`).
```html
<nav class="fixed bottom-0 w-full z-50 pb-safe bg-surface-container-lowest/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(27,46,30,0.08)]">
  <div class="h-16 px-gutter-sm flex items-center justify-around">
    <a aria-current="page" href="#" class="min-h-[48px] min-w-[56px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-space-xs text-primary font-bold bg-primary-fixed/30">
      <span class="material-symbols-outlined text-[22px]" style="font-variation-settings:'FILL' 1">home</span>
      <span class="font-label-sm text-label-sm leading-none">Beranda</span></a>
    <!-- tab tidak aktif: text-on-surface-variant hover:text-primary -->
  </div>
</nav>
```

**FAB "+ Jual"** (hanya penjual): `fixed bottom-20 right-margin z-50 min-h-[52px] px-space-lg rounded-xl bg-secondary-container text-on-secondary-container font-label-lg`, ikon `add_circle` 24px.

**Dock aksi lengket** (layar detail/form): `fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/95 backdrop-blur-md px-margin py-3 pb-safe`, berisi satu tombol besar dan satu tautan sekunder kecil di bawahnya.

**Bottom sheet** (filter, laporan, ganti nomor)
```html
<div class="fixed inset-0 z-50 bg-inverse-surface/60 backdrop-blur-sm flex flex-col justify-end hidden" id="sheet">
  <div class="bg-surface-container-lowest w-full rounded-t-3xl p-space-lg max-h-[85vh] overflow-y-auto flex flex-col gap-space-md shadow-2xl">
    <div class="w-12 h-1.5 bg-outline-variant/60 rounded-full mx-auto"></div>
    <div class="flex items-center justify-between">
      <h3 class="font-headline-sm text-headline-sm">Judul Sheet</h3>
      <button class="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center" aria-label="Tutup"><span class="material-symbols-outlined text-[20px]">close</span></button>
    </div>
    <!-- isi; footer: Reset (flex-1 bg-surface-container) + Terapkan (flex-[2] bg-primary) -->
  </div>
</div>
```

**Toast:** `fixed top-20 inset-x-margin z-50 bg-inverse-surface text-inverse-on-surface rounded-xl p-space-md shadow-xl`, ikon `task_alt`, hilang otomatis 2,5–3,5 detik. Sukses besar boleh memakai `bg-primary text-on-primary`.

## 5. Komponen

### 5.1 Tombol
Tinggi minimum 48px (aksi utama 52–56px), ikon 20–24px di kiri teks, `gap-space-sm`.

| Jenis | Kelas inti |
|---|---|
| Utama | `w-full min-h-[54px] rounded-xl bg-primary text-on-primary font-label-lg shadow-md active:scale-[0.98]` |
| Sekunder | `min-h-[48px] rounded-xl bg-surface-container-high text-primary font-label-md` |
| Tersier di kartu | `bg-surface-container-lowest text-primary shadow-sm` |
| Aksi cepat (3 kolom) | `grid grid-cols-3 gap-space-xs`, tiap tombol `min-h-[48px] rounded-lg bg-surface-container-low text-primary` + ikon 18px |
| Bahaya | `bg-error text-on-error` |
| Tautan lapor | `text-error/80 font-label-sm` + ikon `report_problem` 16px |
| Loading | ganti isi dengan spinner `w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin` + teks proses ("Menghubungkan ke WhatsApp...") |

**Tombol WhatsApp** — satu-satunya pemakaian hijau WhatsApp:
```html
<a href="https://wa.me/62NOMOR?text=PESAN_URL_ENCODED" target="_blank" rel="noopener noreferrer"
   class="w-full min-h-[52px] rounded-xl bg-[#25D366] text-on-surface font-label-lg text-label-lg flex items-center justify-center gap-space-sm shadow-sm active:scale-[0.98] transition-all">
  <span class="material-symbols-outlined text-[24px]">chat</span><span>Hubungi Petani (WA)</span>
</a>
```
Teks gelap (`text-on-surface`) dipilih karena teks putih di atas `#25D366` hanya berkontras sekitar 2:1 dan hilang di bawah matahari. Pesan awal mengikuti PRD (FR-05): *"Halo [Nama Penjual], saya tertarik dengan komoditas [Judul Listing] di Way Kanan Agro-Commerce. Apakah stok [Volume] masih tersedia?"* Ambil nomor dari data penjual, jangan di-hardcode.

### 5.2 Kartu

Dasar: `bg-surface-container-lowest rounded-xl p-space-md shadow-sm`.

**Kartu produk (daftar/katalog)** — varian utama:
```html
<article class="bg-surface-container-lowest rounded-xl p-space-md shadow-sm flex flex-col gap-space-md">
  <div class="flex gap-space-md">
    <img class="w-24 h-24 rounded-lg object-cover shrink-0 bg-surface-container" loading="lazy" src="" alt="Singkong segar grade A"/>
    <div class="flex flex-col justify-between flex-1 min-w-0">
      <div>
        <span class="inline-flex items-center gap-1 bg-[#E8F5E9] text-[#1E7E34] px-2 py-0.5 rounded-full font-label-sm text-label-sm">
          <span class="material-symbols-outlined text-[14px]" style="font-variation-settings:'FILL' 1">verified</span>Terverifikasi</span>
        <h3 class="font-headline-sm text-headline-sm truncate mt-1">Singkong Segar Grade A</h3>
        <p class="font-body-sm text-body-sm font-semibold truncate">Gapoktan Makmur Jaya</p>
        <p class="font-label-sm text-label-sm text-on-surface-variant flex items-center gap-0.5">
          <span class="material-symbols-outlined text-[14px] text-primary">location_on</span>Banjit, Way Kanan</p>
      </div>
      <div class="flex items-baseline justify-between mt-1">
        <span class="font-headline-md text-headline-md text-primary font-extrabold">Rp 1.800 <span class="font-label-sm text-label-sm text-on-surface-variant font-normal">/ kg</span></span>
        <span class="font-label-md text-label-md bg-surface-container-high px-2 py-0.5 rounded-md">Stok: 20 Ton</span>
      </div>
    </div>
  </div>
  <!-- opsional: grid 2 kolom bg-surface-container-low/70 rounded-lg p-2.5 berisi stok, min. order, lokasi -->
  <!-- tombol WhatsApp (§5.1) -->
</article>
```
Varian gambar besar (Beranda): foto `h-44` di atas, lencana "Petani Terverifikasi" kiri-atas (`bg-primary text-on-primary rounded-full`), chip kesegaran kanan-bawah (`bg-inverse-surface/85`), lalu kotak `surface-container-low` dua kolom (kapasitas | harga).

**Ubin harga (scroller horizontal)** — `w-[210px] shrink-0 rounded-xl p-3.5`: chip waktu (`schedule`; "Hari ini" beramber, selebihnya netral) → nama → spesifikasi → harga `headline-md text-primary` → delta. **Delta:** naik = `arrow_upward` + `text-tertiary`; turun = `arrow_downward` + `text-error`; tetap = `horizontal_rule` + `text-on-surface-variant`.

**Tabel spesifikasi:** baris bergantian `bg-surface-container-low/50` dan putih; label kiri `body-md text-on-surface-variant`, nilai kanan `label-md` rata kanan `max-w-[60%]`.

**Ubin statistik:** grid 3 kolom; ikon dalam kotak 28px `rounded-lg`, nilai `headline-sm`, keterangan `body-sm`.

**Kartu penjual:** avatar 56px berinisial (`bg-primary-container text-on-primary`) dengan lencana `check_circle` di sudut, nama `headline-sm`, peran `label-md`.

**Pratinjau tampilan pembeli** (di form jual): kartu produk besar bertanda "Siap Tayang" agar penjual melihat hasilnya sebelum terbit.

### 5.3 Chip, lencana, kontrol segmen
- **Chip filter/kategori:** `min-h-[48px] px-4 rounded-xl`; aktif `bg-primary text-on-primary`, tidak aktif `bg-surface-container-lowest shadow-sm`; ikon 20px; baris scroll `overflow-x-auto -mx-margin px-margin`.
- **Chip filter aktif:** `pl-3 pr-2 py-1.5 rounded-full bg-surface-container-lowest shadow-sm` + tombol `close`; sertakan tautan "Reset Filter".
- **Data kedaluwarsa:** `bg-secondary-fixed text-on-secondary-fixed p-2 rounded-lg` + ikon `warning` + "Data lebih dari 14 hari belum diperbarui".
- **Kontrol segmen/tab:** wadah `p-1 bg-surface-container-high rounded-xl flex`; item `flex-1 min-h-[48px] rounded-lg`, aktif `bg-surface-container-lowest text-primary shadow-sm`; badge hitungan `rounded-full`.

### 5.4 Form
- **Input:** `w-full h-[52px] px-space-md rounded-xl bg-surface-container-low text-on-surface font-body-lg`; fokus `focus:bg-surface-container focus:ring-2 focus:ring-primary` (selalu beri indikator fokus yang terlihat). Tanpa border.
- **Label** di atas field (`label-md`, bintang wajib `text-error`), **helper text** di bawah (`body-sm text-on-surface-variant` + ikon `info` 16px).
- **Select:** `appearance-none pr-10` + ikon `arrow_drop_down` absolut di kanan.
- **Angka dan satuan:** prefix "Rp" absolut di kiri; saklar satuan Kg/Ton berupa kontrol segmen setinggi 52px; tampilkan pratinjau langsung ("Rp 1.800 / kg (± Rp 1.800.000 / Ton)"); tombol preset cepat (`grid-cols-3 h-11 rounded-xl`) untuk min. order.
- **Nomor HP:** wadah `min-h-[56px] rounded-xl bg-surface-container-lowest shadow-sm`, prefix "🇮🇩 +62" (`bg-surface-container`), `inputmode="numeric"`, format otomatis `812-3456-7890`, penghitung digit, tombol hapus.
- **Kartu peran (radio):** `role="radio" aria-checked`; terpilih `bg-surface-container-low shadow-md` dengan lingkaran centang `bg-primary`; tidak terpilih `bg-surface-container-lowest shadow-sm`.
- **Pemilih komoditas:** lima tombol penuh `min-h-[58px]`, ubin ikon 48px di kiri, bulatan status (centang/plus) di kanan.
- **Slot foto:** `grid grid-cols-3 gap-space-sm`, kotak `aspect-square rounded-xl`; terisi = foto + centang 24px + label kiri-atas (`bg-on-surface/70`); kosong = tombol `add_a_photo`. Sertakan mikrocopy hemat kuota.
- **Form bertahap:** progress `grid grid-cols-3 gap-1.5 h-2 rounded-full` + tiga lingkaran langkah 28px. **Tampilkan satu langkah per layar** (lihat §10).
- **Slider harga:** `accent-primary h-2.5`, label nilai langsung di atas. **Daftar kecamatan di filter:** checkbox `min-h-[48px]` dengan jumlah hasil di kanan.
- **OTP 6 digit:** enam kotak `flex-1 max-w-[52px] h-[58px] rounded-xl font-headline-xl`; kosong/terisi `bg-surface-container-lowest`; salah `bg-error-container/40 text-error`. Wajib input sungguhan: `inputmode="numeric" autocomplete="one-time-code" maxlength="1"`, auto-maju, dukung tempel. Di bawahnya: pil hitung mundur 60 detik (`timer`), tombol "Kirim Ulang Kode via WhatsApp", dan jalur cadangan "Hubungi Admin via WhatsApp".
- **Unggah dokumen:** bidang bidik `aspect-[16/10]` dengan empat sudut `border-primary` 4px, daftar panduan foto, tombol kamera (utama) dan galeri (sekunder), catatan privasi dengan ikon `lock`.

### 5.5 Banner dan status
Struktur seragam: lingkaran ikon 32–40px + judul `label-md` + isi `body-sm` di dalam wadah tonal.

| Makna | Wadah | Ikon |
|---|---|---|
| Kepercayaan / info | `bg-surface-container-low` atau `-highest` | `verified`, `shield_person`, `security` |
| Menunggu / perhatian | `bg-secondary-fixed` (boleh `/40`) | `schedule`, `hourglass_top`, `warning` |
| Gagal / ditolak | `bg-error-container text-on-error-container` | `error`, `gpp_maybe` (+ tombol "Perbaiki Dokumen") |
| Berhasil / terverifikasi | `bg-surface-container-high`, ikon di lingkaran `bg-primary` | `verified` |

**Status verifikasi penjual** punya tiga varian tetap: *Terverifikasi* (hijau), *Menunggu Verifikasi Admin* (amber), *Verifikasi Ditolak: [alasan]* (merah + tombol perbaiki). **Linimasa verifikasi:** garis vertikal; langkah selesai `bg-primary` + centang, berjalan `bg-secondary-container` + `sync` berputar, belum `bg-surface-container-high text-outline`.

**Kartu konfirmasi stok** (penjual): `bg-secondary-container text-on-secondary-container rounded-xl p-space-md`, dua tombol sejajar — "Ya, Masih Ada" (`bg-primary-container`) dan "Sudah Habis" (`bg-surface-container-lowest text-error`).

### 5.6 State wajib untuk setiap layar data
- **Loading:** skeleton `animate-pulse bg-surface-container-high` yang meniru bentuk kartu, plus mikrocopy ("Jaringan di kebun lambat? Tenang, data dimuat ringan.").
- **Kosong:** lingkaran 80px `bg-surface-container-low` + ikon 44px (`search_off`), judul, penjelasan, tombol "Reset Semua Filter".
- **Offline:** banner `bg-surface-container-high` dengan ikon `wifi_off` di lingkaran amber; jelaskan bahwa draf tersimpan dan terkirim saat online.
- **Error:** pesan inline merah di dekat sumber masalah, berisi apa yang salah dan apa yang harus dilakukan.
- **Stale / menunggu konfirmasi:** lihat §5.3 dan banner amber "Menunggu Konfirmasi Stok".

### 5.7 Ikon
Material Symbols Outlined; ukuran 14/16/18/20/22/24/28px; isi (`FILL 1`) untuk lencana kepercayaan dan ikon aktif via `style="font-variation-settings:'FILL' 1"`.

| Makna | Ikon | Makna | Ikon |
|---|---|---|---|
| Terverifikasi | `verified` | Lokasi/kecamatan | `location_on` |
| Stok | `inventory_2` | Min. order / angkut | `local_shipping` |
| Tonase | `scale` | Waktu / pembaruan | `schedule` |
| Harga naik / tren | `trending_up` | Kontak WhatsApp | `chat` |
| Bantuan | `support_agent` | Keamanan | `security`, `shield`, `lock` |
| Offline | `wifi_off` | Laporkan | `flag`, `report_problem` |
| Jual | `add_circle` | Filter / cari | `tune`, `search` |

**Komoditas (kanonik):** Singkong `spa` · Kopi Robusta `coffee` · Karet/Lateks `water_drop` · Padi `grass` · Jagung `grain`. Ikon `agriculture` dicadangkan untuk identitas penjual/petani.

## 6. Cetak biru layar

| Layar | Shell | Urutan section |
|---|---|---|
| Beranda | tab | Kartu sapaan/nilai jual → banner kepercayaan → pencarian + chip kategori → "Harga Hari Ini" (scroller) → "Stok Terbaru" (3 kartu + "Lihat semua") → "Cari per Kecamatan" (grid 2 kolom) → catatan transaksi aman |
| Katalog | tab | Pencarian lengket + tombol Filter (badge jumlah) → sortir + chip aktif → jumlah hasil → kartu produk → state loading/kosong. Sheet filter: kategori, batas harga, kecamatan |
| Detail Komoditas | stack | Banner konfirmasi stok + chip → galeri 4:3 + 3 thumbnail → judul, harga, 3 sorotan → spesifikasi → deskripsi → kartu penjual → tips aman → dock WhatsApp + "Laporkan". Sheet laporan |
| Papan Harga | tab | Judul + banner sumber/waktu pembaruan → chip komoditas → kartu tren (harga, delta, sparkline 8 minggu, terendah/tertinggi) → daftar per kecamatan (+ chip kedaluwarsa) → catatan penting + "Laporkan Perbedaan Harga" |
| Dashboard Penjual | tab | Kartu profil + status verifikasi → 3 statistik → kartu konfirmasi stok → tab Aktif/Terjual/Draf → kartu listing + aksi cepat → bantuan |
| Pasang Hasil Panen | stack | Banner offline → progress 3 langkah → (1) komoditas + judul, (2) stok + harga + min. order, (3) mutu + foto + catatan → pratinjau pembeli → Terbitkan / Simpan Draf |
| Profil & Verifikasi | stack | Ringkasan akun (+ Ganti Nomor) → linimasa → data usaha → unggah dokumen → bantuan → dock "Simpan & Ajukan Verifikasi" |
| Masuk / Daftar | stack | Langkah 1/2 → kartu peran → input +62 → catatan keamanan → "Kirim Kode Masuk via WhatsApp" → bantuan |
| Verifikasi OTP | stack | Langkah 2/2 → kartu instruksi + nomor + "Ubah" → 6 kotak OTP + error → hitung mundur + kirim ulang → "Verifikasi & Masuk" → bantuan |

Dashboard Admin (desktop) belum ada di sumber. Bila diminta, pakai token yang sama, tambahkan sidebar kiri dan tabel padat, dan tetap tonal.

## 7. Konten dan suara (Bahasa Indonesia)

- Nada hangat, langsung, sederhana. Sapa dengan "Pak Joko" / "Anda". Label pendek dan berupa kata kerja: *Hubungi Petani (WA)*, *Terbitkan Listing Sekarang*, *Simpan sebagai Draf*, *Kirim Ulang Kode via WhatsApp*.
- Hindari istilah teknis (OTP boleh, dengan penjelasan "kode masuk").
- **Harga:** pemisah ribuan titik, satuan jelas, selalu berlabel indikasi.
  ```js
  const rp = n => 'Rp ' + Number(n).toLocaleString('id-ID');   // Rp 1.800
  ```
  Tulis `Rp 1.800 / kg`; untuk Ton tampilkan padanan "(± Rp 1.800.000 / Ton)". Label: *"Harga indikasi, bisa dinegosiasi"*.
- **Waktu:** utamakan relatif ("Hari ini", "2 hari lalu"); tanggal absolut format `24 Okt 2026` dan harus dinamis, bukan contoh tetap.
- **Mikrocopy pengaman** yang disetujui: "Gratis tanpa biaya", "Tips aman: cek barang dulu sebelum membayar. Platform ini tidak memproses pembayaran.", "Nomor Anda dipakai untuk kode masuk dan kontak transaksi."

## 8. Batas konten (selaras PRD)

Sumber desain memuat beberapa elemen contoh yang **melampaui lingkup MVP atau membuat klaim berisiko**. Jangan salin ke layar baru:

- **Fitur di luar MVP:** rating/ulasan, "18 Transaksi Berhasil", waktu respons penjual, status "Lunas" (menyiratkan pelacakan pembayaran). Status listing yang sah hanya Aktif / Terjual / Draf (+ Menunggu Konfirmasi Stok).
- **Komoditas:** gunakan lima komoditas utama. Jangan menambah kelapa sawit, lada, dan sebagainya tanpa keputusan produk.
- **Klaim absolut:** hindari "100% Bebas Penipuan", "Dijamin", "terenkripsi", "Resmi Dinas Pertanian", "Akreditasi Lokal", "Panen Terverifikasi Gapoktan". Status wewenang verifikasi (PRD Q-01) dan tanggung jawab hukum (Q-05) belum diputuskan. Pakai bahasa yang bisa dipertanggungjawabkan: "Penjual telah diperiksa Admin", "Harga indikasi sebagai acuan".
- **Nama instansi sumber harga** jadikan variabel; PRD Q-04 belum menetapkan petugas. Di sumber ada tiga nama instansi berbeda untuk hal yang sama.
- **Privasi:** jangan mencetak nomor WhatsApp penjual di halaman publik; ungkap hanya lewat tombol `wa.me`. Dokumen KTP cukup disebut "diperiksa Admin".
- **Papan harga** wajib menampilkan tanggal pembaruan dan peringatan kedaluwarsa (> 14 hari). **Listing** wajib menampilkan "stok dikonfirmasi X hari lalu".

## 9. Aksesibilitas dan performa

- Target sentuh ≥ 48px (ikon-saja minimal 44px); jarak antar target ≥ 8px.
- Kontras teks ≥ 4,5:1. Placeholder memakai `text-outline` (bukan `outline-variant`, terlalu pudar).
- `alt` bermakna pada gambar, `aria-label` pada tombol ikon, `role="radio"`/`aria-checked` pada pilihan, `aria-current="page"` pada tab aktif.
- Jangan memblokir zoom (hindari `user-scalable=no` / `maximum-scale=1`).
- Gambar: `loading="lazy"`, rasio tetap (`aspect-*`) untuk mencegah lompatan layout, kompres di sisi klien < 200KB, unggah maksimal 3 foto/2MB.
- Hormati `prefers-reduced-motion` untuk animasi non-esensial.
- Untuk produksi, kompilasi Tailwind (jangan CDN), muat satu tautan Material Symbols, dan ganti URL gambar contoh dengan aset sungguhan.

## 10. Masalah pada layar sumber (perbaiki saat dipakai ulang)

1. **Token tanpa `#`**: `primary-fixed: "a3f69c"` pada beberapa konfigurasi (lihat §2).
2. **Latar tidak seragam**: layar Masuk/OTP memakai `#FAFAF5`, layar lain `#eaffe8`. Gunakan `#eaffe8`.
3. **Kontras tombol WhatsApp**: teks putih di `#25D366` ≈ 2:1. Gunakan teks gelap (§5.1).
4. **Panjang OTP tidak konsisten**: modal "Ganti Nomor" memakai 4 digit, PRD (FR-01) menetapkan 6 digit.
5. **Kotak OTP statis**: pada layar OTP berupa `<span>`, bukan input. Implementasikan input sungguhan (§5.4).
6. **FAB tidak konsisten**: ada versi hijau-pil dan amber-persegi. Gunakan amber (§4).
7. **Ikon komoditas berubah-ubah** antar layar (Padi: `psychiatry`/`grass`/`grain`). Pakai pemetaan kanonik (§5.7).
8. **Teks di bawah 12px** (`text-[10px]`, `text-[11px]`) pada lencana. Minimal `label-sm` (12px).
9. **Form "bertahap" menumpuk tiga langkah dalam satu halaman** dengan indikator "Langkah 3 dari 3". Pecah menjadi satu langkah per layar, sesuai prinsip satu aksi utama.
10. **Beranda hanya menampilkan 10 dari 14 kecamatan**. Tampilkan semua atau beri "Lihat semua".
11. **Tab keempat bernama beda** ("Akun" vs "Dashboard"). Tentukan berdasarkan peran (§4).
12. **Sisa artefak prototipe**: nomor `wa.me` palsu, tanggal 2024, atribut `data-alt` berisi prompt gambar, tautan Material Symbols ganda, `alert()` sebagai konfirmasi. Ganti dengan data dan komponen sungguhan (toast/sheet).

## 11. Master data

**14 kecamatan Way Kanan:** Banjit, Baradatu, Bahuga, Blambangan Umpu, Buay Bahuga, Bumi Agung, Gunung Labuhan, Kasui, Negeri Agung, Negeri Besar, Pakuan Ratu, Rebang Tangkas, Way Tuba, Umpu Semenguk. Verifikasi daftar ini dengan Pemkab sebelum rilis. Kecamatan sentra pilot: Banjit, Blambangan Umpu, Buay Bahuga.

**Kategori:** Pangan, Perkebunan, Hortikultura. **Komoditas MVP:** Singkong (Pangan), Kopi Robusta (Perkebunan), Karet (Perkebunan), Padi (Pangan), Jagung (Pangan). Kategori Hortikultura belum punya komoditas; tampilkan state kosong yang ramah bila dipilih.

**Satuan:** Kg dan Ton; harga per satuan yang dipilih penjual, dengan padanan ditampilkan.

## 12. Checklist sebelum menyerahkan layar

- [ ] Shell benar (`mobile_tab` / `mobile_stack`) dan `safe-area` dipakai pada header, nav, dan dock.
- [ ] Hanya satu aksi utama yang menonjol; tombol ≥ 48px.
- [ ] Hanya token dari §2–3; tidak ada hex acak selain warna WhatsApp dan tint lencana.
- [ ] Tanpa border dekoratif; kedalaman dari lapisan tonal.
- [ ] Setiap ikon berpasangan dengan teks; status tidak hanya warna.
- [ ] State loading, kosong, error, dan offline/stale tersedia bila layar menampilkan data.
- [ ] Harga berformat `Rp 1.800 / kg`, berlabel indikasi; waktu pembaruan terlihat.
- [ ] Tidak ada fitur/klaim di luar MVP (§8); tidak ada nomor telepon tercetak.
- [ ] Teks ≥ 12px, kontras ≥ 4,5:1, zoom tidak diblokir, indikator fokus terlihat.
- [ ] Dibaca ulang dalam bahasa Indonesia sederhana yang akan dipahami Pak Joko.
