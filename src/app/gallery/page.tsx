import GalleryPage from '@/components/GalleryPage'
import { galleryData } from '@/data/gallary'

export default function Gallery() {
  const barbers = Array.from(new Set(galleryData.map(item => item.barber)))

  return (
    <>
      <GalleryPage items={galleryData} barbers={barbers} />
    </>
  )
}
