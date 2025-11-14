import { Phone, ArrowLeft, ShoppingCart, Calendar } from "lucide-react"
import { useTranslations } from "next-intl"

interface ActionButtonsProps {
  isForSale: boolean
}

export default function ActionButtons({ isForSale }: ActionButtonsProps) {
  const t = useTranslations("equipmentDetails")

  const handleActionClick = () => {
    // This will be handled by admin approval system
    console.log(isForSale ? 'Sale request submitted' : 'Booking request submitted')
  }

  return (
    <div className="mt-auto pt-4 sm:pt-6 space-y-2 sm:space-y-3">
      <button 
        onClick={handleActionClick}
        className="w-full bg-primary hover:bg-primary/90 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl transition-all duration-300 font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
      >
        {isForSale ? (
          <>
            <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
            {t("sendSaleRequest")}
          </>
        ) : (
          <>
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            {t("sendBookingRequest")}
          </>
        )}
      </button>
      <button
        onClick={() => window.history.back()}
        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all duration-200 font-medium text-sm sm:text-base flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        {t("goBack")}
      </button>
    </div>
  )
}
