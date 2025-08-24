'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

const LottiePlayer = dynamic(
  () => import('@lottiefiles/react-lottie-player').then(mod => mod.Player),
  { ssr: false }
)

type SuccessModalProps = {
  show: boolean
  onClose: () => void
  message: string
  type: 'booking' | 'reschedule' | 'cancel'
}

export default function SuccessModal({
  show,
  onClose,
  message,
  type,
}: SuccessModalProps) {
  const [isVisible, setIsVisible] = useState(show)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(show)
    if (show) {
      const timeout = setTimeout(() => {
        setIsVisible(false)
        onClose()
        if (type === 'booking') router.push('/manage-booking')
        else if (type === 'reschedule') router.refresh()
        else if (type === 'cancel') router.push('/')
      }, 2500)
      return () => clearTimeout(timeout)
    }
  }, [show, onClose, router, type])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="bg-[#1f2020] p-6 rounded-xl shadow-lg flex flex-col items-center space-y-4"
          >
            <LottiePlayer
              autoplay
              loop={false}
              src="/lottie/success.json"
              style={{ height: '200px', width: '200px' }}
            />
            <p className="text-lg font-medium text-green-600">{message}</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
