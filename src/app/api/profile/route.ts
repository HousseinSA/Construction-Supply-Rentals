import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import { connectDB } from '@/src/lib/mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectDB()
    const user = await db.collection('users').findOne({ 
      email: session.user.email
    })
    
    return NextResponse.json({
      phone: user?.phone || '',
      password: user?.password || ''
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { phone, password } = body

    if (!phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const db = await connectDB()
    await db.collection('users').updateOne(
      { email: session.user.email },
      {
        $set: {
          phone: phone,
          password: password,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Profile updated successfully' 
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}