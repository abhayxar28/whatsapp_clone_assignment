import { create } from "zustand";

interface AuthState {
  loggedInUserWaId: string;
  setLoggedInUserWaId: (waId: string) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  loggedInUserWaId: "",
  setLoggedInUserWaId: (waId) => set({ loggedInUserWaId: waId }),
}));