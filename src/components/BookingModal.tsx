'use client'

import 'react-datepicker/dist/react-datepicker.css'
import { useEffect, useState } from 'react'
import DatePicker from 'react-datepicker'

type BookingModalProps = {
  barberName: string
  onClose: () => void
}

const barbers = ['Jay', 'Luis', 'Los']
const services = ['Haircut', 'Beard Trim', 'Fade + Line-Up', 'Full Service']


export default function BookingModal({ barberName, onClose }: BookingModalProps) {
  const [selectedBarber, setSelectedBarber] = useState(barberName || '')
  const [selectedService, setSelectedService] = useState('')
  const [selectedDateTime, setSelectedDateTime] = useState('')
  const [selectedDate, setSelectedDate] = useState('');
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif']


  const [file, setFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    comments: '',
  })

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      if (!ALLOWED_TYPES.includes(selectedFile.type)) {
        setFileError('Invalid file type. Only JPG, PNG, GIF allowed.')
        setFile(null)
        return
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        setFileError('File size too large. Max 5 MB allowed.')
        setFile(null)
        return
      }

      setFile(selectedFile)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFileError(null)

    // Basic required fields validation (you can expand)
    if (!formData.name || !formData.email || !selectedDateTime || !selectedService || !selectedBarber) {
      alert('Please fill out all required fields.')
      return
    }

    setLoading(true)

    const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formDataToSend = new FormData()
    formDataToSend.append('name', formData.name)
    formDataToSend.append('email', formData.email)
    formDataToSend.append('phone', formData.phone)
    formDataToSend.append('comments', formData.comments)
    formDataToSend.append('datetime', selectedDateTime)
    formDataToSend.append('service', selectedService)
    formDataToSend.append('barber', selectedBarber)
    formDataToSend.append('timeZone', userTimeZone);

    if (file) {
      formDataToSend.append('upload', file)
    }

    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        body: formDataToSend,
      })

      const result = await res.json()
      if (result.success) {
        alert('Booking confirmed!')
        onClose()
      } else {
        alert('Booking failed: ' + (result.error || 'Unknown error'))
      }
    } catch (err) {
      console.error('Booking failed', err)
      alert('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }



  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate) return;

      const startOfDay = new Date(selectedDate);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23, 59, 59, 999);

      const params = new URLSearchParams({
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString(),
      });

      const res = await fetch(`/api/calendar/availability?${params}`);
      const data = await res.json();
      setAvailableTimes(data.availableSlots || []);
    };

    fetchAvailability();
  }, [selectedDate]);


  return (
    <div
      className="fixed inset-0 z-[999] bg-black/80 flex justify-center items-center px-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 max-w-md w-full text-black relative overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl mb-4 text-center">Book {barberName}</h2>

        <form onSubmit={handleSubmit} aria-busy={loading} className="flex flex-col space-y-4">
          {/* Barber Dropdown */}
          <select
            value={selectedBarber}
            onChange={e => setSelectedBarber(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Barber</option>
            {barbers.map(name => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          {/* Service Dropdown */}
          <select
            value={selectedService}
            onChange={e => setSelectedService(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="">Select Service</option>
            {services.map(service => (
              <option key={service} value={service}>{service}</option>
            ))}
          </select>

          {/* Select Date */}
          <DatePicker
            selected={selectedDate ? new Date(selectedDate) : null}
            onChange={(date: Date | null) => {
              if (date) {
                const isoDate = date.toISOString().split('T')[0]; // yyyy-mm-dd
                setSelectedDate(isoDate);
                setSelectedDateTime('');
              }
            }}
            className="border p-2 rounded w-full"
            placeholderText="Select a date"
            dateFormat="MMMM d, yyyy"
          />


          {/* Time Slot Dropdown */}
          {availableTimes.length > 0 && (
            <select
              value={selectedDateTime}
              onChange={(e) => setSelectedDateTime(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select a Time</option>
              {availableTimes.map(time => {
                const localTime = new Date(time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                });
                return (
                  <option key={time} value={time}>
                    {localTime}
                  </option>
                );
              })}
            </select>
          )}

          {/* Upload Style Photo */}
          <label className="text-sm">Upload a style reference (optional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border p-2 rounded"
          />
          {fileError && (
            <p className="text-red-600 text-sm mt-1">{fileError}</p>
          )}

          {/* Contact Info */}
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleInputChange}
            className="border p-2 rounded"
          />
          <textarea
            name="comments"
            placeholder="Additional notes or preferences"
            value={formData.comments}
            onChange={handleInputChange}
            className="border p-2 rounded resize-none"
          ></textarea>

          <button
            disabled={loading}
            type="submit"
            className="bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-lg"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
