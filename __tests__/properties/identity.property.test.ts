/**
 * Property-based tests for dual identity
 * Properties 23–24
 */
import * as fc from 'fast-check';
import { sendOtp, verifyOtp } from '../../data/services/auth.service';
import { createProvider } from '../../data/services/provider.service';
import { createUser } from '../../data/services/user.service';
import { getItem, setItem } from '../../data/storage';
import { AuthSession, STORAGE_KEYS } from '../../data/types';

const phPhone = () => fc.stringMatching(/^9[0-9]{9}$/).map((n) => `+63${n}`);

describe('Property 23: Dual Identity Persistence Round-Trip', () => {
  it('same phone can have both userId and providerId in session', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        // Create both user and provider for the same phone
        const user = await createUser({ phone, displayName: 'Dual User', serviceAddress: 'Makati' });
        const provider = await createProvider({ phone, displayName: 'Dual Provider', governmentIdPhoto: 'f' });

        // Simulate session with both identities
        const session: AuthSession = {
          phone,
          activeIdentity: 'user',
          userId: user.id,
          providerId: provider.id,
        };
        await setItem(STORAGE_KEYS.AUTH_SESSION, session);

        // Read back and verify both IDs are present
        const stored = await getItem<AuthSession>(STORAGE_KEYS.AUTH_SESSION);
        expect(stored?.userId).toBe(user.id);
        expect(stored?.providerId).toBe(provider.id);
        expect(stored?.phone).toBe(phone);
      }),
      { numRuns: 15 }
    );
  });

  it('switching activeIdentity persists correctly', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const session: AuthSession = {
          phone,
          activeIdentity: 'user',
          userId: 'user-123',
          providerId: 'provider-456',
        };
        await setItem(STORAGE_KEYS.AUTH_SESSION, session);

        // Switch to provider
        const updated: AuthSession = { ...session, activeIdentity: 'provider' };
        await setItem(STORAGE_KEYS.AUTH_SESSION, updated);

        const stored = await getItem<AuthSession>(STORAGE_KEYS.AUTH_SESSION);
        expect(stored?.activeIdentity).toBe('provider');
        expect(stored?.userId).toBe('user-123');
        expect(stored?.providerId).toBe('provider-456');
      }),
      { numRuns: 15 }
    );
  });
});

describe('Property 24: Active Identity Persisted Across Sessions', () => {
  it('verifyOtp returns existing session with preserved activeIdentity', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        // First login — creates session with activeIdentity: 'user'
        await sendOtp(phone);
        const session1 = await verifyOtp(phone, '123456');
        expect(session1.activeIdentity).toBe('user');

        // Manually update to provider identity
        const updated: AuthSession = { ...session1, activeIdentity: 'provider' };
        await setItem(STORAGE_KEYS.AUTH_SESSION, updated);

        // Second verifyOtp should return the existing session (not overwrite)
        await sendOtp(phone);
        const session2 = await verifyOtp(phone, '123456');
        expect(session2.activeIdentity).toBe('provider');
        expect(session2.phone).toBe(phone);
      }),
      { numRuns: 15 }
    );
  });
});
