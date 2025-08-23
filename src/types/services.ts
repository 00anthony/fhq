export type BarberOption = {
  name: string;
  price: number | "FREE";
  duration: number;
};

export type Media = {
  type: "image" | "video";
  src: string;
  poster?: string;   // Optional
  barber?: string;   // Optional
  barberId?: number; // Optional
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
