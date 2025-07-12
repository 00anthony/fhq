import GalleryGrid from '@/components/GalleryGrid'
import { galleryData } from '@/data/gallary'

export default function GalleryPage() {
  const barbers = Array.from(new Set(galleryData.map(item => item.barber)))

  return (
    <>
      <GalleryGrid items={galleryData} barbers={barbers} />
    </>
  )
}
