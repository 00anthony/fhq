import { useState } from 'react'

type ContactFieldsProps = {
  formData: {
    name: string
    email: string
    phone: string
    comments: string
  }
  onChange: (name: string, value: string) => void
}

export function ContactFields({ formData, onChange }: ContactFieldsProps) {
  const [emailError, setEmailError] = useState<string | null>(null)

  // Format phone number as (123) 456-7890 while typing
  const formatPhone = (input: string) => {
    let digits = input.replace(/\D/g, '')

    // If starts with '1' and has 11 digits, strip the country code
    if (digits.length === 11 && digits.startsWith('1')) {
      digits = digits.slice(1)
    }

    digits = digits.slice(0, 10) // limit to 10 digits

    const match = digits.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/)
    if (!match) return input
    const [, area, prefix, line] = match
    if (digits.length <= 3) return `(${area}`
    if (digits.length <= 6) return `(${area}) ${prefix}`
    return `(${area}) ${prefix}-${line}`
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value
    onChange('email', e.target.value)

    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    setEmailError(email && !isValidEmail ? 'Please enter a valid email address.' : null)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value)
    onChange('phone', formatted)
  }

  return (
    <div className="flex flex-col space-y-4">
      <label htmlFor="name" className="text-sm font-medium mb-1">Full Name</label>
      <input
        id="name"
        aria-label="Full Name"
        type="text"
        name="name"
        placeholder="John Doe"
        value={formData.name}
        onChange={(e) => onChange('name', e.target.value)}
        className="w-full border border-gray-300 p-2 rounded focus:outline-none transition"
        inputMode="text"
        autoComplete="name"
      />
      <label htmlFor="email" className="text-sm font-medium mb-1">Your Email</label>
      <input
        id="email"
        aria-label="Email Address"
        type="email"
        name="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={handleEmailChange}
        className={`w-full border p-2 rounded focus:outline-none transition ${
          emailError ? 'border-red-500' : 'border-gray-300'
        }`}
        inputMode="email"
        autoComplete="email"
        aria-describedby="email-error"
      />
      {emailError && (
        <p id="email-error" className="text-sm text-red-600 mt-1">{emailError}</p>
      )}
      <label htmlFor="phone" className="text-sm font-medium mb-1">Phone Number</label>
      <input
        id="phone"
        aria-label="Phone Number"
        type="tel"
        name="phone"
        placeholder="123-456-7890"
        value={formData.phone}
        onChange={handlePhoneChange}
        className="w-full border border-gray-300 p-2 rounded focus:outline-none transition"
        inputMode="tel"
        autoComplete="tel"
      />
      <label htmlFor="comments" className="text-sm font-medium mb-1">Comments (optional)</label>
      <textarea
        id="comments"
        name="comments"
        placeholder="Additional notes or preferences"
        value={formData.comments}
        onChange={(e) => onChange('comments', e.target.value)}
        className="w-full border border-gray-300 p-2 rounded resize-none focus:outline-none transition"
        rows={3}
      />
    </div>
  )
}
