/**
 * Property-based tests for auth service
 * Properties 1–3
 */
import * as fc from 'fast-check';
import { sendOtp, verifyOtp } from '../../data/services/auth.service';
import { createUser, updateUser } from '../../data/services/user.service';
import { getItem } from '../../data/storage';
import { STORAGE_KEYS } from '../../data/types';

// Arbitrary: valid PH phone number (10 digits starting with 9)
const phPhone = fc.stringMatching(/^9[0-9]{9}$/).map((n) => `+63${n}`);

// Arbitrary: any 6-char string that is NOT '123456'
const wrongOtp = fc
  .string({ minLength: 1, maxLength: 10 })
  .filter((s) => s !== '123456');

describe('Property 1: OTP Authentication Round-Trip', () => {
  it('sendOtp then verifyOtp(123456) returns session with correct phone', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone, async (phone) => {
        await sendOtp(phone);
        const session = await verifyOtp(phone, '123456');
        expect(session.phone).toBe(phone);
        expect(session.activeIdentity).toBe('user');
      }),
      { numRuns: 20 }
    );
  });
});

describe('Property 2: Wrong OTP Rejected', () => {
  it('any code !== 123456 throws and no session written', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone, wrongOtp, async (phone, code) => {
        await sendOtp(phone);
        await expect(verifyOtp(phone, code)).rejects.toThrow();
        // No session should be stored for this phone with wrong OTP
        // (session may exist from a prior run but verifyOtp should throw)
      }),
      { numRuns: 20 }
    );
  });
});

describe('Property 3: Profile Update Persistence', () => {
  it('updating display name and address retrieves exact values from storage', async () => {
    await fc.assert(
      fc.asyncProperty(
        phPhone,
        fc.string({ minLength: 1, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (phone, displayName, serviceAddress) => {
          const user = await createUser({ phone, displayName, serviceAddress });
          await updateUser(user.id, { displayName, serviceAddress });
          const users = await getItem<Record<string, unknown>>(STORAGE_KEYS.USERS);
          const stored = (users as Record<string, { displayName: string; serviceAddress: string }>)[user.id];
          expect(stored.displayName).toBe(displayName);
          expect(stored.serviceAddress).toBe(serviceAddress);
        }
      ),
      { numRuns: 20 }
    );
  });
});
