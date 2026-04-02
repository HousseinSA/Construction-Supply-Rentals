import type { SSEChannel } from './channels'
import type { SSEEvent } from './events'
import { ObjectId } from 'mongodb'

const CONFIG = {
  IDLE_TIMEOUT: 5 * 60 * 1000,
  CLEANUP_INTERVAL: 60 * 1000,
  MAX_CONNECTIONS: 1000,
  MAX_FAILS: 3,
  CACHE_TTL: 5 * 1000,
  HEARTBEAT_ACTIVE: 30 * 1000,
  HEARTBEAT_IDLE: 90 * 1000,
  IDLE_THRESHOLD: 2 * 60 * 1000
} as const

interface SSEConnection {
  controller: ReadableStreamDefaultController
  userId: string
  channels: Set<string>
  lastActivity: number
  failCount: number
}

interface CachedMessage {
  data: Uint8Array
  timestamp: number
}

function serializeForSSE(data: any): any {
  if (!data || typeof data !== 'object') return data
  if (data instanceof ObjectId) return data.toString()
  if (data instanceof Date) return data
  if (Array.isArray(data)) return data.map(serializeForSSE)
  
  const result: any = {}
  for (const key in data) {
    const val = data[key]
    result[key] = val instanceof ObjectId ? val.toString() : 
                  Array.isArray(val) ? val.map(v => v instanceof ObjectId ? v.toString() : v) :
                  val && typeof val === 'object' && !(val instanceof Date) ? serializeForSSE(val) : val
  }
  return result
}

class SSEManager {
  private connections = new Map<string, SSEConnection>()
  private channels = new Map<string, Set<string>>()
  private encoder = new TextEncoder()
  private messageCache = new Map<string, CachedMessage>()
  private cleanupTimer: NodeJS.Timeout

  constructor() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now()
      
      Array.from(this.connections.entries())
        .filter(([_, conn]) => now - conn.lastActivity > CONFIG.IDLE_TIMEOUT)
        .forEach(([id]) => this.unsubscribe(id))
      
      Array.from(this.messageCache.entries())
        .filter(([_, cached]) => now - cached.timestamp > CONFIG.CACHE_TTL)
        .forEach(([key]) => this.messageCache.delete(key))
    }, CONFIG.CLEANUP_INTERVAL)
  }

  subscribe(connectionId: string, channel: SSEChannel, controller: ReadableStreamDefaultController, userId: string) {
    if (!this.connections.has(connectionId)) {
      if (this.connections.size >= CONFIG.MAX_CONNECTIONS) throw new Error('Connection limit reached')
      this.connections.set(connectionId, {
        controller,
        userId,
        channels: new Set([channel]),
        lastActivity: Date.now(),
        failCount: 0
      })
    } else {
      const conn = this.connections.get(connectionId)!
      conn.channels.add(channel)
      conn.lastActivity = Date.now()
    }

    if (!this.channels.has(channel)) this.channels.set(channel, new Set())
    this.channels.get(channel)!.add(connectionId)
  }

  unsubscribe(connectionId: string) {
    const conn = this.connections.get(connectionId)
    if (!conn) return

    conn.channels.forEach(ch => {
      const subs = this.channels.get(ch)
      if (subs) {
        subs.delete(connectionId)
        if (subs.size === 0) this.channels.delete(ch)
      }
    })

    this.connections.delete(connectionId)
  }

  broadcast(channel: SSEChannel, event: SSEEvent) {
    const subs = this.channels.get(channel)
    if (!subs?.size) return

    const cacheKey = `${event.type}:${JSON.stringify(event.data)}`
    let msg: Uint8Array
    
    const cached = this.messageCache.get(cacheKey)
    const now = Date.now()
    
    if (cached && now - cached.timestamp < CONFIG.CACHE_TTL) {
      msg = cached.data
    } else {
      msg = this.encoder.encode(this.formatSSEMessage(event))
      this.messageCache.set(cacheKey, { data: msg, timestamp: now })
    }

    const failed: string[] = []

    subs.forEach(id => {
      const conn = this.connections.get(id)
      if (!conn) return

      try {
        conn.controller.enqueue(msg)
        conn.lastActivity = Date.now()
        conn.failCount = 0
      } catch {
        if (++conn.failCount >= CONFIG.MAX_FAILS) failed.push(id)
      }
    })

    failed.forEach(id => this.unsubscribe(id))
  }

  sendHeartbeat(connectionId: string) {
    const conn = this.connections.get(connectionId)
    if (!conn) return

    try {
      conn.controller.enqueue(this.encoder.encode(': heartbeat\n\n'))
      conn.failCount = 0
    } catch {
      if (++conn.failCount >= CONFIG.MAX_FAILS) this.unsubscribe(connectionId)
    }
  }

  getHeartbeatInterval(connectionId: string): number {
    const conn = this.connections.get(connectionId)
    if (!conn) return CONFIG.HEARTBEAT_IDLE

    const timeSinceActivity = Date.now() - conn.lastActivity
    return timeSinceActivity < CONFIG.IDLE_THRESHOLD 
      ? CONFIG.HEARTBEAT_ACTIVE 
      : CONFIG.HEARTBEAT_IDLE
  }

  shutdown() {
    clearInterval(this.cleanupTimer)
    this.connections.clear()
    this.channels.clear()
    this.messageCache.clear()
  }

  private formatSSEMessage(event: SSEEvent): string {
    return `id: ${Date.now()}\nevent: ${event.type}\ndata: ${JSON.stringify(serializeForSSE(event.data))}\n\n`
  }

  getStats() {
    return {
      connections: this.connections.size,
      cacheSize: this.messageCache.size,
      channels: Array.from(this.channels.entries()).map(([channel, subs]) => ({
        channel,
        subscribers: subs.size
      }))
    }
  }
}

export const sseManager = new SSEManager()
