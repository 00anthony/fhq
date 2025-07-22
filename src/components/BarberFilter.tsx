"use client";

type BarberFilterProps = {
  barbers: string[];
  selectedBarber: string;
  onSelect: (barber: string) => void;
};

export default function BarberFilter({
  barbers,
  selectedBarber,
  onSelect,
}: BarberFilterProps) {
  return (
    <div className="flex gap-4 flex-wrap">
      {barbers.map((barber) => (
        <button
          key={barber}
          onClick={() => onSelect(barber)}
          className={`relative px-2 py-1 text-lg font-medium transition-all duration-300 ${
            selectedBarber === barber
              ? "text-white scale-105 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:bg-gradient-to-r after:from-red-900 after:to-amber-700 after:rounded-full after:shadow-[0_0_10px_rgba(99,102,241,0.8)]"
              : "text-gray-300 hover:text-white hover:scale-105"
          }`}
        >
          {barber}
        </button>
      ))}
    </div>
  );
}
