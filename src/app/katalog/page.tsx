'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { TabShell } from '@/components/shells/TabShell';
import { ProductCard } from '@/components/ui/ProductCard';
import { ProductCardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Chip } from '@/components/ui/Chip';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';

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
const CATEGORIES = ['Pangan', 'Perkebunan', 'Hortikultura'];

function CatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state initialized from URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedCommodity, setSelectedCommodity] = useState(searchParams.get('commodity') || '');
  const [selectedSubdistricts, setSelectedSubdistricts] = useState<string[]>(
    searchParams.getAll('subdistrict')
  );
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');

  // Listings data & loading state
  const [listings, setListings] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Sync with URL when search params change
  useEffect(() => {
    fetchListings();
  }, [searchParams]);

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const url = new URL('/api/listings', window.location.origin);
      searchParams.forEach((val, key) => {
        url.searchParams.append(key, val);
      });

      const res = await fetch(url.toString());
      const data = await res.json();
      setListings(data.listings || []);
      setTotalCount(data.pagination?.total || 0);
    } catch (err) {
      console.error('Gagal memuat komoditas:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUrlParams = (newParams: Record<string, string | string[] | undefined>) => {
    const params = new URLSearchParams();

    // Preserve or set new values
    const currentQ = newParams.q !== undefined ? newParams.q : searchParams.get('q');
    if (currentQ && typeof currentQ === 'string' && currentQ.trim()) params.set('q', currentQ.trim());

    const currentCat = newParams.category !== undefined ? newParams.category : searchParams.get('category');
    if (currentCat && typeof currentCat === 'string') params.set('category', currentCat);

    const currentComm = newParams.commodity !== undefined ? newParams.commodity : searchParams.get('commodity');
    if (currentComm && typeof currentComm === 'string') params.set('commodity', currentComm);

    const currentSubs = newParams.subdistrict !== undefined
      ? (Array.isArray(newParams.subdistrict) ? newParams.subdistrict : [newParams.subdistrict])
      : searchParams.getAll('subdistrict');
    currentSubs.forEach((sub) => {
      if (sub) params.append('subdistrict', sub);
    });

    const currentMin = newParams.minPrice !== undefined ? newParams.minPrice : searchParams.get('minPrice');
    if (currentMin && typeof currentMin === 'string' && currentMin.trim()) params.set('minPrice', currentMin.trim());

    const currentMax = newParams.maxPrice !== undefined ? newParams.maxPrice : searchParams.get('maxPrice');
    if (currentMax && typeof currentMax === 'string' && currentMax.trim()) params.set('maxPrice', currentMax.trim());

    const currentSort = newParams.sort !== undefined ? newParams.sort : searchParams.get('sort') || 'newest';
    if (currentSort && currentSort !== 'newest') params.set('sort', currentSort as string);

    router.push(`/katalog?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrlParams({ q: searchTerm });
  };

  const handleApplyFilters = () => {
    setIsFilterSheetOpen(false);
    updateUrlParams({
      category: selectedCategory,
      commodity: selectedCommodity,
      subdistrict: selectedSubdistricts,
      minPrice,
      maxPrice,
    });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedCommodity('');
    setSelectedSubdistricts([]);
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setIsFilterSheetOpen(false);
    router.push('/katalog');
  };

  // Count active filters for badge
  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    (selectedCommodity ? 1 : 0) +
    selectedSubdistricts.length +
    (minPrice ? 1 : 0) +
    (maxPrice ? 1 : 0);

  const toggleSubdistrict = (sub: string) => {
    if (selectedSubdistricts.includes(sub)) {
      setSelectedSubdistricts(selectedSubdistricts.filter((s) => s !== sub));
    } else {
      setSelectedSubdistricts([...selectedSubdistricts, sub]);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Sticky Search Header */}
      <section className="bg-surface-container-lowest rounded-2xl p-space-md shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <span className="material-symbols-outlined text-[20px] text-on-surface-variant absolute left-3.5 top-3.5 pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari judul, komoditas, penjual..."
              className="w-full h-[48px] pl-10 pr-3 rounded-xl bg-surface-container-low text-on-surface font-body-md focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none placeholder:text-outline"
            />
          </div>
          <button
            type="button"
            onClick={() => setIsFilterSheetOpen(true)}
            className="min-h-[48px] px-3.5 rounded-xl bg-surface-container-high text-primary font-label-md inline-flex items-center gap-1.5 hover:bg-surface-container-highest transition-colors active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-[20px]">tune</span>
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-on-primary font-label-sm text-[12px] flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </form>

        {/* Sort Controls */}
        <div className="flex items-center justify-between pt-1 border-t border-surface-container-high">
          <div className="flex items-center gap-1 text-on-surface-variant text-label-sm">
            <span className="material-symbols-outlined text-[16px]">sort</span>
            <span>Urutkan:</span>
          </div>

          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => {
                setSort('newest');
                updateUrlParams({ sort: 'newest' });
              }}
              className={`px-2.5 py-1 min-h-[48px] rounded-lg text-label-sm transition-all ${
                sort === 'newest'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Terbaru
            </button>
            <button
              type="button"
              onClick={() => {
                setSort('price_asc');
                updateUrlParams({ sort: 'price_asc' });
              }}
              className={`px-2.5 py-1 min-h-[48px] rounded-lg text-label-sm transition-all ${
                sort === 'price_asc'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Harga Terendah
            </button>
            <button
              type="button"
              onClick={() => {
                setSort('price_desc');
                updateUrlParams({ sort: 'price_desc' });
              }}
              className={`px-2.5 py-1 min-h-[48px] rounded-lg text-label-sm transition-all ${
                sort === 'price_desc'
                  ? 'bg-primary text-on-primary font-bold shadow-sm'
                  : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              Tertinggi
            </button>
          </div>
        </div>
      </section>

      {/* 2. Active Filter Chips Row */}
      {activeFilterCount > 0 && (
        <section className="flex items-center gap-2 overflow-x-auto -mx-margin px-margin py-1">
          {selectedCategory && (
            <Chip
              label={`Kategori: ${selectedCategory}`}
              onRemove={() => {
                setSelectedCategory('');
                updateUrlParams({ category: '' });
              }}
            />
          )}
          {selectedCommodity && (
            <Chip
              label={`Komoditas: ${selectedCommodity}`}
              onRemove={() => {
                setSelectedCommodity('');
                updateUrlParams({ commodity: '' });
              }}
            />
          )}
          {selectedSubdistricts.map((sub) => (
            <Chip
              key={sub}
              label={sub}
              onRemove={() => {
                const updated = selectedSubdistricts.filter((s) => s !== sub);
                setSelectedSubdistricts(updated);
                updateUrlParams({ subdistrict: updated });
              }}
            />
          ))}
          {(minPrice || maxPrice) && (
            <Chip
              label={`Harga: ${minPrice ? `Rp ${minPrice}` : '0'} - ${maxPrice ? `Rp ${maxPrice}` : 'Max'}`}
              onRemove={() => {
                setMinPrice('');
                setMaxPrice('');
                updateUrlParams({ minPrice: '', maxPrice: '' });
              }}
            />
          )}
          <button
            type="button"
            onClick={handleResetFilters}
            className="min-h-[48px] px-3 rounded-full text-primary font-label-sm text-label-sm hover:underline shrink-0"
          >
            Reset Semua
          </button>
        </section>
      )}

      {/* 3. Result Count */}
      <div className="flex items-center justify-between px-1">
        <span className="font-label-md text-label-md text-on-surface-variant">
          Menampilkan <strong className="text-on-surface font-extrabold">{totalCount}</strong> komoditas siap panen
        </span>
      </div>

      {/* 4. Product Listings Grid / List */}
      {isLoading ? (
        <div className="flex flex-col gap-4">
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </div>
      ) : listings.length === 0 ? (
        <EmptyState
          icon="search_off"
          title="Komoditas Tidak Ditemukan"
          description="Tidak ada hasil panen yang sesuai dengan kata kunci atau filter kecamatan yang dipilih."
          action={{
            label: 'Reset Semua Filter',
            onClick: handleResetFilters,
          }}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {listings.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              title={item.title}
              organizationName={item.organizationName}
              subdistrict={item.subdistrict}
              pricePerUnit={item.pricePerUnit}
              unit={item.unit}
              stockQuantity={item.stockQuantity}
              minOrder={item.minOrder}
              photoUrl={item.photoUrl}
              isVerified={item.isVerified}
              status={item.status}
              variant="catalog"
            />
          ))}
        </div>
      )}

      {/* 5. Filter Bottom Sheet */}
      <Sheet
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        title="Filter Komoditas"
        footer={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={handleResetFilters}
            >
              Reset
            </Button>
            <Button
              type="button"
              variant="primary"
              className="flex-[2]"
              onClick={handleApplyFilters}
            >
              Terapkan Filter
            </Button>
          </div>
        }
      >
        <div className="space-y-5 py-2">
          {/* Commodity Quick Select */}
          <div className="space-y-2">
            <label className="font-headline-sm text-headline-sm text-on-surface block">
              Pilih Komoditas
            </label>
            <div className="flex flex-wrap gap-2">
              {COMMODITIES.map((comm) => {
                const isSelected = selectedCommodity === comm;
                return (
                  <Chip
                    key={comm}
                    label={comm}
                    active={isSelected}
                    onClick={() => setSelectedCommodity(isSelected ? '' : comm)}
                  />
                );
              })}
            </div>
          </div>

          {/* Category Select */}
          <div className="space-y-2">
            <label className="font-headline-sm text-headline-sm text-on-surface block">
              Kategori Komoditas
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <Chip
                    key={cat}
                    label={cat}
                    active={isSelected}
                    onClick={() => setSelectedCategory(isSelected ? '' : cat)}
                  />
                );
              })}
            </div>
          </div>

          {/* Subdistricts multi-select */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-headline-sm text-headline-sm text-on-surface block">
                Kecamatan (Way Kanan)
              </label>
              {selectedSubdistricts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedSubdistricts([])}
                  className="font-label-sm text-primary hover:underline"
                >
                  Hapus Pilihan
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 bg-surface-container-low rounded-xl">
              {SUBDISTRICTS.map((sub) => {
                const isChecked = selectedSubdistricts.includes(sub);
                return (
                  <label
                    key={sub}
                    className={`min-h-[48px] px-3 py-2 rounded-lg flex items-center gap-2 cursor-pointer transition-all ${
                      isChecked ? 'bg-primary-fixed/30 font-bold text-primary' : 'hover:bg-surface-container'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSubdistrict(sub)}
                      className="w-5 h-5 rounded text-primary focus:ring-primary accent-primary"
                    />
                    <span className="truncate text-body-md">{sub}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-2">
            <label className="font-headline-sm text-headline-sm text-on-surface block">
              Rentang Harga (Rp / kg)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Harga Min (Rp)"
                className="h-[48px] px-3 rounded-xl bg-surface-container-low font-body-md focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Harga Max (Rp)"
                className="h-[48px] px-3 rounded-xl bg-surface-container-low font-body-md focus:bg-surface-container focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      </Sheet>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <TabShell activeTab="catalog">
      <Suspense fallback={<ProductCardSkeleton />}>
        <CatalogContent />
      </Suspense>
    </TabShell>
  );
}
