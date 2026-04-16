import { useState, useEffect } from "react"
import { Category as CategoryModel } from "@/lib/models/category"

export interface Category
  extends Omit<CategoryModel, "_id" | "categoryId" | "createdBy"> {
  _id: string
  nameAr: string
  nameFr: string
  slug: string
  equipmentTypeCount: number
}

const getInitialCategories = (): Category[] => {
  if (typeof window === 'undefined') return []
  
    const cached = localStorage.getItem('categories')
    return cached ? JSON.parse(cached) : []
 
}

export function useCategories() {
  const initialCategories = getInitialCategories()
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [loading, setLoading] = useState(initialCategories.length === 0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (categories.length > 0) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch("/api/categories")

        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }

        const data = await response.json()
        localStorage.setItem('categories', JSON.stringify(data))
        setCategories(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error")
        console.error("Failed to fetch categories:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [categories.length])

  return {
    categories,
    loading,
    error,
  }
}
