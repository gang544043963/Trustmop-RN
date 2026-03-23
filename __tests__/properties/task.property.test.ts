/**
 * Property-based tests for task and service filtering/sorting
 * Properties 9–15
 */
import * as fc from 'fast-check';
import { createOrder } from '../../data/services/order.service';
import { createProvider, updateProvider } from '../../data/services/provider.service';
import { createService, listServices } from '../../data/services/service.service';
import { cancelTask, createTask, listTasks } from '../../data/services/task.service';
import { ServiceType } from '../../data/types';

const phPhone = () => fc.stringMatching(/^9[0-9]{9}$/).map((n) => `+63${n}`);

const makeTask = (overrides: Partial<{ serviceType: ServiceType; serviceAddress: string }> = {}) =>
  createTask({
    userId: 'user-test',
    serviceType: overrides.serviceType ?? 'regular_cleaning',
    serviceAddress: overrides.serviceAddress ?? 'Makati City',
    scheduledDate: '2026-04-01',
    timeSlot: '09:00–11:00',
    budgetMin: 300,
    budgetMax: 600,
  });

describe('Property 9: Filter Returns Only Matching Results', () => {
  it('listTasks with serviceType filter returns only matching tasks', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<ServiceType>('regular_cleaning', 'deep_cleaning'),
        async (filterType) => {
          await makeTask({ serviceType: 'regular_cleaning' });
          await makeTask({ serviceType: 'deep_cleaning' });
          const results = await listTasks({ serviceType: filterType });
          expect(results.every((t) => t.serviceType === filterType)).toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  });

  it('listTasks with area filter returns only tasks matching address', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom('Makati', 'BGC', 'Pasig'),
        async (area) => {
          await makeTask({ serviceAddress: `${area} City` });
          await makeTask({ serviceAddress: 'Quezon City' });
          const results = await listTasks({ area });
          expect(results.every((t) => t.serviceAddress.toLowerCase().includes(area.toLowerCase()))).toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  });
});

describe('Property 10: Browse List Sorted by Rating Descending', () => {
  it('listServices returns results sorted by provider averageRating desc', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), phPhone(), async (phone1, phone2) => {
        const p1 = await createProvider({ phone: phone1, displayName: 'P1', governmentIdPhoto: 'f' });
        const p2 = await createProvider({ phone: phone2, displayName: 'P2', governmentIdPhoto: 'f' });
        await updateProvider(p1.id, { status: 'verified', averageRating: 4.5 });
        await updateProvider(p2.id, { status: 'verified', averageRating: 3.0 });
        await createService({ providerId: p1.id, serviceType: 'regular_cleaning', description: 'd', price: 500, pricingUnit: 'per_session', coverageAreas: ['Makati'], photos: ['f'], isActive: true });
        await createService({ providerId: p2.id, serviceType: 'regular_cleaning', description: 'd', price: 500, pricingUnit: 'per_session', coverageAreas: ['Makati'], photos: ['f'], isActive: true });
        const listings = await listServices();
        for (let i = 0; i < listings.length - 1; i++) {
          expect(listings[i].provider.averageRating).toBeGreaterThanOrEqual(listings[i + 1].provider.averageRating);
        }
      }),
      { numRuns: 10 }
    );
  });
});

describe('Property 11: New Task Has Open Status', () => {
  it('every newly created task has status open', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom<ServiceType>('regular_cleaning', 'deep_cleaning'),
        fc.string({ minLength: 5, maxLength: 50 }),
        async (serviceType, address) => {
          const task = await makeTask({ serviceType, serviceAddress: address });
          expect(task.status).toBe('open');
        }
      ),
      { numRuns: 20 }
    );
  });
});

describe('Property 12: Task Cancellation Only Before Acceptance', () => {
  it('open task can be cancelled', async () => {
    await fc.assert(
      fc.asyncProperty(fc.constant(null), async () => {
        const task = await makeTask();
        const cancelled = await cancelTask(task.id);
        expect(cancelled.status).toBe('cancelled');
      }),
      { numRuns: 10 }
    );
  });

  it('accepted task cannot be cancelled', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const provider = await createProvider({ phone, displayName: 'P', governmentIdPhoto: 'f' });
        await updateProvider(provider.id, { status: 'verified' });
        const task = await makeTask();
        await createOrder(task.id, provider.id);
        await expect(cancelTask(task.id)).rejects.toThrow();
      }),
      { numRuns: 10 }
    );
  });
});

describe('Property 13: Task Hall Shows Only Open Tasks', () => {
  it('listTasks never returns non-open tasks', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const provider = await createProvider({ phone, displayName: 'P', governmentIdPhoto: 'f' });
        await updateProvider(provider.id, { status: 'verified' });
        const task = await makeTask();
        await createOrder(task.id, provider.id); // task becomes accepted
        const openTasks = await listTasks();
        expect(openTasks.find((t) => t.id === task.id)).toBeUndefined();
      }),
      { numRuns: 10 }
    );
  });
});

describe('Property 14: Accepting a Task Creates an Order and Updates Task Status', () => {
  it('createOrder sets task status to accepted', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const provider = await createProvider({ phone, displayName: 'P', governmentIdPhoto: 'f' });
        await updateProvider(provider.id, { status: 'verified' });
        const task = await makeTask();
        const order = await createOrder(task.id, provider.id);
        expect(order.taskId).toBe(task.id);
        expect(order.providerId).toBe(provider.id);
        expect(order.status).toBe('accepted');
      }),
      { numRuns: 10 }
    );
  });
});

describe('Property 15: Duplicate Task Acceptance Rejected', () => {
  it('accepting an already-accepted task throws', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), phPhone(), async (phone1, phone2) => {
        const p1 = await createProvider({ phone: phone1, displayName: 'P1', governmentIdPhoto: 'f' });
        const p2 = await createProvider({ phone: phone2, displayName: 'P2', governmentIdPhoto: 'f' });
        await updateProvider(p1.id, { status: 'verified' });
        await updateProvider(p2.id, { status: 'verified' });
        const task = await makeTask();
        await createOrder(task.id, p1.id);
        await expect(createOrder(task.id, p2.id)).rejects.toThrow();
      }),
      { numRuns: 10 }
    );
  });
});
