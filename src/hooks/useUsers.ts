import { useEffect, useCallback } from 'react'
import { useUsersStore } from '@/src/stores/usersStore'
import { useSSE } from './useSSE'

export function useUsers() {
  const { users, loading, setUsers, setLoading, updateUser, shouldRefetch } = useUsersStore()

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/users')
      if (response.ok) {
        const result = await response.json()
        setUsers(result.data || [])
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }, [setUsers, setLoading])

  const updateUserStatus = async (userId: string, status: string) => {
    try {
      const response = await fetch('/api/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status })
      })

      if (!response.ok) throw new Error('Failed to update user')

      updateUser(userId, { status })
      return true
    } catch (error) {
      console.error('Error updating user:', error)
      return false
    }
  }

  useSSE('user', useCallback(() => {
    fetchUsers()
  }, [fetchUsers]))

  useEffect(() => {
    if (shouldRefetch()) {
      fetchUsers()
    }
  }, [fetchUsers, shouldRefetch])

  return {
    users,
    loading,
    fetchUsers,
    updateUserStatus,
  }
}
