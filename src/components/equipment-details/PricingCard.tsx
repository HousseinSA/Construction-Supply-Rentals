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
    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 sm:p-5">
      <h3 className="text-sm sm:text-base font-medium text-gray-600 mb-2">
        {isForSale ? t("salePrice") : t("rentalPrice")}
      </h3>
      <div className="space-y-2">
        {prices.map((price, index) => (
          <div key={index} className="flex items-baseline gap-2 flex-wrap">
            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary" dir="ltr">
              {price.displayPrice}
            </span>
            <span className="text-base sm:text-lg text-gray-600 font-medium">
              {price.displayUnit ? `${price.displayUnit}` : ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
