import { PrismaClient } from '@prisma/client';
import { UserRole, UserStatus, VerificationStatus, ListingStatus, ProductUnit, ListingEventType, ReportStatus } from '../src/types/domain';

const prisma = new PrismaClient();

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

async function main() {
  console.log('[Seed] Starting Way Kanan Agro database seed...');

  // 1. Categories
  const pangan = await prisma.category.upsert({
    where: { name: 'Pangan' },
    update: {},
    create: { name: 'Pangan' },
  });

  const perkebunan = await prisma.category.upsert({
    where: { name: 'Perkebunan' },
    update: {},
    create: { name: 'Perkebunan' },
  });

  const hortikultura = await prisma.category.upsert({
    where: { name: 'Hortikultura' },
    update: {},
    create: { name: 'Hortikultura' },
  });

  console.log('[Seed] Categories seeded.');

  // 2. Commodities (5 canonical)
  const singkong = await prisma.commodity.upsert({
    where: { name: 'Singkong' },
    update: { icon: 'spa', unit: 'kg' },
    create: {
      name: 'Singkong',
      categoryId: pangan.id,
      unit: 'kg',
      icon: 'spa',
    },
  });

  const kopi = await prisma.commodity.upsert({
    where: { name: 'Kopi Robusta' },
    update: { icon: 'coffee', unit: 'kg' },
    create: {
      name: 'Kopi Robusta',
      categoryId: perkebunan.id,
      unit: 'kg',
      icon: 'coffee',
    },
  });

  const karet = await prisma.commodity.upsert({
    where: { name: 'Karet' },
    update: { icon: 'water_drop', unit: 'kg' },
    create: {
      name: 'Karet',
      categoryId: perkebunan.id,
      unit: 'kg',
      icon: 'water_drop',
    },
  });

  const padi = await prisma.commodity.upsert({
    where: { name: 'Padi' },
    update: { icon: 'grass', unit: 'kg' },
    create: {
      name: 'Padi',
      categoryId: pangan.id,
      unit: 'kg',
      icon: 'grass',
    },
  });

  const jagung = await prisma.commodity.upsert({
    where: { name: 'Jagung' },
    update: { icon: 'grain', unit: 'kg' },
    create: {
      name: 'Jagung',
      categoryId: pangan.id,
      unit: 'kg',
      icon: 'grain',
    },
  });

  console.log('[Seed] Commodities seeded.');

  // 3. Admin & Officer
  const admin = await prisma.user.upsert({
    where: { phoneNumber: '0811000001' },
    update: {},
    create: {
      phoneNumber: '0811000001',
      displayName: 'Admin Way Kanan',
      role: UserRole.admin,
      status: UserStatus.active,
    },
  });

  const officer = await prisma.user.upsert({
    where: { phoneNumber: '0811000002' },
    update: {},
    create: {
      phoneNumber: '0811000002',
      displayName: 'Bpk. Rahmat (Petugas Dinas)',
      role: UserRole.officer,
      status: UserStatus.active,
    },
  });

  // 4. Farmers: 3 distinct verification statuses
  // Farmer 1: Verified (Pak Joko)
  const farmerUser1 = await prisma.user.upsert({
    where: { phoneNumber: '081234567801' },
    update: {},
    create: {
      phoneNumber: '081234567801',
      displayName: 'Pak Joko Susanto',
      role: UserRole.farmer,
      status: UserStatus.active,
    },
  });

  const profileVerified = await prisma.farmerProfile.upsert({
    where: { userId: farmerUser1.id },
    update: {
      verificationStatus: VerificationStatus.verified,
      verifiedById: admin.id,
      verifiedAt: new Date(Date.now() - 15 * 86400000),
    },
    create: {
      userId: farmerUser1.id,
      organizationName: 'Gapoktan Makmur Jaya Banjit',
      subdistrict: 'Banjit',
      addressDetail: 'Jl. Lintas Banjit No. 12, RT 02/RW 01',
      idCardPhoto: '/uploads/private/id_cards/ktp_joko_sample.jpg',
      verificationStatus: VerificationStatus.verified,
      verifiedById: admin.id,
      verifiedAt: new Date(Date.now() - 15 * 86400000),
    },
  });

  // Farmer 2: Pending (H. Ridwan)
  const farmerUser2 = await prisma.user.upsert({
    where: { phoneNumber: '081234567802' },
    update: {},
    create: {
      phoneNumber: '081234567802',
      displayName: 'H. Ridwan',
      role: UserRole.farmer,
      status: UserStatus.active,
    },
  });

  const profilePending = await prisma.farmerProfile.upsert({
    where: { userId: farmerUser2.id },
    update: {
      verificationStatus: VerificationStatus.pending,
    },
    create: {
      userId: farmerUser2.id,
      organizationName: 'Koperasi Tani Sejahtera Way Kanan',
      subdistrict: 'Blambangan Umpu',
      addressDetail: 'Jl. Jenderal Sudirman Km. 4',
      idCardPhoto: '/uploads/private/id_cards/ktp_ridwan_sample.jpg',
      verificationStatus: VerificationStatus.pending,
    },
  });

  // Farmer 3: Rejected (Ahmad Basri)
  const farmerUser3 = await prisma.user.upsert({
    where: { phoneNumber: '081234567803' },
    update: {},
    create: {
      phoneNumber: '081234567803',
      displayName: 'Ahmad Basri',
      role: UserRole.farmer,
      status: UserStatus.active,
    },
  });

  await prisma.farmerProfile.upsert({
    where: { userId: farmerUser3.id },
    update: {
      verificationStatus: VerificationStatus.rejected,
      rejectionReason: 'Foto KTP buram dan tidak terbaca jelas. Mohon unggah ulang foto dokumen asli di tempat terang.',
    },
    create: {
      userId: farmerUser3.id,
      organizationName: 'Kelompok Tani Harapan Mulya',
      subdistrict: 'Buay Bahuga',
      addressDetail: 'Desa Sukabumi RT 03',
      idCardPhoto: '/uploads/private/id_cards/ktp_ahmad_sample.jpg',
      verificationStatus: VerificationStatus.rejected,
      rejectionReason: 'Foto KTP buram dan tidak terbaca jelas. Mohon unggah ulang foto dokumen asli di tempat terang.',
    },
  });

  // 5. Buyers
  const buyer1 = await prisma.user.upsert({
    where: { phoneNumber: '081398765401' },
    update: {},
    create: {
      phoneNumber: '081398765401',
      displayName: 'Ibu Sri Wahyuni (UMKM Keripik Singkong)',
      role: UserRole.buyer,
      status: UserStatus.active,
    },
  });

  const buyer2 = await prisma.user.upsert({
    where: { phoneNumber: '081398765402' },
    update: {},
    create: {
      phoneNumber: '081398765402',
      displayName: 'PT Sinar Tapioka Lampung',
      role: UserRole.buyer,
      status: UserStatus.active,
    },
  });

  const buyer3 = await prisma.user.upsert({
    where: { phoneNumber: '081398765403' },
    update: {},
    create: {
      phoneNumber: '081398765403',
      displayName: 'CV Kopi Robusta Nusantara',
      role: UserRole.buyer,
      status: UserStatus.active,
    },
  });

  console.log('[Seed] Users and profiles seeded.');

  // 6. Product Listings (13 total with varied statuses)
  const now = new Date();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86400000);

  // Clear existing seed listings to avoid duplicate growth
  await prisma.report.deleteMany({});
  await prisma.listingEvent.deleteMany({});
  await prisma.listingPhoto.deleteMany({});
  await prisma.productListing.deleteMany({});

  const listingsData = [
    {
      profileId: profileVerified.id,
      commodityId: singkong.id,
      title: 'Singkong Segar Grade A Kadar Pati Tinggi',
      description: 'Singkong varietas Casesart umur panen 10 bulan, baru dicabut saat pesanan disepakati. Sangat cocok untuk bahan baku tepung tapioka dan industri keripik renyah. Siap angkut truk cold diesel.',
      specificationGrade: 'Grade A (Super)',
      qualityParamName: 'Kadar Pati',
      qualityParamValue: '28%',
      pricePerUnit: 1800,
      unit: ProductUnit.kg,
      stockQuantity: 25,
      minOrder: 2,
      status: ListingStatus.active,
      lastStockConfirmedAt: daysAgo(2),
      photos: ['/images/products/singkong-1.jpg', '/images/products/singkong-2.jpg'],
    },
    {
      profileId: profileVerified.id,
      commodityId: kopi.id,
      title: 'Kopi Robusta Petik Merah Fine Way Kanan',
      description: 'Kopi Robusta dataran tinggi Banjit, dipetik merah 95%, diolah dengan proses natural dry hull. Aroma cokelat dan karamel khas Lampung Barat/Way Kanan, kadar air terjaga stabil di bawah 13%.',
      specificationGrade: 'Fine Robusta Grade 1',
      qualityParamName: 'Kadar Air',
      qualityParamValue: '12.5%',
      pricePerUnit: 42000,
      unit: ProductUnit.kg,
      stockQuantity: 5,
      minOrder: 0.5,
      status: ListingStatus.active,
      lastStockConfirmedAt: daysAgo(3),
      photos: ['/images/products/kopi-1.jpg', '/images/products/kopi-2.jpg'],
    },
    {
      profileId: profileVerified.id,
      commodityId: karet.id,
      title: 'Karet Lateks Pekat Kualitas 1 DRC Tinggi',
      description: 'Lateks kebun sendiri di Banjit, disadap pagi hari dengan asam semut terstandar. Tanpa campuran tawas atau bahan pengental kimia berbahaya. Siap kirim ke pabrik pengolahan karet.',
      specificationGrade: 'Lateks Super DRC 60%',
      qualityParamName: 'DRC (Dry Rubber Content)',
      qualityParamValue: '60%',
      pricePerUnit: 12500,
      unit: ProductUnit.kg,
      stockQuantity: 8,
      minOrder: 1,
      status: ListingStatus.active,
      lastStockConfirmedAt: daysAgo(1),
      photos: ['/images/products/karet-1.jpg'],
    },
    {
      profileId: profileVerified.id,
      commodityId: padi.id,
      title: 'Padi Ciherang Kering Giling (GKG) Kadar Air Rendah',
      description: 'Gabah Kering Giling varietas Ciherang panen musim gadu. Dijemur alami di lantai jemur semen selama 3 hari. Beras putih bersih, pulen, dan minim butir patah saat digiling.',
      specificationGrade: 'GKG Standar Bulog',
      qualityParamName: 'Kadar Air',
      qualityParamValue: '13.5%',
      pricePerUnit: 7200,
      unit: ProductUnit.kg,
      stockQuantity: 15,
      minOrder: 2,
      status: ListingStatus.active,
      lastStockConfirmedAt: daysAgo(4),
      photos: ['/images/products/padi-1.jpg'],
    },
    {
      profileId: profileVerified.id,
      commodityId: jagung.id,
      title: 'Jagung Pipil Kering Hibrida Pakan Ternak',
      description: 'Jagung pipil hibrida varietas Pioneer, butiran padat warna kuning jingga mengkilap. Bebas jamur/aflatoksin, kadar air diukur dengan moisture tester digital.',
      specificationGrade: 'Kering Pakan Grade A',
      qualityParamName: 'Kadar Air',
      qualityParamValue: '14.0%',
      pricePerUnit: 5400,
      unit: ProductUnit.kg,
      stockQuantity: 20,
      minOrder: 3,
      status: ListingStatus.active,
      lastStockConfirmedAt: daysAgo(5),
      photos: ['/images/products/jagung-1.jpg'],
    },
    {
      profileId: profileVerified.id,
      commodityId: singkong.id,
      title: 'Singkong Varietas Gajah Umur 11 Bulan',
      description: 'Singkong ukuran jumbo bobot 3-6 kg per umbi. Tekstur empuk pulen bila direbus atau diolah keripik. Stok di lahan siap cabut.',
      specificationGrade: 'Grade B (Konsumsi/Olahan)',
      qualityParamName: 'Kadar Pati',
      qualityParamValue: '23%',
      pricePerUnit: 1700,
      unit: ProductUnit.kg,
      stockQuantity: 10,
      minOrder: 1,
      status: ListingStatus.pending_confirmation, // Stock confirmed 9 days ago (> 7 days)
      lastStockConfirmedAt: daysAgo(9),
      photos: ['/images/products/singkong-1.jpg'],
    },
    {
      profileId: profileVerified.id,
      commodityId: singkong.id,
      title: 'Singkong Thailand Panen Raya Musim Lalu',
      description: 'Stok telah terjual habis ke pabrik tapioka Terbanggi Besar. Disimpan sebagai rekam jejak panen.',
      specificationGrade: 'Grade A',
      qualityParamName: 'Kadar Pati',
      qualityParamValue: '27%',
      pricePerUnit: 1650,
      unit: ProductUnit.kg,
      stockQuantity: 0,
      minOrder: 5,
      status: ListingStatus.sold_out,
      lastStockConfirmedAt: daysAgo(12),
      photos: ['/images/products/singkong-2.jpg'],
    },
    {
      profileId: profileVerified.id,
      commodityId: kopi.id,
      title: 'Kopi Robusta Asalan Siap Sangrai [Draf]',
      description: 'Draf rencana panen kopi robusta asalan kebun talang. Masih dalam proses penjemuran.',
      specificationGrade: 'Asalan Berkualitas',
      qualityParamName: 'Kadar Air',
      qualityParamValue: '14%',
      pricePerUnit: 38000,
      unit: ProductUnit.kg,
      stockQuantity: 3,
      minOrder: 0.5,
      status: ListingStatus.draft,
      lastStockConfirmedAt: daysAgo(1),
      photos: ['/images/products/kopi-2.jpg'],
    },
    {
      profileId: profileVerified.id,
      commodityId: karet.id,
      title: 'Karet Sheet Asap RSS-1 [Suspended Review]',
      description: 'Listing karet sheet asap yang sedang ditangguhkan akibat laporan pembeli.',
      specificationGrade: 'RSS-1',
      qualityParamName: 'DRC (Dry Rubber Content)',
      qualityParamValue: '65%',
      pricePerUnit: 21000,
      unit: ProductUnit.kg,
      stockQuantity: 4,
      minOrder: 1,
      status: ListingStatus.suspended,
      lastStockConfirmedAt: daysAgo(8),
      photos: ['/images/products/karet-1.jpg'],
    },
    {
      profileId: profileVerified.id,
      commodityId: singkong.id,
      title: 'Singkong Putih Industri Panen Lama',
      description: 'Arsip catatan panen musim lalu.',
      specificationGrade: 'Industri',
      qualityParamName: 'Kadar Pati',
      qualityParamValue: '21%',
      pricePerUnit: 1550,
      unit: ProductUnit.kg,
      stockQuantity: 30,
      minOrder: 10,
      status: ListingStatus.archived,
      lastStockConfirmedAt: daysAgo(40),
      photos: ['/images/products/singkong-1.jpg'],
    },
    {
      profileId: profileVerified.id,
      commodityId: padi.id,
      title: 'Padi Pandan Wangi Organik Bebas Pestisida Kimia',
      description: 'Gabah wangi alami dari sawah irigasi pegunungan Banjit. Menggunakan pupuk kandang terfermentasi, bulir utuh, nasi sangat harum.',
      specificationGrade: 'Organik Super',
      qualityParamName: 'Kadar Air',
      qualityParamValue: '13.0%',
      pricePerUnit: 9500,
      unit: ProductUnit.kg,
      stockQuantity: 6,
      minOrder: 1,
      status: ListingStatus.active,
      lastStockConfirmedAt: daysAgo(3),
      photos: ['/images/products/padi-1.jpg'],
    },
    {
      profileId: profileVerified.id,
      commodityId: jagung.id,
      title: 'Jagung Manis Segar Kupas Manise',
      description: 'Jagung manis segar baru dipetik subuh hari, rasa manis gurih alami, cocok untuk pasar tradisional dan rebusan.',
      specificationGrade: 'Manis Grade 1',
      qualityParamName: 'Kadar Air',
      qualityParamValue: '18.0%',
      pricePerUnit: 4800,
      unit: ProductUnit.kg,
      stockQuantity: 12,
      minOrder: 1,
      status: ListingStatus.active,
      lastStockConfirmedAt: daysAgo(2),
      photos: ['/images/products/jagung-1.jpg'],
    },
    {
      profileId: profilePending.id,
      commodityId: singkong.id,
      title: 'Draf Singkong Calon Penjual Baru',
      description: 'Draf produk dari penjual yang masih berstatus pending verifikasi.',
      specificationGrade: 'Grade A',
      qualityParamName: 'Kadar Pati',
      qualityParamValue: '25%',
      pricePerUnit: 1750,
      unit: ProductUnit.kg,
      stockQuantity: 10,
      minOrder: 2,
      status: ListingStatus.draft,
      lastStockConfirmedAt: daysAgo(1),
      photos: ['/images/products/singkong-2.jpg'],
    },
  ];

  const createdListings = [];
  for (const item of listingsData) {
    const { photos, ...listingFields } = item;
    const listing = await prisma.productListing.create({
      data: {
        ...listingFields,
        photos: {
          create: photos.map((url, idx) => ({
            photoUrl: url,
            order: idx,
          })),
        },
      },
    });
    createdListings.push(listing);
  }

  console.log(`[Seed] ${createdListings.length} listings seeded.`);

  // 7. Seed 3 Reports for the suspended listing (item index 8)
  const suspendedListing = createdListings.find(l => l.status === ListingStatus.suspended);
  if (suspendedListing) {
    await prisma.report.createMany({
      data: [
        {
          reporterId: buyer1.id,
          listingId: suspendedListing.id,
          reason: 'Nomor WhatsApp penjual tidak membalas dan harga berbeda dengan yang tertulis.',
          status: ReportStatus.pending,
          createdAt: daysAgo(3),
        },
        {
          reporterId: buyer2.id,
          listingId: suspendedListing.id,
          reason: 'Spesifikasi DRC di lapangan tidak sesuai dengan klaim pada deskripsi produk.',
          status: ReportStatus.pending,
          createdAt: daysAgo(2),
        },
        {
          reporterId: buyer3.id,
          listingId: suspendedListing.id,
          reason: 'Stok dinyatakan masih ada namun penjual mengaku sudah kosong.',
          status: ReportStatus.pending,
          createdAt: daysAgo(1),
        },
      ],
    });

    await prisma.auditLog.create({
      data: {
        action: 'AUTO_SUSPEND_LISTING',
        entity: 'ProductListing',
        entityId: String(suspendedListing.id),
        meta: JSON.stringify({
          reason: 'Menerima 3 laporan pengguna unik',
          reportsCount: 3,
        }),
        createdAt: daysAgo(1),
      },
    });

    console.log('[Seed] 3 reports and auto-suspend audit log created.');
  }

  // 8. Seed Listing Events for metrics & telemetry
  const activeListing = createdListings[0];
  const events = [];
  // 60 views, 22 wa_clicks (~36.6% conversion rate > 30% pilot target)
  for (let i = 0; i < 60; i++) {
    events.push({
      type: ListingEventType.view,
      listingId: activeListing.id,
      createdAt: daysAgo(Math.floor(Math.random() * 14)),
    });
  }
  for (let i = 0; i < 22; i++) {
    events.push({
      type: ListingEventType.wa_click,
      listingId: activeListing.id,
      createdAt: daysAgo(Math.floor(Math.random() * 14)),
    });
  }
  await prisma.listingEvent.createMany({ data: events });
  console.log('[Seed] Telemetry events seeded.');

  // 9. Riwayat Harga Indikasi 8 Minggu (price_boards)
  // Termasuk sebagian kecamatan sengaja dibuat kedaluwarsa (> 14 hari lalu)
  await prisma.priceBoard.deleteMany({});

  const commodityList = [singkong, kopi, karet, padi, jagung];
  const basePrices: Record<string, number> = {
    Singkong: 1800,
    'Kopi Robusta': 42000,
    Karet: 12500,
    Padi: 7200,
    Jagung: 5400,
  };

  const priceBoardsData = [];

  // 8 weeks of data: week 0 (today), week 1 (7 days ago), ... week 7 (49 days ago)
  for (let week = 0; week < 8; week++) {
    const effectiveDate = daysAgo(week * 7);

    for (const comm of commodityList) {
      const base = basePrices[comm.name] || 2000;

      for (const sub of SUBDISTRICTS) {
        // Purposely make Bumi Agung and Pakuan Ratu outdated for Singkong/Karet (no entries for week 0 & 1, only week >= 3)
        const isStaleTarget = (sub === 'Bumi Agung' || sub === 'Pakuan Ratu') && (comm.name === 'Singkong' || comm.name === 'Karet');
        if (isStaleTarget && week < 3) {
          continue; // Leaves newest entry >= 21 days ago -> triggers stale badge > 14 days!
        }

        // Small deterministic variation per week and subdistrict
        const weekVariation = Math.sin(week + sub.length) * 0.04;
        const price = Math.round(base * (1 + weekVariation) / 50) * 50;

        priceBoardsData.push({
          commodityId: comm.id,
          subdistrict: sub,
          indicatedPrice: price,
          unit: 'kg',
          effectiveDate,
          updatedById: officer.id,
          createdAt: effectiveDate,
        });
      }
    }
  }

  await prisma.priceBoard.createMany({ data: priceBoardsData });
  console.log(`[Seed] ${priceBoardsData.length} price board records seeded over 8 weeks.`);

  console.log('[Seed] Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
