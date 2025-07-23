'use client'

import { useBookingForm } from '@/hooks/useBookingForm'
import { BarberSelect } from './BarberSelect'
import { ServiceSelect } from './ServiceSelect'
import { DateTimePickerField } from './DateTimePickerField'
import { FileUpload } from './FileUpload'
import { ContactFields } from './ContactFields'

const barbers = ['Jay', 'Luis', 'Los']
const services = ['Haircut', 'Beard Trim', 'Fade + Line-Up', 'Full Service']

type BookingFormProps = {
  barberName?: string
  bookingId?: string
  onSuccess?: () => void
}

export function BookingForm({ barberName = '', bookingId, onSuccess }: BookingFormProps) {
  const {
    formData,
    handleInputChange,
    selectedBarber,
    setSelectedBarber,
    selectedService,
    setSelectedService,
    selectedDateTime,
    setSelectedDateTime,
    availableTimes,
    fileError,
    handleFileChange,
    handleSubmit,
    loading,
  } = useBookingForm(barberName, bookingId)

  const onSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e)
    if (onSuccess) onSuccess()
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col space-y-4 bg-neutral-800 p-6 rounded-xl shadow-md w-full max-w-md"
    >
      <h2 className="text-2xl text-center text-neutral-100">Book Your Appointment</h2>

      <BarberSelect selected={selectedBarber} onChange={setSelectedBarber} barbers={barbers} />

      <ServiceSelect selected={selectedService} onChange={setSelectedService} services={services} />

      <DateTimePickerField
        selected={selectedDateTime}
        onChange={setSelectedDateTime}
        availableTimes={availableTimes}
      />

      <FileUpload onChange={handleFileChange} error={fileError} />

      <ContactFields formData={formData} onChange={handleInputChange} />

      <button
        disabled={loading}
        type="submit"
        className="bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium disabled:bg-red-400"
      >
        {loading ? 'Booking...' : 'Confirm Booking'}
      </button>
    </form>
  )
}
