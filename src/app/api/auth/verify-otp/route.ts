import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { verifyOtp } from '@/lib/otp/service';
import { createSessionToken, SESSION_COOKIE_NAME, SESSION_DURATION_SECONDS } from '@/lib/auth/jwt';
import { UserRole, UserStatus, VerificationStatus } from '@/types/domain';

const verifyOtpSchema = z.object({
  phoneNumber: z.string().min(9).max(15),
  code: z.string().length(6, 'Kode OTP harus berupa 6 digit angka'),
  role: z.enum(['farmer', 'buyer']).optional(),
  displayName: z.string().min(2, 'Nama minimal 2 karakter').max(60).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.errors[0]?.message || 'Input tidak valid' },
        { status: 400 }
      );
    }

    const { phoneNumber, code, role, displayName } = parsed.data;
    const cleanPhone = phoneNumber.replace(/\D/g, '');

    // 1. Verify OTP
    const verifyResult = await verifyOtp(cleanPhone, code, 'login');
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

    // 2. Find or Create User
    let user = await prisma.user.findUnique({
      where: { phoneNumber: cleanPhone },
      include: { farmerProfile: true },
    });

    let isNewUser = false;

    if (!user) {
      isNewUser = true;
      const initialRole = role || UserRole.buyer;
      const initialName = displayName || (initialRole === UserRole.farmer ? 'Petani Way Kanan' : 'Pembeli');

      user = await prisma.user.create({
        data: {
          phoneNumber: cleanPhone,
          displayName: initialName,
          role: initialRole,
          status: UserStatus.active,
          farmerProfile:
            initialRole === UserRole.farmer
              ? {
                  create: {
                    organizationName: initialName,
                    subdistrict: 'Banjit',
                    addressDetail: 'Way Kanan, Lampung',
                    verificationStatus: VerificationStatus.pending,
                  },
                }
              : undefined,
        },
        include: { farmerProfile: true },
      });
    }

    // 3. Check Account Status
    if (user.status === UserStatus.suspended) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akun Anda sedang ditangguhkan akibat pelanggaran aturan. Silakan hubungi Bantuan Admin via WhatsApp.',
        },
        { status: 403 }
      );
    }

    // 4. Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: isNewUser ? 'USER_REGISTER' : 'USER_LOGIN',
        entity: 'User',
        entityId: String(user.id),
        meta: JSON.stringify({
          phoneNumber: user.phoneNumber,
          role: user.role,
          isNewUser,
        }),
      },
    });

    // 5. Generate Session Token
    const sessionToken = await createSessionToken({
      userId: user.id,
      phoneNumber: user.phoneNumber,
      displayName: user.displayName,
      role: user.role,
      status: user.status,
    });

    // Determine redirect destination
    let redirectTo = '/katalog';
    if (user.role === UserRole.farmer) {
      redirectTo = '/dashboard';
    } else if (user.role === UserRole.admin) {
      redirectTo = '/admin';
    } else if (user.role === UserRole.officer) {
      redirectTo = '/admin/harga';
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phoneNumber: user.phoneNumber,
        displayName: user.displayName,
        role: user.role,
        farmerProfile: user.farmerProfile,
      },
      redirectTo,
    });

    // 6. Set HTTP-Only Cookie
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_DURATION_SECONDS,
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan server';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
