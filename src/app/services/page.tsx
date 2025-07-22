"use client";
import { useState } from "react";
import { servicesData, barbers, categories } from "@/data/services";
import { BarberOption } from "@/types/services"
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import ExpandedServiceContent from '@/components/ExpandedServiceContent'; // adjust path

const ModalGallery = dynamic(() => import("@/components/ModalGallery"), { ssr: false });

export default function ServicesPage() {
  const [selectedBarber, setSelectedBarber] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [expandedServiceId, setExpandedServiceId] = useState<number | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
  const [selectedMediaIdx, setSelectedMediaIdx] = useState<number | null>(null);

  // ----- Price and Duration Helpers -----
  const getPriceRange = (barbers: BarberOption[]) => {
    if (barbers.length === 1) return `$${barbers[0].price}`;
    const prices = barbers.map(b => b.price);
    return `$${Math.min(...prices)} - $${Math.max(...prices)}`;
  };

  const getDurationRange = (barbers: BarberOption[]) => {
    if (barbers.length === 1) return barbers[0].duration;
    // Extract numeric minutes
    const minutes = barbers.map(b => parseInt(b.duration));
    return `${Math.min(...minutes)} - ${Math.max(...minutes)} min`;
  };

  const formatCategory = (category: string | string[]) => 
   Array.isArray(category) ? category.join(", ") : category;


  const toggleExpand = (id: number) => {
    setExpandedServiceId(expandedServiceId === id ? null : id);
  };

  // ----- Modal Navigation -----
  const showPrev = () => {
    if (selectedServiceId === null || selectedMediaIdx === null) return;
    const service = servicesData.find(s => s.id === selectedServiceId);
    if (!service || !service.media) return;

    setSelectedMediaIdx((idx) =>
      idx !== null ? (idx > 0 ? idx - 1 : service.media!.length - 1) : 0
    );
  };

  const showNext = () => {
    if (selectedServiceId === null || selectedMediaIdx === null) return;
    const service = servicesData.find(s => s.id === selectedServiceId);
    if (!service || !service.media) return;

    setSelectedMediaIdx((idx) =>
      idx !== null ? (idx < service.media!.length - 1 ? idx + 1 : 0) : 0
    );
  };

  const filteredServices = servicesData.filter(service => {
    const barberMatch =
      selectedBarber === "All" ||
      service.barbers.some(barber => barber.name === selectedBarber);

    const categoryMatch =
      selectedCategory === "All" ||
      (Array.isArray(service.category)
        ? service.category.includes(selectedCategory)
        : service.category === selectedCategory);

    return barberMatch && categoryMatch;
  });

  return (
    <section className="bg-neutral-950 py-20">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl">Our Services</h1>
          <div className="my-4 pb-4 mx-auto w-32 border-t-4 border-white"></div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-center gap-6 mb-10">
          {/* Barber Filter */}
          <div className="flex gap-2">
            {barbers.map(barber => (
              <button
                key={barber}
                onClick={() => setSelectedBarber(barber)}
                className={`px-4 py-2 rounded-full border transition ${
                  selectedBarber === barber ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {barber}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full border transition ${
                  selectedCategory === category ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {filteredServices.map(service => (
              <div
                key={service.id}
                onClick={() => toggleExpand(service.id)}
                className={`bg-white p-6 rounded-2xl shadow-md transition cursor-pointer ${
                  expandedServiceId === service.id ? "shadow-xl" : "hover:shadow-lg"
                }`}
              >
                {/* card summary here */}
                <h3 className="text-xl font-semibold">{service.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {formatCategory(service.category)} • {service.barbers.map(b => b.name).join(", ")}
                </p>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-lg font-bold">{getPriceRange(service.barbers)}</span>
                  <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                    Book Now
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Duration: {getDurationRange(service.barbers)}</p>

                {/* AnimatePresence and expanded content */}
                <AnimatePresence>
                  {expandedServiceId === service.id && (
                    <ExpandedServiceContent
                      service={service}
                      onSelectMedia={(idx) => {
                        setSelectedServiceId(service.id);
                        setSelectedMediaIdx(idx);
                      }}
                    />
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No services match the selected filters.</p>
        )}
      </div>
      {/* Modal Gallery */}
      {selectedServiceId !== null && selectedMediaIdx !== null && (
        <ModalGallery
          media={servicesData.find(s => s.id === selectedServiceId)?.media || []}
          selectedIdx={selectedMediaIdx}
          onClose={() => {
            setSelectedServiceId(null);
            setSelectedMediaIdx(null);
          }}
          showPrev={showPrev}
          showNext={showNext}
        />
      )}
    </section>
  );
}
