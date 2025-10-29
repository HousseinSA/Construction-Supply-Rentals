"use client"

import { useParams } from "next/navigation"
import { useTranslations } from "next-intl"
import { useState, useEffect } from "react"
import Image from "next/image"

const categoryMapping: {
  [key: string]: { image: string; translationKey: string }
} = {
  terrassement: {
    image: "/equipement-images/Pelle hydraulique.jpg",
    translationKey: "terrassement",
  },
  "nivellement-et-compactage": {
    image: "/equipement-images/Niveuleuse.jpg",
    translationKey: "nivellementcompactage",
  },
  transport: {
    image: "/equipement-images/Camion-benne.jpg",
    translationKey: "transport",
  },
  "levage-et-manutention": {
    image: "/equipement-images/Grue mobile.jpg",
    translationKey: "levageemanutention",
  },
}

const equipmentTypeMapping: { [key: string]: string } = {
  // Terrassement
  "Pelle hydraulique": "pellehydraulique",
  "Chargeuse sur pneus": "chargeusesurpneus",
  "Chargeuse sur chenilles": "chargeusesurchenilles",
  "جرافة": "bulldozer",
  "حفارة هيدروليكية": "pellehydraulique",
  "Mini-pelle": "minipelle",
  "Décapeuse (Scraper)": "decapeuse",
  Bulldozer: "bulldozer",
  Chargeuse: "chargeuse",
  Tractopelle: "tractopelle",
  // Nivellement et Compactage
  "Compacteur à pied de mouton": "compacteurpieddemouton",
  "Compacteur pied de mouton": "compacteurpieddemouton",
  "Compacteur tandem": "compacteurtandem",
  "Compacteur monocylindre": "compacteurmonocylindre",
  "Plaque vibrante": "plaquevibrante",
  Pilonneuse: "pilonneuse",
  "Niveleuse (Grader)": "niveuleuse",
  Niveleuse: "niveuleuse",
  Compacteur: "compacteur",
  "لوحة اهتزازية": "plaquevibrante",
  "مدقة قفزية": "pilonneuse",
  "مسوية": "niveuleuse",
  // Transport
  "Camion-benne": "camionbenne",
  "Camion benne": "camionbenne",
  "Camion citerne (eau, carburant)": "camionciterne",
  "Camion citerne": "camionciterne",
  "Benne articulée": "bennearticulee",
  "Porte char": "portechar",
  // Levage et Manutention
  "Grue mobile": "gruemobile",
  "Grue à tour": "grueatour",
  "رافعة متحركة": "gruemobile",
  "Chariot élévateur (forklift)": "chariotelevateur",
  "Palan électrique": "palanelectrique",
  "Nacelle élévatrice": "nacelleelevratrice",
  "Manitou / Chariot télescopique": "manitou",
  Manitou: "manitou",
  // Transport additional
  "شاحنة صهريج": "camionciterne",
  "شاحنة قلبة": "camionbenne",
  "شاحنة قلبة مفصلية": "bennearticulee",
  "Tracteur routier avec remorque": "tracteurroutier",
  "Porte-char / Porte-engin": "portechar",
  "Camion plateau": "camionplateau",
  // Terrassement additional
  "جرار حفار": "tractopelle",
}

function getEquipmentTypeName(name: string, t: any): string {
  const key = equipmentTypeMapping[name]
  if (key) {
    try {
      return t(`equipmentTypes.${key}`)
    } catch {
      return name
    }
  }
  return name
}

function getEquipmentTypeDesc(name: string, t: any): string {
  const key = equipmentTypeMapping[name]
  if (key) {
    try {
      return t(`equipmentTypes.${key}Desc`)
    } catch {
      return ""
    }
  }
  return ""
}

export default function CategoryPage() {
  const params = useParams()
  const t = useTranslations("categories")
  const category = params.category as string
  const [equipmentTypes, setEquipmentTypes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchEquipmentTypes = async () => {
      try {
        const response = await fetch(
          `/api/equipment-types?category=${category}`
        )
        const data = await response.json()
        setEquipmentTypes(data.data || [])
      } catch (error) {
        console.error("Failed to fetch equipment types:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchEquipmentTypes()
  }, [category])

  const categoryInfo = categoryMapping[category] || {
    image: "/equipement-images/Pelle hydraulique.jpg",
    translationKey: category,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative h-64 bg-gradient-to-r from-primary to-primary-dark">
        <div className="absolute inset-0 bg-black/30" />
        <div className="relative z-10 h-full flex items-center justify-center text-center text-white">
          <div>
            <h1 className="text-4xl font-bold mb-4">
              {t(categoryInfo.translationKey as any)}
            </h1>
            <p className="text-xl opacity-90">
              {t(`${categoryInfo.translationKey}Desc` as any)}
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <div className="h-48 bg-gray-200 animate-pulse" />
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-100 rounded mb-4 animate-pulse" />
                  <div className="h-10 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {equipmentTypes.map((type: any) => (
              <div
                key={type._id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
              >
                <div className="h-48 relative">
                  <Image
                    src={categoryInfo.image}
                    alt={type.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {getEquipmentTypeName(type.name, t)}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {getEquipmentTypeDesc(type.name, t) ||
                      type.description ||
                      t("defaultEquipmentDesc")}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-primary">
                      {type.equipmentCount || 0} {t("available")}
                    </span>
                    <button className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors">
                      {t("viewEquipment")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && equipmentTypes.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🚧</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {t("noEquipmentTitle")}
            </h3>
            <p className="text-gray-600">{t("noEquipmentMessage")}</p>
          </div>
        )}
      </div>
    </div>
  )
}
