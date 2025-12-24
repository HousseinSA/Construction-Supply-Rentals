"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Truck, ExternalLink } from "lucide-react"
import Input from "@/src/components/ui/Input"

interface PorteChar {
  _id: string
  name: string
  pricing: {
    kmRate: number
  }
  supplierId?: string
  supplierName?: string
}

interface TransportSectionProps {
  isRequired: boolean
  selectedPorteChar: PorteChar | null
  distance: number
  onPorteCharChange: (porteChar: PorteChar | null) => void
  onDistanceChange: (distance: number) => void
  locale: string
}

export default function TransportSection({
  isRequired,
  selectedPorteChar,
  distance,
  onPorteCharChange,
  onDistanceChange,
  locale,
}: TransportSectionProps) {
  const t = useTranslations("booking")
  const [porteChars, setPorteChars] = useState<PorteChar[]>([])
  const [showSelection, setShowSelection] = useState(false)
  const [loading, setLoading] = useState(true)
  const [includeTransport, setIncludeTransport] = useState(isRequired)

  useEffect(() => {
    fetchPorteChars()
  }, [])

  const fetchPorteChars = async () => {
    try {
      const response = await fetch("/api/equipment/porte-chars")
      const data = await response.json()
      if (data.success) {
        setPorteChars(data.porteChars)
        if (data.porteChars.length > 0 && isRequired) {
          onPorteCharChange(data.porteChars[0])
        }
      }
    } catch (error) {
      console.error("Failed to fetch porte-chars:", error)
    } finally {
      setLoading(false)
    }
  }

  const transportCost = selectedPorteChar && distance > 0
    ? selectedPorteChar.pricing.kmRate * distance
    : 0

  if (!isRequired && !includeTransport) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={includeTransport}
            onChange={(e) => {
              setIncludeTransport(e.target.checked)
              if (!e.target.checked) {
                onPorteCharChange(null)
                onDistanceChange(0)
              }
            }}
            className="w-4 h-4 text-primary"
          />
          <Truck className="w-5 h-5 text-gray-600" />
          <span className="font-medium">{t("addTransport")}</span>
        </label>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-2 text-gray-600">
          <Truck className="w-5 h-5" />
          <span>{t("loading")}</span>
        </div>
      </div>
    )
  }

  if (porteChars.length === 0) {
    return (
      <div className="border border-red-200 bg-red-50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-red-600 mb-2">
          <Truck className="w-5 h-5" />
          <span className="font-semibold">{t("noTransportAvailable")}</span>
        </div>
        <p className="text-sm text-red-600">{t("contactPlatform")}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-primary/30 bg-primary/5 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Truck className="w-5 h-5 text-primary" />
          <span className="font-semibold text-primary">
            {isRequired ? t("transportRequired") : t("transportOptional")}
          </span>
        </div>

        {selectedPorteChar && (
          <div className="bg-white rounded-lg p-3 mb-3">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-medium">{selectedPorteChar.name}</p>
                {selectedPorteChar.supplierName && (
                  <p className="text-sm text-gray-600">
                    ({selectedPorteChar.supplierName})
                  </p>
                )}
              </div>
              <p className="text-sm font-medium text-primary" dir="ltr">
                {selectedPorteChar.pricing.kmRate.toLocaleString()} MRU/{t("ratePerKm")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => window.open(`/${locale}/equipment/${selectedPorteChar._id}`, '_blank')}
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {t("viewDetails")}
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}

        {porteChars.length > 1 && (
          <button
            type="button"
            onClick={() => setShowSelection(!showSelection)}
            className="text-sm text-primary hover:underline mb-3"
          >
            {t("changePorteChar")} ▼
          </button>
        )}

        {showSelection && (
          <div className="bg-white border rounded-lg p-3 mb-3 max-h-60 overflow-y-auto">
            <p className="text-sm font-medium mb-2">{t("selectPorteChar")}</p>
            {porteChars.map((pc) => (
              <label
                key={pc._id}
                className="flex items-start gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="radio"
                  name="porteChar"
                  checked={selectedPorteChar?._id === pc._id}
                  onChange={() => {
                    onPorteCharChange(pc)
                    setShowSelection(false)
                  }}
                  className="mt-1"
                />
                <div className="flex-1">
                  <p className="font-medium text-sm">{pc.name}</p>
                  {pc.supplierName && (
                    <p className="text-xs text-gray-600">({pc.supplierName})</p>
                  )}
                  <p className="text-xs text-primary" dir="ltr">
                    {pc.pricing.kmRate.toLocaleString()} MRU/{t("ratePerKm")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    window.open(`/${locale}/equipment/${pc._id}`, '_blank')
                  }}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  {t("viewDetails")}
                  <ExternalLink className="w-3 h-3" />
                </button>
              </label>
            ))}
          </div>
        )}

        <Input
          type="text"
          label={`${t("estimatedDistance")} (${t("km")})`}
          value={distance}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, "")
            onDistanceChange(val ? Number(val) : 0)
          }}
          required
        />

        {transportCost > 0 && (
          <div className="mt-3 p-2 bg-gray-50 rounded">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">{t("transportCost")}:</span>
              <span className="font-semibold text-primary" dir="ltr">
                {transportCost.toLocaleString()} MRU
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
