import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    supportPhone: '22245111111',
    supportEmail: 'Kriliyengin@gmail.com',
  })
}
