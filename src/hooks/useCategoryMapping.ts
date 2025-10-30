import { useTranslations } from "next-intl"

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
  "Camion-benne": "camionbenne",
  "Camion benne": "camionbenne",
  "Camion citerne (eau, carburant)": "camionciterne",
  "Camion citerne": "camionciterne",
  "Benne articulée": "bennearticulee",
  "Porte char": "portechar",
  "Grue mobile": "gruemobile",
  "Grue à tour": "grueatour",
  "رافعة متحركة": "gruemobile",
  "Chariot élévateur (forklift)": "chariotelevateur",
  "Palan électrique": "palanelectrique",
  "Nacelle élévatrice": "nacelleelevratrice",
  "Manitou / Chariot télescopique": "manitou",
  Manitou: "manitou",
  "شاحنة صهريج": "camionciterne",
  "شاحنة قلبة": "camionbenne",
  "شاحنة قلبة مفصلية": "bennearticulee",
  "Tracteur routier avec remorque": "tracteurroutier",
  "Porte-char / Porte-engin": "portechar",
  "Camion plateau": "camionplateau",
  "جرار حفار": "tractopelle",
}

export function useCategoryMapping() {
  const t = useTranslations("categories")

  const getCategoryInfo = (category: string) => {
    return categoryMapping[category] || {
      image: "/equipement-images/Pelle hydraulique.jpg",
      translationKey: category,
    }
  }

  const getCategoryKey = (categoryName: string) => {
    return categoryName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z-]/g, "")
  }

  const getEquipmentTypeName = (name: string): string => {
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

  const getEquipmentTypeDesc = (name: string): string => {
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

  return {
    getCategoryInfo,
    getCategoryKey,
    getEquipmentTypeName,
    getEquipmentTypeDesc,
  }
}