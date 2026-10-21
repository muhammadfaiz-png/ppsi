import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ListingStatus } from '@/types/domain';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get('q')?.trim() || '';
    const category = searchParams.get('category')?.trim() || '';
    const commodity = searchParams.get('commodity')?.trim() || '';
    const subdistricts = searchParams.getAll('subdistrict');
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const sort = searchParams.get('sort') || 'newest'; // newest, price_asc, price_desc
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const skip = (page - 1) * limit;

    // Filter criteria: only active and pending_confirmation are visible to the public
    // draft, suspended, and archived are strictly hidden from public catalog
    const where: any = {
      status: {
        in: [ListingStatus.active, ListingStatus.pending_confirmation],
      },
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { commodity: { name: { contains: q } } },
        { farmerProfile: { organizationName: { contains: q } } },
      ];
    }

    if (category) {
      where.commodity = {
        ...(where.commodity || {}),
        category: { name: category },
      };
    }

    if (commodity) {
      where.commodity = {
        ...(where.commodity || {}),
        name: commodity,
      };
    }

    if (subdistricts.length > 0) {
      where.farmerProfile = {
        ...(where.farmerProfile || {}),
        subdistrict: { in: subdistricts },
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.pricePerUnit = {};
      if (minPrice !== undefined && !isNaN(minPrice)) where.pricePerUnit.gte = minPrice;
      if (maxPrice !== undefined && !isNaN(maxPrice)) where.pricePerUnit.lte = maxPrice;
    }

    // Sorting: listings with pending_confirmation are ordered AFTER active listings
    let orderBy: any[] = [];
    if (sort === 'price_asc') {
      orderBy = [{ status: 'asc' }, { pricePerUnit: 'asc' }, { createdAt: 'desc' }];
    } else if (sort === 'price_desc') {
      orderBy = [{ status: 'asc' }, { pricePerUnit: 'desc' }, { createdAt: 'desc' }];
    } else {
      // Default: newest active listings first
      orderBy = [{ status: 'asc' }, { createdAt: 'desc' }];
    }

    const [listings, totalCount] = await Promise.all([
      prisma.productListing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          commodity: {
            include: { category: true },
          },
          farmerProfile: {
            select: {
              id: true,
              organizationName: true,
              subdistrict: true,
              verificationStatus: true,
            },
          },
          photos: {
            orderBy: { order: 'asc' },
            take: 1,
          },
        },
      }),
      prisma.productListing.count({ where }),
    ]);

    // Format for client
    const formatted = listings.map((l) => ({
      id: l.id,
      title: l.title,
      commodityName: l.commodity.name,
      categoryName: l.commodity.category.name,
      organizationName: l.farmerProfile.organizationName,
      subdistrict: l.farmerProfile.subdistrict,
      isVerified: l.farmerProfile.verificationStatus === 'verified',
      pricePerUnit: Number(l.pricePerUnit),
      unit: l.unit,
      stockQuantity: Number(l.stockQuantity),
      minOrder: Number(l.minOrder),
      status: l.status,
      photoUrl: l.photos[0]?.photoUrl || undefined,
      lastStockConfirmedAt: l.lastStockConfirmedAt,
      createdAt: l.createdAt,
    }));

    return NextResponse.json({
      listings: formatted,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memuat katalog';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
