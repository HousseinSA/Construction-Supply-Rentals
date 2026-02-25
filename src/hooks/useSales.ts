import { useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useSalesStore, SaleWithDetails } from '@/src/stores/salesStore'
import { useServerTableData } from './useServerTableData'

export function useSales() {
  const { data: session } = useSession()
  const { setSales, invalidateCache } = useSalesStore()

  const {
    data: sales,
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
  } = useServerTableData<SaleWithDetails>({
    endpoint: '/api/sales',
    itemsPerPage: 10,
    transformResponse: (data) => {
      setSales(data)
      return data
    },
  })

  const updateSaleStatus = async (saleId: string, status: string, adminId?: string, adminNotes?: string) => {
    try {
      const response = await fetch('/api/sales', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ saleId, status, adminId, adminNotes })
      })

      if (response.ok) {
        invalidateCache()
        await refetch()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update sale:', error)
      return false
    }
  }

  return {
    sales,
    loading,
    error: null,
    fetchSales: refetch,
    updateSaleStatus,
    searchValue,
    setSearchValue,
    filterValues,
    handleFilterChange,
    currentPage,
    totalPages,
    goToPage,
    totalItems,
    itemsPerPage,
  }
}
