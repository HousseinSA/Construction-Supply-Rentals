"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { useTranslations } from "next-intl"
import QuickSearchModal from "./QuickSearchModal"

export default function QuickSearchButton() {
  const [showModal, setShowModal] = useState(false)
  const t = useTranslations("quickSearch")

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        data-search-button
        className="hidden md:flex items-center gap-2 px-3 py-2 text-gray-700 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm font-medium">{t("button")}</span>
      </button>
      <QuickSearchModal isOpen={showModal} onClose={() => setShowModal(false)} />
    </>
  )
}
