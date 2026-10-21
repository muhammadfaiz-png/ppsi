import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser, createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { verifyOtp } from '@/lib/otp/service';

const verifyNewPhoneSchema = z.object({
  newPhoneNumber: z.string().min(9).max(15),
  code: z.string().length(6, 'Kode OTP harus berupa 6 digit angka'),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Harap masuk terlebih dahulu' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = verifyNewPhoneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || 'Input tidak valid' },
        { status: 400 }
      );
    }

    const cleanNewPhone = parsed.data.newPhoneNumber.replace(/\D/g, '');

    // 1. Verify OTP with purpose change_phone
    const verifyResult = await verifyOtp(cleanNewPhone, parsed.data.code, 'change_phone');
    if (!verifyResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: verifyResult.error,
          remainingAttempts: verifyResult.remainingAttempts,
        },
        { status: 400 }
      );
    }

    // 2. Update user phone number
    const updatedUser = await prisma.user.update({
      where: { id: session.userId },
      data: { phoneNumber: cleanNewPhone },
    });

    // 3. Audit log
    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'USER_CHANGE_PHONE',
        entity: 'User',
        entityId: String(session.userId),
        meta: JSON.stringify({
          oldPhoneNumber: session.phoneNumber,
          newPhoneNumber: cleanNewPhone,
        }),
      },
    });

    // 4. Re-issue updated session token
    const newToken = await createSessionToken({
      userId: updatedUser.id,
      phoneNumber: updatedUser.phoneNumber,
      displayName: updatedUser.displayName,
      role: updatedUser.role,
      status: updatedUser.status,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Nomor WhatsApp berhasil diperbarui.',
      phoneNumber: updatedUser.phoneNumber,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: newToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
