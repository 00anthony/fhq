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
import { allBarbers } from '@/data/barbers';
import { servicesData } from '@/data/services'
import { getBarberServiceMapById } from "@/lib/utils/barberServiceMap";
import { getServiceSummary } from '@/lib/utils/serviceSummary'
import SuccessModal from '../Modals/SuccessModal'

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
      console.error('Booking failed:', result.error);
    } else {
      console.error('Booking submit failed without a result.');
    }
  }

  const router = useRouter()
  const [showSuccess, setShowSuccess] = useState(false)

  const barberServices = getBarberServiceMapById(); // Use ID-based map

  //filters services by barber
  const availableServices =
    selectedBarber && selectedBarber !== 'any'
      ? barberServices[selectedBarber] || []
      : services

  const summaryService = getServiceSummary(selectedService, selectedBarber, selectedBarberForTime)

  const selectedServiceObject = servicesData.find(s => s.name === selectedService);

  // Convert barber names to barber objects with IDs and durations
  const availableBarbersWithInfo = availableBarbersForSelectedTime.map(barberName => {
    // Find the barber by name to get their ID
    const barber = allBarbers.find(b => b.name === barberName);
    
    if (!barber) {
      console.warn(`Could not find barber with name: ${barberName}`);
      return {
        barberId: barberName.toLowerCase().replace(/\s+/g, ''), // fallback ID
        name: barberName,
        duration: 30 // fallback duration
      };
    }

    // Get duration from the selected service for this barber
    const serviceDuration = selectedServiceObject?.barbers
      .find(sb => sb.barberId === barber.id)?.duration || 30;

    return {
      barberId: barber.id,
      name: barber.name,
      duration: serviceDuration
    };
  });

  return (
    <div className="w-full max-w-5xl mx-auto md:px-4">
      <form
        onSubmit={onSubmit}
        className="grid grid-cols-1 md:grid-cols-2 gap-x-20 bg-neutral-800 p-8 rounded-xl shadow-md"
      >
        <h1 id="booking-form-title" className="col-span-full text-4xl uppercase text-center text-neutral-100 mb-2">Book Your Appointment</h1>
        <div className="col-span-full mb-8 mx-auto w-24 border-b-4 border-red-900"></div>

        {/* LEFT COLUMN */}
        <div className='col-span-1 flex flex-col space-y-4'>
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

          {availableBarbersWithInfo.length > 0 && (
            <BarberTimeSelect
              availableBarbers={availableBarbersWithInfo} // Use converted array
              selectedBarber={selectedBarberForTime}
              onChange={setSelectedBarberForTime}
              serviceBarbers={selectedServiceObject?.barbers ?? []}
            />
          )}
        </div>
        
        {/* RIGHT COLUMN */}
        <div className='col-span-1 flex flex-col space-y-4'>
          <ContactFields formData={formData} onChange={handleInputChange} />

          <FileUpload onChange={handleFileChange} error={fileError} />

          <BookingSummary
            barber={selectedBarber === 'any' ? selectedBarberForTime : selectedBarber}
            service={summaryService}
            date={selectedDateTime}
            time={selectedDateTime}
          />
          <button
            disabled={loading}
            type="submit"
            className={`bg-red-900 text-white py-2 rounded-lg hover:bg-red-700 transition font-medium disabled:bg-red-400 cursor-pointer${
              loading ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            {loading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </div>
        
        <SuccessModal
          show={showSuccess}
          onClose={() => setShowSuccess(false)}
          message="Your appointment has been booked!"
          type="booking"
        />
        
      </form>
    </div>
  )
}