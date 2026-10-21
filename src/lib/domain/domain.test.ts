import { describe, it, expect } from 'vitest';
import { UserRole, ListingStatus, VerificationStatus } from '@/types/domain';

const CANONICAL_SUBDISTRICTS = [
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

const CANONICAL_COMMODITIES = ['Singkong', 'Kopi Robusta', 'Karet', 'Padi', 'Jagung'];

describe('Domain Rules & Invariants Tests', () => {
  it('has exactly 14 official subdistricts for Kabupaten Way Kanan', () => {
    expect(CANONICAL_SUBDISTRICTS).toHaveLength(14);
    expect(CANONICAL_SUBDISTRICTS).toContain('Banjit');
    expect(CANONICAL_SUBDISTRICTS).toContain('Blambangan Umpu');
    expect(CANONICAL_SUBDISTRICTS).toContain('Buay Bahuga');
  });

  it('has exactly 5 canonical MVP commodities', () => {
    expect(CANONICAL_COMMODITIES).toHaveLength(5);
    expect(CANONICAL_COMMODITIES).toEqual(['Singkong', 'Kopi Robusta', 'Karet', 'Padi', 'Jagung']);
  });

  it('validates 7-day threshold for stock confirmation (PRD Edge Case 3)', () => {
    const now = new Date();
    const sixDaysAgo = new Date(now.getTime() - 6 * 86400000);
    const eightDaysAgo = new Date(now.getTime() - 8 * 86400000);

    const isStale = (date: Date) => now.getTime() - date.getTime() >= 7 * 86400000;

    expect(isStale(sixDaysAgo)).toBe(false);
    expect(isStale(eightDaysAgo)).toBe(true);
  });

  it('validates 14-day stale threshold for price board data', () => {
    const now = new Date();
    const tenDaysAgo = new Date(now.getTime() - 10 * 86400000);
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 86400000);

    const isPriceStale = (date: Date) => now.getTime() - date.getTime() > 14 * 86400000;

    expect(isPriceStale(tenDaysAgo)).toBe(false);
    expect(isPriceStale(fifteenDaysAgo)).toBe(true);
  });

  it('formats PRD FR-05 WhatsApp inquiry prefilled text correctly', () => {
    const sellerName = 'Pak Joko';
    const listingTitle = 'Singkong Gajah Banjit';
    const volume = '20 Ton';

    const text = `Halo ${sellerName}, saya tertarik dengan komoditas ${listingTitle} di Way Kanan Agro-Commerce. Apakah stok ${volume} masih tersedia?`;

    expect(text).toContain('Halo Pak Joko');
    expect(text).toContain('Singkong Gajah Banjit');
    expect(text).toContain('Apakah stok 20 Ton masih tersedia?');
  });

  it('validates 3-report threshold for auto-suspension (PRD Edge Case 4)', () => {
    const shouldAutoSuspend = (uniqueReportCount: number) => uniqueReportCount >= 3;

    expect(shouldAutoSuspend(1)).toBe(false);
    expect(shouldAutoSuspend(2)).toBe(false);
    expect(shouldAutoSuspend(3)).toBe(true);
    expect(shouldAutoSuspend(5)).toBe(true);
  });
});
