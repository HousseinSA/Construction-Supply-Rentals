import { useTranslations, useLocale } from "next-intl"
import { Construction, ShieldCheck, Timer, Headphones, MapPin } from "lucide-react"

export default function ServicesSection() {
  const t = useTranslations("landing")
  const locale = useLocale()

  const services = [
    {
      icon: <Construction className="w-8 h-8" />,
      title: t("services.equipmentRental.title"),
      description: t("services.equipmentRental.description"),
      features: [
        t("services.equipmentRental.feature1"),
        t("services.equipmentRental.feature2"),
        t("services.equipmentRental.feature3")
      ]
    },
    {
      icon: <ShieldCheck className="w-8 h-8" />,
      title: t("services.qualityAssurance.title"),
      description: t("services.qualityAssurance.description"),
      features: [
        t("services.qualityAssurance.feature1"),
        t("services.qualityAssurance.feature2"),
        t("services.qualityAssurance.feature3")
      ]
    },
    {
      icon: <Timer className="w-8 h-8" />,
      title: t("services.flexibleRental.title"),
      description: t("services.flexibleRental.description"),
      features: [
        t("services.flexibleRental.feature1"),
        t("services.flexibleRental.feature2"),
        t("services.flexibleRental.feature3")
      ]
    },
    {
      icon: <Headphones className="w-8 h-8" />,
      title: t("services.expertSupport.title"),
      description: t("services.expertSupport.description"),
      features: [
        t("services.expertSupport.feature1"),
        t("services.expertSupport.feature2"),
        t("services.expertSupport.feature3")
      ]
    },

    {
      icon: <MapPin className="w-8 h-8" />,
      title: t("services.nationwide.title"),
      description: t("services.nationwide.description"),
      features: [
        t("services.nationwide.feature1"),
        t("services.nationwide.feature2"),
        t("services.nationwide.feature3")
      ]
    }
  ]

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t('services.title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div 
              key={index} 
              className="group bg-gray-50 rounded-2xl p-8 hover:bg-white hover:shadow-xl transition-all duration-300 border border-transparent hover:border-gray-200"
            >
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 text-primary rounded-xl mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                {service.icon}
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {service.title}
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Features */}
              <ul className="space-y-3">
                {service.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <div className={`w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0 ${locale === 'ar' ? 'ml-3' : 'mr-3'}`}></div>
                    <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>


      </div>
    </section>
  )
}