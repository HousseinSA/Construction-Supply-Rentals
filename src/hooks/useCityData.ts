import { useLocale } from "next-intl"
import { useMemo } from "react"

const CITIES = [
  { latin: "Nouakchott", ar: "نواكشوط" },
  { latin: "Nouadhibou", ar: "نواذيبو" },
  { latin: "Rosso", ar: "روصو" },
  { latin: "Kaédi", ar: "كيهيدي" },
  { latin: "Zouérat", ar: "الزويرات" },
  { latin: "Kiffa", ar: "كيفة" },
  { latin: "Atar", ar: "أطار" },
  { latin: "Sélibaby", ar: "سيليبابي" },
  { latin: "Akjoujt", ar: "أكجوجت" },
  { latin: "Tidjikja", ar: "تيجيكجة" },
] as const

const latinToArMap = new Map(CITIES.map(c => [c.latin.toLowerCase(), c.ar]))
const arToLatinMap = new Map(CITIES.map(c => [c.ar, c.latin]))

export function useCityData() {
  const locale = useLocale() as "en" | "ar" | "fr"

  const cities = useMemo(
    () => (locale === "ar" ? CITIES.map(c => c.ar) : CITIES.map(c => c.latin)),
    [locale]
  )

  const convertToLatin = useMemo(
    () => (city: string) => arToLatinMap.get(city) || city,
    []
  )

  const convertToLocalized = useMemo(
    () => (latinCity: string) => {
      if (!latinCity) return latinCity
      return locale === "ar"
        ? latinToArMap.get(latinCity.toLowerCase()) || latinCity
        : latinCity
    },
    [locale]
  )

  const getDisplayValue = useMemo(
    () => (selectedCity: string) => {
      if (!selectedCity) return cities[0]
      return locale === "ar"
        ? latinToArMap.get(selectedCity.toLowerCase()) || selectedCity
        : selectedCity
    },
    [locale, cities]
  )

  return {
    cities,
    defaultCity: cities[0],
    convertToLatin,
    convertToLocalized,
    getDisplayValue,
    locale,
  }
}