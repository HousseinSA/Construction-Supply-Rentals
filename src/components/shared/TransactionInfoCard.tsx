interface TransactionInfoRow {
  label: string
  value: string | number
  highlight?: boolean
  dir?: "ltr" | "rtl"
}

interface TransactionInfoCardProps {
  title: string
  rows: TransactionInfoRow[]
}

export default function TransactionInfoCard({ title, rows }: TransactionInfoCardProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-5">
      <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={index}
            className={`flex items-center justify-between py-2 ${
              index < rows.length - 1 ? "border-b border-gray-200" : ""
            }`}
          >
            <span className="text-sm text-gray-600">{row.label}</span>
            <span
              className={`text-sm font-${row.highlight ? "bold" : "semibold"} ${
                row.highlight ? "text-green-600" : "text-gray-900"
              }`}
              dir={row.dir || "auto"}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
