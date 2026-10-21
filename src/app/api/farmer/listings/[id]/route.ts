import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { ListingStatus, UserRole } from '@/types/domain';

export async function PATCH(
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
    const { status, pricePerUnit, stockQuantity } = body;

    const dataToUpdate: any = {};
    if (status && Object.values(ListingStatus).includes(status)) {
      dataToUpdate.status = status;
      if (status === ListingStatus.active) {
        dataToUpdate.lastStockConfirmedAt = new Date();
      }
    }

    if (pricePerUnit !== undefined) {
      const p = parseFloat(pricePerUnit);
      if (!isNaN(p) && p > 0) dataToUpdate.pricePerUnit = p;
    }

    if (stockQuantity !== undefined) {
      const s = parseFloat(stockQuantity);
      if (!isNaN(s) && s >= 0) dataToUpdate.stockQuantity = s;
    }

    const updated = await prisma.productListing.update({
      where: { id: listingId },
      data: dataToUpdate,
    });

    // Audit log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: 'UPDATE_LISTING_STATUS',
          entity: 'ProductListing',
          entityId: String(listingId),
          meta: JSON.stringify({ oldStatus: listing.status, newStatus: updated.status }),
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Status listing berhasil diperbarui',
      listing: updated,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memperbarui listing';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

export async function DELETE(
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

    // Soft delete to archived status
    await prisma.productListing.update({
      where: { id: listingId },
      data: { status: ListingStatus.archived },
    });

    return NextResponse.json({
      success: true,
      message: 'Listing berhasil diarsipkan',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mengarsipkan listing';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
