import { NextRequest, NextResponse } from 'next/server'
import { connectDB } from '@/src/lib/mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const since = parseInt(searchParams.get('since') || '0')

    if (!type) {
      return NextResponse.json({ error: 'Type required' }, { status: 400 })
    }

    const db = await connectDB()
    
    const lastUpdate = await db.collection('realtime_updates')
      .findOne(
        { type, timestamp: { $gte: new Date(since) } },
        { sort: { timestamp: -1 } }
      )

    return NextResponse.json({
      hasUpdates: !!lastUpdate
    })
  } catch (error) {
    return NextResponse.json({ error: 'Poll failed' }, { status: 500 })
  }
}
