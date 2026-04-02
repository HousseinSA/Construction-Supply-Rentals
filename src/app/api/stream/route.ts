import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/src/lib/api-helpers'
import { sseManager, SSE_CHANNELS } from '@/src/lib/sse'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const auth = await getAuthenticatedUser()
  
  if (!auth.authenticated || !auth.user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { id: userId, role, userType } = auth.user
  const connectionId = `${userId}-${Date.now()}`

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      
      controller.enqueue(encoder.encode(': connected\n\n'))

      if (role === 'admin') {
        sseManager.subscribe(connectionId, SSE_CHANNELS.EQUIPMENT_ADMIN, controller, userId)
        sseManager.subscribe(connectionId, SSE_CHANNELS.EQUIPMENT_PUBLIC, controller, userId)
      } else if (userType === 'supplier') {
        sseManager.subscribe(connectionId, SSE_CHANNELS.EQUIPMENT_SUPPLIER(userId), controller, userId)
        sseManager.subscribe(connectionId, SSE_CHANNELS.EQUIPMENT_PUBLIC, controller, userId)
      } else {
        sseManager.subscribe(connectionId, SSE_CHANNELS.EQUIPMENT_PUBLIC, controller, userId)
      }

      const scheduleHeartbeat = () => {
        const interval = sseManager.getHeartbeatInterval(connectionId)
        const timeoutId = setTimeout(() => {
          sseManager.sendHeartbeat(connectionId)
          scheduleHeartbeat()
        }, interval)
        
        return timeoutId
      }

      const heartbeatTimeout = scheduleHeartbeat()

      request.signal.addEventListener('abort', () => {
        clearTimeout(heartbeatTimeout)
        sseManager.unsubscribe(connectionId)
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
