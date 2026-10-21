import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { ListingStatus, ReportStatus } from '@/types/domain';

const reportSchema = z.object({
  reason: z.string().min(5, 'Alasan laporan minimal 5 karakter').max(500),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Silakan masuk ke akun Anda terlebih dahulu untuk melaporkan produk ini.' },
        { status: 401 }
      );
    }

    const listingId = parseInt(params.id, 10);
    if (isNaN(listingId)) {
      return NextResponse.json({ success: false, error: 'ID komoditas tidak valid' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = reportSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || 'Alasan laporan tidak valid' },
        { status: 400 }
      );
    }

    const listing = await prisma.productListing.findUnique({
      where: { id: listingId },
    });

    if (!listing) {
      return NextResponse.json({ success: false, error: 'Komoditas tidak ditemukan' }, { status: 404 });
    }

    // Check unique report constraint
    const existingReport = await prisma.report.findUnique({
      where: {
        reporterId_listingId: {
          reporterId: session.userId,
          listingId: listing.id,
        },
      },
    });

    if (existingReport) {
      return NextResponse.json(
        { success: false, error: 'Anda sudah pernah mengirimkan laporan untuk komoditas ini.' },
        { status: 400 }
      );
    }

    // Create report
    await prisma.report.create({
      data: {
        reporterId: session.userId,
        listingId: listing.id,
        reason: parsed.data.reason,
        status: ReportStatus.pending,
      },
    });

    // Check threshold: >= 3 unique reports triggers automatic suspension
    const totalReports = await prisma.report.count({
      where: { listingId: listing.id },
    });

    if (totalReports >= 3 && listing.status !== ListingStatus.suspended) {
      await prisma.productListing.update({
        where: { id: listing.id },
        data: { status: ListingStatus.suspended },
      });

      await prisma.auditLog.create({
        data: {
          action: 'AUTO_SUSPEND_LISTING',
          entity: 'ProductListing',
          entityId: String(listing.id),
          meta: JSON.stringify({
            reason: 'Menerima >= 3 laporan pengguna unik',
            reportsCount: totalReports,
            lastReporterId: session.userId,
          }),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Laporan Anda telah diterima dan akan segera ditinjau oleh Admin Platform.',
      autoSuspended: totalReports >= 3,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
