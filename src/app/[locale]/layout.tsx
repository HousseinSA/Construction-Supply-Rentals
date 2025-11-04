import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  setRequestLocale,
  getTranslations,
  getMessages,
} from "next-intl/server";
import { NextIntlClientProvider } from "next-intl";
import { Toaster } from "sonner";

import { routing } from "@/i18n/routing";
import { inter, cairo, poppins } from "@/lib/fonts";
import Header from "@/components/layout/Header";
import "../globals.css";


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: "fr" | "ar" | "en" }>;
}): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({
    locale: locale,
    namespace: "common",
  });

  return {
    title: t("title"),
    description: "Construction equipment rental platform",
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: "fr" | "ar" | "en" }>;
}) {
  const { locale } = await params;

  if (!locale || !routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();

  const isArabic = locale === "ar";
  const direction = isArabic ? "rtl" : "ltr";
  
  const fontClasses = `${inter.variable} ${cairo.variable} ${poppins.variable}`;
  const baseFont = isArabic ? cairo.className : locale === 'fr' ? poppins.className : inter.className;

  return (
    <html lang={locale} dir={direction} className={fontClasses}>
      <body className={`${baseFont} antialiased`}>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Header />
          {children}
          <Toaster position="top-right" richColors />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
