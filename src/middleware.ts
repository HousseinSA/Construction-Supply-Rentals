import { NextRequest, NextResponse } from "next/server"
import createMiddleware from "next-intl/middleware"
import { routing, Locale } from "@/i18n/routing"
import { getToken } from "next-auth/jwt"

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const pathSegments = pathname.split("/")
  const firstSegment = pathSegments[1]
  const urlLocale = routing.locales.includes(firstSegment as Locale)
    ? (firstSegment as Locale)
    : undefined

  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value as
    | Locale
    | undefined

  if (
    urlLocale &&
    cookieLocale &&
    urlLocale !== cookieLocale &&
    routing.locales.includes(cookieLocale)
  ) {
    const pathWithoutLocale = pathname.replace(/^\/(ar|fr|en)/, "")
    const newUrl = new URL(`/${cookieLocale}${pathWithoutLocale}`, request.url)
    newUrl.search = request.nextUrl.search
    const response = NextResponse.redirect(newUrl)
    response.headers.set("Cache-Control", "no-store, must-revalidate")
    return response
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })
  const locale = cookieLocale || urlLocale || routing.defaultLocale

  if (
    token &&
    pathname.match(/\/(ar|fr|en)\/auth\/(login|register|reset-password)/)
  ) {
    const response = NextResponse.redirect(new URL(`/${locale}`, request.url))
    response.headers.set("Cache-Control", "no-store, must-revalidate")
    return response
  }

  if (pathname.match(/\/(ar|fr|en)\/dashboard/)) {
    if (!token) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      const response = NextResponse.redirect(loginUrl)
      response.headers.set("Cache-Control", "no-store, must-revalidate")
      return response
    }
    
    if (token.role === "user" && token.userType === "renter") {
      const response = NextResponse.redirect(new URL(`/${locale}`, request.url))
      response.headers.set("Cache-Control", "no-store, must-revalidate")
      return response
    }
  }

  const response = createMiddleware({
    locales: routing.locales,
    defaultLocale: routing.defaultLocale,
    localePrefix: "always",
    localeDetection: true,
  })(request)

  response.headers.set("Cache-Control", "no-store, must-revalidate")

  return response
}

export const config = {
  matcher: ["/((?!api|_next|static|favicon.ico|google.*\\.html|.*\\..*).*)"],
}
