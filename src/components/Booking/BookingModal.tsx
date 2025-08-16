import { BookingForm } from '@/components/Booking/BookingForm'

type BookingModalProps = {
  barberName: string
  onClose: () => void
  bookingId?: string
}

export default function BookingModal({ barberName, onClose, bookingId }: BookingModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 z-[999] flex justify-center items-center" onClick={onClose}>
      <div
        className="rounded-xl w-full max-w-5xl relative overflow-y-auto max-h-[90vh] scrollbar-hide"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:right-8 text-gray-500 hover:text-black text-xl font-bold"
        >
          ✕
        </button>
        <BookingForm barberName={barberName} bookingId={bookingId} />
      </div>
    </div>
  )
}
