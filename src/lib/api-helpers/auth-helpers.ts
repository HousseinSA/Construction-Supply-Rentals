import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"

export async function getAuthenticatedUser() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return {
      authenticated: false,
      error: NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
    }
  }

  return {
    authenticated: true,
    user: {
      id: session.user.id,
      role: session.user.role || "user",
      userType: session.user.userType || "supplier"
    }
  }
}

export async function requireAdmin() {
  const auth = await getAuthenticatedUser()
  
  if (!auth.authenticated) {
    return { authorized: false, error: auth.error }
  }

  if (auth.user!.role !== "admin") {
    return {
      authorized: false,
      error: NextResponse.json({ success: false, error: "Unauthorized - Admin only" }, { status: 401 })
    }
  }

  return { authorized: true, user: auth.user }
}
