"use client"

import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { useBookingDetails } from "@/src/hooks/useBookingDetails"
import { formatDate } from "@/src/lib/table-utils"
import BaseDetailsModal from "@/src/components/shared/BaseDetailsModal"
import ContactCard from "@/src/components/shared/ContactCard"
import MessageSection from "@/src/components/shared/MessageSection"
import TransactionInfoCard from "@/src/components/shared/TransactionInfoCard"
import StatusManager from "@/src/components/ui/StatusManager"
import PriceDisplay from "@/src/components/ui/PriceDisplay"
import type { BookingWithDetails } from "@/src/stores/bookingsStore"

interface BookingDetailsModalProps {
  booking: BookingWithDetails
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: () => void
}

export default function BookingDetailsModal({
  booking,
  isOpen,
  onClose,
  onStatusUpdate,
}: BookingDetailsModalProps) {
  const t = useTranslations("dashboard.bookings")
  const tBooking = useTranslations("booking")
  const tDashboard = useTranslations("dashboard")
  const { data: session } = useSession()
  const {
    status,
    setStatus,
    loading,
    handleStatusUpdate,
    totalCommission,
    originalStatus,
  } = useBookingDetails(booking, onStatusUpdate, onClose)

  const getUsageUnitLabel = (unit: string) => {
    const unitMap: Record<string, string> = {
      hours: tBooking("hours"),
      days: tBooking("days") || "days",
      km: tBooking("km"),
      tons: tBooking("tons"),
    }
    return unitMap[unit] || unit
  }

  const getSingularUnitLabel = (unit: string) => {
    const unitMap: Record<string, string> = {
      hours: tBooking("hour"),
      days: tBooking("day"),
      km: tBooking("km"),
      tons: tBooking("ton"),
    }
    return unitMap[unit] || unit
  }

  const getRentalPeriod = () => {
    if (booking.startDate && booking.endDate) {
      return `${formatDate(booking.startDate)} - ${formatDate(booking.endDate)}`
    } else if (booking.startDate) {
      return formatDate(booking.startDate)
    }
    return '-'
  }

  const transactionRows: Array<{
    label: string
    value: string | number
    highlight?: boolean
    dir?: "ltr" | "rtl"
  }> = []

  booking.bookingItems?.forEach((item: any) => {
    const usageLabel = getUsageUnitLabel(item.usageUnit)
    const singularLabel = getSingularUnitLabel(item.usageUnit)
    transactionRows.push(
      {
        label: item.equipmentName,
        value: `${item.usage} ${usageLabel}`,
      },
      {
        label: `${tBooking("rate")}`,
        value: `${item.rate.toLocaleString()} MRU/${singularLabel}`,
        dir: "ltr",
      }
    )
  })

  transactionRows.push(
    {
      label: t("table.total"),
      value: <PriceDisplay amount={booking.totalPrice} />,
      dir: "ltr",
      highlight: true,
    },
    {
      label: t("details.commissionBooking"),
      value: <PriceDisplay amount={totalCommission} suffix="/(10%)" variant="commission" />,
      highlight: true,
      dir: "ltr",
    }
  )

  return (
    <BaseDetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("details.title")}
      referenceNumber={booking.referenceNumber || ""}
      referenceLabel={t("details.reference")}
      onUpdate={() => handleStatusUpdate(session?.user?.id)}
      updateDisabled={loading || status === originalStatus}
      updateLoading={loading}
      updateLabel={t("actions.update")}
      updatingLabel={t("actions.updating")}
      closeLabel={t("actions.close")}
    >
      <div className="bg-gray-50 py-4 border-b border-gray-200 -mx-6 px-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">{t("details.createdAt")}</div>
            <div className="text-sm font-semibold text-gray-900" >
              {new Date(booking.createdAt).toLocaleDateString()}
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-gray-600 mb-2">{t("table.rentalPeriod")}</div>
            <div className="text-sm font-semibold text-gray-900" >
              {getRentalPeriod()}
            </div>
          </div>
        </div>
      </div>

      <TransactionInfoCard
        title={t("details.bookingInfo")}
        rows={transactionRows}
      />

      <StatusManager
        currentStatus={booking.status}
        selectedStatus={status}
        onStatusChange={setStatus}
        labels={{
          title: t("details.status"),
          currentStatus: t("details.status"),
          statusOptions: {
            pending: t("status.pending"),
            paid: t("status.paid"),
            completed: t("status.completed"),
            cancelled: t("status.cancelled"),
          },
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {booking.renterInfo?.[0] && (
          <ContactCard
            user={booking.renterInfo[0]}
            title={t("details.renterInfo")}
            variant="renter"
          />
        )}
        <ContactCard
          user={booking.supplierInfo?.[0]}
          title={t("details.supplierInfo")}
          variant="supplier"
          adminCreated={booking.hasAdminCreatedEquipment}
          adminLabel={tDashboard("equipment.createdByAdmin")}
        />
      </div>

      {booking.renterMessage && (
        <MessageSection
          message={booking.renterMessage}
          title={t("details.renterMessage")}
          variant="renter"
        />
      )}
    </BaseDetailsModal>
  )
}
