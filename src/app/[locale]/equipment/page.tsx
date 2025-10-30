"use client"

import { useSearchParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useState, useEffect, Suspense } from "react"
import Image from "next/image"
import { useEquipment } from "@/src/hooks/useEquipment"
import PageHeader from "@/src/components/equipment/PageHeader"
import EquipmentGrid from "@/src/components/equipment/EquipmentGrid"

function EquipmentContent() {
  const searchParams = useSearchParams()
  const selectedCity = searchParams.get("city")
  const { equipment, loading } = useEquipment(selectedCity)

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader selectedCity={selectedCity} />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EquipmentGrid 
          equipment={equipment} 
          loading={loading} 
          selectedCity={selectedCity} 
        />
      </div>
    </div>
  )
}

export default function EquipmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-lg">Loading...</div></div>}>
      <EquipmentContent />
    </Suspense>
  )
}
