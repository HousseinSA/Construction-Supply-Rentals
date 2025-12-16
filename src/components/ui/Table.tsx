import { ReactNode } from 'react'

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px]">{children}</table>
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

export function TableHead({ children, align = 'left', sticky }: { children: ReactNode; align?: 'left' | 'center' | 'right'; sticky?: boolean }) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-end' : 'text-start'
  const stickyClass = sticky ? 'sticky left-0 z-10 bg-gray-50' : ''
  return <th className={`px-6 py-4 ${alignClass} ${stickyClass} text-sm font-semibold text-gray-700 whitespace-nowrap`}>{children}</th>
}

export function TableCell({ children, align = 'left', sticky }: { children: ReactNode; align?: 'left' | 'center' | 'right'; sticky?: boolean }) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-end' : ''
  const stickyClass = sticky ? 'sticky left-0 z-10 bg-white' : ''
  return <td className={`px-6 py-4 ${alignClass} ${stickyClass}`}>{children}</td>
}
