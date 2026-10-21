import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getWhatsAppGateway } from '@/lib/whatsapp';

export const OTP_EXPIRY_MINUTES = 5;
export const OTP_COOLDOWN_SECONDS = 60;
export const OTP_MAX_ATTEMPTS = 5;

export function hashOtp(code: string): string {
  return crypto.createHash('sha256').update(code.trim()).digest('hex');
}

export function generate6DigitCode(): string {
  // Generate cryptographically secure 6-digit random number between 100000 and 999999
  const randomNum = crypto.randomInt(100000, 1000000);
  return String(randomNum);
}

export async function requestOtp(phoneNumber: string, purpose: 'login' | 'change_phone' = 'login') {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  if (!cleanPhone || cleanPhone.length < 9) {
    return { success: false, error: 'Nomor telepon tidak valid' };
  }

  // 1. Check cooldown (60 seconds)
  const lastActiveOtp = await prisma.otpCode.findFirst({
    where: {
      phoneNumber: cleanPhone,
      purpose,
      consumedAt: null,
      createdAt: {
        gte: new Date(Date.now() - OTP_COOLDOWN_SECONDS * 1000),
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (lastActiveOtp) {
    const elapsedSeconds = Math.floor((Date.now() - lastActiveOtp.createdAt.getTime()) / 1000);
    const remaining = Math.max(0, OTP_COOLDOWN_SECONDS - elapsedSeconds);
    return {
      success: false,
      error: `Harap tunggu ${remaining} detik sebelum meminta kode baru`,
      cooldownRemaining: remaining,
    };
  }

  // 2. Generate and hash OTP
  const code = generate6DigitCode();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // 3. Store in database
  await prisma.otpCode.create({
    data: {
      phoneNumber: cleanPhone,
      codeHash,
      purpose,
      expiresAt,
      attempts: 0,
    },
  });

  // 4. Send via WhatsApp Gateway
  const gateway = getWhatsAppGateway();
  const sendResult = await gateway.sendOtp(cleanPhone, code);

  return {
    success: true,
    expiresAt,
    code: process.env.NODE_ENV !== 'production' ? code : undefined, // Useful for dev/tests
  };
}

export async function verifyOtp(
  phoneNumber: string,
  inputCode: string,
  purpose: 'login' | 'change_phone' = 'login'
) {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  const cleanInput = inputCode.trim();

  if (cleanInput.length !== 6) {
    return { success: false, error: 'Kode OTP harus berupa 6 digit angka' };
  }

  const activeOtp = await prisma.otpCode.findFirst({
    where: {
      phoneNumber: cleanPhone,
      purpose,
      consumedAt: null,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!activeOtp) {
    return { success: false, error: 'Kode masuk tidak ditemukan atau belum diminta' };
  }

  // Check if expired
  if (new Date() > activeOtp.expiresAt) {
    return { success: false, error: 'Kode masuk sudah kedaluwarsa (lebih dari 5 menit). Silakan minta kode baru.' };
  }

  // Check max attempts
  if (activeOtp.attempts >= OTP_MAX_ATTEMPTS) {
    return {
      success: false,
      error: 'Terlalu banyak percobaan salah (maks. 5 kali). Harap minta kode masuk baru.',
    };
  }

  // Verify hash
  const inputHash = hashOtp(cleanInput);
  if (inputHash !== activeOtp.codeHash) {
    // Increment attempts
    await prisma.otpCode.update({
      where: { id: activeOtp.id },
      data: { attempts: { increment: 1 } },
    });
    const remainingAttempts = OTP_MAX_ATTEMPTS - (activeOtp.attempts + 1);
    return {
      success: false,
      error: `Kode salah. Sisa kesempatan: ${remainingAttempts} kali.`,
      remainingAttempts,
    };
  }

  // Mark as consumed
  await prisma.otpCode.update({
    where: { id: activeOtp.id },
    data: { consumedAt: new Date() },
  });

  return { success: true };
}
