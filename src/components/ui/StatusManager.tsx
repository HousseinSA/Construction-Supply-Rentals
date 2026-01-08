"use client"

import Dropdown from "./Dropdown"

interface StatusManagerProps {
  currentStatus: string
  selectedStatus: string
  onStatusChange: (status: string) => void
  labels: {
    title: string
    currentStatus: string
    statusOptions: Record<string, string>
  }
}

const STATUS_ORDER = ['pending', 'paid', 'completed', 'cancelled']

export default function StatusManager({
  currentStatus,
  selectedStatus,
  onStatusChange,
  labels,
}: StatusManagerProps) {
  if (currentStatus === 'cancelled') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{labels.currentStatus}</span>
          <span className="font-semibold px-4 py-2 rounded-full text-sm bg-red-100 text-red-800">
            {labels.statusOptions.cancelled}
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-2">
        </p>
      </div>
    )
  }

  const currentIndex = STATUS_ORDER.indexOf(currentStatus)
  const availableStatuses = Object.keys(labels.statusOptions)

  const options = STATUS_ORDER
    .filter(status => availableStatuses.includes(status))
    .map((status, index) => {
      const isDisabled = status !== 'cancelled' && index < currentIndex

      return {
        value: status,
        label: labels.statusOptions[status],
        disabled: isDisabled,
      }
    }).filter(opt => !opt.disabled) 

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-600">{labels.currentStatus}</span>
        <span className={`font-semibold px-3 py-1 rounded-full text-xs ${
          currentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
          currentStatus === 'paid' ? 'bg-blue-100 text-blue-800' :
          currentStatus === 'completed' ? 'bg-green-100 text-green-800' :
          'bg-red-100 text-red-800'
        }`}>
          {labels.statusOptions[currentStatus]}
        </span>
      </div>

      <Dropdown
        options={options}
        value={selectedStatus}
        onChange={onStatusChange}
      />
    </div>
  )
}
