/**
 * Property-based tests for order status machine
 * Properties 16–18
 */
import * as fc from 'fast-check';
import {
    createOrder,
    getOrder,
    mockPay,
    mockRefund,
    mockRelease,
    updateOrderStatus,
} from '../../data/services/order.service';
import { createProvider, updateProvider } from '../../data/services/provider.service';
import { createTask } from '../../data/services/task.service';
import { OrderStatus } from '../../data/types';

const phPhone = () => fc.stringMatching(/^9[0-9]{9}$/).map((n) => `+63${n}`);

async function setupVerifiedProviderAndTask(phone: string) {
  const provider = await createProvider({ phone, displayName: 'P', governmentIdPhoto: 'f' });
  await updateProvider(provider.id, { status: 'verified' });
  const task = await createTask({
    userId: 'user-test',
    serviceType: 'regular_cleaning',
    serviceAddress: 'Makati',
    scheduledDate: '2026-04-01',
    timeSlot: '09:00–11:00',
    budgetMin: 300,
    budgetMax: 600,
  });
  return { provider, task };
}

describe('Property 16: Order Status Machine Validity', () => {
  it('valid transitions: accepted → in_progress → pending_confirmation → completed', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const { provider, task } = await setupVerifiedProviderAndTask(phone);
        const order = await createOrder(task.id, provider.id);
        expect(order.status).toBe('accepted');

        const o2 = await updateOrderStatus(order.id, 'in_progress');
        expect(o2.status).toBe('in_progress');

        const o3 = await updateOrderStatus(order.id, 'pending_confirmation');
        expect(o3.status).toBe('pending_confirmation');

        const o4 = await updateOrderStatus(order.id, 'completed');
        expect(o4.status).toBe('completed');
      }),
      { numRuns: 5 }
    );
  });

  it('invalid transitions throw', async () => {
    const invalidTransitions: [OrderStatus, OrderStatus][] = [
      ['accepted', 'completed'],
      ['accepted', 'pending_confirmation'],
      ['in_progress', 'accepted'],
      ['completed', 'in_progress'],
    ];

    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        for (const [from, to] of invalidTransitions) {
          const { provider, task } = await setupVerifiedProviderAndTask(phone);
          const order = await createOrder(task.id, provider.id);
          // Advance to the 'from' state
          if (from === 'in_progress') await updateOrderStatus(order.id, 'in_progress');
          if (from === 'completed') {
            await updateOrderStatus(order.id, 'in_progress');
            await updateOrderStatus(order.id, 'pending_confirmation');
            await updateOrderStatus(order.id, 'completed');
          }
          await expect(updateOrderStatus(order.id, to)).rejects.toThrow();
        }
      }),
      { numRuns: 3 }
    );
  });
});

describe('Property 17: Order Completion Triggers Payment Release', () => {
  it('mockPay then mockRelease sets paymentStatus to released', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const { provider, task } = await setupVerifiedProviderAndTask(phone);
        const order = await createOrder(task.id, provider.id);
        await updateOrderStatus(order.id, 'in_progress');
        await updateOrderStatus(order.id, 'pending_confirmation');
        await updateOrderStatus(order.id, 'completed');
        await mockPay(order.id);
        await mockRelease(order.id);
        const final = await getOrder(order.id);
        expect(final?.paymentStatus).toBe('released');
      }),
      { numRuns: 5 }
    );
  });
});

describe('Property 18: Pre-Acceptance Cancellation Triggers Refund', () => {
  it('mockRefund sets paymentStatus to refunded', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const { provider, task } = await setupVerifiedProviderAndTask(phone);
        const order = await createOrder(task.id, provider.id);
        await mockPay(order.id);
        await mockRefund(order.id);
        const final = await getOrder(order.id);
        expect(final?.paymentStatus).toBe('refunded');
      }),
      { numRuns: 5 }
    );
  });
});
