import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/domain';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== UserRole.admin) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Admin yang dapat melihat laporan' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status')?.trim() || '';

    const where: any = {};
    if (status && ['pending', 'resolved', 'rejected'].includes(status)) {
      where.status = status;
    }

    const reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        reporter: {
          select: {
            id: true,
            displayName: true,
            phoneNumber: true,
          },
        },
        listing: {
          include: {
            commodity: true,
            farmerProfile: {
              include: {
                user: {
                  select: {
                    id: true,
                    displayName: true,
                    phoneNumber: true,
                    status: true,
                  },
                },
              },
            },
            photos: {
              take: 1,
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });

    // Also get all listings currently suspended
    const suspendedListings = await prisma.productListing.findMany({
      where: { status: 'suspended' },
      include: {
        commodity: true,
        farmerProfile: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                phoneNumber: true,
                status: true,
              },
            },
          },
        },
        reports: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({
      reports: reports.map((r) => ({
        id: r.id,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt,
        reporter: r.reporter,
        listing: {
          id: r.listing.id,
          title: r.listing.title,
          status: r.listing.status,
          commodityName: r.listing.commodity.name,
          farmerProfile: r.listing.farmerProfile,
          photoUrl: r.listing.photos[0]?.photoUrl || null,
        },
      })),
      suspendedListings: suspendedListings.map((l) => ({
        id: l.id,
        title: l.title,
        commodityName: l.commodity.name,
        pricePerUnit: Number(l.pricePerUnit),
        unit: l.unit,
        farmerProfile: l.farmerProfile,
        reportCount: l.reports.length,
        status: l.status,
        updatedAt: l.updatedAt,
      })),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memuat data laporan';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
