import { useState, useEffect } from 'react'
import { getBarberServiceMapById } from "@/lib/utils/barberServiceMap";
import { DateTime } from 'luxon'

export function useBookingForm(initialBarber = '', bookingId?: string) {
  const [selectedBarber, setSelectedBarber] = useState(initialBarber)
  const [selectedService, setSelectedService] = useState('')
  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null)
  const [availableTimes, setAvailableTimes] = useState<{ time: string; barbers: string[] }[]>([])
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', comments: '' })
  const [availableBarbersForSelectedTime, setAvailableBarbersForSelectedTime] = useState<string[]>([])
  const [selectedBarberForTime, setSelectedBarberForTime] = useState<string>(initialBarber || '')
  const [isFetchingTimes, setIsFetchingTimes] = useState(false);

  const isAnyBarber = (barber: string) => barber === 'any' // Simplified check
  const barberServices = getBarberServiceMapById(); // Use ID-based map

  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5 MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif']

  // handle input
  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // handle file
  const handleFileChange = (file: File | null): boolean => {
    setFileError(null)

    if (!file) {
      setFile(null)
      return false
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      setFileError('Invalid file type. Only JPG, PNG, GIF allowed.')
      return false
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('File size too large. Max 5 MB allowed.')
      return false
    }

    setFile(file)
    return true
  }

  // Fetch availability whenever date, barber or bookingId changes
 useEffect(() => {
    console.log('🟢 selectedService changed:', selectedService);
    if (!selectedDateTime || !selectedService) {
      setAvailableTimes([])
      return
    }

    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const selectedDT = DateTime.fromJSDate(selectedDateTime, { zone: timeZone });
    const startISO = selectedDT.startOf('day').toUTC().toISO() || '';
    const endISO = selectedDT.endOf('day').toUTC().toISO() || '';

    const params = new URLSearchParams({
      start: startISO,
      end: endISO,
      barber: isAnyBarber(selectedBarber) ? 'any' : selectedBarber, // selectedBarber is now ID
      service: selectedService,
    })

    if (bookingId) params.append('bookingId', bookingId)
      
    setIsFetchingTimes(true);

    console.log('📡 Fetching with service:', selectedService, 'barber:', selectedBarber);

    fetch(`/api/calendar/availability?${params.toString()}`)
      .then(res => res.json())
      .then(data => {
        console.log('📬 Raw availability data:', data);
        console.log('📬 Available slots count:', data.availableSlots?.length || 0);
        console.log('📬 First slot example:', data.availableSlots?.[0]);
        
        if (selectedBarber && !isAnyBarber(selectedBarber)) {
          // Filter slots for specific barber ID
          const slots = (data.availableSlots || [])
            .filter((slot: { slot: string; barbers: Array<{ barberId: string; name: string; duration: number }> }) => {
              // Check if any barber in the slot matches our selected barber ID
              return slot.barbers.some(b => b.barberId === selectedBarber)
            })
            .map((slot: { slot: string; barbers: Array<{ barberId: string; name: string; duration: number }> }) => ({
              time: slot.slot,
              barbers: slot.barbers.map(b => b.barberId), // Keep IDs
            }))
          setAvailableTimes(slots)
        } else {
          // Define the expected data shape for clarity
          type BarberData = { barberId: string; name: string; duration: number };
          type AvailabilitySlot = { slot: string; barbers: BarberData[] };

          // Handle "any" barber selection safely
          const slots = ((data.availableSlots as AvailabilitySlot[]) || []).map((item) => ({
            time: item.slot,
            barbers: item.barbers.map((b: BarberData) => b.barberId),
          }));
          setAvailableTimes(slots)
          console.log('✅ Slots set for UI:', slots)
        }
      })
      .catch(error => {
        console.error('❌ Error fetching availability:', error)
        setAvailableTimes([])
      })
      .finally(() => {
        setIsFetchingTimes(false);
      });
      console.log('Selected barber:', selectedBarber)
  }, [selectedDateTime, selectedBarber, selectedService, bookingId])

  // Update available barbers for selected time whenever availableTimes or selectedDateTime changes
  useEffect(() => {
    if (!selectedDateTime || !availableTimes.length) {
      setAvailableBarbersForSelectedTime([])
      setSelectedBarberForTime('')
      return
    }

    const selectedTimeMs = selectedDateTime.getTime();
    const slot = availableTimes.find(slot => {
      const slotTimeMs = new Date(slot.time).getTime();
      return Math.abs(slotTimeMs - selectedTimeMs) < 60 * 1000; // within 1 minute
    });

    if (slot && slot.barbers.length) {
      setAvailableBarbersForSelectedTime(slot.barbers)

      // ⚠️ Sync logic: If the current selected barber is still available for the slot, keep it.
      if (slot.barbers.includes(selectedBarber)) {
        setSelectedBarberForTime(selectedBarber)
      } else {
        // Otherwise pick the first available one
        setSelectedBarberForTime(slot.barbers[0])
      }

    } else {
      setAvailableBarbersForSelectedTime([])
      setSelectedBarberForTime('')
    }
  }, [selectedDateTime, availableTimes, selectedBarber])

  useEffect(() => {
    console.log('Fetched slots:', availableTimes)
  }, [availableTimes])

  useEffect(() => {
    if (selectedBarber && !isAnyBarber(selectedBarber)) {
      const servicesOffered = barberServices[selectedBarber] || [] // Now using ID

      if (!servicesOffered.includes(selectedService)) {
        setSelectedService('')
        setSelectedDateTime(null)
      }

      if (servicesOffered.length === 0) {
        setSelectedService('')
        setSelectedDateTime(null)
      }
    }
  }, [selectedBarber, selectedService, barberServices])

  // handle submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !selectedDateTime || !selectedService || !selectedBarber) {
      alert('Please fill out all required fields.');
      return { success: false, error: 'Missing required fields' };
    }
    
    if (!availableBarbersForSelectedTime.includes(selectedBarberForTime)) {
      alert('The selected barber is no longer available for this time. Please choose another time or barber.');
      return { success: false, error: 'Barber not available' };
    }

    setLoading(true)
    const formDataToSend = new FormData()
    formDataToSend.append('name', formData.name)
    formDataToSend.append('email', formData.email)
    formDataToSend.append('phone', formData.phone)
    formDataToSend.append('comments', formData.comments)
    formDataToSend.append('datetime', selectedDateTime.toISOString())
    formDataToSend.append('service', selectedService)
    formDataToSend.append('barber', selectedBarberForTime)
    formDataToSend.append('timeZone', Intl.DateTimeFormat().resolvedOptions().timeZone)
    if (file) formDataToSend.append('upload', file)

    try {
      const res = await fetch('/api/book', { method: 'POST', body: formDataToSend })
      const result = await res.json()
      
      if (result.success) {
        return { success: true, bookingId: result.bookingId } 
      } else {
        alert('Booking failed: ' + (result.error || 'Unknown error'))
        return { success: false, error: result.error || 'Unknown error' }
      }
    } catch (err) {
      console.error('Booking failed', err)
      alert('Something went wrong.')
      return { success: false, error: 'Network error'}
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
    loading, handleSubmit,
    availableBarbersForSelectedTime,
    selectedBarberForTime, setSelectedBarberForTime,
    isFetchingTimes,
  }
}