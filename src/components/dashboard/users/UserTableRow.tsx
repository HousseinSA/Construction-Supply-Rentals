"use client"
import { User } from '@/src/lib/types'
import { TableCell } from '@/src/components/ui/Table'
import UserInfo, { UserPhone, UserRoleBadge, UserStatusBadge, formatUserDate } from './UserInfo'
import UserActions from './UserActions'

interface UserTableRowProps {
  user: User
  onAction: (userId: string, action: 'block' | 'unblock', userName: string) => void
  updating: string | null
  t: any
}

export default function UserTableRow({ user, onAction, updating, t }: UserTableRowProps) {
  return (
    <tr key={user._id?.toString()}>
      <TableCell>
        <UserInfo user={user} t={t} />
      </TableCell>
      <TableCell>
        <UserPhone phone={user.phone} />
      </TableCell>
      <TableCell>
        <UserRoleBadge user={user} t={t} />
      </TableCell>
      <TableCell>
        <UserStatusBadge status={user.status} t={t} />
      </TableCell>
      <TableCell>{formatUserDate(user.createdAt || new Date())}</TableCell>
      <TableCell>
        <UserActions
          userId={user._id?.toString() || ''}
          status={user.status}
          userName={`${user.firstName} ${user.lastName}`}
          updating={updating}
          onAction={onAction}
          t={t}
        />
      </TableCell>
    </tr>
  )
}
