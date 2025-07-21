'use client'

import { useState } from 'react'
import Image from 'next/image'
import Masonry from 'react-masonry-css'
import { GalleryGridProps } from '@/types/gallery'
import ModalGallery from '@/components/ModalGallery'

// Masonry breakpoints
const breakpointColumnsObj = {
  default: 3,  // Desktop
  1024: 2,     // Tablet
  640: 1       // Mobile
}

export default function GalleryGrid({ items, barbers }: GalleryGridProps) {
  const [barberFilter, setBarberFilter] = useState('All')
  const [hairStyle, setHairStyle] = useState('')
  const [beardStyle, setBeardStyle] = useState('')
  const [equipment, setEquipment] = useState('')
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const filtered = items.filter(item => {
    const matchBarber = barberFilter === 'All' || item.barber === barberFilter
    const matchHair =
      !hairStyle || (item.hairStyle && item.hairStyle.includes(hairStyle))
    const matchBeard = !beardStyle || item.beardStyle === beardStyle
    const matchEquip =
      !equipment || (item.equipment && item.equipment.includes(equipment))
    return matchBarber && matchHair && matchBeard && matchEquip
  })

  const openModal = (index: number) => setSelectedIdx(index)
  const closeModal = () => setSelectedIdx(null)
  const showPrev = () =>
    setSelectedIdx(prev =>
      prev !== null ? (prev - 1 + filtered.length) % filtered.length : null
    )
  const showNext = () =>
    setSelectedIdx(prev =>
      prev !== null ? (prev + 1) % filtered.length : null
    )

  return (
    <section className="py-20 bg-neutral-950 text-white min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-4xl text-center">Gallery</h1>
        <div className="my-4 pb-4 mx-auto w-32 border-t-4 border-white"></div>

        {/* Filters */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
          {['All', ...barbers].map(name => (
            <button
              key={name}
              className={`px-4 py-2 rounded-2xl border-2 ${
                barberFilter === name
                  ? 'bg-white text-black'
                  : 'border-gray-500 hover:bg-gray-700'
              } transition`}
              onClick={() => setBarberFilter(name)}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Dropdown filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <select
            value={hairStyle}
            onChange={e => setHairStyle(e.target.value)}
            className="bg-neutral-900 text-white p-2 rounded border border-neutral-800"
          >
            <option value="">All Hair Styles</option>
            <option value="Fade">Fade</option>
            <option value="Pompadour">Pompadour</option>
            <option value="Buzz Cut">Buzz Cut</option>
          </select>

          <select
            value={beardStyle}
            onChange={e => setBeardStyle(e.target.value)}
            className="bg-neutral-900 text-white p-2 rounded border border-neutral-800"
          >
            <option value="">All Beard Styles</option>
            <option value="Full Beard">Full Beard</option>
            <option value="Goatee">Goatee</option>
            <option value="Stubble">Stubble</option>
          </select>

          <select
            value={equipment}
            onChange={e => setEquipment(e.target.value)}
            className="bg-neutral-900 text-white p-2 rounded border border-neutral-800"
          >
            <option value="">All Equipment</option>
            <option value="Razor">Razor</option>
            <option value="Scissors">Scissors</option>
            <option value="Clippers">Clippers</option>
          </select>
        </div>

        {/* Masonry layout */}
        <Masonry
          breakpointCols={breakpointColumnsObj}
          className="my-masonry-grid"
          columnClassName="my-masonry-grid_column"
        >
          {filtered.map((item, index) => (
            <div
              key={item.id}
              onClick={() => openModal(index)}
              className="cursor-pointer relative group rounded-xl overflow-hidden shadow-xl mb-6"
            >
              {item.type === 'video' ? (
                <video
                  src={item.src}
                  poster={item.poster}
                  className="w-full h-auto object-cover rounded-xl"
                  muted
                  
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <Image
                  src={item.src}
                  alt={`${item.style} by ${item.barber}`}
                  width={400}
                  height={400}
                  className="object-cover w-full h-auto rounded-xl"
                />
              )}

              <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                <div className="text-center">
                  <h2 className="text-xl">{item.style}</h2>
                  <p className="mt-1 text-sm">{item.barber}</p>
                </div>
              </div>
            </div>
          ))}
        </Masonry>
      </div>

      {/* Modal */}
      {selectedIdx !== null && (
        <ModalGallery
          media={filtered.map(item => ({
            type: item.type,
            src: item.src,
            barber: item.barber,
            barberId: item.barberId,
            style: item.style,
          }))}
          selectedIdx={selectedIdx}
          onClose={closeModal}
          showPrev={showPrev}
          showNext={showNext}
        />
      )}
    </section>
  )
}
