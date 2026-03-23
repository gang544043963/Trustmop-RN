import { getItem, setItem } from '../storage';
import { Provider, Service, ServiceType, STORAGE_KEYS } from '../types';
import { delay } from './auth.service';

export interface ServiceWithProvider extends Service {
  provider: Provider;
}

export async function listServices(filters?: {
  serviceType?: ServiceType;
  providerId?: string;
}): Promise<ServiceWithProvider[]> {
  await delay(100);
  const services = (await getItem<Record<string, Service>>(STORAGE_KEYS.SERVICES)) ?? {};
  const providers = (await getItem<Record<string, Provider>>(STORAGE_KEYS.PROVIDERS)) ?? {};

  let results = Object.values(services).filter((s) => {
    if (!s.isActive) return false;
    const provider = providers[s.providerId];
    if (!provider || provider.status !== 'verified') return false;
    if (filters?.serviceType && s.serviceType !== filters.serviceType) return false;
    if (filters?.providerId && s.providerId !== filters.providerId) return false;
    return true;
  });

  results.sort((a, b) => {
    const ratingA = providers[a.providerId]?.averageRating ?? 0;
    const ratingB = providers[b.providerId]?.averageRating ?? 0;
    return ratingB - ratingA;
  });

  return results.map((s) => ({ ...s, provider: providers[s.providerId] }));
}

export async function getService(id: string): Promise<Service | null> {
  await delay(100);
  const services = (await getItem<Record<string, Service>>(STORAGE_KEYS.SERVICES)) ?? {};
  return services[id] ?? null;
}

export async function createService(
  data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Service> {
  await delay(150);
  const services = (await getItem<Record<string, Service>>(STORAGE_KEYS.SERVICES)) ?? {};
  const now = new Date().toISOString();
  const service: Service = {
    ...data,
    id: 'service-' + Date.now(),
    createdAt: now,
    updatedAt: now,
  };
  services[service.id] = service;
  await setItem(STORAGE_KEYS.SERVICES, services);
  return service;
}

export async function updateService(
  id: string,
  partial: Partial<Omit<Service, 'id' | 'createdAt'>>
): Promise<Service> {
  await delay(150);
  const services = (await getItem<Record<string, Service>>(STORAGE_KEYS.SERVICES)) ?? {};
  if (!services[id]) throw new Error(`Service not found: ${id}`);
  services[id] = { ...services[id], ...partial, updatedAt: new Date().toISOString() };
  await setItem(STORAGE_KEYS.SERVICES, services);
  return services[id];
}
