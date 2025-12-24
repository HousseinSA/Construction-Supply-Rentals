export type UpdateType = 'booking' | 'equipment' | 'user'

class SSEManager {
  private clients = new Map<string, ReadableStreamDefaultController>()
  private static instance: SSEManager

  static getInstance() {
    if (!SSEManager.instance) {
      SSEManager.instance = new SSEManager()
    }
    return SSEManager.instance
  }

  addClient(id: string, controller: ReadableStreamDefaultController) {
    this.clients.set(id, controller)
  }

  removeClient(id: string) {
    this.clients.delete(id)
  }

  broadcast(type: UpdateType, data?: any) {
    const encoder = new TextEncoder()
    const message = `data: ${JSON.stringify({ type, data, timestamp: Date.now() })}\n\n`
    
    this.clients.forEach((controller, clientId) => {
      try {
        controller.enqueue(encoder.encode(message))
      } catch (error) {
        console.error(`Failed to send to client ${clientId}:`, error)
        this.clients.delete(clientId)
      }
    })
  }
}

export const sseManager = SSEManager.getInstance()