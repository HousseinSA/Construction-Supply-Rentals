"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import RenterBookingView from "./RenterBookingView"
import RenterPurchasesView from "./RenterPurchasesView"
import Tabs from "@/src/components/ui/Tabs"
import DashboardPageHeader from "../DashboardPageHeader"
import ReloadButton from "@/src/components/ui/ReloadButton"
import { useBookings } from "@/src/hooks/useBookings"
import { usePurchases } from "@/src/hooks/usePurchases"

export default function RenterTransactionsView() {
  const t = useTranslations("dashboard.transactions")
  const tCommon = useTranslations("common")
  const [activeTab, setActiveTab] = useState<"rentals" | "purchases">("rentals")

  const { bookings, loading: bookingsLoading, error, fetchBookings } = useBookings()
  const { purchases, loading: purchasesLoading, error: purchasesError, fetchPurchases } = usePurchases()

  useEffect(() => {
    const saved = localStorage.getItem("renterTransactionsTab")
    if (saved === "rentals" || saved === "purchases") setActiveTab(saved)
  }, [])

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as "rentals" | "purchases")
    localStorage.setItem("renterTransactionsTab", tab)
  }

  const tabs = [
    { id: "rentals", label: t("rentals") },
    { id: "purchases", label: t("purchases") },
  ]

  const currentLoading =
    activeTab === "rentals" ? bookingsLoading : purchasesLoading
  const currentRefetch =
    activeTab === "rentals" ? fetchBookings : fetchPurchases

  return (
    <>
      <DashboardPageHeader
        title={tCommon("myBookings")}
        actions={
          <ReloadButton onReload={currentRefetch} loading={currentLoading} />
        }
      />

      <div className="space-y-6">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="xl:bg-white xl:rounded-xl xl:shadow-sm xl:border xl:border-gray-200 overflow-hidden">
          {activeTab === "rentals" ? (
            <RenterBookingView bookings={bookings} loading={bookingsLoading} error={error} fetchBookings={fetchBookings} />
          ) : (
            <RenterPurchasesView purchases={purchases} loading={purchasesLoading} error={purchasesError} fetchPurchases={fetchPurchases} />
          )}
        </div>
      </div>
    </>
  )
}
