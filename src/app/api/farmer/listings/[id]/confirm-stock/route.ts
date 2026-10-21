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
    if (!session) {
      return NextResponse.json({ error: 'Harap masuk terlebih dahulu' }, { status: 401 });
    }

    const listingId = parseInt(params.id, 10);
    if (isNaN(listingId)) {
      return NextResponse.json({ error: 'ID listing tidak valid' }, { status: 400 });
    }

    const listing = await prisma.productListing.findUnique({
      where: { id: listingId },
      include: {
        farmerProfile: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing tidak ditemukan' }, { status: 404 });
    }

    const isOwner = listing.farmerProfile.userId === session.userId;
    const isAdmin = session.role === UserRole.admin;

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: 'Akses ditolak: Anda bukan pemilik listing ini' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { isAvailable } = body;

    const newStatus = isAvailable ? ListingStatus.active : ListingStatus.sold_out;
    const updated = await prisma.productListing.update({
      where: { id: listingId },
      data: {
        status: newStatus,
        lastStockConfirmedAt: new Date(),
      },
    });

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: isAvailable ? 'CONFIRM_STOCK_AVAILABLE' : 'CONFIRM_STOCK_SOLD_OUT',
          entity: 'ProductListing',
          entityId: String(listingId),
          meta: JSON.stringify({
            listingId,
            isAvailable,
            status: newStatus,
          }),
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: isAvailable
        ? 'Stok panen berhasil dikonfirmasi masih tersedia'
        : 'Status listing berhasil diubah menjadi Terjual / Habis',
      listing: updated,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mengonfirmasi stok';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
