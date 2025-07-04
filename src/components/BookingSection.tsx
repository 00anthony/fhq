import SectionHeader from './SectionHeader';
import BarberCard from './BarberCard';
import { barbers, Barber } from '../data/barbers';


const BookingSection = () => {
  return (
    <section 
      className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8"
      id="booking"
      aria-labelledby="booking-heading"
    >
      <div id="booking-heading" data-aos="zoom-in" data-aos-delay="500">
        <SectionHeader title="Booking" />
      </div>
      
      <div 
        className="grid gap-10 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
        data-aos="fade-up" data-aos-delay="500"
      > 
        {barbers.map((barber: Barber) => (
          <BarberCard key={barber.bookLink} {...barber} />
        ))}

      </div>
    </section>
  );
};

export default BookingSection;
