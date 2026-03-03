import { useEffect, useState } from "react"

export function usePricingTypes(equipmentTypeId: string) {
  const [pricingTypes, setPricingTypes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!equipmentTypeId) {
      setPricingTypes([])
      return
    }

    setLoading(true)
    fetch(`/api/equipment-types/${equipmentTypeId}`)
      .then((res) => res.json())
      .then((data) => setPricingTypes(data.data?.pricingTypes || []))
      .catch((error) => {
        console.error("Error fetching pricing types:", error)
        setPricingTypes([])
      })
      .finally(() => setLoading(false))
  }, [equipmentTypeId])

  return { pricingTypes, loading }
}
