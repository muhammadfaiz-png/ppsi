import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/domain';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== UserRole.admin) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Admin yang dapat melihat antrean verifikasi' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status')?.trim() || '';

    const where: any = {};
    if (status && ['pending', 'verified', 'rejected'].includes(status)) {
      where.verificationStatus = status;
    }

    const profiles = await prisma.farmerProfile.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            phoneNumber: true,
            displayName: true,
            role: true,
            status: true,
            createdAt: true,
          },
        },
        verifiedBy: {
          select: {
            id: true,
            displayName: true,
          },
        },
        listings: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
      },
    });

    const counts = {
      all: await prisma.farmerProfile.count(),
      pending: await prisma.farmerProfile.count({ where: { verificationStatus: 'pending' } }),
      verified: await prisma.farmerProfile.count({ where: { verificationStatus: 'verified' } }),
      rejected: await prisma.farmerProfile.count({ where: { verificationStatus: 'rejected' } }),
    };

    return NextResponse.json({
      profiles: profiles.map((p) => ({
        id: p.id,
        userId: p.userId,
        organizationName: p.organizationName,
        subdistrict: p.subdistrict,
        addressDetail: p.addressDetail,
        idCardPhoto: p.idCardPhoto,
        verificationStatus: p.verificationStatus,
        rejectionReason: p.rejectionReason,
        verifiedAt: p.verifiedAt,
        verifiedByName: p.verifiedBy?.displayName || null,
        user: p.user,
        totalListings: p.listings.length,
        updatedAt: p.updatedAt,
      })),
      counts,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memuat antrean verifikasi';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
