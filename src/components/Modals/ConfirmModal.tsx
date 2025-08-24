'use client'

import { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

type ConfirmModalProps = {
  isOpen: boolean
  title?: string
  message?: string | ReactNode
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
  confirmColor?: 'red' | 'green' | 'blue'
}

export default function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmText = 'Yes',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  loading = false,
  confirmColor = 'red',
}: ConfirmModalProps) {
  const getConfirmButtonClasses = (
    color: 'red' | 'green' | 'blue',
    loading: boolean
  ) => {
    const base = 'px-4 py-2 text-sm rounded text-white cursor-pointer'
    const colors = {
      red: loading ? 'bg-red-300' : 'bg-red-900 hover:bg-red-800',
      green: loading ? 'bg-green-300' : 'bg-green-700 hover:bg-green-600',
      blue: loading ? 'bg-blue-300' : 'bg-blue-700 hover:bg-blue-600',
    }
    return `${base} ${colors[color]}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        >
          <motion.div
            className="bg-[#1f2020] p-6 rounded-xl max-w-sm w-full shadow-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg mb-3">{title}</h2>
            <div className="mb-4 text-sm text-gray-400">{message}</div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm rounded bg-gray-600 hover:bg-gray-500 cursor-pointer"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={getConfirmButtonClasses(confirmColor, loading)}
              >
                {loading ? 'Please wait...' : confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
