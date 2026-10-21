import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { ReportStatus, UserRole } from '@/types/domain';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== UserRole.admin) {
      return NextResponse.json(
        { error: 'Akses ditolak: Hanya Admin yang dapat memoderasi laporan' },
        { status: 403 }
      );
    }

    const reportId = parseInt(params.id, 10);
    if (isNaN(reportId)) {
      return NextResponse.json({ error: 'ID laporan tidak valid' }, { status: 400 });
    }

    const body = await req.json();
    const { action } = body; // 'resolve' or 'reject'

    const newStatus = action === 'reject' ? ReportStatus.rejected : ReportStatus.resolved;

    const report = await prisma.report.update({
      where: { id: reportId },
      data: { status: newStatus },
      include: { listing: true },
    });

    // Record audit log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: session.userId,
          action: newStatus === ReportStatus.resolved ? 'RESOLVE_REPORT' : 'DISMISS_REPORT',
          entity: 'Report',
          entityId: String(reportId),
          meta: JSON.stringify({
            listingId: report.listingId,
            reason: report.reason,
            action,
          }),
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      message: `Laporan berhasil ditandai sebagai ${newStatus === ReportStatus.resolved ? 'Selesai' : 'Ditolak/Dilewati'}`,
      report,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memperbarui status laporan';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
