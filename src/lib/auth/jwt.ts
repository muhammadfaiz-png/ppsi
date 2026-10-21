import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET_STRING =
  process.env.JWT_SECRET || 'waykanan_secret_jwt_token_key_at_least_32_characters_long_super_secure';
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export const SESSION_COOKIE_NAME = 'wk_session';
export const SESSION_DURATION_SECONDS = 30 * 24 * 60 * 60; // 30 days

export interface SessionPayload {
  userId: number;
  phoneNumber: string;
  displayName: string;
  role: string; // farmer, buyer, admin, officer
  status: string; // active, suspended
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });
    return payload as unknown as SessionPayload;
  } catch (err) {
    return null;
  }
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}
