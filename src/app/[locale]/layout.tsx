import { Metadata } from "next"
import { notFound } from "next/navigation"
import {
  setRequestLocale,
  getTranslations,
  getMessages,
} from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"
import { Toaster } from "sonner"
import SessionProvider from "@/src/components/providers/SessionProvider"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import WhatsAppFloat from "@/src/components/ui/WhatsAppFloat"
import ImageLoadHandler from "@/src/components/ui/ImageLoadHandler"

import { routing } from "@/i18n/routing"
import { inter, cairo, poppins } from "@/lib/fonts"
import Header from "@/components/layout/Header"
import "../globals.css"
import { Analytics } from "@vercel/analytics/next"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "fr" | "ar" | "en" }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({
    locale: locale,
    namespace: "common",
  })

  const baseUrl = process.env.NEXTAUTH_URL || 'https://kriliyengin.com'
  const titles = {
    fr: 'KriliyEngin - Location Équipement Construction Mauritanie | Matériel BTP',
    ar: 'KriliyEngin - تأجير معدات البناء موريتانيا | معدات البناء والأشغال العامة',
    en: 'KriliyEngin - Construction Equipment Rental Mauritania | Heavy Machinery'
  }
  const descriptions = {
    fr: 'Plateforme de location d\'équipements de construction en Mauritanie. Trouvez des engins de terrassement, nivellement, transport et levage à Nouakchott, Nouadhibou et partout en Mauritanie.',
    ar: 'منصة تأجير معدات البناء في موريتانيا. ابحث عن معدات الحفر والتسوية والنقل والرفع في نواكشوط ونواذيبو وجميع أنحاء موريتانيا.',
    en: 'Construction equipment rental platform in Mauritania. Find excavation, leveling, transport and lifting equipment in Nouakchott, Nouadhibou and across Mauritania.'
  }

  return {
    title: {
      default: titles[locale],
      template: `%s | ${t("title")}`
    },
    description: descriptions[locale],
    keywords: ['kriliyengin', 'kriliy engin', 'kriliyengin mr', 'kriliyengin mauritania', 'location équipement', 'construction mauritanie', 'engins BTP', 'matériel construction', 'Nouakchott', 'Nouadhibou', 'terrassement', 'excavation', 'معدات البناء', 'موريتانيا', 'كريلي إنجن'],
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
      siteName: titles[locale],
      title: titles[locale],
      description: descriptions[locale],
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
      icon: "/favicon.ico",
    },
  }
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: "fr" | "ar" | "en" }>
}) {
  const { locale } = await params

  if (!locale || !routing.locales.includes(locale)) {
    notFound()
  }

  setRequestLocale(locale)

  const messages = await getMessages()

  const isArabic = locale === "ar"
  const direction = isArabic ? "rtl" : "ltr"

  const fontClasses = `${inter.variable} ${cairo.variable} ${poppins.variable}`
  const baseFont = isArabic
    ? cairo.className
    : locale === "fr"
    ? poppins.className
    : inter.className
  const session = await getServerSession(authOptions)

  return (
    <html lang={locale} dir={direction} className={fontClasses}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'KriliyEngin',
              url: process.env.NEXTAUTH_URL || 'https://kriliyengin.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: `${process.env.NEXTAUTH_URL || 'https://kriliyengin.com'}/${locale}/equipment?search={search_term_string}`,
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
      </head>
      <body className={`${baseFont} antialiased`}>
        <SessionProvider session={session}>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <ImageLoadHandler />
            <Header session={session} />
            {children}
            <Analytics />
            <WhatsAppFloat />
            <Toaster position="top-right" richColors />
          </NextIntlClientProvider>
        </SessionProvider>
      </body>
    </html>
  )
}
