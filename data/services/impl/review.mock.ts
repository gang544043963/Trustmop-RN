import { getItem, setItem } from '../../storage';
import { Review, STORAGE_KEYS } from '../../types';
import { delay } from './auth.mock';
import { updateProvider } from '../provider.service';

export async function createReview(data: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  await delay(150);
  if (data.rating < 1 || data.rating > 5) throw new Error('Rating must be between 1 and 5');
  const reviews = (await getItem<Record<string, Review>>(STORAGE_KEYS.REVIEWS)) ?? {};
  const review: Review = { ...data, id: 'review-' + Date.now(), createdAt: new Date().toISOString() };
  reviews[review.id] = review;
  await setItem(STORAGE_KEYS.REVIEWS, reviews);
  const providerReviews = Object.values(reviews).filter((r) => r.providerId === data.providerId);
  const totalReviews = providerReviews.length;
  const averageRating = totalReviews > 0 ? providerReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews : 0;
  await updateProvider(data.providerId, { averageRating, totalReviews });
  return review;
}

export async function listReviews(providerId: string): Promise<Review[]> {
  await delay(100);
  const reviews = (await getItem<Record<string, Review>>(STORAGE_KEYS.REVIEWS)) ?? {};
  return Object.values(reviews)
    .filter((r) => r.providerId === providerId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
