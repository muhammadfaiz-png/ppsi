import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth/jwt';
import { ListingStatus, UserRole } from '@/types/domain';

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

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Harap masuk terlebih dahulu' }, { status: 401 });
    }

    if (session.role !== UserRole.farmer && session.role !== UserRole.admin) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya akun penjual (petani/gapoktan) yang dapat memasang hasil panen' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      commodityId,
      commodityName,
      title,
      description,
      specificationGrade,
      qualityParamName,
      qualityParamValue,
      pricePerUnit,
      unit = 'kg',
      stockQuantity,
      minOrder,
      status = 'active', // 'active' or 'draft'
      photos = [],
    } = body;

    if (!title || typeof title !== 'string' || title.trim().length < 3) {
      return NextResponse.json({ error: 'Judul listing panen minimal 3 karakter' }, { status: 400 });
    }

    const price = parseFloat(pricePerUnit);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Harga indikasi per satuan harus lebih besar dari 0' }, { status: 400 });
    }

    const stock = parseFloat(stockQuantity);
    if (isNaN(stock) || stock <= 0) {
      return NextResponse.json({ error: 'Jumlah stok harus lebih besar dari 0' }, { status: 400 });
    }

    const min = parseFloat(minOrder);
    if (isNaN(min) || min <= 0) {
      return NextResponse.json({ error: 'Minimal pemesanan harus lebih besar dari 0' }, { status: 400 });
    }

    // Resolve commodity
    let comm;
    if (commodityId) {
      comm = await prisma.commodity.findUnique({ where: { id: parseInt(commodityId, 10) } });
    } else if (commodityName) {
      comm = await prisma.commodity.findUnique({ where: { name: commodityName } });
    }

    if (!comm) {
      return NextResponse.json({ error: 'Komoditas tidak valid' }, { status: 404 });
    }

    // Resolve or auto-create farmer profile
    let profile = await prisma.farmerProfile.findUnique({
      where: { userId: session.userId },
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
      });
    }

    // Process photo uploads
    const savedPhotoUrls: string[] = [];
    if (Array.isArray(photos) && photos.length > 0) {
      const publicUploadsDir = path.join(process.cwd(), 'public', 'uploads', 'listings');
      if (!fs.existsSync(publicUploadsDir)) {
        fs.mkdirSync(publicUploadsDir, { recursive: true });
      }

      photos.slice(0, 3).forEach((photoStr: string, idx: number) => {
        if (typeof photoStr === 'string' && photoStr.startsWith('data:image')) {
          const matches = photoStr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (matches && matches.length === 3) {
            const ext = matches[1].includes('png') ? 'png' : matches[1].includes('webp') ? 'webp' : 'jpg';
            const filename = `${profile.id}_${Date.now()}_${idx}.${ext}`;
            const filepath = path.join(publicUploadsDir, filename);
            fs.writeFileSync(filepath, Buffer.from(matches[2], 'base64'));
            savedPhotoUrls.push(`/uploads/listings/${filename}`);
          }
        } else if (typeof photoStr === 'string' && photoStr.length > 0) {
          savedPhotoUrls.push(photoStr);
        }
      });
    }

    // Validate status: active or draft
    const listingStatus = status === 'draft' ? ListingStatus.draft : ListingStatus.active;

    const newListing = await prisma.productListing.create({
      data: {
        profileId: profile.id,
        commodityId: comm.id,
        title: title.trim(),
        description: description?.trim() || '',
        specificationGrade: specificationGrade?.trim() || 'Standar',
        qualityParamName: qualityParamName?.trim() || null,
        qualityParamValue: qualityParamValue?.trim() || null,
        pricePerUnit: price,
        unit: unit === 'ton' ? 'ton' : 'kg',
        stockQuantity: stock,
        minOrder: min,
        status: listingStatus,
        lastStockConfirmedAt: new Date(),
        photos: {
          create: savedPhotoUrls.map((url, index) => ({
            photoUrl: url,
            order: index,
          })),
        },
      },
      include: {
        photos: true,
        commodity: true,
      },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: 'CREATE_LISTING',
          entity: 'ProductListing',
          entityId: String(newListing.id),
          meta: JSON.stringify({
            title: newListing.title,
            commodityName: comm.name,
            pricePerUnit: price,
            stockQuantity: stock,
            status: listingStatus,
          }),
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: listingStatus === 'draft' ? 'Listing berhasil disimpan sebagai draf' : 'Listing hasil panen berhasil diterbitkan',
      listing: {
        id: newListing.id,
        title: newListing.title,
        status: newListing.status,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal membuat listing panen';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
