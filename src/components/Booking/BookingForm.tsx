'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useBookingForm } from '@/hooks/useBookingForm'
import { BarberSelect } from './BarberSelect'
import { ServiceSelect } from './ServiceSelect'
import { DateTimePickerField } from './DateTimePickerField'
import { FileUpload } from './FileUpload'
import { ContactFields } from './ContactFields'
import { BarberTimeSelect } from './BarberTimeSelect'
import { BookingSummary } from './BookingSummary'
import { allBarbers } from '@/data/services';
import { servicesData } from '@/data/services'
import { getBarberServiceMap } from "@/lib/utils/barberServiceMap";
import { getServiceSummary } from '@/lib/utils/serviceSummary'
import SuccessModal from '../SuccessModal'


const services = servicesData.map(s => s.name)

type BookingFormProps = {
  barberName?: string
  bookingId?: string
}

export function BookingForm({ barberName = '', bookingId }: BookingFormProps) {
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
    isFetchingTimes
  } = useBookingForm(barberName, bookingId)

  const onSubmit = async (e: React.FormEvent) => {
    const result = await handleSubmit(e);

    if (result?.success) {
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push(`/manage-booking${result.bookingId ? `?bookingId=${result.bookingId}` : ''}`);
      }, 2500);
    } else if (result && !result.success) {
      // Optional: handle known error cases (e.g. show a message)
      console.error('Booking failed:', result.error);
    } else {
      // result is undefined or unexpected
      console.error('Booking submit failed without a result.');
    }
  }

  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)

  const barberServices = getBarberServiceMap();

  //filters services by barber
  const availableServices =
    selectedBarber && selectedBarber.toLowerCase() !== 'any'
      ? barberServices[selectedBarber] || []
      : services

  const summaryService = getServiceSummary(selectedService, selectedBarber, selectedBarberForTime)

  const selectedServiceObject = servicesData.find(s => s.name === selectedService);

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
        selectedBarber={selectedBarber}
        selectedService={selectedService}
        isLoading={isFetchingTimes}
      />

      {availableBarbersForSelectedTime.length > 0 && (
        <BarberTimeSelect
          availableBarbers={availableBarbersForSelectedTime}
          selectedBarber={selectedBarberForTime}
          onChange={setSelectedBarberForTime}
          serviceBarbers={selectedServiceObject?.barbers ?? []}
        />
      )}

      <ContactFields formData={formData} onChange={handleInputChange} />

      <FileUpload onChange={handleFileChange} error={fileError} />

      <BookingSummary
        barber={selectedBarber.toLowerCase() === 'any' ? selectedBarberForTime : selectedBarber}
        service={summaryService}
        date={selectedDateTime}
        time={selectedDateTime}
      />

      <SuccessModal
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Your appointment has been booked!"
        type="booking"
      />

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
