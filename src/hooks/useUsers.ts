import { useEffect } from 'react'
import { useUsersStore } from '@/src/stores/usersStore'
import { useServerTableData } from './useServerTableData'
import { User, UserStatus } from '@/src/lib/types'

const API_ENDPOINT = '/api/users'

async function apiCall(url: string, options?: RequestInit) {
  try {
    const response = await fetch(url, options)
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Request failed')
    }
    return response.json()
  } catch (error) {
    console.error('API Error:', error)
    throw error
  }
}

export function useUsers() {
  const { 
    users: cachedUsers, 
    stats: cachedStats, 
    setUsers, 
    setStats, 
    updateUser, 
    shouldRefetch, 
    invalidateCache
  } = useUsersStore()

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
    endpoint: API_ENDPOINT,
    itemsPerPage: 10,
    shouldRefetch,
    transformResponse: (data) => {
      setUsers(data)
      return data
    },
    onStatsUpdate: setStats,
    invalidateCache,
  })

  const displayUsers = users.length > 0 ? users : cachedUsers
  const displayStats = stats || cachedStats

  useEffect(() => {
    const hasNoSearch = searchValue === ""
    const hasNoFilter = !filterValues.role || filterValues.role === "all"
    
    if (hasNoSearch && hasNoFilter) {
      invalidateCache()
    }
  }, []) 

  const updateUserStatus = async (userId: string, status: UserStatus) => {
    try {
      await apiCall(API_ENDPOINT, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, status })
      })

      updateUser(userId, { status })
      invalidateCache()
      await refetch()
      return true
    } catch (error) {
      console.error('Error updating user:', error)
      return false
    }
  }

  return {
    users: displayUsers,
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
    stats: displayStats,
  }
}
