import { Save } from 'lucide-react'
import Dropdown from '@/src/components/ui/Dropdown'
import Button from '@/src/components/ui/Button'

interface AdminControlsProps {
  status: string
  onStatusChange: (status: string) => void
  onSave: () => void
  onCancel: () => void
  loading: boolean
  isChanged: boolean
  labels: {
    status: string
    statusOptions: {
      pending: string
      paid: string
      completed: string
      cancelled: string
    }
    cancel: string
    save: string
    saving: string
  }
}

export default function AdminControls({ status, onStatusChange, onSave, onCancel, loading, isChanged, labels }: AdminControlsProps) {
  return (
    <div className="mt-6 border-t border-gray-200 pt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Dropdown
            label={labels.status}
            options={[
              { value: 'pending', label: labels.statusOptions.pending },
              { value: 'paid', label: labels.statusOptions.paid },
              { value: 'completed', label: labels.statusOptions.completed },
              { value: 'cancelled', label: labels.statusOptions.cancelled }
            ]}
            value={status}
            onChange={onStatusChange}
            compact
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-3 mt-4">
        <button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:text-gray-800">
          {labels.cancel}
        </button>
        <Button onClick={onSave} disabled={loading || !isChanged} className="flex items-center gap-2">
          <Save className="w-4 h-4" />
          {loading ? labels.saving : labels.save}
        </Button>
      </div>
    </div>
  )
}
