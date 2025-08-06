import { servicesData } from "@/data/services";
import { getPriceDisplay } from "@/lib/utils/serviceDisplay";

type ServiceSelectProps = {
  selected: string;
  onChange: (value: string) => void;
  services: string[];
  selectedBarber: string; 
  disabled?: boolean;
};

export function ServiceSelect({ 
  selected, 
  onChange, 
  services, 
  selectedBarber,
  disabled = false 
}: ServiceSelectProps) {
  return (
    <div id="service-section" className="flex flex-col scroll-mt-20">
      <label className="text-sm font-medium mb-1">Select Service</label>
      <select
        value={selected}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={`bg-neutral-800 border border-gray-300 p-2 rounded focus:outline-none transition cursor-pointer ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <option value="" disabled>
          {disabled ? 'No services available' : 'Select a Service'}
        </option>

        {services.map((serviceName) => {
          // Find the full service object by name
          const service = servicesData.find((s) => s.name === serviceName);

          // Get price label using utility
          const priceLabel = service
            ? getPriceDisplay(service.barbers, selectedBarber)
            : "";

          return (
            <option key={serviceName} value={serviceName}>
              {serviceName} {priceLabel ? `(${priceLabel})` : ""}
            </option>
          );
        })}
      </select>
    </div>
  )
}
