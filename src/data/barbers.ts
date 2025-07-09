export type WorkMedia = {
  src: string;
  type: 'image' | 'video';
  poster?: string; // optional, only needed for video
};

export type Barber = {
  name: string;
  profilePic: string;
  workPics: WorkMedia[];
  instagram: string;
  tiktok: string;
  bookLink: string;
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
  },
];
