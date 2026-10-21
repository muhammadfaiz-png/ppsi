import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ListingEventType, ListingStatus } from '@/types/domain';

export async function GET(
  req: NextRequest,
  { params }: { params: { listingId: string } }
) {
  const listingId = parseInt(params.listingId, 10);
  if (isNaN(listingId)) {
    return NextResponse.redirect(new URL('/katalog', req.url));
  }

  const listing = await prisma.productListing.findUnique({
    where: { id: listingId },
    include: {
      farmerProfile: {
        include: {
          user: {
            select: {
              phoneNumber: true,
              displayName: true,
            },
          },
        },
      },
    },
  });

  if (!listing) {
    return NextResponse.redirect(new URL('/katalog', req.url));
  }

  // 1. Record telemetry event asynchronously
  try {
    await prisma.listingEvent.create({
      data: {
        type: ListingEventType.wa_click,
        listingId: listing.id,
      },
    });
  } catch (err) {
    console.error('Gagal mencatat wa_click event:', err);
  }

  // 2. Prepare recipient phone
  let rawPhone = listing.farmerProfile.user.phoneNumber.replace(/\D/g, '');
  if (rawPhone.startsWith('0')) {
    rawPhone = '62' + rawPhone.slice(1);
  } else if (!rawPhone.startsWith('62')) {
    rawPhone = '62' + rawPhone;
  }

  // 3. Prepare standardized message format (FR-05)
  // "Halo [Nama Penjual], saya tertarik dengan komoditas [Judul Listing] di Way Kanan Agro-Commerce. Apakah stok [Volume] masih tersedia?"
  const sellerName = listing.farmerProfile.organizationName || listing.farmerProfile.user.displayName;
  const volumeString = `${Number(listing.stockQuantity)} ${listing.unit === 'kg' ? 'Ton' : 'Unit'}`;

  const message = `Halo ${sellerName}, saya tertarik dengan komoditas ${listing.title} di Way Kanan Agro-Commerce. Apakah stok ${volumeString} masih tersedia?`;

  const waUrl = `https://wa.me/${rawPhone}?text=${encodeURIComponent(message)}`;

  // 4. Perform HTTP 302 redirect
  return NextResponse.redirect(waUrl, { status: 302 });
}
