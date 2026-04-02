import { api } from '../../api';
import { Provider } from '../../types';

export async function getProvider(id: string): Promise<Provider | null> {
  return api.get<Provider>(`/providers/${id}`);
}

export async function getProviderByPhone(phone: string): Promise<Provider | null> {
  return api.get<Provider>(`/providers/by-phone/${encodeURIComponent(phone)}`);
}

export async function createProvider(
  data: Omit<Provider, 'id' | 'createdAt' | 'averageRating' | 'totalReviews' | 'status'>
): Promise<Provider> {
  return api.post<Provider>('/providers', data);
}

export async function updateProvider(id: string, partial: Partial<Omit<Provider, 'id'>>): Promise<Provider> {
  return api.patch<Provider>(`/providers/${id}`, partial);
}

export async function listProviders(): Promise<Provider[]> {
  return api.get<Provider[]>('/providers');
}
