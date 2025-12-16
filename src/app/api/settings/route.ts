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
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    if (session.user.role === 'admin') {
      const settings = await db.collection('settings').findOne({ type: 'platform' })
      return NextResponse.json({
        supportPhone: settings?.supportPhone || '+222 45 111111',
        supportEmail: settings?.supportEmail || 'support@krilyengin.com',
        adminPhone: user.phone || '+222 45 111111',
        adminPassword: user.password || '12345678'
      })
    }

    return NextResponse.json({
      phone: user.phone || '',
      password: user.password || ''
    })
  } catch (error) {
    console.error('Error fetching settings:', error)
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
    const db = await connectDB()

    if (session.user.role === 'admin') {
      const { supportPhone, supportEmail, adminPhone, adminPassword } = body

      if (supportPhone && supportEmail && adminPhone && adminPassword) {
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
      } else {
        const { phone, password } = body
        
        if (!phone || !password) {
          return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 })
        }

        await db.collection('users').updateOne(
          { email: session.user.email, role: 'admin' },
          {
            $set: {
              phone,
              password,
              updatedAt: new Date()
            }
          }
        )
      }
    } else {
      const { phone, password } = body

      if (!phone || !password) {
        return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 })
      }

      await db.collection('users').updateOne(
        { email: session.user.email },
        {
          $set: {
            phone,
            password,
            updatedAt: new Date()
          }
        }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Settings updated successfully' 
    })
  } catch (error) {
    console.error('Error updating settings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}