"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import RenterBookingView from "./RenterBookingView"
import RenterPurchasesView from "./RenterPurchasesView"
import Tabs from "@/src/components/ui/Tabs"

export default function RenterTransactionsView() {
  const t = useTranslations("dashboard.transactions")
  const [activeTab, setActiveTab] = useState<"rentals" | "purchases">("rentals")

  useEffect(() => {
    try {
      const saved = localStorage.getItem("renterTransactionsTab")
      if (saved === "rentals" || saved === "purchases") setActiveTab(saved)
    } catch (e) {
      /* ignore */
    }
  }, [])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "rentals" | "purchases")
    try {
      localStorage.setItem("renterTransactionsTab", tab)
    } catch (e) {
      /* ignore */
    }
  }

  const tabs = [
    { id: "rentals", label: t("rentals") },
    { id: "purchases", label: t("purchases") }
  ]

  return (
    <div className="space-y-6">
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="xl:bg-white xl:rounded-xl xl:shadow-sm xl:border xl:border-gray-200 overflow-hidden">
        {activeTab === "rentals" ? <RenterBookingView /> : <RenterPurchasesView />}
      </div>
    </div>
  )
}
