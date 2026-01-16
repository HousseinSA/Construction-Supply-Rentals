import HeroSection from '@/components/landing/HeroSection'
import EquipmentCategories from '@/components/landing/EquipmentCategories'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import ServicesSection from '@/components/landing/ServicesSection'
import Footer from '@/components/landing/Footer'

export default function Home() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'KriliyEngin',
    alternateName: ['Kriliy Engin', 'Location Engin Mauritanie'],
    url: 'https://kriliyengin.com',
    description: 'Plateforme de location d\'équipements de construction en Mauritanie. Location engin, matériel BTP, pelle hydraulique, bulldozer, chargeuse à Nouakchott et Nouadhibou.',
    inLanguage: ['fr', 'ar', 'en'],
    areaServed: {
      '@type': 'Country',
      name: 'Mauritanie'
    },
    serviceType: ['Location équipement construction', 'Location engin BTP', 'Location matériel chantier'],
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: 'https://kriliyengin.com',
      serviceType: 'Online'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main className="min-h-screen">
        <HeroSection />
        <EquipmentCategories />
        <HowItWorksSection />
        <ServicesSection />
        <Footer />
      </main>
    </>
  )
}
