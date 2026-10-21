import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { UserRole, VerificationStatus } from '@/types/domain';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== UserRole.admin) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Admin yang dapat menyetujui verifikasi' },
        { status: 403 }
      );
    }

    const profileId = parseInt(params.id, 10);
    if (isNaN(profileId)) {
      return NextResponse.json({ error: 'ID profil tidak valid' }, { status: 400 });
    }

    const profile = await prisma.farmerProfile.findUnique({
      where: { id: profileId },
      include: { user: true },
    });

    if (!profile) {
      return NextResponse.json({ error: 'Profil tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.farmerProfile.update({
      where: { id: profileId },
      data: {
        verificationStatus: VerificationStatus.verified,
        rejectionReason: null,
        verifiedById: session.userId,
        verifiedAt: new Date(),
      },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: 'APPROVE_SELLER_VERIFICATION',
          entity: 'FarmerProfile',
          entityId: String(profileId),
          meta: JSON.stringify({
            organizationName: profile.organizationName,
            farmerUserId: profile.userId,
          }),
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Profil penjual "${profile.organizationName}" berhasil diverifikasi`,
      profile: updated,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal menyetujui verifikasi';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
