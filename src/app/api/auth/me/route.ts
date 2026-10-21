import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { farmerProfile: true },
  });

  if (!user || user.status === 'suspended') {
    return NextResponse.json({ authenticated: false, user: null });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      id: user.id,
      phoneNumber: user.phoneNumber,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
      farmerProfile: user.farmerProfile,
    },
  });
}
