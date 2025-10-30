import { useLocale } from "next-intl"

const mauritaniaCities = {
  en: ["Nouakchott", "Nouadhibou", "Rosso", "Kaédi", "Zouérat", "Kiffa", "Atar", "Sélibaby", "Akjoujt", "Tidjikja"],
  ar: ["نواكشوط", "نواذيبو", "روصو", "كيهيدي", "الزويرات", "كيفة", "أطار", "سيليبابي", "أكجوجت", "تيجيكجة"],
  fr: ["Nouakchott", "Nouadhibou", "Rosso", "Kaédi", "Zouérat", "Kiffa", "Atar", "Sélibaby", "Akjoujt", "Tidjikja"]
}

const cityToLatinMap: { [key: string]: string } = {
  "نواكشوط": "Nouakchott",
  "نواذيبو": "Nouadhibou", 
  "روصو": "Rosso",
  "كيهيدي": "Kaédi",
  "الزويرات": "Zouérat",
  "كيفة": "Kiffa",
  "أطار": "Atar",
  "سيليبابي": "Sélibaby",
  "أكجوجت": "Akjoujt",
  "تيجيكجة": "Tidjikja"
}

const latinToCityMap: { [key: string]: { [key in "en" | "ar" | "fr"]: string } } = {
  "Nouakchott": { en: "Nouakchott", ar: "نواكشوط", fr: "Nouakchott" },
  "Nouadhibou": { en: "Nouadhibou", ar: "نواذيبو", fr: "Nouadhibou" },
  "Rosso": { en: "Rosso", ar: "روصو", fr: "Rosso" },
  "Kaédi": { en: "Kaédi", ar: "كيهيدي", fr: "Kaédi" },
  "Zouérat": { en: "Zouérat", ar: "الزويرات", fr: "Zouérat" },
  "Kiffa": { en: "Kiffa", ar: "كيفة", fr: "Kiffa" },
  "Atar": { en: "Atar", ar: "أطار", fr: "Atar" },
  "Sélibaby": { en: "Sélibaby", ar: "سيليبابي", fr: "Sélibaby" },
  "Akjoujt": { en: "Akjoujt", ar: "أكجوجت", fr: "Akjoujt" },
  "Tidjikja": { en: "Tidjikja", ar: "تيجيكجة", fr: "Tidjikja" }
}

export function useCityData() {
  const locale = useLocale() as "en" | "ar" | "fr"

  const getCitiesForLocale = () => mauritaniaCities[locale]
  
  const getDefaultCity = () => mauritaniaCities[locale][0]
  
  const convertToLatin = (city: string) => cityToLatinMap[city] || city
  
  const convertToLocalized = (latinCity: string) => 
    latinToCityMap[latinCity]?.[locale] || latinCity

  const getDisplayValue = (selectedCity: string) => {
    if (!selectedCity) return getDefaultCity()
    return latinToCityMap[selectedCity] ? latinToCityMap[selectedCity][locale] : selectedCity
  }

  return {
    cities: getCitiesForLocale(),
    defaultCity: getDefaultCity(),
    convertToLatin,
    convertToLocalized,
    getDisplayValue,
    locale
  }
}