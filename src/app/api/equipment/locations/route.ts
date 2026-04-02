import { NextResponse } from "next/server"
import clientPromise from "@/src/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/src/lib/auth"

const CITIES_MAP = new Map([
  ["نواكشوط", "Nouakchott"],
  ["نواذيبو", "Nouadhibou"],
  ["روصو", "Rosso"],
  ["كيهيدي", "Kaédi"],
  ["الزويرات", "Zouérat"],
  ["كيفة", "Kiffa"],
  ["أطار", "Atar"],
  ["سيليبابي", "Sélibaby"],
  ["أكجوجت", "Akjoujt"],
  ["تيجيكجة", "Tidjikja"],
])

const LATIN_CITIES_LOWER = new Map(
  Array.from(CITIES_MAP.values()).map(city => [city.toLowerCase(), city])
)

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const client = await clientPromise
    const db = client.db("construction_rental")

    const query = session?.user?.role === "supplier" ? { supplierId: session.user.id } : {}

    const locations = await db.collection("equipment").distinct("location", query)
    
    const normalized = new Set<string>()
    for (const loc of locations) {
      if (loc) {
        normalized.add(CITIES_MAP.get(loc) || LATIN_CITIES_LOWER.get(loc.toLowerCase()) || loc)
      }
    }

    return NextResponse.json({
      success: true,
      data: Array.from(normalized).sort(),
    })
  } catch (error) {
    console.error("Error fetching locations:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch locations" },
      { status: 500 },
    )
  }
}