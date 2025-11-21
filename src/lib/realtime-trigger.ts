import { connectDB } from './mongodb'
import { UpdateType } from './realtime'

export async function triggerRealtimeUpdate(type: UpdateType) {
  try {
    const db = await connectDB()
    await db.collection('realtime_updates').insertOne({
      type,
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('Failed to trigger realtime update:', error)
  }
}
