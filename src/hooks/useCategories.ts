import { useEffect, useCallback } from "react"
import { Category as CategoryModel } from "@/lib/models/category"
import { useCategoriesStore } from "@/src/stores"

export interface Category
  extends Omit<CategoryModel, "_id" | "categoryId" | "createdBy"> {
  _id: string
  nameAr: string
  nameFr: string
  slug: string
  equipmentTypeCount: number
}

export function useCategories() {
  const { categories, loading, error, setCategories, setLoading, setError } = useCategoriesStore()

  const fetchCategories = useCallback(async () => {
    if (categories.length > 0) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/categories")

      if (!response.ok) {
        throw new Error("Failed to fetch categories")
      }

      const data = await response.json()
      setCategories(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error")
      console.error("Failed to fetch categories:", err)
    }
  }, [categories.length, setCategories, setLoading, setError])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  }
}
