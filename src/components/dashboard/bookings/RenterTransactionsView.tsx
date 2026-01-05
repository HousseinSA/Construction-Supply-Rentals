"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import RenterBookingView from "./RenterBookingView"
import RenterPurchasesView from "./RenterPurchasesView"

export default function RenterTransactionsView() {
  const t = useTranslations("dashboard.transactions")
  const [activeTab, setActiveTab] = useState<"rentals" | "purchases">("rentals")

  // Read saved tab after mount to avoid SSR/client hydration mismatch
  useEffect(() => {
    try {
      const saved = localStorage.getItem("renterTransactionsTab")
      if (saved === "rentals" || saved === "purchases") setActiveTab(saved)
    } catch (e) {
      /* ignore */
    }
  }, [])

  const handleTabChange = (tab: "rentals" | "purchases") => {
    setActiveTab(tab)
    try {
      localStorage.setItem("renterTransactionsTab", tab)
    } catch (e) {
      /* ignore */
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => handleTabChange("rentals")}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "rentals"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {t("rentals")}
          {activeTab === "rentals" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => handleTabChange("purchases")}
          className={`px-6 py-3 font-medium text-sm transition-colors relative ${
            activeTab === "purchases"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          {t("purchases")}
          {activeTab === "purchases" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      <div className="xl:bg-white xl:rounded-xl xl:shadow-sm xl:border xl:border-gray-200 overflow-hidden">
        {activeTab === "rentals" ? <RenterBookingView /> : <RenterPurchasesView />}
      </div>
    </div>
  )
}
