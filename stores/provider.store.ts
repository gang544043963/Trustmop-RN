import { create } from 'zustand';
import {
    createProvider,
    getProvider,
    updateProvider,
} from '../data/services/provider.service';
import { createService, listServices, updateService } from '../data/services/service.service';
import { Provider, Service } from '../data/types';

interface ProviderState {
  provider: Provider | null;
  services: Service[];
  fetchProvider: (id: string) => Promise<void>;
  updateProvider: (data: Partial<Omit<Provider, 'id'>>) => Promise<void>;
  createProvider: (
    data: Omit<Provider, 'id' | 'createdAt' | 'averageRating' | 'totalReviews' | 'status'>
  ) => Promise<void>;
  fetchServices: (providerId: string) => Promise<void>;
  createService: (data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateService: (
    id: string,
    data: Partial<Omit<Service, 'id' | 'createdAt'>>
  ) => Promise<void>;
}

export const useProviderStore = create<ProviderState>((set, get) => ({
  provider: null,
  services: [],

  fetchProvider: async (id) => {
    const provider = await getProvider(id);
    set({ provider });
  },

  updateProvider: async (data) => {
    const { provider } = get();
    if (!provider) throw new Error('No provider loaded');
    const updated = await updateProvider(provider.id, data);
    set({ provider: updated });
  },

  createProvider: async (data) => {
    const provider = await createProvider(data);
    set({ provider });
  },

  fetchServices: async (providerId) => {
    const results = await listServices({ providerId });
    set({ services: results });
  },

  createService: async (data) => {
    const service = await createService(data);
    set((state) => ({ services: [...state.services, service] }));
  },

  updateService: async (id, data) => {
    const service = await updateService(id, data);
    set((state) => ({
      services: state.services.map((s) => (s.id === id ? service : s)),
    }));
  },
}));
