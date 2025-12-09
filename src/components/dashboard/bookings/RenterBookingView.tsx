"use client"

import { useState } from "react"
import { useTranslations } from "next-intl"
import { useBookings } from "@/src/hooks/useBookings"
import { usePagination } from "@/src/hooks/usePagination"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableCell,
} from "@/src/components/ui/Table"
import Pagination from "@/src/components/ui/Pagination"
import { Eye, XCircle } from "lucide-react"
import { Link } from "@/src/i18n/navigation"
import EquipmentImage from "@/src/components/ui/EquipmentImage"
import { toast } from "sonner"
import type { BookingWithDetails } from "@/src/stores/bookingsStore"
import ConfirmModal from "@/src/components/ui/ConfirmModal"
import { AlertTriangle } from "lucide-react"
import GenericMobileCard from "@/src/components/ui/GenericMobileCard"
import { formatBookingId } from "@/src/lib/format"
import { formatReferenceNumber } from "@/src/lib/format-reference"

export default function RenterBookingView() {
  const t = useTranslations("dashboard.bookings")
  const tCommon = useTranslations("common")
  const { bookings, loading, fetchBookings } = useBookings()
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(
    null
  )

  const {
    currentPage,
    totalPages,
    paginatedData,
    goToPage,
    totalItems,
    itemsPerPage,
  } = usePagination({ data: bookings, itemsPerPage: 10 })

  const handleCancelClick = (bookingId: string) => {
    setSelectedBookingId(bookingId)
    setShowCancelDialog(true)
  }

  const handleCancelBooking = async () => {
    if (!selectedBookingId) return

    setCancellingId(selectedBookingId)
    try {
      const response = await fetch("/api/bookings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: selectedBookingId,
          status: "cancelled",
        }),
      })

      if (response.ok) {
        toast.success(t("cancelSuccess"))
        fetchBookings()
      } else {
        toast.error(t("cancelFailed"))
      }
    } catch (error) {
      toast.error(t("cancelFailed"))
    } finally {
      setCancellingId(null)
      setShowCancelDialog(false)
      setSelectedBookingId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800",
      paid: "bg-green-100 text-green-800",
      completed: "bg-blue-100 text-blue-800",
      cancelled: "bg-red-100 text-red-800",
    }
    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          styles[status as keyof typeof styles] || "bg-gray-100 text-gray-800"
        }`}
      >
        {t(`status.${status}`)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="p-12 text-center">
        <div className="animate-pulse text-gray-600 font-medium">
          {t("loading")}
        </div>
      </div>
    )
  }

  if (bookings.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-gray-500 text-lg mb-2">{t("noBookings")}</div>
        <div className="text-gray-400 text-sm">{t("noBookingsDesc")}</div>
      </div>
    )
  }

  return (
    <>
      <div className="hidden lg:block">
        <Table>
          <TableHeader>
            <tr>
              <TableHead>{t("table.reference")}</TableHead>
              <TableHead>{t("table.equipment")}</TableHead>
              <TableHead>{t("table.usage")}</TableHead>
              <TableHead>{t("table.total")}</TableHead>
              <TableHead align="center">{t("table.status")}</TableHead>
              <TableHead align="center">{t("table.date")}</TableHead>
              <TableHead align="center">{t("table.actions")}</TableHead>
            </tr>
          </TableHeader>
          <TableBody>
            {paginatedData.map((booking) => (
              <tr key={booking._id?.toString()}>
                <TableCell>
                  <div className="font-semibold text-orange-600 text-sm" dir="ltr">
                    {formatReferenceNumber(booking.referenceNumber)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <EquipmentImage
                      src={booking.bookingItems[0]?.equipmentImage || "/equipement-images/default-fallback-image.png"}
                      alt={booking.bookingItems[0]?.equipmentName || "Equipment"}
                      size="lg"
                    />
                    <div className="space-y-1">
                      {booking.bookingItems?.map((item, idx) => (
                        <div key={idx} className="text-sm font-medium">
                          {item.equipmentName}
                        </div>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {booking.bookingItems?.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-600">
                        {item.usage}
                        {item.usageUnit
                          ? item.usageUnit === "hours"
                            ? ` ${tCommon("hour")}`
                            : item.usageUnit === "days"
                            ? ` ${tCommon("day")}`
                            : item.usageUnit === "km"
                            ? ` ${tCommon("km")}`
                            : item.usageUnit === "tons"
                            ? ` ${tCommon("tons")}`
                            : ""
                          : "h"}
                      </div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-semibold" dir="ltr">
                    {booking.totalPrice.toLocaleString()} MRU
                  </span>
                </TableCell>
                <TableCell align="center">
                  {getStatusBadge(booking.status)}
                </TableCell>
                <TableCell align="center">
                  <span className="text-sm text-gray-600">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </span>
                </TableCell>
                <TableCell align="center">
                  <div className="flex items-center justify-center gap-2 min-w-[80px]">
                    <Link
                      href={`/equipment/${booking.bookingItems[0]?.equipmentId}`}
                      className="inline-block p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Eye className="h-4 w-4 text-gray-600" />
                    </Link>
                    {booking.status === "pending" && (
                      <button
                        onClick={() =>
                          handleCancelClick(booking._id?.toString() || "")
                        }
                        disabled={cancellingId === booking._id?.toString()}
                        className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 group"
                        title={t("cancelBooking")}
                      >
                        <XCircle className="h-5 w-5 text-red-600 group-hover:text-red-700" />
                      </button>
                    )}
                  </div>
                </TableCell>
              </tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="lg:hidden space-y-4">
        {paginatedData.map((booking) => {
          const equipmentTitle = `${booking.bookingItems[0]?.equipmentName}${
            booking.bookingItems.length > 1
              ? ` +${booking.bookingItems.length - 1}`
              : ""
          }`
          const totalUsage = booking.bookingItems.reduce(
            (sum, item) => sum + item.usage,
            0
          )

          return (
            <GenericMobileCard
              key={booking._id?.toString()}
              id={formatReferenceNumber(booking.referenceNumber)}
              title={equipmentTitle}
              date={new Date(booking.createdAt).toLocaleDateString()}
              status={booking.status}
              image={
                <EquipmentImage
                  src={booking.bookingItems[0]?.equipmentImage || "/equipement-images/default-fallback-image.png"}
                  alt={booking.bookingItems[0]?.equipmentName || "Equipment"}
                  size="lg"
                  onClick={() => { window.location.href = `/equipment/${booking.bookingItems[0]?.equipmentId}` }}
                />
              }
              fields={[
                {
                  label: t("table.usage"),
                  value: `${totalUsage}${
                    booking.bookingItems[0]?.usageUnit
                      ? booking.bookingItems[0].usageUnit === "hours"
                        ? ` ${tCommon("hour")}`
                        : booking.bookingItems[0].usageUnit === "days"
                        ? ` ${tCommon("day")}`
                        : booking.bookingItems[0].usageUnit === "km"
                        ? ` ${tCommon("km")}`
                        : booking.bookingItems[0].usageUnit === "tons"
                        ? ` ${tCommon("tons")}`
                        : ""
                      : "h"
                  }`,
                },
                {
                  label: t("table.total"),
                  value: booking.totalPrice,
                },
              ]}
              onViewDetails={() => {
                window.location.href = `/equipment/${booking.bookingItems[0]?.equipmentId}`
              }}
              viewButtonText={t("actions.view")}
              actionButton={
                booking.status === "pending" ? (
                  <button
                    onClick={() =>
                      handleCancelClick(booking._id?.toString() || "")
                    }
                    disabled={cancellingId === booking._id?.toString()}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 group"
                    title={t("cancelBooking")}
                  >
                    <XCircle className="h-5 w-5 text-red-600 group-hover:text-red-700" />
                  </button>
                ) : undefined
              }
            />
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

      <ConfirmModal
        isOpen={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
        onConfirm={handleCancelBooking}
        title={t("cancelBookingTitle")}
        message={t("cancelBookingMessage")}
        confirmText={t("confirmCancel")}
        cancelText={t("actions.cancel")}
        icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
        iconBgColor="bg-red-100"
        isLoading={cancellingId !== null}
      />
    </>
  )
}
