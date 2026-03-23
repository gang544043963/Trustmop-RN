/**
 * Property-based tests for reviews
 * Properties 20–21
 */
import * as fc from 'fast-check';
import { createProvider, getProvider } from '../../data/services/provider.service';
import { createReview } from '../../data/services/review.service';

const phPhone = () => fc.stringMatching(/^9[0-9]{9}$/).map((n) => `+63${n}`);

const validRating = fc.integer({ min: 1, max: 5 });
const invalidRating = fc.oneof(
  fc.integer({ max: 0 }),
  fc.integer({ min: 6 })
);

describe('Property 20: Review Rating Bounds Enforcement', () => {
  it('ratings 1–5 are accepted', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), validRating, async (phone, rating) => {
        const provider = await createProvider({ phone, displayName: 'P', governmentIdPhoto: 'f' });
        const review = await createReview({
          orderId: 'order-test',
          userId: 'user-test',
          providerId: provider.id,
          rating,
        });
        expect(review.rating).toBe(rating);
      }),
      { numRuns: 20 }
    );
  });

  it('ratings outside 1–5 are rejected', async () => {
    await fc.assert(
      fc.asyncProperty(phPhone(), invalidRating, async (phone, rating) => {
        const provider = await createProvider({ phone, displayName: 'P', governmentIdPhoto: 'f' });
        await expect(
          createReview({
            orderId: 'order-test',
            userId: 'user-test',
            providerId: provider.id,
            rating,
          })
        ).rejects.toThrow();
      }),
      { numRuns: 20 }
    );
  });
});

describe('Property 21: Provider Average Rating Calculation', () => {
  it('provider averageRating equals mean of all submitted reviews', async () => {
    await fc.assert(
      fc.asyncProperty(
        phPhone(),
        fc.array(validRating, { minLength: 1, maxLength: 10 }),
        async (phone, ratings) => {
          const provider = await createProvider({ phone, displayName: 'P', governmentIdPhoto: 'f' });
          for (const rating of ratings) {
            await createReview({
              orderId: 'order-' + Math.random(),
              userId: 'user-test',
              providerId: provider.id,
              rating,
            });
          }
          const updated = await getProvider(provider.id);
          const expectedAvg = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          expect(updated?.totalReviews).toBe(ratings.length);
          expect(updated?.averageRating).toBeCloseTo(expectedAvg, 5);
        }
      ),
      { numRuns: 15 }
    );
  });
});
