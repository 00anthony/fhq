"use client";
import { useState } from "react";
import { allBarbers, categories } from "@/data/services";
import ServicesFilters from "@/components/Services/ServiceFilters";
import ServicesGrid from "@/components/Services/ServicesGrid"; 

export default function ServicesPage() {
  const [selectedBarber, setSelectedBarber] = useState("Any Barber");
  const [selectedCategory, setSelectedCategory] = useState("All");

  return (
    <section className="bg-neutral-900 py-20">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl">Our Services</h1>
          <div className="my-4 pb-4 mx-auto w-32 border-t-4 border-white"></div>
        </div>

        {/* Filters */}
        <ServicesFilters
          selectedBarber={selectedBarber}
          selectedCategory={selectedCategory}
          onSelectBarber={setSelectedBarber}
          onSelectCategory={setSelectedCategory}
          barbers={allBarbers}
          categories={categories}
        />

        {/* Service Grid */}
        <ServicesGrid
          selectedBarber={selectedBarber}
          selectedCategory={selectedCategory}
        />
      </div>
    </section>
  );
}
