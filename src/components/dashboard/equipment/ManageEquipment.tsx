"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import {
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  MapPin,
  Edit,
  Eye,
  Tag,
  Loader2,
} from "lucide-react"
import Image from "next/image"
import { Link, useRouter } from "@/src/i18n/navigation"
import { useLocale } from "next-intl"
import { useManageEquipment } from "@/src/hooks/useManageEquipment"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { usePagination } from "@/src/hooks/usePagination"
import { showToast } from "@/src/lib/toast"
import EquipmentTableRow from "./EquipmentTableRow"
import HomeButton from "../../ui/HomeButton"
import ConfirmModal from "../../ui/ConfirmModal"
import Dropdown from "../../ui/Dropdown"
import Pagination from "../../ui/Pagination"
import { Table, TableHeader, TableBody, TableHead } from "../../ui/Table"
import { EquipmentWithSupplier } from "@/src/stores/equipmentStore"

export default function ManageEquipment() {
  const { data: session } = useSession()
  const router = useRouter()
  const t = useTranslations("dashboard.equipment")
  const tCommon = useTranslations("common")
  const locale = useLocale()
  const isRTL = locale === "ar"
  const headerAlign = isRTL ? "text-right" : "text-left"
  const { getPriceData, formatPrice } = usePriceFormatter()

  const {
    equipment,
    loading,
    updating,
    handleStatusChange,
    handleAvailabilityChange,
  } = useManageEquipment()

  const {
    currentPage,
    totalPages,
    paginatedData: paginatedEquipment,
    goToPage,
    totalItems,
    itemsPerPage,
  } = usePagination({ data: equipment, itemsPerPage: 10 })

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    equipmentId: string | null
    action: "approve" | "reject" | null
  }>({ isOpen: false, equipmentId: null, action: null })

  const [navigating, setNavigating] = useState<string | null>(null)

  const openConfirmModal = (id: string, action: "approve" | "reject") => {
    setConfirmModal({ isOpen: true, equipmentId: id, action })
  }

  const closeConfirmModal = () => {
    setConfirmModal({ isOpen: false, equipmentId: null, action: null })
  }

  const handleConfirmAction = async () => {
    if (confirmModal.equipmentId && confirmModal.action) {
      const status = confirmModal.action === "approve" ? "approved" : "rejected"
      const success = await handleStatusChange(confirmModal.equipmentId, status)

      if (success) {
        showToast.success(
          t(
            confirmModal.action === "approve"
              ? "equipmentApproved"
              : "equipmentRejected"
          )
        )
      } else {
        showToast.error(t("equipmentUpdateFailed"))
      }
      closeConfirmModal()
    }
  }

  const handleAvailabilityChangeWithToast = async (
    id: string,
    isAvailable: boolean
  ) => {
    const success = await handleAvailabilityChange(id, isAvailable)
    if (success) {
      showToast.success(t("availabilityUpdated"))
    } else {
      showToast.error(t("equipmentUpdateFailed"))
    }
  }

  const handleNavigation = (url: string, equipmentId: string) => {
    setNavigating(equipmentId)
    router.push(url)
  }

  if (!session?.user || session.user.role !== "admin") {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Link
                href="/dashboard"
                className="flex items-center justify-center w-10 h-10 rounded-lg bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t("manageTitle")}
                </h1>
                <p className="text-gray-600 text-sm">{t("manageSubtitle")}</p>
              </div>
            </div>
            <HomeButton />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-pulse text-gray-600 font-medium">
                {t("loading")}
              </div>
            </div>
          ) : equipment.length === 0 ? (
            <div className="p-12 text-center text-gray-500 font-medium">
              No equipment found
            </div>
          ) : (
            <>
              <div className="hidden lg:block">
                <Table>
                  <TableHeader>
                    <tr>
                      <TableHead>{t("name")}</TableHead>
                      <TableHead>{t("location")}</TableHead>
                      <TableHead>{t("price")}</TableHead>
                      <TableHead>{t("supplierInfo")}</TableHead>
                      <TableHead align="center">{t("createdAt")}</TableHead>
                      <TableHead align="center">{t("status")}</TableHead>
                      <TableHead align="center">{t("availability")}</TableHead>
                      <TableHead align="center">{t("actions")}</TableHead>
                    </tr>
                  </TableHeader>
                  <TableBody>
                      {paginatedEquipment.map((item: EquipmentWithSupplier) => (
                        <EquipmentTableRow
                          key={item._id?.toString()}
                          item={item}
                          updating={updating}
                          navigating={navigating}
                          onStatusChange={openConfirmModal}
                          onAvailabilityChange={
                            handleAvailabilityChangeWithToast
                          }
                          onNavigate={handleNavigation}
                        />
                      ))}
                  </TableBody>
                </Table>
              </div>

              <div className="lg:hidden divide-y divide-gray-200">
                {paginatedEquipment.map((item: EquipmentWithSupplier) => {
                  const priceData = getPriceData(
                    item.pricing,
                    item.listingType === "forSale"
                  )
                  const { displayPrice, displayUnit } = formatPrice(
                    priceData.rate,
                    priceData.unit
                  )

                  return (
                    <div key={item._id} className="p-4 hover:bg-gray-50">
                      <div className="flex gap-3 mb-3">
                        <div className="relative">
                          <Image
                            src={
                              item.images[0] ||
                              "/equipement-images/default-fallback-image.png"
                            }
                            alt={item.name}
                            width={96}
                            height={80}
                            className="w-24 h-20 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() =>
                              handleNavigation(
                                `/equipment/${item._id?.toString()}?admin=true`,
                                item._id?.toString() || ""
                              )
                            }
                          />
                          {navigating === item._id?.toString() && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                              <Loader2 className="w-6 h-6 text-white animate-spin" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.name}
                          </h3>
                          <div className="flex gap-2 mb-1">
                            {item.createdBy === "admin" && (
                              <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                {t("createdByAdmin")}
                              </span>
                            )}
                            {item.listingType === "forSale" && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs text-white rounded bg-gradient-to-r from-orange-500 to-red-500">
                                <Tag className="w-3 h-3" />
                                {t("forSale")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                            <span className="capitalize">{item.location}</span>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {displayPrice}
                            {displayUnit ? ` ${displayUnit}` : ""}
                          </p>
                        </div>
                      </div>

                      {item.supplier && (
                        <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <p className="text-sm font-bold text-gray-800 mb-2">
                            {t("supplierInfo")}
                          </p>
                          <div className="space-y-1">
                            <p className="text-base font-semibold text-gray-900">
                              {item.supplier.firstName} {item.supplier.lastName}
                            </p>
                            <p className="text-sm text-gray-700">
                              {item.supplier.email}
                            </p>
                            <p className="text-sm text-gray-700">
                              {item.supplier.phone}
                            </p>
                            {item.supplier.companyName && (
                              <p className="text-sm font-medium text-gray-800">
                                {item.supplier.companyName}
                              </p>
                            )}
                            {item.supplier.location && (
                              <p className="text-sm text-gray-600">
                                {item.supplier.location}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mb-3">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          {t("status")}:
                        </p>
                        {item.status === "pending" ? (
                          <div className="flex gap-2">
                            <button
                              onClick={() =>
                                openConfirmModal(
                                  item._id?.toString() || "",
                                  "approve"
                                )
                              }
                              disabled={updating === item._id?.toString()}
                              className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-md hover:bg-green-600 flex-1"
                            >
                              {t("approve")}
                            </button>
                            <button
                              onClick={() =>
                                openConfirmModal(
                                  item._id?.toString() || "",
                                  "reject"
                                )
                              }
                              disabled={updating === item._id?.toString()}
                              className="px-3 py-1.5 text-xs font-medium bg-red-500 text-white rounded-md hover:bg-red-600 flex-1"
                            >
                              {t("reject")}
                            </button>
                          </div>
                        ) : (
                          <span
                            className={`inline-block px-3 py-1.5 text-xs font-semibold rounded-md ${
                              item.status === "approved"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {t(item.status)}
                          </span>
                        )}
                      </div>

                      <div className="mb-3">
                        <Dropdown
                          options={[
                            { value: "available", label: t("available") },
                            { value: "unavailable", label: t("unavailable") },
                          ]}
                          value={item.isAvailable ? "available" : "unavailable"}
                          onChange={(val) =>
                            handleAvailabilityChangeWithToast(
                              item._id?.toString() || "",
                              val === "available"
                            )
                          }
                          disabled={updating === item._id?.toString() || (item.listingType === "forSale" && !item.isAvailable)}
                        />
                      </div>

                      <div className="flex gap-2">
                        {item.createdBy === "admin" && (
                          <button
                            onClick={() =>
                              handleNavigation(
                                `/dashboard/equipment/edit/${item._id?.toString()}`,
                                `edit-${item._id?.toString()}`
                              )
                            }
                            disabled={
                              navigating === `edit-${item._id?.toString()}`
                            }
                            className="flex-1 p-2 text-blue-600 bg-blue-50 rounded-lg font-medium text-sm disabled:opacity-50"
                          >
                            {navigating === `edit-${item._id?.toString()}` ? (
                              <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
                            ) : (
                              <Edit className="w-4 h-4 inline mr-1" />
                            )}
                            {t("editEquipment")}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleNavigation(
                              `/equipment/${item._id?.toString()}?admin=true`,
                              item._id?.toString() || ""
                            )
                          }
                          disabled={navigating === item._id?.toString()}
                          className="flex-1 p-2 text-gray-600 bg-gray-100 rounded-lg font-medium text-sm disabled:opacity-50"
                        >
                          {navigating === item._id?.toString() ? (
                            <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
                          ) : (
                            <Eye className="w-4 h-4 inline mr-1" />
                          )}
                          {t("viewDetails")}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={goToPage}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                showInfo={true}
              />
            </>
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
      </div>
    </div>
  )
}