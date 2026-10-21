import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import { UserRole } from '@/types/domain';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const commodityName = searchParams.get('commodity') || 'Singkong';

    const commodity = await prisma.commodity.findUnique({
      where: { name: commodityName },
    });

    if (!commodity) {
      return NextResponse.json({ error: 'Komoditas tidak ditemukan' }, { status: 404 });
    }

    const now = new Date();
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 86400000);

    // Fetch all records for this commodity
    const records = await prisma.priceBoard.findMany({
      where: { commodityId: commodity.id },
      orderBy: { effectiveDate: 'desc' },
      include: {
        updatedBy: {
          select: { displayName: true },
        },
      },
    });

    // 1. Group latest price per subdistrict
    const latestPerSubdistrict: Record<string, typeof records[0]> = {};
    const previousPerSubdistrict: Record<string, typeof records[0]> = {};

    for (const rec of records) {
      if (!latestPerSubdistrict[rec.subdistrict]) {
        latestPerSubdistrict[rec.subdistrict] = rec;
      } else if (!previousPerSubdistrict[rec.subdistrict]) {
        previousPerSubdistrict[rec.subdistrict] = rec;
      }
    }

    // 2. Format subdistrict prices
    const subdistrictPrices = Object.keys(latestPerSubdistrict).map((sub) => {
      const current = latestPerSubdistrict[sub];
      const previous = previousPerSubdistrict[sub];
      const delta = previous ? Number(current.indicatedPrice) - Number(previous.indicatedPrice) : 0;
      const isStale = new Date(current.effectiveDate) < fourteenDaysAgo;

      return {
        subdistrict: sub,
        indicatedPrice: Number(current.indicatedPrice),
        unit: current.unit,
        effectiveDate: current.effectiveDate,
        delta,
        isStale,
        updatedByName: current.updatedBy?.displayName || 'Petugas Dinas',
      };
    });

    // 3. Compute 8-week trend sparkline
    // Group records by week (0 to 7)
    const weeklyData: Array<{ weekIndex: number; date: Date; avgPrice: number }> = [];
    for (let w = 7; w >= 0; w--) {
      const weekStart = new Date(now.getTime() - (w + 1) * 7 * 86400000);
      const weekEnd = new Date(now.getTime() - w * 7 * 86400000);

      const weekRecords = records.filter(
        (r) => r.effectiveDate >= weekStart && r.effectiveDate <= weekEnd
      );

      if (weekRecords.length > 0) {
        const sum = weekRecords.reduce((acc, r) => acc + Number(r.indicatedPrice), 0);
        const avg = Math.round(sum / weekRecords.length);
        weeklyData.push({
          weekIndex: 7 - w,
          date: weekEnd,
          avgPrice: avg,
        });
      }
    }

    // If less than 2 points, ensure we provide sample points
    const sparkline = weeklyData.map((d) => d.avgPrice);

    // Compute min, max, avg
    const pricesList = subdistrictPrices.map((p) => p.indicatedPrice);
    const minPrice = pricesList.length > 0 ? Math.min(...pricesList) : 0;
    const maxPrice = pricesList.length > 0 ? Math.max(...pricesList) : 0;
    const avgPrice =
      pricesList.length > 0
        ? Math.round(pricesList.reduce((a, b) => a + b, 0) / pricesList.length)
        : 0;

    // Delta of average
    const prevSpark = sparkline.length >= 2 ? sparkline[sparkline.length - 2] : avgPrice;
    const avgDelta = avgPrice - prevSpark;

    return NextResponse.json({
      commodity: {
        id: commodity.id,
        name: commodity.name,
        unit: commodity.unit,
        icon: commodity.icon,
      },
      stats: {
        avgPrice,
        minPrice,
        maxPrice,
        avgDelta,
        sparkline,
        sourceAgency:
          process.env.PRICE_SOURCE_AGENCY || 'Dinas Ketahanan Pangan & Pertanian Kab. Way Kanan',
        lastUpdatedDate: subdistrictPrices[0]?.effectiveDate || now,
      },
      subdistricts: subdistrictPrices,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memuat data harga';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || (session.role !== UserRole.admin && session.role !== UserRole.officer)) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Admin atau Petugas Dinas yang dapat memperbarui harga indikasi' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { commodityId, commodityName, subdistrict, indicatedPrice, unit, effectiveDate } = body;

    const priceNum = parseFloat(indicatedPrice);
    if (isNaN(priceNum) || priceNum <= 0) {
      return NextResponse.json({ error: 'Harga indikasi harus berupa angka positif' }, { status: 400 });
    }

    if (!subdistrict || typeof subdistrict !== 'string') {
      return NextResponse.json({ error: 'Kecamatan wajib dipilih' }, { status: 400 });
    }

    // Resolve commodity
    let comm;
    if (commodityId) {
      comm = await prisma.commodity.findUnique({ where: { id: parseInt(commodityId, 10) } });
    } else if (commodityName) {
      comm = await prisma.commodity.findUnique({ where: { name: commodityName } });
    }

    if (!comm) {
      return NextResponse.json({ error: 'Komoditas tidak valid' }, { status: 404 });
    }

    const priceRecord = await prisma.priceBoard.create({
      data: {
        commodityId: comm.id,
        subdistrict,
        indicatedPrice: priceNum,
        unit: unit || comm.unit || 'kg',
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        updatedById: session.userId,
      },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: 'UPDATE_PRICE_BOARD',
          entity: 'PriceBoard',
          entityId: String(priceRecord.id),
          meta: JSON.stringify({
            commodityName: comm.name,
            subdistrict,
            indicatedPrice: priceNum,
            unit: priceRecord.unit,
          }),
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Harga indikasi berhasil diperbarui',
      price: priceRecord,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memperbarui harga indikasi';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
