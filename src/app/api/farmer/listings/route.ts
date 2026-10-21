import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { ListingEventType, ListingStatus, UserRole } from '@/types/domain';

export async function GET() {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Harap masuk terlebih dahulu' }, { status: 401 });
    }

    if (session.role !== UserRole.farmer && session.role !== UserRole.admin) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya akun penjual yang dapat mengakses dashboard' },
        { status: 403 }
      );
    }

    let profile = await prisma.farmerProfile.findUnique({
      where: { userId: session.userId },
      include: {
        user: {
          select: {
            id: true,
            phoneNumber: true,
            displayName: true,
            role: true,
            status: true,
          },
        },
      },
    });

    if (!profile) {
      const user = await prisma.user.findUnique({ where: { id: session.userId } });
      profile = await prisma.farmerProfile.create({
        data: {
          userId: session.userId,
          organizationName: user?.displayName || 'Petani Way Kanan',
          subdistrict: 'Banjit',
          addressDetail: 'Way Kanan, Lampung',
          verificationStatus: 'pending',
        },
        include: {
          user: {
            select: {
              id: true,
              phoneNumber: true,
              displayName: true,
              role: true,
              status: true,
            },
          },
        },
      });
    }

    const listings = await prisma.productListing.findMany({
      where: {
        profileId: profile.id,
        status: { not: ListingStatus.archived },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        commodity: true,
        photos: { orderBy: { order: 'asc' } },
        events: true,
      },
    });

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

    // Compute stats & format listings
    let activeCount = 0;
    let soldCount = 0;
    let draftCount = 0;
    let totalStockTon = 0;
    let totalWaClicks = 0;
    let totalViews = 0;

    const formattedListings = listings.map((l) => {
      const waClicks = l.events.filter((e) => e.type === ListingEventType.wa_click).length;
      const views = l.events.filter((e) => e.type === ListingEventType.view).length;

      totalWaClicks += waClicks;
      totalViews += views;

      const isSevenDaysOld = new Date(l.lastStockConfirmedAt) < sevenDaysAgo;
      const needsConfirmation =
        l.status === ListingStatus.pending_confirmation ||
        (l.status === ListingStatus.active && isSevenDaysOld);

      if (l.status === ListingStatus.active || l.status === ListingStatus.pending_confirmation) {
        activeCount++;
        const stock = Number(l.stockQuantity);
        totalStockTon += l.unit === 'ton' ? stock : stock / 1000;
      } else if (l.status === ListingStatus.sold_out) {
        soldCount++;
      } else if (l.status === ListingStatus.draft) {
        draftCount++;
      }

      return {
        id: l.id,
        title: l.title,
        commodityName: l.commodity.name,
        commodityIcon: l.commodity.icon,
        pricePerUnit: Number(l.pricePerUnit),
        unit: l.unit,
        stockQuantity: Number(l.stockQuantity),
        minOrder: Number(l.minOrder),
        specificationGrade: l.specificationGrade,
        status: l.status,
        lastStockConfirmedAt: l.lastStockConfirmedAt,
        needsConfirmation,
        views,
        waClicks,
        photoUrl: l.photos[0]?.photoUrl || null,
        createdAt: l.createdAt,
      };
    });

    // Find any listing that urgently needs confirmation
    const pendingConfirmationListings = formattedListings.filter((l) => l.needsConfirmation);

    return NextResponse.json({
      profile: {
        id: profile.id,
        organizationName: profile.organizationName,
        subdistrict: profile.subdistrict,
        addressDetail: profile.addressDetail,
        verificationStatus: profile.verificationStatus,
        rejectionReason: profile.rejectionReason,
        user: profile.user,
      },
      stats: {
        activeCount,
        soldCount,
        draftCount,
        totalStockTon: Math.round(totalStockTon * 10) / 10,
        totalWaClicks,
        totalViews,
      },
      pendingConfirmationListings,
      listings: formattedListings,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memuat data dashboard penjual';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
