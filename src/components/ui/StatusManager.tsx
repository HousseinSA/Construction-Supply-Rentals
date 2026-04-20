"use client"

import Dropdown from "./Dropdown"
import { BookingStatus } from "@/src/lib/types"
import { VALID_TRANSITIONS, STATUS_ORDER } from "@/src/lib/constants/booking"

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

function validateStatusTransition(currentStatus: BookingStatus, newStatus: BookingStatus): boolean {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) || false
}

export default function StatusManager({
  currentStatus,
  selectedStatus,
  onStatusChange,
  labels,
}: StatusManagerProps) {
  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">{labels.currentStatus}</span>
          <span className={`font-semibold px-4 py-2 rounded-full text-sm ${
            currentStatus === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {labels.statusOptions[currentStatus]}
          </span>
        </div>
      </div>
    )
  }

  const availableStatuses = Object.keys(labels.statusOptions)

  const options = STATUS_ORDER
    .filter(status => availableStatuses.includes(status))
    .map(status => ({
      value: status,
      label: labels.statusOptions[status],
      disabled: !validateStatusTransition(currentStatus as BookingStatus, status),
    })) 

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
