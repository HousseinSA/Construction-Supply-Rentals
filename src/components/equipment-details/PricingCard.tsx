import { useTranslations } from "next-intl"

interface PriceOption {
  displayPrice: string
  displayUnit: string
}

interface PricingCardProps {
  prices: PriceOption[]
  isForSale: boolean
}

export default function PricingCard({ prices, isForSale }: PricingCardProps) {
  const t = useTranslations("equipmentDetails")

  return (
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
      <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-2 sm:mb-3">
        {isForSale ? t("salePrice") : t("rentalPrice")}
      </h3>
      <div className="space-y-2">
        {prices.map((price, index) => (
          <div key={index} className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary" dir="ltr">
              {price.displayPrice}
            </span>
            <span className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">
              {price.displayUnit ? `${price.displayUnit}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
