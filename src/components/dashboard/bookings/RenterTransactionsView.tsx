"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import RenterBookingView from "./RenterBookingView"
import RenterPurchasesView from "./RenterPurchasesView"

export default function RenterTransactionsView() {
  const t = useTranslations("dashboard.transactions")
  const [activeTab, setActiveTab] = useState<"rentals" | "purchases">("rentals")

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("rentals")}
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
          onClick={() => setActiveTab("purchases")}
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === "rentals" ? <RenterBookingView /> : <RenterPurchasesView />}
      </div>
    </div>
  )
}
