import { ReactNode } from 'react'

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto overflow-y-visible">
      <table className="w-full min-w-max">{children}</table>
    </div>
  )
}

export function TableHeader({ children }: { children: ReactNode }) {
  return <thead className="bg-gradient-to-b from-gray-50 to-gray-100/50 border-b border-gray-200">{children}</thead>
}

export function TableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-gray-200 bg-white">{children}</tbody>
}

export function TableRow({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr className="hover:bg-blue-50/30 transition-all duration-150 hover:shadow-sm" onClick={onClick}>
      {children}
    </tr>
  )
}

export function TableHead({ children, align = 'left', sticky }: { children: ReactNode; align?: 'left' | 'center' | 'right'; sticky?: boolean }) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-end' : 'text-start'
  const stickyClass = sticky ? 'sticky left-0 z-10 bg-gradient-to-b from-gray-50 to-gray-100/50' : ''
  return <th className={`px-6 py-4 ${alignClass} ${stickyClass} text-xs font-bold text-gray-600 uppercase tracking-wider whitespace-nowrap`}>{children}</th>
}

export function TableCell({ children, align = 'left', sticky }: { children: ReactNode; align?: 'left' | 'center' | 'right'; sticky?: boolean }) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-end' : ''
  const stickyClass = sticky ? 'sticky left-0 z-10 bg-white' : ''
  return <td className={`px-6 py-5 ${alignClass} ${stickyClass} text-sm text-gray-700`}>{children}</td>
}
