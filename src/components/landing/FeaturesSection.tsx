import { useTranslations } from 'next-intl'

const features = [
  {
    icon: '🔍',
    title: 'Easy Search & Compare',
    description: 'Find and compare equipment from verified rental companies in your area.'
  },
  {
    icon: '📅',
    title: 'Flexible Booking',
    description: 'Book equipment for any duration - daily, weekly, or monthly rentals available.'
  },
  {
    icon: '🚚',
    title: 'Delivery Available',
    description: 'Get equipment delivered directly to your job site when you need it.'
  },
  {
    icon: '✅',
    title: 'Verified Equipment',
    description: 'All equipment is inspected and maintained by certified rental partners.'
  },
  {
    icon: '💰',
    title: 'Best Prices',
    description: 'Compare prices from multiple suppliers to get the best deal.'
  },
  {
    icon: '🛡️',
    title: 'Insured & Safe',
    description: 'All rentals include insurance coverage and safety certifications.'
  }
]

export default function FeaturesSection() {
  const t = useTranslations('landing')

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Our Platform?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We make equipment rental simple, safe, and affordable for construction professionals.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}