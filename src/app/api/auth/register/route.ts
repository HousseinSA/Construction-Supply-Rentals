import { NextRequest, NextResponse } from "next/server"
import { connectDB } from "@/src/lib/mongodb"
import { COLLECTIONS } from "@/src/lib/types"
import { validateEmail, validateMauritanianPhone } from "@/src/lib/validators"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    let { 
      firstName, 
      lastName, 
      email, 
      password, 
      phone, 
      userType, 
      companyName, 
      location 
    } = body

    email = email?.trim().toLowerCase()

    if (!firstName?.trim()) {
      return NextResponse.json({ error: "First name is required" }, { status: 400 })
    }

    if (!lastName?.trim()) {
      return NextResponse.json({ error: "Last name is required" }, { status: 400 })
    }

    if (!email || !validateEmail(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 })
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    if (!phone || !validateMauritanianPhone(phone)) {
      return NextResponse.json({ error: "Valid Mauritanian phone number is required" }, { status: 400 })
    }

    if (!userType || !["renter", "supplier"].includes(userType)) {
      return NextResponse.json({ error: "User type must be renter or supplier" }, { status: 400 })
    }

    if (userType === "supplier") {
      if (!companyName?.trim()) {
        return NextResponse.json({ error: "Company name is required for suppliers" }, { status: 400 })
      }
      if (!location?.trim()) {
        return NextResponse.json({ error: "Location is required for suppliers" }, { status: 400 })
      }
    }

    const db = await connectDB()
    
    const existingUserByEmail = await db.collection(COLLECTIONS.USERS).findOne({ email })
    if (existingUserByEmail) {
      return NextResponse.json({ error: "emailAlreadyExists" }, { status: 409 })
    }

    const existingUserByPhone = await db.collection(COLLECTIONS.USERS).findOne({ phone: phone.replace(/\s+/g, '') })
    if (existingUserByPhone) {
      return NextResponse.json({ error: "phoneAlreadyExists" }, { status: 409 })
    }

    const userData = {
      email,
      username: email.split("@")[0],
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone.replace(/\s+/g, ''),
      location: userType === "supplier" ? location.trim() : "",
      userType,
      role: "user" as const,
      status: "approved" as const,
      ...(userType === "supplier" && { companyName: companyName.trim() }),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await db.collection(COLLECTIONS.USERS).insertOne(userData)

    return NextResponse.json({
      success: true,
      userId: result.insertedId.toString(),
      message: "Account created successfully",
    }, { status: 201 })

  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 })
  }
}
