export type Booking = {
  id: string
  name: string
  email: string
  phone: string
  comments: string | null
  datetime: string
  service: string
  barber: string
   timeZone?: string; // ✅ Make it optional if older bookings might not have it
}
