export type Barber = {
  name: string;
  profilePic: string;
  workPics: string[];
  instagram: string;
  tiktok: string;
  bookLink: string;
};

export const barbers: Barber[] = [
  {
    name: 'JJ',
    profilePic: '/barbers/JJ/profile.avif',
    workPics: ['/barbers/JJ/drop-design.avif', '/barbers/JJ/drop-beard.mp4', '/barbers/JJ/taper-design.avif', '/barbers/JJ/drop.avif'],
    instagram: 'https://instagram.com/jaythebarber',
    tiktok: 'https://tiktok.com/@jaythebarber',
    bookLink: 'https://booksy.com/en-us/805700_jj-cutz_barber-shop_36835_kyle#ba_s=sh_1',
  },
  {
    name: 'Los',
    profilePic: '/barbers/los/profile.avif',
    workPics: ['/barbers/JJ/taper-design.avif', '/barbers/JJ/drop.avif', '/barbers/JJ/drop-design.avif'],
    instagram: 'https://instagram.com/mannyfades',
    tiktok: 'https://tiktok.com/@mannyfades',
    bookLink: 'https://booksy.com/en-us/1412622_los-cutzz_barber-shop_36835_kyle#ba_s=sh_1',
  },
  {
    name: 'Nelson',
    profilePic: '/barbers/nelson/profile.avif',
    workPics: ['/barbers/JJ/taper-design.avif', '/barbers/JJ/drop-beard.mp4', '/barbers/JJ/drop.avif', '/barbers/JJ/drop-design.avif'],
    instagram: 'https://instagram.com/samanthacuts',
    tiktok: 'https://tiktok.com/@samanthacuts',
    bookLink: 'https://booksy.com/en-us/1265933_nelson-blendzzz_hair-salon_36835_kyle#ba_s=sgr_1',
  },
];
