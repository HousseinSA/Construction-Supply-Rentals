import { defineRouting } from "next-intl/routing"
const locales = ["en", "fr", "ar"] as const
export const routing = defineRouting({
  locales,
  defaultLocale: "en",
})

export type Locale = (typeof routing.locales)[number]
