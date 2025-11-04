import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { connectDB } from "./mongodb"
import { COLLECTIONS } from "./types"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        emailOrPhone: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.emailOrPhone || !credentials?.password) return null

        const db = await connectDB()
        const isEmail = (credentials.emailOrPhone as string).includes('@')
        const query = isEmail ? { email: credentials.emailOrPhone } : { phone: credentials.emailOrPhone }

        const user = await db.collection(COLLECTIONS.USERS).findOne(query)
        if (!user || !user.password) return null
        if (user.password !== credentials.password) return null

        console.log("Authorize - user found:", { id: user._id.toString(), role: user.role, userType: user.userType })
        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          userType: user.userType,
        } as any
      },
    }),
  ],
  session: { strategy: "jwt" as const, maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/auth/login" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.userType = user.userType
      }
      console.log("JWT callback - token:", token)
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.userType = token.userType as string
      }
      console.log("Session callback - session:", session)
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
