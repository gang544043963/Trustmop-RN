/**
 * Property-based tests for payment
 * Property 19: Platform fee deduction invariant
 */
import * as fc from 'fast-check';
import { createOrder } from '../../data/services/order.service';
import { createProvider, updateProvider } from '../../data/services/provider.service';
import { createTask } from '../../data/services/task.service';

const phPhone = () => fc.stringMatching(/^9[0-9]{9}$/).map((n) => `+63${n}`);

describe('Property 19: Platform Fee Deduction Invariant', () => {
  it('order.platformFeeRate is always 0.10 and provider payout = agreedPrice * (1 - 0.10)', async () => {
    await fc.assert(
      fc.asyncProperty(
        phPhone(),
        fc.integer({ min: 100, max: 10000 }),
        async (phone, budget) => {
          const provider = await createProvider({ phone, displayName: 'P', governmentIdPhoto: 'f' });
          await updateProvider(provider.id, { status: 'verified' });
          const task = await createTask({
            userId: 'user-test',
            serviceType: 'regular_cleaning',
            serviceAddress: 'Makati',
            scheduledDate: '2026-04-01',
            timeSlot: '09:00–11:00',
            budgetMin: budget,
            budgetMax: budget,
          });
          const order = await createOrder(task.id, provider.id);
          expect(order.platformFeeRate).toBe(0.10);

          const providerPayout = order.agreedPrice * (1 - order.platformFeeRate);
          const platformFee = order.agreedPrice * order.platformFeeRate;
          // Invariant: payout + fee = agreedPrice
          expect(providerPayout + platformFee).toBeCloseTo(order.agreedPrice, 5);
        }
      ),
      { numRuns: 20 }
    );
  });
});
