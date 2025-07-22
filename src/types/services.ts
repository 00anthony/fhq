export type BarberOption = {
  name: string;
  price: number;
  duration: string;
};

export type ServiceMedia = {
  src: string;
  type: 'image' | 'video';
  poster?: string; // Optional: useful for video thumbnails
};

export type Service = {
  id: number;
  name: string;
  category: string | string[];
  barbers: BarberOption[];
  description: string;
  media?: ServiceMedia[];
};
