import Hero from "@/components/Hero";
import Intro from "@/components/Intro";
import BarberSection from "@/components/BarberSection";

export const metadata = {
  title: "Ants Booking | Home",
  description: "Book your appointments with Ants Booking - fast, simple, reliable.",
};

export default function Home() {
  return (
    <>
      <Hero />
      {/* added bg-color to hide rounded corners */}
      <div className="bg-gray-100 text-black border-black"> 
        <Intro />
      </div>   
      <BarberSection />
    </>
  );
}
