import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/domain';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getCurrentUser();
  if (!session || session.role !== UserRole.admin) {
    return new NextResponse('Akses ditolak: Hanya Admin yang dapat melihat dokumen verifikasi.', {
      status: 403,
    });
  }

  const profileId = parseInt(params.id, 10);
  if (isNaN(profileId)) {
    return new NextResponse('ID profil tidak valid', { status: 400 });
  }

  const profile = await prisma.farmerProfile.findUnique({
    where: { id: profileId },
  });

  if (!profile || !profile.idCardPhoto) {
    return new NextResponse('Dokumen KTP tidak ditemukan', { status: 404 });
  }

  // The idCardPhoto is stored as e.g. /uploads/private/id_cards/xxx.jpg
  const relativePath = profile.idCardPhoto.replace(/^\//, '');
  const fullPath = path.join(process.cwd(), relativePath);

  if (!fs.existsSync(fullPath)) {
    // Return sample placeholder image if local file does not exist on disk
    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="380" viewBox="0 0 600 380">
      <rect width="600" height="380" rx="16" fill="#e2fae1"/>
      <rect x="20" y="20" width="560" height="340" rx="12" fill="#ffffff" stroke="#0d631b" stroke-width="2"/>
      <text x="300" y="70" font-family="sans-serif" font-size="20" font-weight="bold" fill="#0d631b" text-anchor="middle">REPUBLIK INDONESIA - KTP SIMULASI</text>
      <text x="50" y="140" font-family="sans-serif" font-size="16" fill="#0d1f11">NIK: 1808012345670001</text>
      <text x="50" y="180" font-family="sans-serif" font-size="16" fill="#0d1f11">Nama: ${profile.organizationName}</text>
      <text x="50" y="220" font-family="sans-serif" font-size="16" fill="#0d1f11">Kecamatan: ${profile.subdistrict}</text>
      <text x="50" y="260" font-family="sans-serif" font-size="16" fill="#0d1f11">Kabupaten: Way Kanan, Lampung</text>
      <rect x="420" y="110" width="130" height="170" rx="8" fill="#d1e9d0"/>
      <text x="485" y="205" font-family="sans-serif" font-size="14" fill="#40493d" text-anchor="middle">FOTO KTP</text>
    </svg>`;
    return new NextResponse(sampleSvg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'private, no-cache',
      },
    });
  }

  const fileBuffer = fs.readFileSync(fullPath);
  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': 'image/jpeg',
      'Cache-Control': 'private, no-cache',
    },
  });
}
