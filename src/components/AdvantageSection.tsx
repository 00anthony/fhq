import React from "react";
import { Advantage } from "@/data/advantages";

type AdvantagesSectionProps = {
  advantages: Advantage[];
};

const AdvantagesSection: React.FC<AdvantagesSectionProps> = ({ advantages }) => {
  return (
    <section className="space-y-8 py-12 rounded-xl">
      <h2 className="text-4xl text-center text-neutral-100">Why Choose Us?</h2>
      <div className="mt-4 mx-auto w-24 border-b-4 border-red-900"></div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4 bg-neutral-800 rounded-xl py-8">
        {advantages.map((adv, idx) => (
          <div
            key={idx}
            className="bg-neutral-900 rounded-xl shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transition-shadow duration-300"
          >
            <div className="mb-3">{adv.icon}</div>
            <h3 className="text-lg font-medium text-neutral-300 mb-1">{adv.title}</h3>
            <p className="text-sm text-neutral-100">{adv.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default AdvantagesSection;
