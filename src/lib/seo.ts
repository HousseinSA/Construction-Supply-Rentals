import { Metadata } from "next"

const baseUrl = process.env.NEXTAUTH_URL || 'https://kriliyengin.com'

export const seoConfig = {
  titles: {
    fr: 'KriliyEngin - Location Équipement Construction Mauritanie | Matériel BTP',
    ar: 'KriliyEngin - تأجير معدات البناء موريتانيا | معدات البناء والأشغال العامة',
    en: 'KriliyEngin - Construction Equipment Rental Mauritania | Heavy Machinery'
  },
  descriptions: {
    fr: 'Plateforme de location d\'équipements de construction en Mauritanie. Trouvez des engins de terrassement, nivellement, transport et levage à Nouakchott, Nouadhibou et partout en Mauritanie.',
    ar: 'منصة تأجير معدات البناء في موريتانيا. ابحث عن معدات الحفر والتسوية والنقل والرفع في نواكشوط ونواذيبو وجميع أنحاء موريتانيا.',
    en: 'Construction equipment rental platform in Mauritania. Find excavation, leveling, transport and lifting equipment in Nouakchott, Nouadhibou and across Mauritania.'
  },
  keywords: [
    'kriliyengin', 'kriliy engin', 'kriliyengin mauritanie',
    'location engin mauritanie', 'location matériel btp mauritanie', 'location équipement construction mauritanie',
    'louer engin mauritanie', 'location engins chantier mauritanie', 'matériel btp mauritanie',
    'location engin nouakchott', 'location engin nouadhibou', 'matériel construction nouakchott',
    'location pelle hydraulique mauritanie', 'location bulldozer mauritanie', 'location chargeuse mauritanie',
    'location grue mauritanie', 'location compacteur mauritanie', 'location niveleuse mauritanie',
    'تأجير معدات البناء موريتانيا', 'معدات البناء موريتانيا', 'كريلي إنجن',
    'construction equipment rental mauritania', 'heavy machinery rental mauritania'
  ]
}

export function generateSiteMetadata(locale: 'fr' | 'ar' | 'en', titleTemplate: string): Metadata {
  return {
    title: {
      default: seoConfig.titles[locale],
      template: titleTemplate
    },
    description: seoConfig.descriptions[locale],
    keywords: seoConfig.keywords,
    authors: [{ name: 'TECHNO-TRANS' }],
    creator: 'TECHNO-TRANS',
    publisher: 'TECHNO-TRANS',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'fr': '/fr',
        'ar': '/ar',
        'en': '/en',
      },
    },
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_MR' : locale === 'fr' ? 'fr_MR' : 'en_US',
      url: `${baseUrl}/${locale}`,
      siteName: 'KriliyEngin',
      title: seoConfig.titles[locale],
      description: seoConfig.descriptions[locale],
      images: [
        {
          url: `${baseUrl}/Kriliy-engin-logo.png`,
          width: 1200,
          height: 630,
          alt: 'KriliyEngin - Location Équipement Construction Mauritanie',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: seoConfig.titles[locale],
      description: seoConfig.descriptions[locale],
      images: [`${baseUrl}/Kriliy-engin-logo.png`],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: [
        { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
        { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
        { url: '/web-app-manifest-512x512.png', sizes: '512x512', type: 'image/png' }
      ],
      shortcut: '/favicon-96x96.png',
      apple: '/apple-touch-icon.png',
    },
    manifest: '/manifest.json',
    verification: {
      google: '617f69fbddc3eaa1',
    },
  }
}

export function generateStructuredData(locale: 'fr' | 'ar' | 'en') {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: 'KriliyEngin',
        inLanguage: locale,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${baseUrl}/${locale}/equipment?search={search_term_string}`
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: 'KriliyEngin',
        alternateName: 'Kriliy Engin',
        url: baseUrl,
        logo: {
          '@type': 'ImageObject',
          '@id': `${baseUrl}/#logo`,
          url: `${baseUrl}/web-app-manifest-512x512.png`,
          contentUrl: `${baseUrl}/web-app-manifest-512x512.png`,
          width: 512,
          height: 512,
          caption: 'KriliyEngin'
        },
        image: { '@id': `${baseUrl}/#logo` },
        description: seoConfig.descriptions[locale],
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'MR',
          addressLocality: 'Nouakchott',
        },
        areaServed: {
          '@type': 'Country',
          name: 'Mauritania'
        },
      }
    ]
  }
}
