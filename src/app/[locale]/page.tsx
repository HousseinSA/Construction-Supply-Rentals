import HeroSection from '@/components/landing/HeroSection'
import EquipmentCategories from '@/components/landing/EquipmentCategories'
import HowItWorksSection from '@/components/landing/HowItWorksSection'
import ServicesSection from '@/components/landing/ServicesSection'
import Footer from '@/components/landing/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <EquipmentCategories />
      <HowItWorksSection />
      <ServicesSection />
      <Footer />
    </main>
  )
}
