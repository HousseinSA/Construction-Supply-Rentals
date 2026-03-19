"use client"
import { Users } from 'lucide-react'
import { User } from '@/src/lib/types'
import CopyButton from '@/src/components/ui/CopyButton'
import { formatPhoneNumber } from '@/src/lib/format'

export function getRoleText(user: User, t: any) {
  if (user.role === 'admin') return t('users.roles.admin')
  return user.userType === 'supplier'
    ? t('users.roles.supplier')
    : t('users.roles.renter')
}

export function getRoleBadgeColor(user: User) {
  if (user.role === 'admin') return 'bg-purple-100 text-purple-800'
  return user.userType === 'supplier'
    ? 'bg-green-100 text-green-800'
    : 'bg-blue-100 text-blue-800'
}

export function getStatusBadgeColor(status: string) {
  return status === 'blocked'
    ? 'bg-red-100 text-red-800'
    : 'bg-green-100 text-green-800'
}

export function formatUserDate(dateString: string | Date) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

interface UserInfoProps {
  user: User
  t: any
}

export default function UserInfo({ user, t }: UserInfoProps) {
  return (
    <div className="flex items-center">
      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
        <Users className="h-5 w-5 text-blue-600" />
      </div>
      <div className="mx-2">
        <div className="text-sm font-medium text-gray-900">
          {user.firstName} {user.lastName}
        </div>
        {user.userType === 'supplier' && user.companyName && (
          <div className="text-sm text-gray-500">{user.companyName}</div>
        )}
      </div>
    </div>
  )
}

export function UserPhone({ phone }: { phone: string }) {
  return (
    <div className="flex items-center text-sm text-gray-900">
      <span className="mr-2" dir="ltr">{formatPhoneNumber(phone)}</span>
      <CopyButton text={phone} size="sm" />
    </div>
  )
}

export function UserRoleBadge({ user, t }: { user: User; t: any }) {
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(user)}`}>
      {getRoleText(user, t)}
    </span>
  )
}

export function UserStatusBadge({ status, t }: { status: string; t: any }) {
  return (
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(status)}`}>
      {status === 'blocked' ? t('users.blocked') : t('users.active')}
    </span>
  )
}
