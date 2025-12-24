import { NextRequest } from 'next/server'
import { sseManager } from '@/src/lib/sse-manager'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const encoder = new TextEncoder()
  const clientId = crypto.randomUUID()
  
  const stream = new ReadableStream({
    start(controller) {
      sseManager.addClient(clientId, controller)
      
      controller.enqueue(encoder.encode('data: {"type":"connected"}'+'\n\n'))
      
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keepalive\n\n'))
        } catch {
          clearInterval(keepAlive)
        }
      }, 30000)

      request.signal.addEventListener('abort', () => {
        clearInterval(keepAlive)
        sseManager.removeClient(clientId)
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
