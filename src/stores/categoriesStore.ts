import { create } from 'zustand'
import { Category } from '@/src/hooks/useCategories'

interface CategoriesState {
  categories: Category[]
  loading: boolean
  error: string | null
  setCategories: (categories: Category[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useCategoriesStore = create<CategoriesState>((set) => ({
  categories: [],
  loading: true,
  error: null,
  setCategories: (categories) => set({ categories, loading: false, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error, loading: false }),
}))