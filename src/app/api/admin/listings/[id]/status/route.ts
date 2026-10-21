import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { ListingStatus, UserRole } from '@/types/domain';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== UserRole.admin) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Admin yang dapat memoderasi status listing' },
        { status: 403 }
      );
    }

    const listingId = parseInt(params.id, 10);
    if (isNaN(listingId)) {
      return NextResponse.json({ error: 'ID listing tidak valid' }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !Object.values(ListingStatus).includes(status)) {
      return NextResponse.json({ error: 'Status listing tidak valid' }, { status: 400 });
    }

    const listing = await prisma.productListing.update({
      where: { id: listingId },
      data: {
        status,
        lastStockConfirmedAt: status === ListingStatus.active ? new Date() : undefined,
      },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: 'ADMIN_CHANGE_LISTING_STATUS',
          entity: 'ProductListing',
          entityId: String(listingId),
          meta: JSON.stringify({
            newStatus: status,
          }),
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Status listing berhasil diubah menjadi "${status}"`,
      listing,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memperbarui status listing';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
