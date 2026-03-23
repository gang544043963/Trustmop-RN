import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as authService from '../data/services/auth.service';
import { AuthSession, IdentityType, STORAGE_KEYS } from '../data/types';


const zustandStorage = createJSONStorage(() => AsyncStorage);

interface AuthState {
  session: AuthSession | null;
  isLoading: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  login: (phone: string, otp: string, role: IdentityType) => Promise<void>;
  logout: () => Promise<void>;
  switchIdentity: (identity: IdentityType) => void;
  setSession: (session: AuthSession) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      isLoading: false,
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),

      login: async (phone, otp, role) => {
        set({ isLoading: true });
        try {
          const session = await authService.verifyOtp(phone, otp);
          const sessionWithRole: AuthSession = { ...session, activeIdentity: role };
          set({ session: sessionWithRole });
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        await authService.logout();
        set({ session: null });
      },

      switchIdentity: (identity) => {
        const session = get().session;
        if (!session) return;
        const updated: AuthSession = { ...session, activeIdentity: identity };
        set({ session: updated });
      },

      setSession: (session) => set({ session }),
    }),
    {
      name: STORAGE_KEYS.AUTH_SESSION,
      storage: zustandStorage,
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
