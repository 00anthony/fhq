export type WorkMedia = {
  src: string;
  type: 'image' | 'video';
  poster?: string; // optional, only needed for video
};

export type Review = {
  user: string;
  rating: number; // e.g. 4.5
  comment: string;
  date: string; // could be formatted as "2025-08-13"
};

export type Barber = {
  name: string;
  profilePic: string;
  workPics: WorkMedia[];
  instagram: string;
  tiktok: string;
  bookLink: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
};

export const barbers: Barber[] = [
  {
    name: 'JJ',
    profilePic: '/barbers/JJ/profile.avif',
    workPics: [
      { src: '/barbers/JJ/drop-design.avif', type: 'image' },
      { src: '/barbers/JJ/drop-beard.mp4', type: 'video', poster: '/barbers/JJ/drop-beard-poster.webp' },
      { src: '/barbers/JJ/taper-design.avif', type: 'image' },
      { src: '/barbers/JJ/drop.avif', type: 'image' },
    ],
    instagram: 'https://instagram.com/jaythebarber',
    tiktok: 'https://tiktok.com/@jaythebarber',
    bookLink: 'https://booksy.com/en-us/805700_jj-cutz_barber-shop_36835_kyle#ba_s=sh_1',
    rating: 4.5,
    reviewCount: 2,
    reviews: [
      { user: 'Michael U.', rating: 5, comment: 'Best fade I’ve had in years!', date: '2025-08-10' },
      { user: 'Chris K.', rating: 4, comment: 'Great cut, just wish the wait was shorter.', date: '2025-08-05' },
    ]
  },
  {
    name: 'Los',
    profilePic: '/barbers/los/profile.avif',
    workPics: [
      { src: '/barbers/JJ/taper-design.avif', type: 'image' },
      { src: '/barbers/JJ/drop.avif', type: 'image' },
      { src: '/barbers/JJ/drop-design.avif', type: 'image' },
    ],
    instagram: 'https://instagram.com/mannyfades',
    tiktok: 'https://tiktok.com/@mannyfades',
    bookLink: 'https://booksy.com/en-us/1412622_los-cutzz_barber-shop_36835_kyle#ba_s=sh_1',
    rating: 5,
    reviewCount: 2,
    reviews: [
      { user: 'Daniel P.', rating: 5, comment: 'Los always kills it with the taper!', date: '2025-08-08' },
      { user: 'Brandon T.', rating: 5, comment: 'Crisp lines and great convo.', date: '2025-08-03' },
    ]
  },
  {
    name: 'Nelson',
    profilePic: '/barbers/nelson/profile.avif',
    workPics: [
      { src: '/barbers/JJ/taper-design.avif', type: 'image' },
      { src: '/barbers/JJ/drop-beard.mp4', type: 'video', poster: '/barbers/JJ/drop-beard-poster.webp' },
      { src: '/barbers/JJ/drop.avif', type: 'image' },
      { src: '/barbers/JJ/drop-design.avif', type: 'image' },
    ],
    instagram: 'https://instagram.com/samanthacuts',
    tiktok: 'https://tiktok.com/@samanthacuts',
    bookLink: 'https://booksy.com/en-us/1265933_nelson-blendzzz_hair-salon_36835_kyle#ba_s=sgr_1',
    rating: 4.3,
    reviewCount: 2,
    reviews: [
      { user: 'Alex R.', rating: 4, comment: 'Solid work, very clean cut.', date: '2025-08-06' },
      { user: 'Kevin D.', rating: 5, comment: 'Fade on point every time.', date: '2025-08-02' },
    ]
  },
];
