"use client"

import { useTranslations } from "next-intl"
import { useRouter } from "@/i18n/navigation"
import { useCityData } from "@/src/hooks/useCityData"
import { useFontClass } from "@/src/hooks/useFontClass"
import { useSearchStore } from "@/src/stores"
import CitySelector from "@/components/ui/CitySelector"

export default function HeroSection() {
  const t = useTranslations("landing")
  const fontClass = useFontClass()
  const router = useRouter()
  const { selectedCity, setSelectedCity } = useSearchStore()
  const { defaultCity, convertToLatin } = useCityData()

  const handleBrowseAll = () => {
    const searchParams = new URLSearchParams()
    const cityForAPI = selectedCity || convertToLatin(defaultCity)

    const latinCity = convertToLatin(cityForAPI)
    setSelectedCity(latinCity)

    searchParams.set("city", latinCity)
    router.push(`/equipment?${searchParams.toString()}`)
  }

  return (
    <section
      className={`relative h-[50vh] md:h-[70vh] flex items-center justify-center will-change-transform ${fontClass}`}
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        crossOrigin="anonymous"
      >
        <source
          src="https://res.cloudinary.com/dqgozilsf/video/upload/f_auto,q_50,w_720,h_480,br_500k,so_0/2073129-hd_1920_1080_30fps_rvuqn2.mp4"
          type="video/mp4"
          media="(max-width: 768px)"
        />
        <source
          src="https://res.cloudinary.com/dqgozilsf/video/upload/f_auto,q_70,w_1280,h_720,br_1000k,so_0/2073129-hd_1920_1080_30fps_rvuqn2.mp4"
          type="video/mp4"
        />
      </video>

      <div className="absolute inset-0 bg-black/35 will-change-transform" />
      <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 leading-tight drop-shadow-2xl">
          {t("hero.title")}
        </h1>
        <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 md:mb-8 text-gray-100 drop-shadow-lg px-2">
          {t("hero.subtitle")}
        </p>
        <div className="bg-white rounded-xl p-2 sm:p-3 flex flex-col md:flex-row gap-2 sm:gap-3 max-w-2xl mx-auto shadow-2xl">
          <CitySelector
            selectedCity={selectedCity || ""}
            onCityChange={(city) => setSelectedCity(convertToLatin(city))}
            placeholder={t("hero.searchPlaceholder")}
          />

          <button
            onClick={handleBrowseAll}
            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg transition-colors font-semibold whitespace-nowrap cursor-pointer"
          >
            {t("hero.browseAllButton")}
          </button>
        </div>
      </div>
    </section>
  )
}
