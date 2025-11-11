import { create } from 'zustand';

interface UserStore {
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
}

export const useUserStore = create<UserStore>((set) => ({
  isAuthenticated: false,
  setIsAuthenticated: (auth: boolean) => set({ isAuthenticated: auth }),
}));
