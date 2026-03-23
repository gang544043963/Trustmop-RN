import { create } from 'zustand';
import { createUser, getUser, updateUser } from '../data/services/user.service';
import { User } from '../data/types';

interface UserState {
  user: User | null;
  fetchUser: (id: string) => Promise<void>;
  updateProfile: (data: Partial<Omit<User, 'id'>>) => Promise<void>;
  createProfile: (data: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  user: null,

  fetchUser: async (id) => {
    const user = await getUser(id);
    set({ user });
  },

  updateProfile: async (data) => {
    const { user } = get();
    if (!user) throw new Error('No user loaded');
    const updated = await updateUser(user.id, data);
    set({ user: updated });
  },

  createProfile: async (data) => {
    const user = await createUser(data);
    set({ user });
  },
}));
