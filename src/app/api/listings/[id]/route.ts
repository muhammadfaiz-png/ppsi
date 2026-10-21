import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import { ListingEventType, ListingStatus, UserRole } from '@/types/domain';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const listingId = parseInt(params.id, 10);
  if (isNaN(listingId)) {
    return NextResponse.json({ error: 'ID listing tidak valid' }, { status: 400 });
  }

  const session = await getCurrentUser();

  const listing = await prisma.productListing.findUnique({
    where: { id: listingId },
    include: {
      commodity: {
        include: {
          category: true,
        },
      },
      farmerProfile: {
        include: {
          user: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
      },
      photos: {
        orderBy: { order: 'asc' },
      },
    },
  });

  if (!listing) {
    return NextResponse.json({ error: 'Komoditas tidak ditemukan' }, { status: 404 });
  }

  // Privacy & Access Control:
  // If status is draft, suspended, or archived, only the owner or an admin can view it
  const isOwner = session && session.userId === listing.farmerProfile.user.id;
  const isAdmin = session && session.role === UserRole.admin;

  if (
    [ListingStatus.draft, ListingStatus.suspended, ListingStatus.archived].includes(
      listing.status as any
    ) &&
    !isOwner &&
    !isAdmin
  ) {
    return NextResponse.json({ error: 'Komoditas sedang tidak dapat diakses publik' }, { status: 404 });
  }

  // Record view event (ignoring errors)
  try {
    await prisma.listingEvent.create({
      data: {
        type: ListingEventType.view,
        listingId: listing.id,
      },
    });
  } catch {}

  const responseData = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    specificationGrade: listing.specificationGrade,
    qualityParamName: listing.qualityParamName,
    qualityParamValue: listing.qualityParamValue,
    pricePerUnit: Number(listing.pricePerUnit),
    unit: listing.unit,
    stockQuantity: Number(listing.stockQuantity),
    minOrder: Number(listing.minOrder),
    status: listing.status,
    lastStockConfirmedAt: listing.lastStockConfirmedAt,
    createdAt: listing.createdAt,
    commodity: {
      id: listing.commodity.id,
      name: listing.commodity.name,
      icon: listing.commodity.icon,
      category: {
        name: listing.commodity.category.name,
      },
    },
    farmerProfile: {
      id: listing.farmerProfile.id,
      organizationName: listing.farmerProfile.organizationName,
      subdistrict: listing.farmerProfile.subdistrict,
      addressDetail: listing.farmerProfile.addressDetail,
      verificationStatus: listing.farmerProfile.verificationStatus,
      displayName: listing.farmerProfile.user.displayName,
    },
    photos: listing.photos.map((p) => ({
      id: p.id,
      photoUrl: p.photoUrl,
      order: p.order,
    })),
  };

  return NextResponse.json({ listing: responseData });
}
