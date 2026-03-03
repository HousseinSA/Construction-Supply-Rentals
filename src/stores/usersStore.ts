import { create } from 'zustand'
import { User } from '@/src/lib/types'

interface UsersStore {
  users: User[]
  lastFetch: number | null
  setUsers: (users: User[]) => void
  updateUser: (id: string, updates: Partial<User>) => void
  shouldRefetch: () => boolean
  invalidateCache: () => void
}

const CACHE_DURATION = 5 * 60 * 1000 

export const useUsersStore = create<UsersStore>((set, get) => ({
  users: [],
  lastFetch: null,
  setUsers: (users) => set({ users, lastFetch: Date.now() }),
  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        user._id?.toString() === id ? { ...user, ...updates } : user
      ),
    })),
  shouldRefetch: () => {
    const { lastFetch } = get()
    return !lastFetch || Date.now() - lastFetch > CACHE_DURATION
  },
  invalidateCache: () => set({ lastFetch: null }),
}))
