'use client'

import { useBookingForm } from '@/hooks/useBookingForm'
import { BarberSelect } from './BarberSelect'
import { ServiceSelect } from './ServiceSelect'
import { DateTimePickerField } from './DateTimePickerField'
import { FileUpload } from './FileUpload'
import { ContactFields } from './ContactFields'
import { BarberTimeSelect } from './BarberTimeSelect'
import { getBarberServiceMap } from "@/lib/utils/barberServiceMap";
import { allBarbers } from '@/data/services';

const services = ['Haircut', 'Beard Trim', 'Haircut & Design', 'Hair + Beard', 'Deluxe Haircut', 'Consultation']

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
    availableBarbersForSelectedTime,
    selectedBarberForTime,
    setSelectedBarberForTime,
  } = useBookingForm(barberName, bookingId)

  const onSubmit = async (e: React.FormEvent) => {
    await handleSubmit(e)
    if (onSuccess) onSuccess()
  }

  const barberServices = getBarberServiceMap();

  //filters services by barber
  const availableServices =
    selectedBarber && selectedBarber.toLowerCase() !== 'any'
      ? barberServices[selectedBarber] || []
      : services

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col space-y-4 bg-neutral-800 p-6 rounded-xl shadow-md w-full max-w-md"
    >
      <h1 id="booking-form-title" className="text-2xl text-center text-neutral-100">Book Your Appointment</h1>

      <BarberSelect
        selected={selectedBarber}
        onChange={setSelectedBarber}
        barbers={allBarbers}
        selectedService={selectedService}
      />

      <ServiceSelect 
        selected={selectedService} 
        onChange={setSelectedService} 
        services={availableServices} 
        selectedBarber={selectedBarber}
        disabled={availableServices.length === 0}
      />

      <DateTimePickerField
        selected={selectedDateTime}
        onChange={setSelectedDateTime}
        availableTimes={availableTimes}
      />

      {availableBarbersForSelectedTime.length > 0 && (
        <BarberTimeSelect
          availableBarbers={availableBarbersForSelectedTime}
          selectedBarber={selectedBarberForTime}
          onChange={setSelectedBarberForTime}
        />
      )}

      <FileUpload onChange={handleFileChange} error={fileError} />

      <ContactFields formData={formData} onChange={handleInputChange} />

      <button
        disabled={loading}
        type="submit"
        className={`bg-red-900 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium disabled:bg-red-400 ${
          loading ? 'cursor-not-allowed opacity-50' : ''
        }`}
      >
        {loading ? 'Booking...' : 'Confirm Booking'}
      </button>
    </form>
  )
}
