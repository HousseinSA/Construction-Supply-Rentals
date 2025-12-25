"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { AlertTriangle, CheckCircle } from "lucide-react"
import { useCityData } from "@/src/hooks/useCityData"
import { useManageEquipment } from "@/src/hooks/useManageEquipment"
import { useEquipmentActions } from "@/src/hooks/useEquipmentActions"
import EquipmentList from "./EquipmentList"
import DashboardPageHeader from "../DashboardPageHeader"
import ConfirmModal from "../../ui/ConfirmModal"
import RejectionModal from "./RejectionModal"
import TableFilters from "../../ui/TableFilters"
import PricingReviewModal from "./PricingReviewModal"
import { showToast } from "@/src/lib/toast"

export default function ManageEquipment() {
  const { data: session } = useSession()
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("common")
  const { convertToLocalized } = useCityData()

  const isSupplier = session?.user?.userType === "supplier"
  const isAdmin = session?.user?.role === "admin"

  const {
    equipment,
    loading,
    updating,
    handleStatusChange,
    handleAvailabilityChange,
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
    supplierId: isSupplier ? session?.user?.id : undefined 
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
  const [rejectionModal, setRejectionModal] = useState<{ isOpen: boolean; equipmentId: string | null }>({ isOpen: false, equipmentId: null })

  const handleReject = async (reason: string) => {
    if (!rejectionModal.equipmentId) return
    const success = await handleStatusChange(rejectionModal.equipmentId, "rejected", reason)
    if (success) {
      setRejectionModal({ isOpen: false, equipmentId: null })
    }
  }

  const handleResubmit = async (id: string) => {
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resubmit" }),
      })
      const data = await response.json()
      if (response.ok) {
        showToast.success(t("resubmitSuccess"))
        window.location.reload()
      } else {
        showToast.error(data.error || t("resubmitFailed"))
      }
    } catch (error) {
      showToast.error(t("resubmitFailed"))
    }
  }

  if (!session?.user || (!isAdmin && !isSupplier)) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <DashboardPageHeader
          title={t("manageTitle")}
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

        <div className="lg:bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 min-h-[600px] flex flex-col">
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
              onResubmit={handleResubmit}
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
              : "confirmRejectTitle"
          )}
          message={t(
            confirmModal.action === "approve"
              ? "confirmApproveMessage"
              : "confirmRejectMessage"
          )}
          confirmText={t(
            confirmModal.action === "approve" ? "approve" : "reject"
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
            equipmentName={pricingReviewModal.name}
            currentPricing={pricingReviewModal.pricing}
            pendingPricing={pricingReviewModal.pendingPricing}
            onClose={() => setPricingReviewModal(null)}
            onSuccess={() => window.location.reload()}
          />
        )}

        <RejectionModal
          isOpen={rejectionModal.isOpen}
          onClose={() => setRejectionModal({ isOpen: false, equipmentId: null })}
          onConfirm={handleReject}
          title={t("confirmRejectTitle")}
          message={t("confirmRejectMessage")}
          confirmText={t("reject")}
          cancelText={tCommon("cancel")}
          placeholder={t("rejectionReasonPlaceholder")}
          isLoading={updating === rejectionModal.equipmentId}
        />
      </div>
    </div>
  )
}
