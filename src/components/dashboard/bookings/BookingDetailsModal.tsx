'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { X, User, Building, Package, MessageSquare, Edit, Save, Phone, MessageCircle } from 'lucide-react'
import { useSession } from 'next-auth/react'
import Dropdown from '@/src/components/ui/Dropdown'
import SupplierInfo from '@/src/components/equipment-details/SupplierInfo'
import CopyButton from '@/src/components/ui/CopyButton'
import { formatPhoneNumber } from '@/src/lib/format'

interface BookingDetailsModalProps {
  booking: any
  isOpen: boolean
  onClose: () => void
  onStatusUpdate: () => void
}

export default function BookingDetailsModal({ booking, isOpen, onClose, onStatusUpdate }: BookingDetailsModalProps) {
  const t = useTranslations('dashboard.bookings')
  const tBooking = useTranslations('booking')
  const { data: session } = useSession()
  const [status, setStatus] = useState(booking.status)
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || '')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const getUsageUnitLabel = (unit: string) => {
    const unitMap: Record<string, string> = {
      'hours': tBooking('hours'),
      'days': tBooking('days') || 'days',
      'km': tBooking('km'),
      'tons': tBooking('tons')
    }
    return unitMap[unit] || unit
  }

  const handleStatusUpdate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: booking._id,
          status,
          adminId: session?.user?.id,
          adminNotes
        })
      })

      if (response.ok) {
        onStatusUpdate()
        onClose()
      }
    } catch (error) {
      console.error('Failed to update booking:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCommission = (subtotal: number, usage: number) => {
    let rate = 0.10 // 10% standard
    if (usage >= 1000) rate = 0.08 // 8% for 1000+ hours
    else if (usage >= 500) rate = 0.09 // 9% for 500+ hours
    return subtotal * rate
  }

  const totalCommission = booking.bookingItems.reduce((sum: number, item: any) => 
    sum + calculateCommission(item.subtotal, item.usage), 0
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">{t('details.title')}</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Booking Info */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" />
                  {t('details.bookingInfo')}
                </h3>
                <div className="space-y-2 text-sm" dir="rtl">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('details.bookingId')}</span>
                    <span className="font-medium">{booking._id.slice(-6).toUpperCase().replace(/(.{3})(.{3})/, '$1-$2')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('details.totalAmount')}</span>
                    <span className="font-medium" dir="ltr">{booking.totalPrice.toLocaleString()} MRU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('details.commission')}</span>
                    <span className="font-medium text-green-600" dir="ltr">{totalCommission.toLocaleString()} MRU</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('details.createdAt')}</span>
                    <span className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Renter Info */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-600" />
                  {t('details.renterInfo')}
                </h3>
                <div className="space-y-2 text-sm" dir="rtl">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('details.name')}</span>
                    <span className="font-medium">
                      {booking.renterInfo[0]?.firstName} {booking.renterInfo[0]?.lastName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('details.email')}</span>
                    <span className="font-medium">{booking.renterInfo[0]?.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{t('details.phone')}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium" dir="ltr">{formatPhoneNumber(booking.renterInfo[0]?.phone)}</span>
                      <CopyButton text={booking.renterInfo[0]?.phone} size="sm" />
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('details.location')}</span>
                    <span className="font-medium">{booking.renterInfo[0]?.location}</span>
                  </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                  <a
                    href={`tel:${booking.renterInfo[0]?.phone}`}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    <Phone className="w-4 h-4" />
                    {t('details.call')}
                  </a>
                  <a
                    href={`https://wa.me/222${booking.renterInfo[0]?.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>

            {/* Equipment & Supplier Info */}
            <div className="space-y-6">
              {/* Equipment Items */}
              <div className="bg-green-50 rounded-lg p-4">
                <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                  <Package className="w-5 h-5 text-green-600" />
                  {t('details.equipmentItems')}
                </h3>
                <div className="space-y-3">
                  {booking.bookingItems.map((item: any, index: number) => (
                    <div key={index} className="bg-white rounded p-3 text-sm">
                      <div className="font-medium mb-2">{item.equipmentName}</div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-gray-600" dir="rtl">
                        <div className="flex justify-between"><span>{t('details.rate')}:</span> <span dir="ltr">{item.rate.toLocaleString()} MRU</span></div>
                        <div className="flex justify-between"><span>{t('details.usage')}:</span> <span>{item.usage} {getUsageUnitLabel(item.usageUnit || 'hours')}</span></div>
                        <div className="flex justify-between"><span>{t('details.subtotal')}:</span> <span dir="ltr">{item.subtotal.toLocaleString()} MRU</span></div>
                        <div className="flex justify-between"><span>{t('details.commission')}:</span> <span className="text-green-600" dir="ltr">{calculateCommission(item.subtotal, item.usage).toLocaleString()} MRU</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supplier Info */}
              {booking.supplierInfo && booking.supplierInfo.length > 0 ? (
                <SupplierInfo supplier={booking.supplierInfo[0]} variant="modal" />
              ) : (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Building className="w-5 h-5 text-gray-600" />
                    {t('details.supplierInfo')}
                  </h3>
                  <p className="text-sm text-gray-600">{t('equipment.createdByAdmin')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Messages */}
          {booking.renterMessage && (
            <div className="mt-6 bg-yellow-50 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-yellow-600" />
                {t('details.renterMessage')}
              </h3>
              <p className="text-sm text-gray-700">{booking.renterMessage}</p>
            </div>
          )}

          {/* Admin Controls */}
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Dropdown
                  label={t('details.status')}
                  options={[
                    { value: 'pending', label: t('status.pending') },
                    { value: 'paid', label: t('status.paid') },
                    { value: 'completed', label: t('status.completed') },
                    { value: 'cancelled', label: t('status.cancelled') }
                  ]}
                  value={status}
                  onChange={setStatus}
                  compact
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                {t('actions.cancel')}
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={loading}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {loading ? t('actions.saving') : t('actions.save')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}