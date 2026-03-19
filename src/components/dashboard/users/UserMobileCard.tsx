"use client"
import { Users } from 'lucide-react'
import { User } from '@/src/lib/types'
import { UserPhone, UserRoleBadge, UserStatusBadge, formatUserDate } from './UserInfo'
import UserActions from './UserActions'

interface UserMobileCardProps {
  user: User
  onAction: (userId: string, action: 'block' | 'unblock', userName: string) => void
  updating: string | null
  t: any
}

export default function UserMobileCard({ user, onAction, updating, t }: UserMobileCardProps) {
  return (
    <div className="p-4 hover:bg-gray-50 border rounded-lg">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            <UserRoleBadge user={user} t={t} />
          </div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{t('equipment.phone')}:</span>
          <UserPhone phone={user.phone} />
        </div>
        {user.userType === 'supplier' && user.companyName && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Company:</span>
            <span className="text-sm text-gray-900">{user.companyName}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <UserStatusBadge status={user.status} t={t} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{t('equipment.createdAt')}:</span>
          <span className="text-sm text-gray-900">{formatUserDate(user.createdAt || new Date())}</span>
        </div>
      </div>
      <div className="w-full">
        <UserActions
          userId={user._id?.toString() || ''}
          status={user.status}
          userName={`${user.firstName} ${user.lastName}`}
          updating={updating}
          onAction={onAction}
          t={t}
        />
      </div>
    </div>
  )
}
