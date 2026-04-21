"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Plus } from "lucide-react"

import { useCityData } from "@/src/hooks/useCityData"
import { useManageEquipment } from "@/src/hooks/equipment/useManageEquipment"
import { useEquipmentActions } from "@/src/hooks/equipment/useEquipmentActions"
import { useUserSession } from "@/src/hooks/useUserSession"
import { Link } from "@/src/i18n/navigation"
import TableFilters from "../../ui/TableFilters"
import { createEquipmentFilters } from "@/src/lib/equipment-filters"
import DashboardPageHeader from "../DashboardPageHeader"
import EquipmentList from "./EquipmentList"
import EquipmentModals from "./EquipmentModals"
import ReloadButton from "@/src/components/ui/ReloadButton"
import ErrorState from "@/src/components/ui/ErrorState"

export default function ManageEquipment() {
  const { user } = useUserSession()
  const t = useTranslations("dashboard.equipment")
  const { convertToLocalized } = useCityData()
  
  const supplierId = useMemo(
    () => (user?.isSupplier ? user.id : undefined),
    [user?.isSupplier, user?.id]
  )
  const {
    confirmModal,
    handleConfirmAction,
    modals,
    handleReject,
    handlePricingReview,
    handleStatusChangeCallback,
    closePricingModal,
    closeRejectionModal,
    closeConfirmModal,
  } = useEquipmentActions(t)

  const {
    loading,
    error,
    equipment,
    updating,
    refetch,
    searchValue,
    setSearchValue,
    filterValues,
    handleFilterChange,
    locations,
    currentPage,
    totalPages,
    goToPage,
    totalItems,
    itemsPerPage,
    mobileEquipment,
    loadingMoreMobile,
    hasMoreMobile,
    loadMoreMobile,
  } = useManageEquipment({
    convertToLocalized,
    supplierId,
  })

  const filters = useMemo(
    () => createEquipmentFilters(t, locations),
    [t, locations],
  )

  if (!user || (!user.isAdmin && !user.isSupplier)) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <DashboardPageHeader
          title={t("manageTitle")}
          showBackButton={false}
          actions={
            <div className="flex items-center gap-2">
              <ReloadButton onReload={refetch} loading={loading} />
              <Link
                href="/dashboard/equipment/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden sm:inline">{t("createEquipment")}</span>
              </Link>
            </div>
          }
        />
        <TableFilters
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchPlaceholder={t("searchPlaceholder")}
          filters={filters}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
        />
        <div className="xl:bg-white xl:rounded-lg xl:shadow-sm xl:border xl:border-gray-200 min-h-[600px] flex flex-col">
          {error ? (
            <ErrorState onRetry={refetch} />
          ) : (
            <EquipmentList
              equipment={equipment}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onPageChange={goToPage}
              onStatusChange={handleStatusChangeCallback}
              onPricingReview={handlePricingReview}
              mobileEquipment={mobileEquipment}
              loadingMoreMobile={loadingMoreMobile}
              hasMoreMobile={hasMoreMobile}
              onLoadMoreMobile={loadMoreMobile}
              loading={loading}
            />
          )}
        </div>
        <EquipmentModals
          confirmModal={confirmModal}
          pricingModal={modals.pricing}
          rejectionModal={modals.rejection}
          updating={updating}
          onConfirmClose={closeConfirmModal}
          onConfirmAction={handleConfirmAction}
          onPricingClose={closePricingModal}
          onPricingSuccess={refetch}
          onRejectionClose={closeRejectionModal}
          onRejectionConfirm={handleReject}
        />
      </div>
    </div>
  )
}
