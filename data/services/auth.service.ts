import { getItem, removeItem, setItem } from '../storage';
import { AuthSession, Provider, STORAGE_KEYS, User } from '../types';

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

  // Look up existing user/provider accounts for this phone
  const users = (await getItem<Record<string, User>>(STORAGE_KEYS.USERS)) ?? {};
  const providers = (await getItem<Record<string, Provider>>(STORAGE_KEYS.PROVIDERS)) ?? {};
  const existingUser = Object.values(users).find((u) => u.phone === phone);
  const existingProvider = Object.values(providers).find((p) => p.phone === phone);

  const session: AuthSession = {
    phone,
    // activeIdentity will be overridden by the caller (login action) based on user's role choice
    activeIdentity: existingUser ? 'user' : existingProvider ? 'provider' : 'user',
    userId: existingUser?.id,
    providerId: existingProvider?.id,
  };

  return session;
}

export async function logout(): Promise<void> {
  await delay(150);
  await removeItem(STORAGE_KEYS.AUTH_SESSION);
}
