/**
 * Property-based tests for notifications
 * Property 22: Notification created on trigger events
 */
import * as fc from 'fast-check';
import { listNotifications } from '../../data/services/notification.service';
import {
    createOrder,
    mockPay,
    mockRelease,
    updateOrderStatus,
} from '../../data/services/order.service';
import { createProvider, updateProvider } from '../../data/services/provider.service';
import { createTask } from '../../data/services/task.service';

const phPhone = () => fc.stringMatching(/^9[0-9]{9}$/).map((n) => `+63${n}`);

async function setupVerifiedProvider(phone: string) {
  const provider = await createProvider({ phone, displayName: 'P', governmentIdPhoto: 'f' });
  await updateProvider(provider.id, { status: 'verified' });
  return provider;
}

describe('Property 22: Notification Created on Trigger Events', () => {
  it('task_accepted notification sent to user when provider accepts task', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const provider = await setupVerifiedProvider(phone);
        const userId = 'user-notif-test-' + Date.now();
        const task = await createTask({
          userId,
          serviceType: 'regular_cleaning',
          serviceAddress: 'Makati',
          scheduledDate: '2026-04-01',
          timeSlot: '09:00–11:00',
          budgetMin: 300,
          budgetMax: 600,
        });
        await createOrder(task.id, provider.id);
        const notifs = await listNotifications(userId, 'user');
        const accepted = notifs.find((n) => n.type === 'task_accepted');
        expect(accepted).toBeDefined();
      }),
      { numRuns: 5 }
    );
  });

  it('order_pending_confirmation notification sent to user when provider marks complete', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const provider = await setupVerifiedProvider(phone);
        const userId = 'user-pending-' + Date.now();
        const task = await createTask({
          userId,
          serviceType: 'regular_cleaning',
          serviceAddress: 'Makati',
          scheduledDate: '2026-04-01',
          timeSlot: '09:00–11:00',
          budgetMin: 300,
          budgetMax: 600,
        });
        const order = await createOrder(task.id, provider.id);
        await updateOrderStatus(order.id, 'in_progress');
        await updateOrderStatus(order.id, 'pending_confirmation');
        const notifs = await listNotifications(userId, 'user');
        const pending = notifs.find((n) => n.type === 'order_pending_confirmation');
        expect(pending).toBeDefined();
      }),
      { numRuns: 5 }
    );
  });

  it('payment_completed notification sent to both user and provider on mockRelease', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const provider = await setupVerifiedProvider(phone);
        const userId = 'user-pay-' + Date.now();
        const task = await createTask({
          userId,
          serviceType: 'regular_cleaning',
          serviceAddress: 'Makati',
          scheduledDate: '2026-04-01',
          timeSlot: '09:00–11:00',
          budgetMin: 300,
          budgetMax: 600,
        });
        const order = await createOrder(task.id, provider.id);
        await mockPay(order.id);
        await mockRelease(order.id);
        const userNotifs = await listNotifications(userId, 'user');
        const providerNotifs = await listNotifications(provider.id, 'provider');
        expect(userNotifs.find((n) => n.type === 'payment_completed')).toBeDefined();
        expect(providerNotifs.find((n) => n.type === 'payment_completed')).toBeDefined();
      }),
      { numRuns: 5 }
    );
  });

  it('new_task_available notification sent to verified providers when task is created', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const provider = await setupVerifiedProvider(phone);
        await createTask({
          userId: 'user-new-task',
          serviceType: 'regular_cleaning',
          serviceAddress: 'Makati',
          scheduledDate: '2026-04-01',
          timeSlot: '09:00–11:00',
          budgetMin: 300,
          budgetMax: 600,
        });
        const notifs = await listNotifications(provider.id, 'provider');
        expect(notifs.find((n) => n.type === 'new_task_available')).toBeDefined();
      }),
      { numRuns: 5 }
    );
  });
});
