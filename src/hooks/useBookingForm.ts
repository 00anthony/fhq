import { useState, useEffect } from 'react'

export function useBookingForm(initialBarber = '', bookingId?: string) {
  const [selectedBarber, setSelectedBarber] = useState(initialBarber)
  const [selectedService, setSelectedService] = useState('')
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null)
  const [availableTimes, setAvailableTimes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', comments: '' })

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif']

  // handle input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // handle file
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null)
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (!ALLOWED_TYPES.includes(selectedFile.type)) {
        setFileError('Invalid file type. Only JPG, PNG, GIF allowed.')
        return
      }
      if (selectedFile.size > MAX_FILE_SIZE) {
        setFileError('File size too large. Max 5 MB allowed.')
        return
      }
      setFile(selectedFile)
    }
  }

  // Fetch available times
  useEffect(() => {
    if (!selectedDateTime) return setAvailableTimes([])
    const dateStr = selectedDateTime.toISOString().split('T')[0]
    const startOfDay = new Date(dateStr)
    const endOfDay = new Date(dateStr)
    endOfDay.setHours(23, 59, 59, 999)
    const params = new URLSearchParams({
      start: startOfDay.toISOString(),
      end: endOfDay.toISOString(),
    })
    if (bookingId) params.append('bookingId', bookingId)
    fetch(`/api/calendar/availability?${params}`)
      .then(res => res.json())
      .then(data => setAvailableTimes(data.availableSlots || []))
      .catch(() => setAvailableTimes([]))
  }, [selectedDateTime, bookingId])

  // handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !selectedDateTime || !selectedService || !selectedBarber) {
      alert('Please fill out all required fields.')
      return
    }
    setLoading(true)
    const formDataToSend = new FormData()
    formDataToSend.append('name', formData.name)
    formDataToSend.append('email', formData.email)
    formDataToSend.append('phone', formData.phone)
    formDataToSend.append('comments', formData.comments)
    formDataToSend.append('datetime', selectedDateTime.toISOString())
    formDataToSend.append('service', selectedService)
    formDataToSend.append('barber', selectedBarber)
    formDataToSend.append('timeZone', Intl.DateTimeFormat().resolvedOptions().timeZone)
    if (file) formDataToSend.append('upload', file)

    try {
      const res = await fetch('/api/book', { method: 'POST', body: formDataToSend })
      const result = await res.json()
      if (result.success) alert('Booking confirmed!')
      else alert('Booking failed: ' + (result.error || 'Unknown error'))
    } catch (err) {
      console.error('Booking failed', err)
      alert('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return {
    formData, setFormData, handleInputChange,
    selectedBarber, setSelectedBarber,
    selectedService, setSelectedService,
    selectedDateTime, setSelectedDateTime,
    availableTimes,
    fileError, handleFileChange,
    handleSubmit, loading,
  }
}
