import { api } from '../../api';
import { AuthSession } from '../../types';

export async function sendOtp(phone: string): Promise<void> {
  await api.post('/auth/send-otp', { phone });
}

export async function verifyOtp(phone: string, code: string): Promise<AuthSession> {
  return api.post<AuthSession>('/auth/verify-otp', { phone, code });
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout', {});
}
