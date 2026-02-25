import { useCallback } from 'react'
import { useUsersStore } from '@/src/stores/usersStore'
import { useServerTableData } from './useServerTableData'
import { User } from '@/src/lib/types'

export function useUsers() {
  const { setUsers, updateUser } = useUsersStore()

  const {
    data: users,
    loading,
    searchValue,
    setSearchValue,
    filterValues,
    handleFilterChange,
    currentPage,
    totalPages,
    goToPage,
    totalItems,
    itemsPerPage,
    refetch,
    stats,
  } = useServerTableData<User>({
    endpoint: '/api/users',
    itemsPerPage: 10,
    transformResponse: (data) => {
      setUsers(data)
      return data
    },
  })

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

  return {
    users,
    loading,
    fetchUsers: refetch,
    updateUserStatus,
    searchValue,
    setSearchValue,
    filterValues,
    handleFilterChange,
    currentPage,
    totalPages,
    goToPage,
    totalItems,
    itemsPerPage,
    stats,
  }
}
