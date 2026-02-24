import { useMemo } from "react"
import { useSession } from "next-auth/react"

export function useUserSession() {
  const { data: session, status } = useSession()

  const user = useMemo(() => {
    if (!session?.user) return null
    return {
      ...session.user,
      isAdmin: session.user.role === "admin",
      isSupplier: session.user.userType === "supplier",
      isRenter: session.user.userType === "renter",
    }
  }, [session?.user])

  return { user, isLoading: status === "loading" }
}
