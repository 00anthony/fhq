export interface GalleryItem {
  id: number
  barber: string
  barberId: string
  style: string
  src: string           
  type: 'image' | 'video' 
  poster?: string; // optional, only needed for video
  hairStyle?: string[]
  beardStyle?: string
  equipment?: string[]
}

export interface GalleryGridProps {
  items: GalleryItem[]
  barbers: string[]
}