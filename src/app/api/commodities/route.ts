import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ListingStatus } from '@/types/domain';

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        commodities: {
          include: {
            _count: {
              select: {
                listings: {
                  where: {
                    status: {
                      in: [ListingStatus.active, ListingStatus.pending_confirmation],
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    const formatted = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      commodities: cat.commodities.map((comm) => ({
        id: comm.id,
        name: comm.name,
        unit: comm.unit,
        icon: comm.icon,
        listingsCount: comm._count.listings,
      })),
    }));

    return NextResponse.json({ categories: formatted });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memuat komoditas';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
