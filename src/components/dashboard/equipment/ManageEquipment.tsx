"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { AlertTriangle, CheckCircle, Plus, Loader2 } from "lucide-react"
import { useCityData } from "@/src/hooks/useCityData"
import { useManageEquipment } from "@/src/hooks/useManageEquipment"
import { useEquipmentActions } from "@/src/hooks/useEquipmentActions"
import { Link } from "@/src/i18n/navigation"
import EquipmentList from "./EquipmentList"
import DashboardPageHeader from "../DashboardPageHeader"
import ConfirmModal from "../../ui/ConfirmModal"
import RejectionModal from "./RejectionModal"
import TableFilters from "../../ui/TableFilters"
import PricingReviewModal from "./PricingReviewModal"

export default function ManageEquipment() {
  const { data: session } = useSession()
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("common")
  const { convertToLocalized } = useCityData()
  const [isNavigating, setIsNavigating] = useState(false)

  const isSupplier = session?.user?.userType === "supplier"
  const isAdmin = session?.user?.role === "admin"

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
    hasEquipment,
  } = useManageEquipment({
    convertToLocalized,
    supplierId: isSupplier ? session?.user?.id : undefined,
  })

  const {
    navigating,
    confirmModal,
    openConfirmModal,
    closeConfirmModal,
    handleConfirmAction,
    handleAvailabilityChangeWithToast,
    handleNavigation,
  } = useEquipmentActions(handleStatusChange, handleAvailabilityChange, t)

  const [pricingReviewModal, setPricingReviewModal] = useState<any>(null)
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean
    equipmentId: string | null
  }>({ isOpen: false, equipmentId: null })

  const handleReject = async (reason: string) => {
    if (!rejectionModal.equipmentId) return
    const success = await handleStatusChange(
      rejectionModal.equipmentId,
      "rejected",
      reason,
    )
    if (success) {
      setRejectionModal({ isOpen: false, equipmentId: null })
    }
  }

  const handleCloseRejectionModal = () => {
    setRejectionModal({ isOpen: false, equipmentId: null })
  }

  if (!session?.user || (!isAdmin && !isSupplier)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <DashboardPageHeader
          title={t("manageTitle")}
          showBackButton={false}
          actions={
            <Link
              href="/dashboard/equipment/create"
              onClick={() => setIsNavigating(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              {isNavigating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">{t("createEquipment")}</span>
            </Link>
          }
        />

        {hasEquipment && (
          <TableFilters
            searchValue={searchValue}
            onSearchChange={setSearchValue}
            searchPlaceholder={t("searchPlaceholder")}
            filters={[
              {
                key: "status",
                label: t("status"),
                options: [
                  { value: "all", label: t("filters.allStatus") },
                  { value: "pending", label: t("pending") },
                  { value: "approved", label: t("approved") },
                  { value: "rejected", label: t("rejected") },
                  { value: "pendingPricing", label: t("pricingUpdateRequest") },
                ],
              },
              {
                key: "listingType",
                label: t("listingType"),
                options: [
                  { value: "all", label: t("filters.allTypes") },
                  { value: "forRent", label: t("forRent") },
                  { value: "forSale", label: t("forSale") },
                ],
              },
              {
                key: "availability",
                label: t("availability"),
                options: [
                  { value: "all", label: t("filters.allAvailability") },
                  { value: "available", label: t("available") },
                  { value: "unavailable", label: t("unavailable") },
                ],
              },
              {
                key: "location",
                label: t("location"),
                options: [
                  { value: "all", label: t("filters.allLocations") },
                  ...locations,
                ],
              },
            ]}
            filterValues={filterValues}
            onFilterChange={handleFilterChange}
          />
        )}

        <div className="xl:bg-white xl:rounded-lg xl:shadow-sm xl:border xl:border-gray-200 min-h-[600px] flex flex-col">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-pulse text-gray-600 font-medium">
                {t("loading")}
              </div>
            </div>
          ) : equipment.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              {t("noEquipmentFound")}
            </div>
          ) : (
            <EquipmentList
              equipment={equipment}
              updating={updating}
              navigating={navigating}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              onStatusChange={(id, action, reason) => {
                if (action === "reject") {
                  setRejectionModal({ isOpen: true, equipmentId: id })
                } else {
                  openConfirmModal(id, action)
                }
              }}
              onAvailabilityChange={handleAvailabilityChangeWithToast}
              onNavigate={handleNavigation}
              onPageChange={goToPage}
              onPricingReview={(item) => setPricingReviewModal(item)}
              t={t}
              isSupplier={isSupplier}
            />
          )}
        </div>

        <ConfirmModal
          isOpen={confirmModal.isOpen}
          onClose={closeConfirmModal}
          onConfirm={handleConfirmAction}
          title={t(
            confirmModal.action === "approve"
              ? "confirmApproveTitle"
              : "confirmRejectTitle",
          )}
          message={t("confirmApproveMessage")}
          confirmText={t(
            confirmModal.action === "approve" ? "approve" : "reject",
          )}
          cancelText={tCommon("cancel")}
          icon={
            confirmModal.action === "approve" ? (
              <CheckCircle className="w-6 h-6 text-green-500" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-red-600" />
            )
          }
          iconBgColor={
            confirmModal.action === "approve" ? "bg-gray-100" : "bg-red-100"
          }
          isLoading={updating === confirmModal.equipmentId}
        />

        {pricingReviewModal && (
          <PricingReviewModal
            equipmentId={pricingReviewModal._id?.toString()}
            currentPricing={pricingReviewModal.pricing}
            pendingPricing={pricingReviewModal.pendingPricing}
            onClose={() => setPricingReviewModal(null)}
            onSuccess={() => refetch()}
          />
        )}

        <RejectionModal
          isOpen={rejectionModal.isOpen}
          onClose={handleCloseRejectionModal}
          onConfirm={handleReject}
          title={t("confirmRejectTitle")}
          confirmText={t("reject")}
          cancelText={tCommon("cancel")}
          placeholder={t("rejectionReason")}
          isLoading={updating === rejectionModal.equipmentId}
        />
      </div>
    </div>
  )
}
