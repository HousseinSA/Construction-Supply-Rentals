"use client"

import { useTranslations } from "next-intl"
import { useSession } from "next-auth/react"
import { useBookingDetails } from "@/src/hooks/useBookingDetails"
import BaseDetailsModal from "@/src/components/shared/BaseDetailsModal"
import ContactCard from "@/src/components/shared/ContactCard"
import MessageSection from "@/src/components/shared/MessageSection"
import TransactionInfoCard from "@/src/components/shared/TransactionInfoCard"
import StatusManager from "@/src/components/ui/StatusManager"
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
    calculateCommission,
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

  const transactionRows: Array<{
    label: string
    value: string | number
    highlight?: boolean
    dir?: "ltr" | "rtl"
  }> = []

  // Equipment items
  booking.bookingItems?.forEach((item: any) => {
    const usageLabel = getUsageUnitLabel(item.usageUnit)
    const singularLabel = getSingularUnitLabel(item.usageUnit)
    transactionRows.push(
      {
        label: item.equipmentName,
        value: `${item.usage} ${usageLabel}`,
        dir: "ltr",
      },
      {
        label: `${tBooking("rate")}`,
        value: `${item.rate.toLocaleString()} MRU/${singularLabel}`,
        dir: "ltr",
      }
    )
  })

  // If transport exists, show equipment and transport in separate columns
  const equipmentRows = booking.transportDetails ? [...transactionRows] : []
  const transportRows: Array<{
    label: string
    value: string | number
    highlight?: boolean
    dir?: "ltr" | "rtl"
  }> = []

  if (booking.transportDetails) {
    // Equipment total
    equipmentRows.push({
      label: t("table.total"),
      value: `${booking.totalPrice.toLocaleString()} MRU`,
      dir: "ltr",
      highlight: true,
    })

    // Transport details
    transportRows.push(
      {
        label: booking.transportDetails.porteCharName,
        value: `${booking.transportDetails.distance} ${tBooking("km")}`,
        dir: "ltr",
      },
      {
        label: tBooking("ratePerKm"),
        value: `${booking.transportDetails.ratePerKm.toLocaleString()} MRU/${tBooking("km")}`,
        dir: "ltr",
      },
      {
        label: t("table.total"),
        value: `${booking.transportDetails.transportCost.toLocaleString()} MRU`,
        dir: "ltr",
        highlight: true,
      }
    )
  }

  // Summary rows (only when transport exists)
  const summaryRows: Array<{
    label: string
    value: string | number
    highlight?: boolean
    dir?: "ltr" | "rtl"
  }> = booking.transportDetails ? [
    {
      label: t("table.estimatedTotal"),
      value: `${(booking.grandTotal || booking.totalPrice).toLocaleString()} MRU`,
      dir: "ltr",
      highlight: true,
    },
    {
      label: t("details.commission"),
      value: `${totalCommission.toLocaleString()} MRU`,
      highlight: true,
      dir: "ltr",
    },
    {
      label: t("details.createdAt"),
      value: new Date(booking.createdAt).toLocaleDateString(),
    }
  ] : []

  // When no transport, add summary to transaction rows
  if (!booking.transportDetails) {
    transactionRows.push(
      {
        label: t("table.total"),
        value: `${booking.totalPrice.toLocaleString()} MRU`,
        dir: "ltr",
        highlight: true,
      },
      {
        label: t("details.commission"),
        value: `${totalCommission.toLocaleString()} MRU`,
        highlight: true,
        dir: "ltr",
      },
      {
        label: t("details.createdAt"),
        value: new Date(booking.createdAt).toLocaleDateString(),
      }
    )
  }

  return (
    <BaseDetailsModal
      isOpen={isOpen}
      onClose={onClose}
      title={t("details.title")}
      referenceNumber={booking.referenceNumber}
      referenceLabel={t("details.reference")}
      onUpdate={() => handleStatusUpdate(session?.user?.id)}
      updateDisabled={loading || status === originalStatus}
      updateLoading={loading}
      updateLabel={t("actions.update")}
      updatingLabel={t("actions.updating")}
      closeLabel={t("actions.close")}
    >
      {booking.transportDetails ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TransactionInfoCard
              title={t("table.equipment")}
              rows={equipmentRows}
            />
            <TransactionInfoCard
              title={tBooking("transport")}
              rows={transportRows}
            />
          </div>
          <TransactionInfoCard
            title={t("table.summary")}
            rows={summaryRows}
          />
        </>
      ) : (
        <TransactionInfoCard
          title={t("details.bookingInfo")}
          rows={transactionRows}
        />
      )}

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
