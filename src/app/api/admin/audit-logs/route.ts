import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/types/domain';

export async function GET(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== UserRole.admin) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Admin yang dapat melihat log audit' },
        { status: 403 }
      );
    }

    const logs = await prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        actor: {
          select: {
            id: true,
            displayName: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({
      logs: logs.map((l) => ({
        id: l.id,
        action: l.action,
        entity: l.entity,
        entityId: l.entityId,
        meta: l.meta ? JSON.parse(l.meta) : null,
        actor: l.actor,
        createdAt: l.createdAt,
      })),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memuat log audit';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
