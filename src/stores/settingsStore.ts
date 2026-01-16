import { create } from 'zustand'

interface Settings {
  phone: string
  password: string
}

interface SettingsStore {
  settings: Settings | null
  loading: boolean
  lastFetch: number | null
  setSettings: (settings: Settings) => void
  setLoading: (loading: boolean) => void
  shouldRefetch: () => boolean
  invalidateCache: () => void
}

const CACHE_DURATION = 5 * 60 * 1000

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: null,
  loading: false,
  lastFetch: null,
  setSettings: (settings) => set({ settings, lastFetch: Date.now() }),
  setLoading: (loading) => set({ loading }),
  shouldRefetch: () => {
    const { lastFetch } = get()
    return !lastFetch || Date.now() - lastFetch > CACHE_DURATION
  },
  invalidateCache: () => set({ lastFetch: null }),
}))
