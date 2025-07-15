'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import axios from 'axios'
import { Booking } from '@/types'

export default function ManageBookingClient() {
  const searchParams = useSearchParams()
  const bookingId = searchParams ? searchParams.get('id') : ''
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [error, setError] = useState('')
  const [newDatetime, setNewDatetime] = useState('')
  const [actionStatus, setActionStatus] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) return
      try {
        const res = await axios.get<Booking>(`/api/bookings?id=${bookingId}`)
        setBooking(res.data)
      } catch (err) {
        console.error(err)
        setError('Booking not found or an error occurred.')
      } finally {
        setLoading(false)
      }
    }
    fetchBooking()
  }, [bookingId])

  useEffect(() => {
    if (booking) {
      const isoString = new Date(booking.datetime).toISOString()
      const localDatetime = isoString.slice(0, 16)
      setNewDatetime(localDatetime)
    }
  }, [booking])

  const handleCancel = async () => {
    setActionLoading(true)
    try {
      await axios.post('/api/bookings/cancel', { bookingId })
      setActionStatus('Booking successfully canceled.')
      setBooking(null)
    } catch {
      setActionStatus('Failed to cancel booking.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleReschedule = async () => {
    setActionLoading(true)
    if (!newDatetime || !booking) return

    try {
      await axios.post('/api/bookings/reschedule', { bookingId, newDatetime })
      setActionStatus('Booking successfully rescheduled.')

      setBooking({
        id: booking.id,
        name: booking.name,
        email: booking.email,
        phone: booking.phone,
        comments: booking.comments,
        datetime: newDatetime,
        service: booking.service,
        barber: booking.barber,
      })
    } catch (err) {
      console.error(err)
      setActionStatus('Failed to reschedule booking.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) return <p className="p-4">Loading...</p>
  if (error) return <p className="p-4 text-red-600">{error}</p>

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-semibold mb-4">Manage Booking</h1>

      {!booking && actionStatus ? (
        <p className="text-green-600">{actionStatus}</p>
      ) : booking ? (
        <div className="space-y-4">
          <p><strong>Client:</strong> {booking.name}</p>
          <p><strong>Barber:</strong> {booking.barber}</p>
          <p><strong>Service:</strong> {booking.service}</p>
          <p><strong>When:</strong> {new Date(booking.datetime).toLocaleString()}</p>

          <div className="border-t pt-4 space-y-2">
            <label className="block font-medium">New Time:</label>
            <input
              type="datetime-local"
              value={newDatetime}
              onChange={e => setNewDatetime(e.target.value)}
              className="border p-2 rounded w-full"
            />
            <button
              disabled={actionLoading || !newDatetime}
              onClick={handleReschedule}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              Reschedule
            </button>
          </div>

          <button
            disabled={actionLoading || !newDatetime}
            onClick={handleCancel}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            Cancel Booking
          </button>

          {actionStatus && (
            <p className={`mt-2 ${actionStatus.includes('Failed') ? 'text-red-600' : 'text-green-600'}`}>
              {actionStatus}
            </p>
          )}
        </div>
      ) : null}
    </div>
  )
}
