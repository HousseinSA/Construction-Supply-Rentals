import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/src/lib/auth'
import { connectDB } from '@/src/lib/mongodb'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const db = await connectDB()
    
    // Get platform settings
    const settings = await db.collection('settings').findOne({ type: 'platform' })
    
    // Get current admin user details
    const admin = await db.collection('users').findOne({ 
      email: session.user.email,
      role: 'admin' 
    })
    
    const response = {
      supportPhone: settings?.supportPhone || '+222 45 111111',
      supportEmail: settings?.supportEmail || 'support@krilyengin.com',
      adminPhone: admin?.phone || '+222 45 111111',
      adminPassword: admin?.password || '12345678'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { supportPhone, supportEmail, adminPhone, adminPassword } = body

    // Validate required fields
    if (!supportPhone || !supportEmail || !adminPhone || !adminPassword) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const db = await connectDB()
    
    // Update platform settings
    await db.collection('settings').updateOne(
      { type: 'platform' },
      {
        $set: {
          supportPhone,
          supportEmail,
          updatedAt: new Date()
        },
        $setOnInsert: {
          type: 'platform',
          createdAt: new Date()
        }
      },
      { upsert: true }
    )

    // Update current admin user details
    await db.collection('users').updateOne(
      { email: session.user.email, role: 'admin' },
      {
        $set: {
          phone: adminPhone,
          password: adminPassword,
          updatedAt: new Date()
        }
      }
    )

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully' 
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}