import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"

export function successResponse(data: any, status = 200) {
  return NextResponse.json({ success: true, ...data }, { status })
}

export function errorResponse(error: string, status = 500) {
  return NextResponse.json({ success: false, error }, { status })
}

export function validateObjectId(id: string, fieldName = "ID"): { valid: boolean; error?: NextResponse } {
  if (!ObjectId.isValid(id)) {
    return {
      valid: false,
      error: errorResponse(`Invalid ${fieldName}`, 400)
    }
  }
  return { valid: true }
}

export function validateObjectIds(ids: Record<string, string>): { valid: boolean; error?: NextResponse } {
  for (const [fieldName, id] of Object.entries(ids)) {
    const result = validateObjectId(id, fieldName)
    if (!result.valid) return result
  }
  return { valid: true }
}
