/**
 * Property-based tests for provider and service listing
 * Properties 4–8
 */
import * as fc from 'fast-check';
import { createOrder } from '../../data/services/order.service';
import { createProvider, updateProvider } from '../../data/services/provider.service';
import { createService, listServices, updateService } from '../../data/services/service.service';
import { createTask } from '../../data/services/task.service';

const phPhone = () => fc.stringMatching(/^9[0-9]{9}$/).map((n) => `+63${n}`);

const providerData = () =>
  fc.record({
    phone: phPhone(),
    displayName: fc.string({ minLength: 1, maxLength: 50 }),
    governmentIdPhoto: fc.constant('file://mock.jpg'),
  });

const serviceData = (providerId: string) => ({
  providerId,
  serviceType: 'regular_cleaning' as const,
  description: 'Test service',
  price: 500,
  pricingUnit: 'per_session' as const,
  coverageAreas: ['Makati'],
  photos: ['file://photo.jpg'],
  isActive: true,
});

describe('Property 4: Provider Registration Status Invariant', () => {
  it('new provider always has pending_review status', async () => {
    await fc.assert(
      fc.asyncProperty(providerData(), async (data) => {
        const provider = await createProvider(data);
        expect(provider.status).toBe('pending_review');
      }),
      { numRuns: 20 }
    );
  });
});

describe('Property 5: Unverified Provider Cannot Accept Orders', () => {
  it('provider with pending_review status cannot accept a task', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const provider = await createProvider({
          phone,
          displayName: 'Test Provider',
          governmentIdPhoto: 'file://id.jpg',
        });
        // Create a task to accept
        const task = await createTask({
          userId: 'user-test',
          serviceType: 'regular_cleaning',
          serviceAddress: 'Makati',
          scheduledDate: '2026-04-01',
          timeSlot: '09:00–11:00',
          budgetMin: 300,
          budgetMax: 600,
        });
        await expect(createOrder(task.id, provider.id)).rejects.toThrow(
          'Account pending verification'
        );
      }),
      { numRuns: 10 }
    );
  });
});

describe('Property 6: Service Listing Creation and Browse Round-Trip', () => {
  it('created service from verified provider appears in listServices', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const provider = await createProvider({
          phone,
          displayName: 'Verified Provider',
          governmentIdPhoto: 'file://id.jpg',
        });
        await updateProvider(provider.id, { status: 'verified' });
        const service = await createService(serviceData(provider.id));
        const listings = await listServices();
        const found = listings.find((s) => s.id === service.id);
        expect(found).toBeDefined();
      }),
      { numRuns: 10 }
    );
  });
});

describe('Property 7: Unpublish Removes Listing from Browse', () => {
  it('setting isActive=false removes service from listServices', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const provider = await createProvider({
          phone,
          displayName: 'Provider',
          governmentIdPhoto: 'file://id.jpg',
        });
        await updateProvider(provider.id, { status: 'verified' });
        const service = await createService(serviceData(provider.id));
        await updateService(service.id, { isActive: false });
        const listings = await listServices();
        const found = listings.find((s) => s.id === service.id);
        expect(found).toBeUndefined();
      }),
      { numRuns: 10 }
    );
  });
});

describe('Property 8: Browse Returns Only Verified Provider Listings', () => {
  it('listServices never returns services from non-verified providers', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), async (phone) => {
        const provider = await createProvider({
          phone,
          displayName: 'Pending Provider',
          governmentIdPhoto: 'file://id.jpg',
        });
        // status is pending_review — do NOT verify
        await createService(serviceData(provider.id));
        const listings = await listServices();
        const found = listings.find((s) => s.providerId === provider.id);
        expect(found).toBeUndefined();
      }),
      { numRuns: 10 }
    );
  });
});
