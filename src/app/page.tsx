import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import BookingSection from "@/components/BookingSection";

export const metadata = {
  title: "Ants Booking | Home",
  description: "Book your appointments with Ants Booking - fast, simple, reliable.",
};

export default function Home() {
  return (
    <>
      <Hero />
      <Intro />
      <BookingSection />
    </>
  );
}
