'use client'

import dynamic from 'next/dynamic'
import { Suspense } from 'react'

const ManageBookingClient = dynamic(() => import('./ManageBookingClient'), {
  ssr: false,
})

export default function ManageBookingWrapper() {
  return (
    <Suspense fallback={<div className="p-4 pt-20">Loading...</div>}>
      <ManageBookingClient />
    </Suspense>
  )
}
