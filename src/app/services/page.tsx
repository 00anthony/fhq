"use client";
import { useState } from "react";
import { categories } from "@/data/services";
import { allBarbers, barbers } from "@/data/barbers";
import ServicesFilters from "@/components/Services/ServiceFilters";
import ServicesGrid from "@/components/Services/ServicesGrid"; 

export default function ServicesPage() {
  const [selectedBarberId, setSelectedBarber] = useState("any");
  const [selectedCategory, setSelectedCategory] = useState("All");

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
          selectedBarberId={selectedBarberId}
          selectedCategory={selectedCategory}
          onSelectBarber={setSelectedBarber}
          onSelectCategory={setSelectedCategory}
          barbers={allBarbers}
          categories={categories}
        />

        {/* Service Grid */}
        <ServicesGrid
          selectedBarberId={selectedBarberId}
          selectedCategory={selectedCategory}
        />
      </div>
    </section>
  );
}
