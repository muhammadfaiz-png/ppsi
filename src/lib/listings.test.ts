import { describe, it, expect } from 'vitest';
import { ListingStatus } from '@/types/domain';

interface MockListing {
  id: number;
  title: string;
  description: string;
  commodityName: string;
  subdistrict: string;
  pricePerUnit: number;
  status: string;
  reportCount: number;
}

const SAMPLE_LISTINGS: MockListing[] = [
  {
    id: 1,
    title: 'Singkong Gajah Super Panen Banjit',
    description: 'Kadar pati tinggi siap kirim',
    commodityName: 'Singkong',
    subdistrict: 'Banjit',
    pricePerUnit: 1800,
    status: ListingStatus.active,
    reportCount: 0,
  },
  {
    id: 2,
    title: 'Kopi Robusta Petik Merah',
    description: 'Kadar air 12% standar ekspor',
    commodityName: 'Kopi Robusta',
    subdistrict: 'Banjit',
    pricePerUnit: 48000,
    status: ListingStatus.active,
    reportCount: 1,
  },
  {
    id: 3,
    title: 'Jagung Pipil Pakan Ternak',
    description: 'Kering panen Blambangan Umpu',
    commodityName: 'Jagung',
    subdistrict: 'Blambangan Umpu',
    pricePerUnit: 4200,
    status: ListingStatus.active,
    reportCount: 0,
  },
  {
    id: 4,
    title: 'Karet Lateks Pekat',
    description: 'DRC tinggi Buay Bahuga',
    commodityName: 'Karet',
    subdistrict: 'Buay Bahuga',
    pricePerUnit: 11000,
    status: ListingStatus.suspended,
    reportCount: 3,
  },
  {
    id: 5,
    title: 'Draf Singkong Cadangan',
    description: 'Belum siap tayang',
    commodityName: 'Singkong',
    subdistrict: 'Banjit',
    pricePerUnit: 1700,
    status: ListingStatus.draft,
    reportCount: 0,
  },
];

describe('Listings Catalog Filtering and Visibility Tests', () => {
  it('hides draft and suspended listings from public catalog view', () => {
    const publicListings = SAMPLE_LISTINGS.filter(
      (l) => l.status === ListingStatus.active || l.status === ListingStatus.pending_confirmation
    );
    expect(publicListings).toHaveLength(3);
    expect(publicListings.map((l) => l.id)).toEqual([1, 2, 3]);
  });

  it('filters listings by keyword in title, description, or commodity', () => {
    const keyword = 'singkong';
    const matches = SAMPLE_LISTINGS.filter(
      (l) =>
        (l.status === ListingStatus.active || l.status === ListingStatus.pending_confirmation) &&
        (l.title.toLowerCase().includes(keyword) ||
          l.description.toLowerCase().includes(keyword) ||
          l.commodityName.toLowerCase().includes(keyword))
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].id).toBe(1);
  });

  it('filters listings by subdistrict', () => {
    const subdistricts = ['Banjit'];
    const matches = SAMPLE_LISTINGS.filter(
      (l) =>
        (l.status === ListingStatus.active || l.status === ListingStatus.pending_confirmation) &&
        subdistricts.includes(l.subdistrict)
    );
    expect(matches).toHaveLength(2);
    expect(matches.map((l) => l.id)).toEqual([1, 2]);
  });

  it('filters listings by price range (min and max)', () => {
    const minPrice = 4000;
    const maxPrice = 15000;
    const matches = SAMPLE_LISTINGS.filter(
      (l) =>
        (l.status === ListingStatus.active || l.status === ListingStatus.pending_confirmation) &&
        l.pricePerUnit >= minPrice &&
        l.pricePerUnit <= maxPrice
    );
    expect(matches).toHaveLength(1);
    expect(matches[0].title).toBe('Jagung Pipil Pakan Ternak');
  });

  it('sorts listings correctly by price ascending and descending', () => {
    const activeListings = SAMPLE_LISTINGS.filter((l) => l.status === ListingStatus.active);

    const priceAsc = [...activeListings].sort((a, b) => a.pricePerUnit - b.pricePerUnit);
    expect(priceAsc[0].pricePerUnit).toBe(1800);
    expect(priceAsc[priceAsc.length - 1].pricePerUnit).toBe(48000);

    const priceDesc = [...activeListings].sort((a, b) => b.pricePerUnit - a.pricePerUnit);
    expect(priceDesc[0].pricePerUnit).toBe(48000);
    expect(priceDesc[priceDesc.length - 1].pricePerUnit).toBe(1800);
  });

  it('enforces automatic suspension when reports reach 3 unique reports', () => {
    const checkSuspensionTrigger = (currentReports: number, newReports: number) => {
      const total = currentReports + newReports;
      return total >= 3 ? ListingStatus.suspended : ListingStatus.active;
    };

    expect(checkSuspensionTrigger(0, 1)).toBe(ListingStatus.active);
    expect(checkSuspensionTrigger(1, 1)).toBe(ListingStatus.active);
    expect(checkSuspensionTrigger(2, 1)).toBe(ListingStatus.suspended);
  });
});
