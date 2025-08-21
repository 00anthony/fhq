import { Service } from "@/types/services"

export const categories = ["All", "Hair", "Beard", "Style & Care", "Combo"];

export const servicesData: Service[] = [
  { 
    id: 1, 
    name: "Haircut", 
    duration: 45, //minutes
    category: ["Hair"], 
    barbers: [
      { name: "Jay", price: 30, duration: "30 min" },
      { name: "Luis", price: 35, duration: "35 min" }
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
    duration: 30, //minutes
    category: ["Beard"], 
    barbers: [
      { name: "Jay", price: 20, duration: "15 min" }
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
    duration: 45, //minutes
    category: ["Combo", "Hair", "Beard"],
    barbers: [
      { name: "Luis", price: 50, duration: "50 min" },
      { name: "Jay", price: 45, duration: "45 min" }
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
    duration: 45, //minutes
    category: ["Hair", "Style & Care"], 
    barbers: [
      { name: "Luis", price: 45, duration: "50 min" },
      { name: "Jay", price: 50, duration: "50 min" }
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
    duration: 60, //minutes
    category: ["Hair", "Style & Care"], 
    barbers: [
      { name: "Luis", price: 60, duration: "50 min" },
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
    duration: 0, //minutes
    category: ["Style & Care", "Hair", "Beard", "Combo"], 
    barbers: [
      { name: "Luis", price: 0, duration: "30 min" },
      { name: "Jay", price: 0, duration: "45 min" }
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

// Generate barber list (no duplicates)
export const barberNames = Array.from(
  new Set(servicesData.flatMap((service) => service.barbers.map((b) => b.name)))
);

// Prepend "Any Barber"
export const allBarbers = ['Any Barber', ...barberNames];

// Extract all service names
export const allServices = servicesData.map((s) => s.name);