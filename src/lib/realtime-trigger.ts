import { sseManager, UpdateType } from './sse-manager'

export async function triggerRealtimeUpdate(type: UpdateType) {
  try {
    sseManager.broadcast(type)
  } catch (error) {
    console.error('Failed to trigger realtime update:', error)
  }
}
