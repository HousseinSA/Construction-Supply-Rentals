import { useState, useMemo, useCallback, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { toast } from "sonner"
import { PricingType } from "@/src/lib/types"
import { useBookingSuccessStore } from "@/src/stores/bookingSuccessStore"
import { calculateCommission } from "@/src/lib/utils/commission-utils"
import { BOOKING_COMMISSION_RATE } from "@/src/lib/constants/commission"
import {
  buildAvailablePricingTypes,
  calculateDaysBetween,
  getPricingRate,
} from "@/src/lib/booking-client-utils"

import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"

export function useBookingModal(
  equipment: any,
  onSuccess?: () => void,
  onClose?: () => void,
  router?: AppRouterInstance,
  locale?: string,
) {
  const { data: session } = useSession()
  const t = useTranslations("booking")
  const tCommon = useTranslations("common")

  const [usage, setUsage] = useState(0)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [bookedRanges, setBookedRanges] = useState<
    Array<{ start: Date | string; end: Date | string }>
  >([])
  const [selectedPricingType, setSelectedPricingType] =
    useState<PricingType>("daily")

  const availablePricingTypes = useMemo(
    () => buildAvailablePricingTypes(equipment?.pricing, tCommon),
    [equipment?.pricing, tCommon],
  )

  useEffect(() => {
    if (
      availablePricingTypes.length > 0 &&
      !availablePricingTypes.find((p) => p.type === selectedPricingType)
    ) {
      setSelectedPricingType(availablePricingTypes[0].type)
    }
  }, [availablePricingTypes, selectedPricingType])

  const selectedPricing = useMemo(
    () => availablePricingTypes.find((p) => p.type === selectedPricingType),
    [availablePricingTypes, selectedPricingType],
  )

  const rate = selectedPricing?.rate || 0
  const unit = selectedPricing?.label || ""
  const subtotal = useMemo(() => rate * usage, [rate, usage])

  const fetchBookedDates = useCallback(async () => {
    if (!equipment?._id) return
    try {
      const res = await fetch(`/api/equipment/${equipment._id}/booked-dates`)
      const data = await res.json()
      if (data.success) {
        setBookedRanges(data.data)
      }
    } catch (err) {
      console.error("Failed to fetch booked dates:", err)
    }
  }, [equipment?._id])

  useEffect(() => {
    fetchBookedDates()
  }, [fetchBookedDates])

  const handleDateChange = useCallback(
    (start: string, end: string) => {
      setStartDate(start)
      setEndDate(end)
      if (start && end && selectedPricingType === "daily") {
        const days = calculateDaysBetween(start, end)
        setUsage(days)
      }
    },
    [selectedPricingType],
  )

  const handlePricingTypeChange = useCallback(
    (type: PricingType) => {
      setSelectedPricingType(type)
      if (type === "daily") {
        if (startDate && endDate) {
          const days = calculateDaysBetween(startDate, endDate)
          setUsage(days)
        } else {
          setUsage(0)
        }
      } else {
        setUsage(0)
      }
    },
    [startDate, endDate],
  )

  const resetForm = () => {
    setUsage(0)
    setStartDate("")
    setEndDate("")
    setMessage("")
  }

  const validateBooking = useCallback(
    (type: PricingType): { valid: boolean; error?: string } => {
      if (type === "daily") {
        if (!startDate || !endDate) {
          return {
            valid: false,
            error: "Please select both start and end dates",
          }
        }
      } else {
        if (!startDate) {
          return { valid: false, error: "Start date is required" }
        }
        if (usage <= 0) {
          return { valid: false, error: "Usage must be greater than 0" }
        }
      }
      return { valid: true }
    },
    [startDate, endDate, usage],
  )

  const isFormValid = useMemo(
    () => validateBooking(selectedPricingType).valid,
    [selectedPricingType, startDate, endDate, usage, validateBooking],
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.id) return

    const validation = validateBooking(selectedPricingType)
    if (!validation.valid) {
      toast.error(validation.error || t("error"))
      return
    }

    setLoading(true)
    try {
      const pricing = equipment.pricing
      const rate = getPricingRate(pricing, selectedPricingType)
      const subtotal = rate * usage
      const commission = calculateCommission(subtotal, BOOKING_COMMISSION_RATE)

      const bookingData: any = {
        renterId: session.user.id,
        equipmentId: equipment._id,
        usage,
        pricingType: selectedPricingType,
        subtotal,
        commission,
        renterMessage: message,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      })

      const data = await response.json()
      if (data.success) {
        if (data.data.equipment) {
          useBookingSuccessStore.setState({ equipment: data.data.equipment })
        }
        if (router && locale) {
          router.push(
            `/${locale}/booking-success?equipment=${encodeURIComponent(equipment.name)}&equipmentId=${equipment._id}&type=booking`,
          )
        } else {
          toast.success(t("successPending"))
        }
        resetForm()
        onSuccess?.()
        onClose?.()
      } else {
        toast.error(data.error || t("error"))
      }
    } catch {
      toast.error(t("error"))
    } finally {
      setLoading(false)
    }
  }

  return {
    usage,
    setUsage,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    message,
    setMessage,
    loading,
    handleSubmit,
    resetForm,
    validateBooking,
    bookedRanges,
    selectedPricingType,
    availablePricingTypes,
    rate,
    unit,
    subtotal,
    isFormValid,
    handleDateChange,
    handlePricingTypeChange,
  }
}
