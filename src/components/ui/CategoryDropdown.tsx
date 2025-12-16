"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import Dropdown from "./Dropdown"

interface CategoryDropdownProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

interface Category {
  _id: string
  name: string
  nameFr?: string
}

export default function CategoryDropdown({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = ""
}: CategoryDropdownProps) {
  const t = useTranslations("dashboard.equipment")
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)



  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        const data = await response.json()
        if (data.success || Array.isArray(data)) {
          const categoryData = data.success ? data.data : data
          // Filter main categories
          const mainCategoryNames = ['terrassement', 'nivellement', 'compactage', 'transport', 'levage', 'manutention']
          const mainCategories = categoryData.filter((cat: Category) => {
            const lowerName = cat.name.toLowerCase()
            return mainCategoryNames.some(keyword => lowerName.includes(keyword))
          })
          setCategories(mainCategories)
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const categoryOptions = categories.map(cat => ({
    value: cat._id,
    label: cat.nameFr || cat.name
  }))

  return (
    <Dropdown
      label={t("category")}
      options={categoryOptions}
      value={value}
      onChange={onChange}
      placeholder={placeholder || t("selectCategory")}
      disabled={disabled || loading}
      className={className}
      required
    />
  )
}