import { useTranslations, useLocale } from "next-intl"

export default function HowItWorksSection() {
  const t = useTranslations("landing")
  const locale = useLocale()
  const steps = [
    {
      step: "01",
      title: t("howItWorks.step1.title"),
      description: t("howItWorks.step1.description"),
      icon: "📝",
    },
    {
      step: "02",
      title: t("howItWorks.step2.title"),
      description: t("howItWorks.step2.description"),
      icon: "✅",
    },
    {
      step: "03",
      title: t("howItWorks.step3.title"),
      description: t("howItWorks.step3.description"),
      icon: "💳",
    },
    {
      step: "04",
      title: t("howItWorks.step4.title"),
      description: t("howItWorks.step4.description"),
      icon: "🏗️",
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-xl text-gray-600">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="text-center relative">
              {/* Step Number */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-600 text-white text-xl font-bold rounded-full mb-6">
                {step.step}
              </div>

              {/* Icon */}
              <div className="text-4xl mb-4">{step.icon}</div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {step.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {step.description}
              </p>

              {/* Arrow (except for last item) */}
              {index < steps.length - 1 && (
                <div className={`hidden md:block absolute top-8 ${locale === 'ar' ? 'right-full transform translate-x-1/2 -translate-x-8' : 'left-full transform -translate-x-1/2 translate-x-8'}`}>
                  <svg
                    className={`w-8 h-8 text-orange-600 ${locale === 'ar' ? 'rotate-180' : ''}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
