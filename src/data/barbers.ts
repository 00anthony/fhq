export type WorkMedia = {
  src: string;
  type: 'image' | 'video';
  poster?: string; // optional, only needed for video
  style: string;
};

export type Review = {
  user: string;
  rating: number; // e.g. 4.5
  comment: string;
  date: string; // could be formatted as "2025-08-13"
};

export type DayAvailability = {
  isActive: boolean;
  startTime: string;
  endTime: string;
  slotInterval: number; // How frequently appointments can start (e.g., every 15, 30 minutes)
  breaks?: { startTime: string; endTime: string; }[];
};

export type Barber = {
  id: string;                 // Unique identifier for referencing
  name: string;               // Display name
  slug: string;               // URL slug
  calendarId?: string;        // Google Calendar ID for availability checking
  profilePic: string;
  workPics: WorkMedia[];
  instagram: string;
  tiktok: string;
  bookLink: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  bio: string;
  experience: string;
  achievements: string[];
  skills: string[];
  availability: {
    [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: DayAvailability;
  };
  timeZone: string;
};

export const barbers: Barber[] = [
  {
    id: 'jj',
    name: 'JJ',
    slug: 'jj',
    calendarId: 'anthonytij3@gmail.com', //temp email for testing
    profilePic: '/barbers/JJ/profile.avif',
    workPics: [
      { src: '/barbers/JJ/drop-design.avif', type: 'image', style: 'Drop Fade & Design', },
      { src: '/barbers/JJ/drop-beard.mp4', type: 'video', poster: '/barbers/JJ/drop-beard-poster.webp', style: 'Drop Fade & Beard', },
      { src: '/barbers/JJ/taper-design.avif', type: 'image', style: 'Taper Fade & Design', },
      { src: '/barbers/JJ/drop.avif', type: 'image', style: 'Drop Fade', },
    ],
    instagram: 'https://instagram.com/jaythebarber',
    tiktok: 'https://tiktok.com/@jaythebarber',
    bookLink: 'https://booksy.com/en-us/805700_jj-cutz_barber-shop_36835_kyle#ba_s=sh_1',
    rating: 4.5,
    reviewCount: 2,
    reviews: [
      { user: 'Michael U.', rating: 5, comment: 'Best fade Ive had in years!', date: '2025-08-10' },
      { user: 'Chris K.', rating: 4, comment: 'Great cut, just wish the wait was shorter.', date: '2025-08-05' },
    ],
    bio: 'JJ is a fade expert with a passion for precise designs and clean lines.',
    experience: '5 years specializing in fades, tapers, and beard styling.',
    achievements: ['Winner of Local Barber Competition 2023', 'Featured in Men\'s Grooming Magazine'],
    skills: ['Fades', 'Tapers', 'Beard Trims', 'Drop Designs'],
    availability: {
      monday: {
        isActive: true,
        startTime: '09:00',
        endTime: '17:00',
        slotInterval: 15,
        breaks: [
          { startTime: '12:00', endTime: '13:00' }
        ]
      },
      tuesday: {
        isActive: true,
        startTime: '09:00',
        endTime: '17:00',
        slotInterval: 15,
        breaks: [
          { startTime: '12:00', endTime: '13:00' }
        ]
      },
      wednesday: {
        isActive: true,
        startTime: '10:00',
        endTime: '18:00',
        slotInterval: 15,
        breaks: [
          { startTime: '13:00', endTime: '14:00' }
        ]
      },
      thursday: {
        isActive: true,
        startTime: '09:00',
        endTime: '17:00',
        slotInterval: 15,
        breaks: [
          { startTime: '12:00', endTime: '13:00' }
        ]
      },
      friday: {
        isActive: true,
        startTime: '09:00',
        endTime: '19:00',
        slotInterval: 15,
        breaks: [
          { startTime: '12:00', endTime: '13:00' },
          { startTime: '15:30', endTime: '16:00' }
        ]
      },
      saturday: {
        isActive: true,
        startTime: '08:00',
        endTime: '16:00',
        slotInterval: 15,
        breaks: [
          { startTime: '12:00', endTime: '12:30' }
        ]
      },
      sunday: {
        isActive: false,
        startTime: '00:00',
        endTime: '00:00',
        slotInterval: 15
      }
    },
    timeZone: 'America/Chicago'
  },
  {
    id: 'los',
    name: 'Los',
    slug: 'los',
    calendarId: undefined, // Los doesn't have calendar integration yet
    profilePic: '/barbers/los/profile.avif',
    workPics: [
      { src: '/barbers/JJ/taper-design.avif', type: 'image', style: 'Taper Fade & Design' },
      { src: '/barbers/JJ/drop.avif', type: 'image', style: 'Drop Fade' },
      { src: '/barbers/JJ/drop-design.avif', type: 'image', style: 'Drop Fade & Design' },
    ],
    instagram: 'https://instagram.com/mannyfades',
    tiktok: 'https://tiktok.com/@mannyfades',
    bookLink: 'https://booksy.com/en-us/1412622_los-cutzz_barber-shop_36835_kyle#ba_s=sh_1',
    rating: 5,
    reviewCount: 2,
    reviews: [
      { user: 'Daniel P.', rating: 5, comment: 'Los always kills it with the taper!', date: '2025-08-08' },
      { user: 'Brandon T.', rating: 5, comment: 'Crisp lines and great convo.', date: '2025-08-03' },
    ],
    bio: 'Luis combines creativity with precision to deliver perfect tapers every time.',
    experience: '7 years of professional barbering with a focus on tapers and classic cuts.',
    achievements: ['Featured in Local Barber Spotlight 2024', 'Instagram influencer with 50k+ followers'],
    skills: ['Tapers', 'Classic Cuts', 'Fade Techniques', 'Lineups'],
    availability: {
      monday: {
        isActive: false,
        startTime: '00:00',
        endTime: '00:00',
        slotInterval: 20
      },
      tuesday: {
        isActive: true,
        startTime: '10:00',
        endTime: '18:00',
        slotInterval: 20,
        breaks: [
          { startTime: '13:00', endTime: '14:00' }
        ]
      },
      wednesday: {
        isActive: true,
        startTime: '10:00',
        endTime: '18:00',
        slotInterval: 20,
        breaks: [
          { startTime: '13:00', endTime: '14:00' }
        ]
      },
      thursday: {
        isActive: true,
        startTime: '10:00',
        endTime: '18:00',
        slotInterval: 20,
        breaks: [
          { startTime: '13:00', endTime: '14:00' }
        ]
      },
      friday: {
        isActive: true,
        startTime: '09:00',
        endTime: '20:00',
        slotInterval: 20,
        breaks: [
          { startTime: '13:00', endTime: '14:00' },
          { startTime: '17:00', endTime: '17:30' }
        ]
      },
      saturday: {
        isActive: true,
        startTime: '08:00',
        endTime: '17:00',
        slotInterval: 20,
        breaks: [
          { startTime: '12:30', endTime: '13:00' }
        ]
      },
      sunday: {
        isActive: true,
        startTime: '10:00',
        endTime: '15:00',
        slotInterval: 20,
        breaks: []
      }
    },
    timeZone: 'America/Chicago'
  },
  {
    id: 'nelson',
    name: 'Nelson',
    slug: 'nelson',
    calendarId: undefined, // Nelson doesn't have calendar integration yet
    profilePic: '/barbers/nelson/profile.avif',
    workPics: [
      { src: '/barbers/JJ/taper-design.avif', type: 'image', style: 'Taper Fade & Design' },
      { src: '/barbers/JJ/drop-beard.mp4', type: 'video', poster: '/barbers/JJ/drop-beard-poster.webp', style: 'Drop Fade & Beard' },
      { src: '/barbers/JJ/drop.avif', type: 'image', style: 'Drop Fade' },
      { src: '/barbers/JJ/drop-design.avif', type: 'image', style: 'Drop Fade & Design' },
    ],
    instagram: 'https://instagram.com/samanthacuts',
    tiktok: 'https://tiktok.com/@samanthacuts',
    bookLink: 'https://booksy.com/en-us/1265933_nelson-blendzzz_hair-salon_36835_kyle#ba_s=sgr_1',
    rating: 4.3,
    reviewCount: 2,
    reviews: [
      { user: 'Alex R.', rating: 4, comment: 'Solid work, very clean cut.', date: '2025-08-06' },
      { user: 'Kevin D.', rating: 5, comment: 'Fade on point every time.', date: '2025-08-02' },
    ],
    bio: 'Nelson is all about clean, precise cuts that leave clients looking sharp.',
    experience: '6 years specializing in fades, beard trims, and creative styles.',
    achievements: ['Barber of the Month 2023', 'Training mentor for new barbers'],
    skills: ['Fades', 'Beard Trims', 'Creative Cuts', 'Lineups'],
    availability: {
      monday: {
        isActive: true,
        startTime: '11:00',
        endTime: '19:00',
        slotInterval: 30,
        breaks: [
          { startTime: '14:00', endTime: '15:00' }
        ]
      },
      tuesday: {
        isActive: true,
        startTime: '09:00',
        endTime: '17:00',
        slotInterval: 30,
        breaks: [
          { startTime: '12:30', endTime: '13:30' }
        ]
      },
      wednesday: {
        isActive: true,
        startTime: '09:00',
        endTime: '17:00',
        slotInterval: 30,
        breaks: [
          { startTime: '12:30', endTime: '13:30' }
        ]
      },
      thursday: {
        isActive: true,
        startTime: '09:00',
        endTime: '17:00',
        slotInterval: 30,
        breaks: [
          { startTime: '12:30', endTime: '13:30' }
        ]
      },
      friday: {
        isActive: true,
        startTime: '09:00',
        endTime: '18:00',
        slotInterval: 30,
        breaks: [
          { startTime: '12:30', endTime: '13:30' }
        ]
      },
      saturday: {
        isActive: true,
        startTime: '08:00',
        endTime: '15:00',
        slotInterval: 30,
        breaks: [
          { startTime: '11:30', endTime: '12:00' }
        ]
      },
      sunday: {
        isActive: false,
        startTime: '00:00',
        endTime: '00:00',
        slotInterval: 30
      }
    },
    timeZone: 'America/Chicago'
  },
];

// Helper functions for easy access
export const getBarberById = (id: string): Barber | undefined => {
  return barbers.find(barber => barber.id === id);
};

export const getBarberBySlug = (slug: string): Barber | undefined => {
  return barbers.find(barber => barber.slug === slug);
};

export const getActiveBarbers = (): Barber[] => {
  return barbers.filter(barber => barber.calendarId); // Only barbers with calendar integration
};

export const getBarberCalendarMap = (): Record<string, string> => {
  return barbers.reduce((map, barber) => {
    if (barber.calendarId) {
      map[barber.id] = barber.calendarId;
    }
    return map;
  }, {} as Record<string, string>);
};

//required for barber selection in booking form
export const allBarbers = ['Any Barber', ...getActiveBarbers().map(b => b.name)];
