import { ReactNode } from 'react'

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">{children}</table>
    </div>
  )
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="bg-gray-50 border-b">{children}</thead>
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-100">{children}</tbody>
}

export function TableRow({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr className="hover:bg-gray-50 transition-colors" onClick={onClick}>
      {children}
    </tr>
  )
}

export function TableHead({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'center' | 'right' }) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-end' : 'text-start'
  return <th className={`px-6 py-4 ${alignClass} text-sm font-semibold text-gray-700`}>{children}</th>
}

export function TableCell({ children, align = 'left' }: { children: ReactNode; align?: 'left' | 'center' | 'right' }) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-end' : ''
  return <td className={`px-6 py-4 ${alignClass}`}>{children}</td>
}
