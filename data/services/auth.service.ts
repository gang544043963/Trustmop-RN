import { getItem, removeItem, setItem } from '../storage';
import { AuthSession, STORAGE_KEYS } from '../types';

export interface OtpEntry {
  phone: string;
  code: string;
  expiresAt: number;
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sendOtp(phone: string): Promise<void> {
  await delay(150);
  const store = (await getItem<Record<string, OtpEntry>>(STORAGE_KEYS.OTP_STORE)) ?? {};
  store[phone] = { phone, code: '123456', expiresAt: Date.now() + 5 * 60 * 1000 };
  await setItem(STORAGE_KEYS.OTP_STORE, store);
}

export async function verifyOtp(phone: string, code: string): Promise<AuthSession> {
  await delay(150);
  if (code !== '123456') throw new Error('Invalid OTP');

  const existing = await getItem<AuthSession>(STORAGE_KEYS.AUTH_SESSION);
  if (existing && existing.phone === phone) return existing;

  const session: AuthSession = {
    phone,
    activeIdentity: 'user',
  };
  await setItem(STORAGE_KEYS.AUTH_SESSION, session);
  return session;
}

export async function logout(): Promise<void> {
  await delay(150);
  await removeItem(STORAGE_KEYS.AUTH_SESSION);
}
