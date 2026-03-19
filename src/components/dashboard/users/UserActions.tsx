"use client"
import { Shield, ShieldOff, Loader2 } from 'lucide-react'

interface UserActionsProps {
  userId: string
  status: string
  userName: string
  updating: string | null
  onAction: (userId: string, action: 'block' | 'unblock', userName: string) => void
  t: any
}

export default function UserActions({ userId, status, userName, updating, onAction, t }: UserActionsProps) {
  const isBlocked = status === 'blocked'
  const isUpdating = updating === userId

  return (
    <button
      onClick={() => onAction(userId, isBlocked ? 'unblock' : 'block', userName)}
      disabled={isUpdating}
      className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium disabled:opacity-50 ${
        isBlocked
          ? 'bg-green-100 text-green-700 hover:bg-green-200'
          : 'bg-red-100 text-red-700 hover:bg-red-200'
      }`}
    >
      {isUpdating ? (
        <>
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
          {t('users.processing')}
        </>
      ) : isBlocked ? (
        <>
          <Shield className="h-4 w-4 mr-1" />
          {t('users.unblockUser')}
        </>
      ) : (
        <>
          <ShieldOff className="h-4 w-4 mr-1" />
          {t('users.blockUser')}
        </>
      )}
    </button>
  )
}
