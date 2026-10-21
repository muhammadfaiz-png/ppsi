import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/jwt';
import { prisma } from '@/lib/prisma';
import { requestOtp } from '@/lib/otp/service';

const changePhoneSchema = z.object({
  newPhoneNumber: z.string().min(9).max(15),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Harap masuk terlebih dahulu' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = changePhoneSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || 'Input tidak valid' },
        { status: 400 }
      );
    }

    const cleanNewPhone = parsed.data.newPhoneNumber.replace(/\D/g, '');

    if (cleanNewPhone === session.phoneNumber) {
      return NextResponse.json(
        { success: false, error: 'Nomor baru tidak boleh sama dengan nomor saat ini' },
        { status: 400 }
      );
    }

    // Check if new phone is already registered to another user
    const existing = await prisma.user.findUnique({
      where: { phoneNumber: cleanNewPhone },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Nomor baru ini sudah terdaftar pada akun lain' },
        { status: 400 }
      );
    }

    // Request OTP to the NEW phone number
    const result = await requestOtp(cleanNewPhone, 'change_phone');
    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, cooldownRemaining: result.cooldownRemaining },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kode verifikasi telah dikirimkan ke nomor WhatsApp baru Anda.',
      expiresAt: result.expiresAt,
      debugCode: result.code,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
