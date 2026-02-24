"use client"

import { useMemo } from "react"
import { useTranslations } from "next-intl"
import { Plus } from "lucide-react"
import { useCityData } from "@/src/hooks/useCityData"
import { useManageEquipment } from "@/src/hooks/useManageEquipment"
import { useEquipmentActions } from "@/src/hooks/useEquipmentActions"
import { useUserSession } from "@/src/hooks/useUserSession"
import { Link } from "@/src/i18n/navigation"
import TableFilters from "../../ui/TableFilters"
import { createEquipmentFilters } from "@/src/lib/equipment-filters"
import DashboardPageHeader from "../DashboardPageHeader"
import EquipmentContent from "./EquipmentContent"
import EquipmentModals from "./EquipmentModals"

export default function ManageEquipment() {
  const { user } = useUserSession()
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("common")
  const { convertToLocalized } = useCityData()

  const {
    equipment,
    loading,
    updating,
    handleStatusChange,
    handleAvailabilityChange,
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
  } = useManageEquipment({
    convertToLocalized,
    supplierId: user?.isSupplier ? user.id : undefined,
  })

  const {
    navigating,
    confirmModal,
    handleConfirmAction,
    handleAvailabilityChangeWithToast,
    handleNavigation,
    modals,
    handleReject,
    handleStatusChangeCallback,
    handlePricingReview,
    closePricingModal,
    closeRejectionModal,
    closeConfirmModal,
  } = useEquipmentActions(handleStatusChange, handleAvailabilityChange, t)

  if (!user || (!user.isAdmin && !user.isSupplier)) return null

  const filters = useMemo(() => createEquipmentFilters(t, locations), [t, locations])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <DashboardPageHeader
          title={t("manageTitle")}
          showBackButton={false}
          actions={
            <Link
              href="/dashboard/equipment/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">{t("createEquipment")}</span>
            </Link>
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
          <EquipmentContent
            loading={loading}
            equipment={equipment}
            updating={updating}
            navigating={navigating}
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onStatusChange={handleStatusChangeCallback}
            onAvailabilityChange={handleAvailabilityChangeWithToast}
            onNavigate={handleNavigation}
            onPageChange={goToPage}
            onPricingReview={handlePricingReview}
            isSupplier={user.isSupplier}
            t={t}
          />
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
          t={t}
          tCommon={tCommon}
        />
      </div>
    </div>
  )
}
