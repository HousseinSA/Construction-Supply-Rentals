"use client"

import { useTranslations } from "next-intl"
import Dropdown from "./Dropdown"

interface CategoryDropdownProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export default function CategoryDropdown({
  value,
  onChange,
  placeholder,
  disabled = false,
  className = ""
}: CategoryDropdownProps) {
  const t = useTranslations("dashboard.equipment")

  const categoryOptions = [
    { value: "terrassement", label: t("categoryTerrassement") },
    { value: "nivellementcompactage", label: t("categoryNivellement") },
    { value: "transport", label: t("categoryTransport") },
    { value: "levageemanutention", label: t("categoryLevage") }
  ]

  return (
    <Dropdown
      label={t("category")}
      options={categoryOptions}
      value={value}
      onChange={onChange}
      placeholder={placeholder || t("selectCategory")}
      disabled={disabled}
      className={className}
    />
  )
}