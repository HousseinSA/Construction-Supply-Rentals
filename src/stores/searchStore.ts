import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SearchState {
  selectedCity: string | null;
  setSelectedCity: (city: string | null) => void;
  clearSearch: () => void;
}

export const useSearchStore = create<SearchState>()(persist(
  (set) => ({
    selectedCity: null,
    setSelectedCity: (city) => set({ selectedCity: city }),
    clearSearch: () => set({ selectedCity: null }),
  }),
  {
    name: 'search-storage',
  }
));