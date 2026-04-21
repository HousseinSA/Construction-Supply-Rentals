import { useState, useEffect, useMemo } from "react"
import { useSession } from "next-auth/react"
import { usePriceFormatter } from "@/src/hooks/usePriceFormatter"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useCityData } from "@/src/hooks/useCityData"

interface UseEquipmentDetailsProps {
  equipmentId: string
}

export function useEquipmentDetails({ equipmentId }: UseEquipmentDetailsProps) {
  const { data: session } = useSession()
  const [equipment, setEquipment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<boolean>(false)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAdminView, setIsAdminView] = useState(false)
  const fontClass = useFontClass()
  const { convertToLocalized } = useCityData()
  const { formatPrice } = usePriceFormatter()

  const getAllFormattedPrices = (pricing: any, isForSale: boolean) => {
    const prices = []
    if (isForSale && pricing.salePrice) {
      const { displayPrice, displayUnit } = formatPrice(
        pricing.salePrice,
        "sale",
      )
      prices.push({ displayPrice, displayUnit })
    } else {
      if (pricing.hourlyRate) {
        const { displayPrice, displayUnit } = formatPrice(
          pricing.hourlyRate,
          "hour",
        )
        prices.push({ displayPrice, displayUnit })
      }
      if (pricing.dailyRate) {
        const { displayPrice, displayUnit } = formatPrice(
          pricing.dailyRate,
          "day",
        )
        prices.push({ displayPrice, displayUnit })
      }
      if (pricing.kmRate) {
        const { displayPrice, displayUnit } = formatPrice(pricing.kmRate, "km")
        prices.push({ displayPrice, displayUnit })
      }
      if (pricing.tonRate) {
        const { displayPrice, displayUnit } = formatPrice(
          pricing.tonRate,
          "ton",
        )
        prices.push({ displayPrice, displayUnit })
      }
    }
    return prices
  }

  const isForSale = equipment?.listingType === "forSale"

  const fetchEquipment = async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      setError(false)
      const urlParams = new URLSearchParams(window.location.search)
      const isAdmin = urlParams.get("admin") === "true"
      setIsAdminView(isAdmin)
      const apiUrl = `/api/equipment/${equipmentId}${isAdmin ? "?admin=true" : ""}`
      const response = await fetch(apiUrl, {
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      const data = await response.json()
      if (data.success) {
        setEquipment(data.data)
      } else {
        setError(true)
      }
    } catch (error) {
      clearTimeout(timeoutId)
      console.error("Failed to fetch equipment:", error)
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchEquipment()
  }, [equipmentId])

  const handleBookingSuccess = () => {
    fetchEquipment()
  }

  const allPrices = useMemo(() => {
    if (!equipment) return []
    return getAllFormattedPrices(equipment.pricing, isForSale)
  }, [equipment?.pricing, isForSale])

  return {
    equipment,
    loading,
    error,
    selectedImage,
    setSelectedImage,
    isModalOpen,
    setIsModalOpen,
    isAdminView,
    fontClass,
    convertToLocalized,
    isForSale,
    allPrices,
    handleBookingSuccess,
    fetchEquipment,
    session,
  }
}
