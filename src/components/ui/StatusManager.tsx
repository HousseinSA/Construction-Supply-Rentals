"use client"

import Dropdown from "./Dropdown"

interface StatusManagerProps {
  currentStatus: string
  selectedStatus: string
  onStatusChange: (status: string) => void
  labels: {
    title: string
    currentStatus: string
    statusOptions: {
      pending: string
      paid: string
      completed: string
      cancelled: string
    }
  }
}

const STATUS_ORDER = ['pending', 'paid', 'completed', 'cancelled']

export default function StatusManager({
  currentStatus,
  selectedStatus,
  onStatusChange,
  labels,
}: StatusManagerProps) {
  // If cancelled, show read-only badge - can't change cancelled status
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
          {/* Cancelled status is final and cannot be changed */}
        </p>
      </div>
    )
  }

  // Get current status index for stage progression
  const currentIndex = STATUS_ORDER.indexOf(currentStatus)

  // Build options with disabled logic
  const options = STATUS_ORDER.map((status, index) => {
    // Disable if it's a previous stage (can't go backwards)
    // Exception: can always select 'cancelled' from any stage
    const isDisabled = status !== 'cancelled' && index < currentIndex

    return {
      value: status,
      label: labels.statusOptions[status as keyof typeof labels.statusOptions],
      disabled: isDisabled,
    }
  }).filter(opt => !opt.disabled) // Remove disabled options from dropdown

  return (
    <div className="space-y-3">
      {/* Current Status Badge */}
      <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">{labels.currentStatus}</span>
          <span className={`font-semibold px-3 py-1 rounded-full text-xs ${
            currentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            currentStatus === 'paid' ? 'bg-blue-100 text-blue-800' :
            currentStatus === 'completed' ? 'bg-green-100 text-green-800' :
            'bg-red-100 text-red-800'
          }`}>
            {labels.statusOptions[currentStatus as keyof typeof labels.statusOptions]}
          </span>
        </div>
      </div>

      {/* Status Dropdown - only show if not cancelled */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <Dropdown
          label={labels.title}
          options={options}
          value={selectedStatus}
          onChange={onStatusChange}
        />
      </div>
    </div>
  )
}
