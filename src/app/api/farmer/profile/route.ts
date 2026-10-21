import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { VerificationStatus, UserRole } from '@/types/domain';

const profileUpdateSchema = z.object({
  displayName: z.string().min(2, 'Nama minimal 2 karakter').max(60),
  organizationName: z.string().min(2, 'Nama kelompok minimal 2 karakter').max(100),
  subdistrict: z.string().min(2, 'Kecamatan wajib dipilih'),
  addressDetail: z.string().min(5, 'Alamat lengkap minimal 5 karakter'),
  idCardPhotoBase64: z.string().optional(),
});

export async function PUT(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Harap masuk terlebih dahulu' }, { status: 401 });
    }

    if (session.role !== UserRole.farmer) {
      return NextResponse.json(
        { success: false, error: 'Hanya akun penjual yang dapat memperbarui profil usaha' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || 'Input tidak valid' },
        { status: 400 }
      );
    }

    const { displayName, organizationName, subdistrict, addressDetail, idCardPhotoBase64 } = parsed.data;

    let savedPhotoPath: string | undefined = undefined;

    // Handle private KTP photo storage
    if (idCardPhotoBase64 && idCardPhotoBase64.startsWith('data:image')) {
      const privateDir = path.join(process.cwd(), 'uploads', 'private', 'id_cards');
      if (!fs.existsSync(privateDir)) {
        fs.mkdirSync(privateDir, { recursive: true });
      }

      const matches = idCardPhotoBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        const buffer = Buffer.from(matches[2], 'base64');
        const filename = `${session.userId}_ktp_${Date.now()}.jpg`;
        const filepath = path.join(privateDir, filename);
        fs.writeFileSync(filepath, buffer);
        savedPhotoPath = `/uploads/private/id_cards/${filename}`;
      }
    }

    // Update user display name
    await prisma.user.update({
      where: { id: session.userId },
      data: { displayName },
    });

    // Update farmer profile
    const existingProfile = await prisma.farmerProfile.findUnique({
      where: { userId: session.userId },
    });

    // If uploading new KTP document, move status back to pending
    const newStatus = savedPhotoPath ? VerificationStatus.pending : existingProfile?.verificationStatus || VerificationStatus.pending;

    const updatedProfile = await prisma.farmerProfile.upsert({
      where: { userId: session.userId },
      update: {
        organizationName,
        subdistrict,
        addressDetail,
        ...(savedPhotoPath ? { idCardPhoto: savedPhotoPath, verificationStatus: newStatus, rejectionReason: null } : {}),
      },
      create: {
        userId: session.userId,
        organizationName,
        subdistrict,
        addressDetail,
        idCardPhoto: savedPhotoPath,
        verificationStatus: VerificationStatus.pending,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: savedPhotoPath ? 'FARMER_SUBMIT_VERIFICATION' : 'FARMER_UPDATE_PROFILE',
        entity: 'FarmerProfile',
        entityId: String(updatedProfile.id),
        meta: JSON.stringify({
          organizationName,
          subdistrict,
          hasPhoto: !!savedPhotoPath,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: savedPhotoPath
        ? 'Dokumen dan profil berhasil disimpan. Menunggu verifikasi Admin.'
        : 'Profil usaha berhasil diperbarui.',
      profile: updatedProfile,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
