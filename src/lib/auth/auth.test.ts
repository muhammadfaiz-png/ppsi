import { describe, it, expect } from 'vitest';
import { normalizePhoneNumber, generate6DigitCode, hashOtp } from '@/lib/otp/service';
import { createSessionToken, verifySessionToken } from '@/lib/auth/jwt';
import { UserRole, UserStatus } from '@/types/domain';

describe('Authentication & OTP Service Tests', () => {
  describe('Phone Number Normalization', () => {
    it('normalizes local 08xx number to 628xx', () => {
      expect(normalizePhoneNumber('081234567890')).toBe('6281234567890');
    });

    it('normalizes +628xx number to 628xx', () => {
      expect(normalizePhoneNumber('+62812-3456-7890')).toBe('6281234567890');
    });

    it('strips dashes, spaces, and brackets', () => {
      expect(normalizePhoneNumber('0812 (3456) 7890')).toBe('6281234567890');
    });

    it('returns empty string on empty input', () => {
      expect(normalizePhoneNumber('')).toBe('');
    });
  });

  describe('OTP Code Generation and Verification', () => {
    it('generates a 6-digit numeric OTP', () => {
      const code = generate6DigitCode();
      expect(code).toMatch(/^\d{6}$/);
    });

    it('hashes OTP and verifies matches correctly', () => {
      const code = '123456';
      const hash = hashOtp(code);
      expect(hash).not.toBe(code);
      expect(hashOtp('123456')).toBe(hash);
      expect(hashOtp('654321')).not.toBe(hash);
    });
  });

  describe('JWT Session Tokens', () => {
    it('signs and verifies stateless JWT session tokens', async () => {
      const payload = {
        userId: 101,
        phoneNumber: '6281234567890',
        displayName: 'Pak Joko Susanto',
        role: UserRole.farmer,
        status: UserStatus.active,
      };

      const token = await createSessionToken(payload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const verified = await verifySessionToken(token);
      expect(verified).not.toBeNull();
      expect(verified?.userId).toBe(101);
      expect(verified?.role).toBe(UserRole.farmer);
      expect(verified?.displayName).toBe('Pak Joko Susanto');
    });

    it('returns null on invalid token signature', async () => {
      const verified = await verifySessionToken('invalid.jwt.token');
      expect(verified).toBeNull();
    });
  });
});
