import { barbers, getBarberById } from './barbers';

export type BarberOption = {
  barberId: string;  // References barber.id instead of name
  price: number | "FREE";
  duration: number;
};

export type Media = {
  type: "image" | "video";
  src: string;
  poster?: string;   // Optional
  barber?: string;   // Optional
  barberId?: string; // Optional - now references barber.id
  style?: string;    // Optional
};

export type Service = {
  id: number;
  name: string;
  barbers: BarberOption[];
  category?: string[];
  description?: string;
  media?: Media[];
};

export const categories = ["All", "Hair", "Beard", "Style & Care", "Combo"];

export const servicesData: Service[] = [
  { 
    id: 1, 
    name: "Haircut", 
    category: ["Hair"], 
    barbers: [
      { barberId: "jj", price: 30, duration: 45 },
      { barberId: "los", price: 35, duration: 30 },
      { barberId: "nelson", price: 35, duration: 30 }
    ],
    description: "A clean, classic haircut tailored to your style. Includes a professional finish and styling.",
    media: [
      { src: '/barbers/JJ/drop-beard.mp4', type: 'video', poster: '/barbers/JJ/drop-beard-poster.webp' },
      { src: '/barbers/JJ/drop.avif', type: 'image' },
      { src: '/barbers/JJ/drop-design.avif', type: 'image' },
      { src: '/barbers/JJ/taper-design.avif', type: 'image' }
    ]
  },
  { 
    id: 2, 
    name: "Beard Trim", 
    category: ["Beard"], 
    barbers: [
      { barberId: "jj", price: 20, duration: 15 }
    ],
    description: "Detailed beard trimming and shaping for a polished look.",
    media: [
      { src: '/barbers/JJ/drop-beard.mp4', type: 'video', poster: '/barbers/JJ/drop-beard-poster.webp' },
      { src: '/barbers/JJ/drop.avif', type: 'image' },
      { src: '/barbers/JJ/drop-design.avif', type: 'image' },
      { src: '/barbers/JJ/taper-design.avif', type: 'image' }
    ]
  },
  {
    id: 3,
    name: "Hair + Beard",
    category: ["Combo", "Hair", "Beard"],
    barbers: [
      { barberId: "los", price: 50, duration: 50 },
      { barberId: "jj", price: 45, duration: 45 }
    ],
    description: "Haircut & beard trim combo with hot towel included.",
    media: [
      { src: '/barbers/JJ/drop-beard.mp4', type: 'video', poster: '/barbers/JJ/drop-beard-poster.webp' },
      { src: '/barbers/JJ/drop.avif', type: 'image' },
      { src: '/barbers/JJ/drop-design.avif', type: 'image' },
      { src: '/barbers/JJ/taper-design.avif', type: 'image' }
    ]
  },
  { 
    id: 4, 
    name: "Haircut & Design", 
    category: ["Hair", "Style & Care"], 
    barbers: [
      { barberId: "los", price: 45, duration: 50 },
      { barberId: "nelson", price: 40, duration: 50 },
      { barberId: "jj", price: 50, duration: 50 }
    ], 
    description: "Our Haircut & Design Are Carefully Customized Based On Your Desired Style. Our Professional Barbers Are Carefully Crafting The Design To Your Liking After Your Desired Haircut. Hot Towels Included.",
    media: [
      { src: '/barbers/JJ/drop-beard.mp4', type: 'video', poster: '/barbers/JJ/drop-beard-poster.webp' },
      { src: '/barbers/JJ/drop.avif', type: 'image' },
      { src: '/barbers/JJ/drop-design.avif', type: 'image' },
      { src: '/barbers/JJ/taper-design.avif', type: 'image' }
    ]
  },
  { 
    id: 5, 
    name: "Deluxe Haircut", 
    category: ["Hair", "Style & Care"], 
    barbers: [
      { barberId: "los", price: 60, duration: 50 }
    ],
    description: "Each Deluxe Haircut Is Customized For You Based On Head Shape, Texture, And Desired Style. Includes A Cleanser, Exfoliator, Moisturizer, Hot Towel Included.", 
    media: [
      { src: '/barbers/JJ/drop-beard.mp4', type: 'video', poster: '/barbers/JJ/drop-beard-poster.webp' },
      { src: '/barbers/JJ/drop.avif', type: 'image' },
      { src: '/barbers/JJ/drop-design.avif', type: 'image' },
      { src: '/barbers/JJ/taper-design.avif', type: 'image' }
    ] 
  },
  { 
    id: 6, 
    name: "Consultation", 
    category: ["Style & Care", "Hair", "Beard", "Combo"], 
    barbers: [
      { barberId: "los", price: 0, duration: 30 },
      { barberId: "jj", price: 0, duration: 45 },
      {barberId: "nelson", price: 0, duration: 30}
    ], 
    description: "Book an online or in person consultation to unlock that untapped potential",
    media: [
      { src: '/barbers/JJ/drop-beard.mp4', type: 'video', poster: '/barbers/JJ/drop-beard-poster.webp' },
      { src: '/barbers/JJ/drop.avif', type: 'image' },
      { src: '/barbers/JJ/drop-design.avif', type: 'image' },
      { src: '/barbers/JJ/taper-design.avif', type: 'image' }
    ]
  },
];

// Essential helper functions (keep minimal, let existing utils handle display logic)
export const getServiceByName = (name: string): Service | undefined => {
  return servicesData.find(service => service.name === name);
};

// Get barber details for a service (with full barber info) - needed for availability route
export const getServiceBarbers = (serviceName: string) => {
  const service = getServiceByName(serviceName);
  if (!service) return [];

  return service.barbers.map(serviceBarber => {
    const barber = getBarberById(serviceBarber.barberId);
    return {
      ...serviceBarber,
      barberInfo: barber // Full barber details including availability, calendar, etc.
    };
  }).filter(item => item.barberInfo); // Only return barbers that exist
};

// Extract all service names
export const allServices = servicesData.map(s => s.name);