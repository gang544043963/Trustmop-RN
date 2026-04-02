import { getItem, setItem } from '../../storage';
import { Provider, STORAGE_KEYS } from '../../types';
import { delay } from './auth.mock';

export async function getProvider(id: string): Promise<Provider | null> {
  await delay(100);
  const providers = (await getItem<Record<string, Provider>>(STORAGE_KEYS.PROVIDERS)) ?? {};
  return providers[id] ?? null;
}

export async function getProviderByPhone(phone: string): Promise<Provider | null> {
  await delay(100);
  const providers = (await getItem<Record<string, Provider>>(STORAGE_KEYS.PROVIDERS)) ?? {};
  return Object.values(providers).find((p) => p.phone === phone) ?? null;
}

export async function createProvider(
  data: Omit<Provider, 'id' | 'createdAt' | 'averageRating' | 'totalReviews' | 'status'>
): Promise<Provider> {
  await delay(150);
  const providers = (await getItem<Record<string, Provider>>(STORAGE_KEYS.PROVIDERS)) ?? {};
  const provider: Provider = {
    ...data,
    id: 'provider-' + Date.now(),
    status: 'verified',
    averageRating: 0,
    totalReviews: 0,
    createdAt: new Date().toISOString(),
  };
  providers[provider.id] = provider;
  await setItem(STORAGE_KEYS.PROVIDERS, providers);
  return provider;
}

export async function updateProvider(id: string, partial: Partial<Omit<Provider, 'id'>>): Promise<Provider> {
  await delay(150);
  const providers = (await getItem<Record<string, Provider>>(STORAGE_KEYS.PROVIDERS)) ?? {};
  if (!providers[id]) throw new Error(`Provider not found: ${id}`);
  providers[id] = { ...providers[id], ...partial };
  await setItem(STORAGE_KEYS.PROVIDERS, providers);
  return providers[id];
}

export async function listProviders(): Promise<Provider[]> {
  await delay(100);
  const providers = (await getItem<Record<string, Provider>>(STORAGE_KEYS.PROVIDERS)) ?? {};
  return Object.values(providers);
}
