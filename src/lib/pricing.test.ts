import { describe, it, expect } from 'vitest';

describe('Price Calculations & Sparkline Math', () => {
  it('calculates average, min, and max indicated prices correctly', () => {
    const prices = [1800, 1900, 1750, 1850, 2000];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const sum = prices.reduce((a, b) => a + b, 0);
    const avgPrice = Math.round(sum / prices.length);

    expect(minPrice).toBe(1750);
    expect(maxPrice).toBe(2000);
    expect(avgPrice).toBe(1860);
  });

  it('computes price delta between current and previous indicated price', () => {
    const current = 1850;
    const previous = 1800;
    const delta = current - previous;
    expect(delta).toBe(50);

    const percent = Math.round((delta / previous) * 1000) / 10;
    expect(percent).toBe(2.8);
  });

  it('generates SVG sparkline normalization points correctly', () => {
    const data = [1700, 1750, 1800, 1850, 1800, 1900, 1850, 1950];
    const width = 320;
    const height = 80;
    const paddingX = 16;
    const paddingY = 16;
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((val, idx) => {
      const x = paddingX + (idx / (data.length - 1)) * usableWidth;
      const y = height - paddingY - ((val - min) / range) * usableHeight;
      return { x, y, val };
    });

    expect(points).toHaveLength(8);
    // First point x should be at paddingX
    expect(points[0].x).toBe(16);
    // Last point x should be at width - paddingX
    expect(points[points.length - 1].x).toBe(304);
    // Max value should map to y = paddingY (highest on SVG canvas)
    const maxPoint = points.find((p) => p.val === max);
    expect(maxPoint?.y).toBe(paddingY);
    // Min value should map to y = height - paddingY (lowest on SVG canvas)
    const minPoint = points.find((p) => p.val === min);
    expect(minPoint?.y).toBe(height - paddingY);
  });
});
