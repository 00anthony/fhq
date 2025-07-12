'use client'

import { useEffect, useState } from 'react'

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
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log({
      selectedBarber,
      selectedService,
      selectedDateTime,
      file,
      ...formData,
    })
    alert('Booking submitted!')
    onClose()
  }

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

        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
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

          {/* Date & Time */}
          <input
            type="datetime-local"
            value={selectedDateTime}
            onChange={e => setSelectedDateTime(e.target.value)}
            className="border p-2 rounded"
          />

          {/* Upload Style Photo */}
          <label className="text-sm">Upload a style reference (optional):</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="border p-2 rounded"
          />

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
            type="submit"
            className="bg-red-600 text-white py-2 rounded hover:bg-red-700 transition"
          >
            Confirm Booking
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
