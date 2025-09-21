"use client";
import { useState } from "react";
import { categories } from "@/data/services";
import { barbers } from "@/data/barbers";
import ServicesFilters from "@/components/Services/ServiceFilters";
import ServicesGrid from "@/components/Services/ServicesGrid"; 

export default function ServicesPage() {
  const [selectedBarber, setSelectedBarber] = useState("Any Barber");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const barberNames = ['Any Barber', ...barbers.map(b => b.name)];

  return (
    <section className="bg-neutral-900 py-20">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="text-center">
          <h1 className="text-4xl text-center uppercase">Our Services</h1>
          <div className="mt-4 mb-8 mx-auto w-24 border-b-4 border-red-900"></div>
        </div>

        {/* Filters */}
        <ServicesFilters
          selectedBarber={selectedBarber}
          selectedCategory={selectedCategory}
          onSelectBarber={setSelectedBarber}
          onSelectCategory={setSelectedCategory}
          barbers={barberNames}
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
