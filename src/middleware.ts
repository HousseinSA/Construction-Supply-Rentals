import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing, Locale } from "@/i18n/routing"

export default async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  
  
  const savedLocale = request.cookies.get("NEXT_LOCALE")?.value

  const pathSegments = pathname.split("/")
  const firstSegment = pathSegments[1]
  const urlLocale = routing.locales.includes(firstSegment as Locale)
    ? (firstSegment as Locale)
    : undefined

  if (savedLocale && savedLocale !== urlLocale) {
    const newPathname = `/${savedLocale}${pathname.replace(/^\/[^\/]+/, "")}`
    return NextResponse.redirect(new URL(newPathname, origin))
  }

  const finalLocale = savedLocale || urlLocale || routing.defaultLocale

  const response = createMiddleware({
    locales: routing.locales,
    defaultLocale: routing.defaultLocale,
    localePrefix: "always",
    localeDetection: false,
  })(request)

  if (!savedLocale && urlLocale) {
    response.cookies.set("NEXT_LOCALE", urlLocale, {
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico|.*\\..*).*)"],
}
