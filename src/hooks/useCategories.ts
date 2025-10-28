import { useState, useEffect, useCallback } from 'react'
import { Category as CategoryModel } from '@/lib/models/category'

// Frontend category response with additional fields from API
export interface Category extends Omit<CategoryModel, '_id' | 'categoryId' | 'createdBy'> {
  _id: string
  slug?: string
  nameAr: string
  nameFr: string
  equipmentTypeCount: number
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/categories')
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories')
      }
      
      const data = await response.json()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      console.error('Failed to fetch categories:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  }
}