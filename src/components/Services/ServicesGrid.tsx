"use client";
import { useState } from "react";
import { servicesData } from "@/data/services";
import dynamic from "next/dynamic";
import ServiceCard from "@/components/Services/ServiceCard";

const ModalGallery = dynamic(() => import("@/components/Gallary/ModalGallery"), {
  ssr: false,
});

type ServicesGridProps = {
  selectedBarber: string;
  selectedCategory: string;
};

export default function ServicesGrid({
  selectedBarber,
  selectedCategory,
}: ServicesGridProps) {
  const [expandedServiceId, setExpandedServiceId] = useState<number | null>(
    null
  );
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  );
  const [selectedMediaIdx, setSelectedMediaIdx] = useState<number | null>(null);

  // Filtered services
  const filteredServices = servicesData.filter((service) => {
    const barberMatch =
      selectedBarber === "Any Barber" ||
      service.barbers.some((barber) => barber.barberId === selectedBarber);

    const categoryMatch =
      selectedCategory === "All" ||
      (Array.isArray(service.category)
        ? service.category.includes(selectedCategory)
        : service.category === selectedCategory);

    return barberMatch && categoryMatch;
  });

  const showPrev = () => {
    if (selectedServiceId === null || selectedMediaIdx === null) return;
    const service = servicesData.find((s) => s.id === selectedServiceId);
    if (!service || !service.media) return;

    setSelectedMediaIdx((idx) =>
      idx !== null ? (idx > 0 ? idx - 1 : service.media!.length - 1) : 0
    );
  };

  const showNext = () => {
    if (selectedServiceId === null || selectedMediaIdx === null) return;
    const service = servicesData.find((s) => s.id === selectedServiceId);
    if (!service || !service.media) return;

    setSelectedMediaIdx((idx) =>
      idx !== null ? (idx < service.media!.length - 1 ? idx + 1 : 0) : 0
    );
  };

  return (
    <>
      {/* Services Grid */}
      {filteredServices.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {filteredServices.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              selectedBarber={selectedBarber}
              expanded={expandedServiceId === service.id}
              onToggle={() =>
                setExpandedServiceId(
                  expandedServiceId === service.id ? null : service.id
                )
              }
              onSelectMedia={(idx) => {
                setSelectedServiceId(service.id);
                setSelectedMediaIdx(idx);
              }}
            />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No services match the selected filters.
        </p>
      )}

      {/* Modal Gallery */}
      {selectedServiceId !== null && selectedMediaIdx !== null && (
        <ModalGallery
          media={
            servicesData.find((s) => s.id === selectedServiceId)?.media || []
          }
          selectedIdx={selectedMediaIdx}
          onClose={() => {
            setSelectedServiceId(null);
            setSelectedMediaIdx(null);
          }}
          showPrev={showPrev}
          showNext={showNext}
        />
      )}
    </>
  );
}
