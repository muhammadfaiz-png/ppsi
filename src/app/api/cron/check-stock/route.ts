import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ListingStatus } from '@/types/domain';
import { getWhatsAppGateway } from '@/lib/whatsapp';

export async function GET(req: NextRequest) {
  return handleStockCheck(req);
}

export async function POST(req: NextRequest) {
  return handleStockCheck(req);
}

async function handleStockCheck(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const authHeader = req.headers.get('authorization');
    const secretParam = searchParams.get('secret');

    const expectedSecret = process.env.CRON_SECRET || 'waykanan_cron_secret_stock_confirmation_key_998877';
    const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (bearerSecret !== expectedSecret && secretParam !== expectedSecret) {
      return NextResponse.json({ error: 'Unauthorized cron request' }, { status: 401 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000);

    // Find active listings that haven't been confirmed in >= 7 days
    const staleListings = await prisma.productListing.findMany({
      where: {
        status: ListingStatus.active,
        lastStockConfirmedAt: {
          lt: sevenDaysAgo,
        },
      },
      include: {
        farmerProfile: {
          include: {
            user: true,
          },
        },
      },
    });

    const updatedIds: number[] = [];
    const waGateway = getWhatsAppGateway();

    for (const listing of staleListings) {
      await prisma.productListing.update({
        where: { id: listing.id },
        data: {
          status: ListingStatus.pending_confirmation,
        },
      });
      updatedIds.push(listing.id);

      // Send WhatsApp stock confirmation prompt to farmer
      try {
        const farmerPhone = listing.farmerProfile.user.phoneNumber;
        const farmerName = listing.farmerProfile.user.displayName;
        const msg = `Halo ${farmerName}, sistem Way Kanan Agro mencatat komoditas Anda "${listing.title}" belum dikonfirmasi ketersediaan stoknya selama 7 hari. Silakan buka Dashboard Penjual Anda untuk mengonfirmasi ketersediaan barang agar pembeli B2B mendapatkan informasi akurat. Terima kasih!`;
        await waGateway.sendMessage(farmerPhone, msg);
      } catch (err) {
        console.error(`Gagal mengirim pesan WA ke ${listing.farmerProfile.user.phoneNumber}:`, err);
      }
    }

    // Record audit log
    if (updatedIds.length > 0) {
      try {
        await prisma.auditLog.create({
          data: {
            action: 'CRON_STOCK_CHECK_PENDING_CONFIRMATION',
            entity: 'ProductListing',
            entityId: updatedIds.join(','),
            meta: JSON.stringify({
              count: updatedIds.length,
              listingIds: updatedIds,
              timestamp: now.toISOString(),
            }),
          },
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      message: `Berhasil memeriksa stok: ${updatedIds.length} listing ditandai sebagai Pending Confirmation`,
      count: updatedIds.length,
      listingIds: updatedIds,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal menjalankan cron periksa stok';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
