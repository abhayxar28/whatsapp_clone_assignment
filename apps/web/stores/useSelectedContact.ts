import { create } from "zustand";


type SelectedContactStore = {
  selectedContactId: string | null;
  setSelectedContactId: (id: string) => void;
};

export const useSelectedContact = create<SelectedContactStore>((set) => ({
  selectedContactId: null,
  setSelectedContactId: (id) => set({ selectedContactId: id }),
}));