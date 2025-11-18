import { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
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
        if (!credentials?.emailOrPhone || !credentials?.password) {
          return null
        }

        const db = await connectDB()
        const isEmail = (credentials.emailOrPhone as string).includes("@")
        const query = isEmail
          ? { email: credentials.emailOrPhone }
          : { phone: credentials.emailOrPhone }

        const user = await db.collection(COLLECTIONS.USERS).findOne(query)

        if (!user || !user.password) {
          return null
        }
        if (user.password !== credentials.password) {
          return null
        }
        
        // Check if user is blocked
        if (user.status === "blocked") {
          return null
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          userType: user.userType,
        }
      },
    }),
  ],
  session: { strategy: "jwt" as const, maxAge: 24 * 60 * 60 },
  pages: { signIn: "/auth/login" },
  basePath: "/api/auth",
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.userType = user.userType
      }
      return token
    },
    async session({ session, token }) {
      if (token && session) {
        session.user = session.user || {}
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
        session.user.userType = token.userType as string
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}
