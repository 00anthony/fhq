'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { DateTimePickerField } from '@/components/Booking/DateTimePickerField'
import ConfirmModal from '@/components/Modals/ConfirmModal'
import SuccessModal from '@/components/Modals/SuccessModal'
import { getBarberById } from '@/data/barbers'

type Booking = {
  id: string
  name: string
  email: string
  phone: string
  service: string
  datetime: string
  barber: string
  comments?: string
  timeZone?: string
}

export default function ManageBookingClient() {
  const searchParams = useSearchParams()
  const bookingId = searchParams?.get('bookingId')

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null)
  const [availableTimes, setAvailableTimes] = useState<{ time: string; barbers: string[] }[]>([])
  const selectedBarber = booking?.barber || '' // This is now a barber ID
  const selectedService = booking?.service || ''
  const [isFetchingTimes, setIsFetchingTimes] = useState(false)
  const [isRescheduling, setIsRescheduling] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [modalType, setModalType] = useState<'reschedule' | 'cancel' | null>(null)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [successType, setSuccessType] = useState<'reschedule' | 'cancel' | 'booking' | null>(null)  

  // Get barber name from ID for display
  const getBarberName = (barberId: string): string => {
    try {
      const barber = getBarberById(barberId)
      return barber.name
    } catch {
      return barberId // fallback to ID if not found
    }
  }

  // 🔄 Fetch booking info
  useEffect(() => {
    if (!bookingId) return
    const fetchBooking = async () => {
      try {
        const res = await fetch(`/api/bookings?id=${bookingId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Failed to fetch booking')
        setBooking(data)
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message)
        } else {
          setError('An unknown error occurred')
        }
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [bookingId])

  // 📅 Fetch available time slots
  useEffect(() => {
    if (!selectedDateTime || !booking?.barber) return
    const fetchAvailability = async () => {
      const start = new Date(selectedDateTime)
      start.setHours(0, 0, 0, 0)
      const end = new Date(selectedDateTime)
      end.setHours(23, 59, 59, 999)

      const query = new URLSearchParams({
        start: start.toISOString(),
        end: end.toISOString(),
        barber: booking.barber, // This is now a barber ID
        service: booking.service || '',
      })

      setIsFetchingTimes(true)
      try {
        const res = await fetch(`/api/calendar/availability?${query}`)
        const data = await res.json()
        
        console.log('📬 Raw availability data for rescheduling:', data);
        
        // FIXED: Handle new API format with barberId, name, duration objects
        const slots = (data.availableSlots || []).map(
          (item: { 
            slot: string; 
            barbers: Array<{ barberId: string; name: string; duration: number }> 
          }) => ({
            time: item.slot,
            barbers: item.barbers.map(b => b.barberId), // Store barber IDs, not names
          })
        )
        
        console.log('✅ Processed slots for rescheduling:', slots)
        setAvailableTimes(slots)
      } catch (error) {
        console.error('❌ Error fetching availability for rescheduling:', error)
        setAvailableTimes([])
      } finally {
        setIsFetchingTimes(false)
      }
    }
    fetchAvailability()
  }, [selectedDateTime, booking?.barber, booking?.service])

  useEffect(() => {
    if (booking?.datetime) {
      setSelectedDateTime(new Date(booking.datetime))
    }
  }, [booking])

  // 📤 Reschedule booking
  const handleReschedule = async () => {
    if (!selectedDateTime || !bookingId) return alert('Please select a new time.')

    const originalTime = new Date(booking!.datetime).toISOString()
    const newTime = new Date(selectedDateTime).toISOString()
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

    if (originalTime === newTime) {
      alert('You have already booked this time.')
      return
    }

    setIsRescheduling(true)
    try {
      const res = await fetch('/api/bookings/reschedule', {
        method: 'POST',
        body: JSON.stringify({ 
          bookingId, 
          newDatetime: selectedDateTime,
          timeZone
        }),
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await res.json()
      if (result.success) {
        setSuccessMessage('Your booking has been rescheduled.')
        setSuccessType('reschedule')
        setShowSuccessModal(true)
      }
      else alert(result.error || 'Failed to reschedule')
    } catch (err) {
      console.error(err)
      alert('Something went wrong')
    } finally {
      setIsRescheduling(false)
    }
  }

  // ❌ Cancel booking
  const handleCancel = async () => {
    setIsCancelling(true)
    
    try {
      const res = await fetch('/api/bookings/cancel', {
        method: 'POST',
        body: JSON.stringify({ bookingId }),
        headers: { 'Content-Type': 'application/json' },
      })
      const result = await res.json()
      if (result.success) {
        setSuccessMessage('Your booking has been canceled.')
        setSuccessType('cancel')
        setShowSuccessModal(true)
      }
      else alert(result.error || 'Failed to cancel')
    } catch (err) {
      console.error(err)
      alert('Something went wrong.')
    } finally {
      setIsCancelling(false)
    }
  }


  if (loading) return <p className='min-h-screen text-center flex items-center justify-center'>Loading...</p>
  if (error) return <p className="text-red-500">Error: {error}</p>
  if (!booking) return <p>No booking found.</p>

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6 mt-20">
      <h1 id="booking-form-title" className="text-4xl uppercase text-center text-neutral-100 mb-2">Manage Your Appointment</h1>
      <p className="text-sm text-gray-300 text-center ">Review, reschedule, or cancel below</p>
      <div className="col-span-full mb-8 mx-auto w-24 border-b-4 border-red-900"></div>

      {/* Booking Details */}
      <div className="space-y-1 text-sm">
        <p><strong>Name:</strong> {booking.name}</p>
        <p><strong>Email:</strong> {booking.email}</p>
        <p><strong>Phone:</strong> {booking.phone}</p>
        <p><strong>Service:</strong> {booking.service}</p>
        <p><strong>Scheduled for: </strong> 
          {new Date(booking.datetime).toLocaleString('en-US', {
            dateStyle: 'long',
            timeStyle: 'short',
          })}
          ({booking.timeZone || 'local time'})
        </p>
        <p><strong>Barber:</strong> {getBarberName(booking.barber)}</p>
        {booking.comments && <p><strong>Comments:</strong> {booking.comments}</p>}
      </div>

      {/* Reschedule Section */}
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Reschedule</h2>
        <DateTimePickerField
          selected={selectedDateTime}
          onChange={setSelectedDateTime}
          availableTimes={availableTimes}
          selectedBarber={selectedBarber} // Pass barber ID
          selectedService={selectedService}
          isLoading={isFetchingTimes}
        />   
      </div>

      {/*  Buttons */}
      <div className='flex space-8 justify-evenly'>
        
        {/* Cancel Button */}
        <button
          onClick={() => setModalType('cancel')}
          disabled={isCancelling}
          className="bg-red-900 text-white px-4 py-2 rounded-lg hover:bg-red-800 cursor-pointer"
        >
          {isCancelling ? 'Cancelling...' : 'Cancel Booking'}
        </button>

        {/* Reschedule Button */}
        <button
          onClick={() => setModalType('reschedule')}
          disabled={isRescheduling}
          className="bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-600 cursor-pointer"
        >
          {isRescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
        </button>
      </div>
      

      <ConfirmModal
        isOpen={modalType === 'reschedule'}
        title="Confirm Reschedule"
        message={
          selectedDateTime
            ? `Are you sure you want to move your appointment to ${new Date(selectedDateTime).toLocaleString()}?`
            : 'Please select a new time before rescheduling.'
        }
        confirmText="Yes, reschedule"
        cancelText="Go Back"
        confirmColor="green"
        onConfirm={() => {
          setModalType(null)
          handleReschedule()
        }}
        onCancel={() => setModalType(null)}
        loading={isRescheduling}
      />

      <ConfirmModal
        isOpen={modalType === 'cancel'}
        title="Cancel Booking"
        message="Are you sure you want to cancel your booking? This cannot be undone."
        confirmText="Yes, cancel it"
        cancelText="Go Back"
        confirmColor="red"
        onConfirm={() => {
          setModalType(null)
          handleCancel()
        }}
        onCancel={() => setModalType(null)}
        loading={isCancelling}
      />

      <SuccessModal
        show={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false)
          setSuccessType(null)
          setSuccessMessage('')
        }}
        message={successMessage}
        type={successType || 'booking'}
      />

    </div>
  )
}