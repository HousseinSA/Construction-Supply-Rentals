import NextAuth from "next-auth"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import { MongoClient } from "mongodb"

const client = new MongoClient(process.env.MONGODB_URI!)

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(client),
  providers: [],
  session: { strategy: "jwt" },
})
