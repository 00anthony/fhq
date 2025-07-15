import { Suspense } from 'react'
import ManageBookingClient from './ManageBookingClient'

export const dynamic = 'force-dynamic' // still good to have

export default function ManageBookingPage() {
  return (
    <Suspense fallback={<p className="p-4">Loading...</p>}>
      <ManageBookingClient />
    </Suspense>
  )
}
