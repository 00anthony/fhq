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
    bookLink: '/book/jay',
  },
  {
    name: 'Los',
    profilePic: '/barbers/los/profile.avif',
    workPics: ['/cuts/manny1.mp4', '/cuts/manny2.jpg'],
    instagram: 'https://instagram.com/mannyfades',
    tiktok: 'https://tiktok.com/@mannyfades',
    bookLink: '/book/manny',
  },
  {
    name: 'Nelson',
    profilePic: '/barbers/nelson/profile.avif',
    workPics: ['/cuts/sam1.jpg', '/cuts/sam2.jpg', '/cuts/sam3.mp4'],
    instagram: 'https://instagram.com/samanthacuts',
    tiktok: 'https://tiktok.com/@samanthacuts',
    bookLink: '/book/samantha',
  },
];
