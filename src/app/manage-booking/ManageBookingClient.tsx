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
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchBooking() {
      if (!bookingId) return
      try {
        const res = await axios.get<Booking>(`/api/bookings?id=${bookingId}`)
        setBooking(res.data)
        setSelectedDate(new Date(res.data.datetime)); // <- INIT SELECTED DATE
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
    if (!selectedDate) return;

    const fetchAvailability = async () => {
      const startOfDay = new Date(selectedDate);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const params = new URLSearchParams({
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString(),
      });

      const res = await fetch(`/api/calendar/availability?${params}`);
      const data = await res.json();
      setAvailableSlots(data.availableSlots || []);
    };

    fetchAvailability();
  }, [selectedDate]);



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
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const isoDatetime = new Date(newDatetime).toISOString(); // Convert to UTC ISO

      await axios.post('/api/bookings/reschedule', { 
        bookingId, 
        newDatetime: isoDatetime,
        timeZone: userTimeZone
      });
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
    <div className="max-w-md mx-auto p-4 pt-20">
      <h1 className="text-2xl font-semibold mb-4">Manage Booking</h1>

      {!booking && actionStatus ? (
        <p className="text-green-600">{actionStatus}</p>
      ) : booking ? (
        <div className="space-y-4">
          <p><strong>Client:</strong> {booking.name}</p>
          <p><strong>Barber:</strong> {booking.barber}</p>
          <p><strong>Service:</strong> {booking.service}</p>
          <p>
            <strong>When:</strong>{' '}
            {new Date(booking.datetime).toLocaleString('en-US', {
              dateStyle: 'long',
              timeStyle: 'short',
              timeZone: booking.timeZone || undefined
            })} 
            {booking.timeZone ? ` (${booking.timeZone})` : ''}
          </p>


          <div className="border-t pt-4 space-y-2">
            <label className="block font-medium">New Date:</label>
            <input
              type="date"
              value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
              min={new Date().toISOString().split('T')[0]}
              max={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
              onChange={(e) => {
                const date = new Date(e.target.value);
                setSelectedDate(date);
              }}
              className="border p-2 rounded w-full"
            />
            <select
              value={newDatetime}
              onChange={(e) => setNewDatetime(e.target.value)}
              className="border p-2 rounded w-full mt-2"
              disabled={!availableSlots.length}
            >
              <option value="">Select a new time</option>
              {availableSlots.map((slot) => (
                <option key={slot} value={slot}>
                  {new Date(slot).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                    timeZone: booking.timeZone || undefined,
                  })}
                </option>
              ))}
            </select>

            {!availableSlots.length && selectedDate && (
              <p className="text-sm text-red-600">No available times for this date. Please pick another.</p>
            )}

            <button
              disabled={actionLoading || !newDatetime}
              onClick={handleReschedule}
              className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {actionLoading ? "Rescheduling..." : "Reschedule"}
            </button>
          </div>

          <button
            disabled={actionLoading}
            onClick={handleCancel}
            className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
          >
            {actionLoading ? "Cancelling..." : "Cancel"}
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
