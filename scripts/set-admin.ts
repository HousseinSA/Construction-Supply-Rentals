import { connectDB } from "../src/lib/mongodb"
import { COLLECTIONS } from "../src/lib/types"

async function setAdmin() {
  const email = process.argv[2]
  
  if (!email) {
    console.error("Usage: tsx scripts/set-admin.ts <email>")
    process.exit(1)
  }

  const db = await connectDB()
  const result = await db.collection(COLLECTIONS.USERS).updateOne(
    { email: email.toLowerCase() },
    { $set: { role: "admin" } }
  )

  if (result.matchedCount === 0) {
    console.error(`User with email ${email} not found`)
    process.exit(1)
  }

  console.log(`Successfully set ${email} as admin`)
  process.exit(0)
}

setAdmin()
