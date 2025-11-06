"use client"
import { Session } from "next-auth"

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export default function SessionProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: Session | null
}) {
  return (
    <NextAuthSessionProvider
      refetchInterval={5 * 60}
      refetchOnWindowFocus={true}
      session={session}
    >
      {children}
    </NextAuthSessionProvider>
  )
}
