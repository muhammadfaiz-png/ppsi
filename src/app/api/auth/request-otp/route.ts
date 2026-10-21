import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { requestOtp } from '@/lib/otp/service';

const requestOtpSchema = z.object({
  phoneNumber: z
    .string()
    .min(9, 'Nomor handphone minimal 9 digit')
    .max(15, 'Nomor handphone maksimal 15 digit'),
  purpose: z.enum(['login', 'change_phone']).default('login'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = requestOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || 'Input tidak valid' },
        { status: 400 }
      );
    }

    const { phoneNumber, purpose } = parsed.data;
    const result = await requestOtp(phoneNumber, purpose);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, cooldownRemaining: result.cooldownRemaining },
        { status: 429 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Kode masuk telah dikirimkan ke WhatsApp Anda.',
      expiresAt: result.expiresAt,
      // For testing / console verification ease
      debugCode: result.code,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan sistem';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
