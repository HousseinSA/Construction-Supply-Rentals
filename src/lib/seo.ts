import { Metadata } from 'next'

export function generateSEOMetadata({
  title,
  description,
  keywords,
  locale = 'fr',
  path = '',
  images = [],
}: {
  title: string
  description: string
  keywords?: string[]
  locale?: string
  path?: string
  images?: string[]
}): Metadata {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://yourdomain.com'
  const url = `${baseUrl}/${locale}${path}`

  return {
    title,
    description,
    keywords: keywords?.join(', '),
    openGraph: {
      title,
      description,
      url,
      siteName: 'Mauritania Equipment Rental',
      locale: locale === 'ar' ? 'ar_MR' : locale === 'fr' ? 'fr_MR' : 'en_US',
      type: 'website',
      images: images.length > 0 ? images : [`${baseUrl}/og-image.jpg`],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images.length > 0 ? images : [`${baseUrl}/og-image.jpg`],
    },
    alternates: {
      canonical: url,
      languages: {
        ar: `${baseUrl}/ar${path}`,
        fr: `${baseUrl}/fr${path}`,
        en: `${baseUrl}/en${path}`,
      },
    },
  }
}

export function generateEquipmentStructuredData(equipment: {
  name: string
  description: string
  price: number
  currency: string
  images: string[]
  location: string
  category: string
  availability: boolean
}) {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://yourdomain.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: equipment.name,
    description: equipment.description,
    image: equipment.images.map(img => `${baseUrl}${img}`),
    offers: {
      '@type': 'Offer',
      price: equipment.price,
      priceCurrency: equipment.currency,
      availability: equipment.availability 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/UsedCondition',
    },
    category: equipment.category,
    areaServed: {
      '@type': 'Country',
      name: 'Mauritania',
    },
  }
}

export function generateOrganizationStructuredData() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://yourdomain.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Mauritania Equipment Rental Platform',
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: 'Plateforme de location d\'équipements de construction en Mauritanie',
    areaServed: {
      '@type': 'Country',
      name: 'Mauritania',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MR',
    },
  }
}

export function generateLocalBusinessStructuredData() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://yourdomain.com'
  
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Mauritania Equipment Rental',
    url: baseUrl,
    description: 'Location d\'équipements de construction - Mauritanie',
    areaServed: [
      'Nouakchott', 'Nouadhibou', 'Rosso', 'Kaédi', 'Zouérat', 
      'Kiffa', 'Atar', 'Sélibaby', 'Akjoujt', 'Tidjikja'
    ],
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'MR',
    },
  }
}
