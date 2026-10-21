import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import { TabShell } from '@/components/shells/TabShell';
import { Banner } from '@/components/ui/Banner';
import { Chip } from '@/components/ui/Chip';
import { PriceTile } from '@/components/ui/PriceTile';
import { ProductCard } from '@/components/ui/ProductCard';
import { ListingStatus } from '@/types/domain';

const PILOT_SUBDISTRICTS = ['Banjit', 'Blambangan Umpu', 'Buay Bahuga'];
const ALL_SUBDISTRICTS = [
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

export const revalidate = 60; // ISR cache 60s

export default async function HomePage() {
  const sessionUser = await getCurrentUser();

  // Fetch recent active listings
  const recentListings = await prisma.productListing.findMany({
    where: {
      status: {
        in: [ListingStatus.active, ListingStatus.pending_confirmation],
      },
    },
    take: 3,
    orderBy: { createdAt: 'desc' },
    include: {
      commodity: true,
      farmerProfile: true,
      photos: { take: 1, orderBy: { order: 'asc' } },
    },
  });

  // Fetch today's price boards
  const commodities = await prisma.commodity.findMany();
  const priceBoardTiles = await Promise.all(
    commodities.map(async (comm) => {
      const latestPrices = await prisma.priceBoard.findMany({
        where: { commodityId: comm.id },
        orderBy: { effectiveDate: 'desc' },
        take: 2,
      });

      const current = latestPrices[0];
      const previous = latestPrices[1];
      const delta = current && previous ? Number(current.indicatedPrice) - Number(previous.indicatedPrice) : 0;

      // Check if price is older than 14 days
      const isStale = current
        ? (Date.now() - new Date(current.effectiveDate).getTime()) > 14 * 86400000
        : false;

      return {
        commodityName: comm.name,
        icon: comm.icon,
        grade: 'Kualitas Standar',
        pricePerUnit: current ? Number(current.indicatedPrice) : 0,
        unit: current?.unit || 'kg',
        delta,
        subdistrict: current?.subdistrict || 'Way Kanan',
        isStale,
        timeLabel: current ? 'Hari ini' : 'Belum ada data',
      };
    })
  );

  return (
    <TabShell activeTab="home" user={sessionUser}>
      <div className="space-y-6">
        {/* 1. Greeting & Value Proposition */}
        <section className="bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 text-primary font-label-sm">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span>Katalog Agribisnis Resmi Way Kanan</span>
          </div>

          <h1 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
            {sessionUser ? `Halo, ${sessionUser.displayName}!` : 'Pasar Digital Komoditas Way Kanan'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
            Perdagangan langsung komoditas singkong, kopi robusta, karet, padi, dan jagung dari kelompok tani terverifikasi tanpa biaya perantara.
          </p>

          {/* Search bar direct link to catalog */}
          <Link
            href="/katalog"
            className="mt-2 min-h-[52px] px-space-md rounded-xl bg-surface-container-low text-on-surface-variant font-body-lg flex items-center justify-between hover:bg-surface-container transition-colors shadow-sm"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-primary">search</span>
              <span>Cari komoditas, grade, atau Gapoktan...</span>
            </span>
            <span className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">tune</span>
            </span>
          </Link>
        </section>

        {/* 2. Trust Banner */}
        <Banner
          variant="info"
          title="Petani Terverifikasi & Bebas Komisi"
          description="Semua kontak diarahkan langsung ke WhatsApp pengurus kelompok tani. Cek fisik barang sebelum pembayaran disepakati."
        />

        {/* 3. Commodity Category Chips */}
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Pilih Komoditas</h2>
            <Link href="/katalog" className="font-label-sm text-label-sm text-primary hover:underline">
              Semua
            </Link>
          </div>
          <div className="overflow-x-auto -mx-margin px-margin flex gap-2 py-1">
            <Link href="/katalog">
              <Chip label="Semua" icon="grid_view" active />
            </Link>
            <Link href="/katalog?commodity=Singkong">
              <Chip label="Singkong" icon="spa" />
            </Link>
            <Link href="/katalog?commodity=Kopi+Robusta">
              <Chip label="Kopi Robusta" icon="coffee" />
            </Link>
            <Link href="/katalog?commodity=Karet">
              <Chip label="Karet" icon="water_drop" />
            </Link>
            <Link href="/katalog?commodity=Padi">
              <Chip label="Padi" icon="grass" />
            </Link>
            <Link href="/katalog?commodity=Jagung">
              <Chip label="Jagung" icon="grain" />
            </Link>
            <Link href="/katalog?category=Hortikultura">
              <Chip label="Hortikultura" icon="eco" />
            </Link>
          </div>
        </section>

        {/* 4. Price Board Scroller */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Harga Indikasi Hari Ini</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Acuan harga pasar kecamatan</p>
            </div>
            <Link
              href="/harga"
              className="min-h-[48px] px-3 rounded-lg text-primary font-label-sm flex items-center gap-1 hover:bg-surface-container transition-colors"
            >
              <span>Papan Harga</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="overflow-x-auto -mx-margin px-margin flex gap-3 py-1">
            {priceBoardTiles.map((tile, idx) => (
              <PriceTile
                key={idx}
                commodityName={tile.commodityName}
                grade={tile.grade}
                pricePerUnit={tile.pricePerUnit}
                unit={tile.unit}
                delta={tile.delta}
                subdistrict={tile.subdistrict}
                isStale={tile.isStale}
                timeLabel={tile.timeLabel}
              />
            ))}
          </div>
        </section>

        {/* 5. Latest Stock */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Stok Panen Terbaru</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">Siap kirim dari kebun & gudang</p>
            </div>
            <Link
              href="/katalog"
              className="min-h-[48px] px-3 rounded-lg text-primary font-label-sm flex items-center gap-1 hover:bg-surface-container transition-colors"
            >
              <span>Lihat Semua</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
          </div>

          <div className="flex flex-col gap-4">
            {recentListings.map((item) => (
              <ProductCard
                key={item.id}
                id={item.id}
                title={item.title}
                organizationName={item.farmerProfile.organizationName}
                subdistrict={item.farmerProfile.subdistrict}
                pricePerUnit={Number(item.pricePerUnit)}
                unit={item.unit}
                stockQuantity={Number(item.stockQuantity)}
                minOrder={Number(item.minOrder)}
                photoUrl={item.photos[0]?.photoUrl}
                isVerified={item.farmerProfile.verificationStatus === 'verified'}
                status={item.status}
                variant="featured"
              />
            ))}
          </div>
        </section>

        {/* 6. Browse by 14 Subdistricts (SKILL.md §10 & §11) */}
        <section className="space-y-3 bg-surface-container-lowest rounded-2xl p-space-lg shadow-sm">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Cari per Kecamatan</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              14 kecamatan sentra komoditas pertanian Way Kanan
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {ALL_SUBDISTRICTS.map((sub) => {
              const isPilot = PILOT_SUBDISTRICTS.includes(sub);
              return (
                <Link
                  key={sub}
                  href={`/katalog?subdistrict=${encodeURIComponent(sub)}`}
                  className={`min-h-[48px] px-3 py-2 rounded-xl flex items-center justify-between transition-all hover:bg-surface-container ${
                    isPilot ? 'bg-primary-fixed/20 text-on-surface font-semibold' : 'bg-surface-container-low text-on-surface'
                  }`}
                >
                  <span className="truncate text-body-md">{sub}</span>
                  {isPilot ? (
                    <span className="font-label-sm text-[12px] bg-primary text-on-primary px-1.5 py-0.5 rounded shrink-0">
                      Sentra
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                      chevron_right
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </section>

        {/* 7. Safe Trading Disclaimer */}
        <section className="bg-surface-container-low rounded-xl p-4 text-center space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-primary font-headline-sm">
            <span className="material-symbols-outlined text-[20px]">security</span>
            <span className="font-label-md text-label-md font-bold">Panduan Keamanan Transaksi</span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant max-w-md mx-auto">
            Way Kanan Agro-Commerce merupakan platform direktori informasi panen lokal. Transaksi, pembayaran, dan logistik dilakukan langsung secara mandiri antar pihak tanpa escrow platform.
          </p>
        </section>
      </div>
    </TabShell>
  );
}
