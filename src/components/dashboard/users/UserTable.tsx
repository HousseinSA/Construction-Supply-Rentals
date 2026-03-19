"use client"
import { User } from '@/src/lib/types'
import { Table, TableHeader, TableBody, TableHead } from '@/src/components/ui/Table'
import UserTableRow from './UserTableRow'

interface UserTableProps {
  users: User[]
  onAction: (userId: string, action: 'block' | 'unblock', userName: string) => void
  updating: string | null
  t: any
}

export default function UserTable({ users, onAction, updating, t }: UserTableProps) {
  return (
    <Table>
      <TableHeader>
        <tr>
          <TableHead>{t('equipment.name')}</TableHead>
          <TableHead>{t('equipment.phone')}</TableHead>
          <TableHead>{t('users.role')}</TableHead>
          <TableHead>{t('users.status')}</TableHead>
          <TableHead>{t('equipment.createdAt')}</TableHead>
          <TableHead>{t('users.actions')}</TableHead>
        </tr>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <UserTableRow
            key={user._id?.toString()}
            user={user}
            onAction={onAction}
            updating={updating}
            t={t}
          />
        ))}
      </TableBody>
    </Table>
  )
}
