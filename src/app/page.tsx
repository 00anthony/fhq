import Hero from "@/components/Hero/Hero";
import Intro from "@/components/About/Intro";
import BarberSection from "@/components/Barbers/BarberSection";

export const metadata = {
  title: "Ants Booking | Home",
  description: "Book your appointments with Ants Booking - fast, simple, reliable.",
};

export default function Home() {
  return (
    <>
      <Hero />

      <div className="text-white bg-neutral-900 "> 
        <Intro />
      </div>

      <div className="bg-neutral-900 bg-gradient-to-b from-transparent to-neutral-950">
        <BarberSection />
      </div>   
      
    </>
  );
}
