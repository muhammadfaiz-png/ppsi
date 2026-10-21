import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { UserRole, UserStatus } from '@/types/domain';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== UserRole.admin) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Admin yang dapat memoderasi akun pengguna' },
        { status: 403 }
      );
    }

    const targetUserId = parseInt(params.id, 10);
    if (isNaN(targetUserId)) {
      return NextResponse.json({ error: 'ID pengguna tidak valid' }, { status: 400 });
    }

    if (targetUserId === session.userId) {
      return NextResponse.json({ error: 'Anda tidak dapat mengubah status akun Anda sendiri' }, { status: 400 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status || !Object.values(UserStatus).includes(status)) {
      return NextResponse.json({ error: 'Status pengguna tidak valid' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: targetUserId },
      data: { status },
      select: {
        id: true,
        displayName: true,
        phoneNumber: true,
        role: true,
        status: true,
      },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: status === UserStatus.suspended ? 'SUSPEND_USER' : 'ACTIVATE_USER',
          entity: 'User',
          entityId: String(targetUserId),
          meta: JSON.stringify({
            targetDisplayName: updatedUser.displayName,
            targetPhone: updatedUser.phoneNumber,
            newStatus: status,
          }),
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Status akun "${updatedUser.displayName}" berhasil diubah menjadi ${status === UserStatus.suspended ? 'Dibekukan (Suspended)' : 'Aktif'}`,
      user: updatedUser,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memperbarui status akun pengguna';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
