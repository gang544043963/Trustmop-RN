import { api } from '../../api';
import { Review } from '../../types';

export async function createReview(data: Omit<Review, 'id' | 'createdAt'>): Promise<Review> {
  return api.post<Review>('/reviews', data);
}

export async function listReviews(providerId: string): Promise<Review[]> {
  return api.get<Review[]>(`/reviews?providerId=${providerId}`);
}
