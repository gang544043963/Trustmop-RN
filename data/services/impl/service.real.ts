import { api } from '../../api';
import { Provider, Service, ServiceType } from '../../types';

export interface ServiceWithProvider extends Service { provider: Provider; }

export async function listServices(filters?: { serviceType?: ServiceType; providerId?: string }): Promise<ServiceWithProvider[]> {
  const params = new URLSearchParams();
  if (filters?.serviceType) params.set('serviceType', filters.serviceType);
  if (filters?.providerId) params.set('providerId', filters.providerId);
  return api.get<ServiceWithProvider[]>(`/services?${params}`);
}

export async function getService(id: string): Promise<Service | null> {
  return api.get<Service>(`/services/${id}`);
}

export async function createService(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
  return api.post<Service>('/services', data);
}

export async function updateService(id: string, partial: Partial<Omit<Service, 'id' | 'createdAt'>>): Promise<Service> {
  return api.patch<Service>(`/services/${id}`, partial);
}
