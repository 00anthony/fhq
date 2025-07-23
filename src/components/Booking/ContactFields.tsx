type ContactFieldsProps = {
  formData: {
    name: string
    email: string
    phone: string
    comments: string
  }
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

export function ContactFields({ formData, onChange }: ContactFieldsProps) {
  return (
    <div className="flex flex-col space-y-3">
      <label className="text-sm font-medium mb-1">Full Name</label>
      <input
        type="text"
        name="name"
        placeholder="John Doe"
        value={formData.name}
        onChange={onChange}
        className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition"
      />
      <label className="text-sm font-medium mb-1">Your Email</label>
      <input
        type="email"
        name="email"
        placeholder="you@example.com"
        value={formData.email}
        onChange={onChange}
        className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition"
      />
      <label className="text-sm font-medium mb-1">Phone Number</label>
      <input
        type="tel"
        name="phone"
        placeholder="(123) 456-7890"
        value={formData.phone}
        onChange={onChange}
        className="border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition"
      />
      <label className="text-sm font-medium mb-1">Comments (optional)</label>
      <textarea
        name="comments"
        placeholder="Additional notes or preferences"
        value={formData.comments}
        onChange={onChange}
        className="border border-gray-300 p-2 rounded resize-none focus:outline-none focus:ring-2 focus:ring-red-500 transition"
        rows={3}
      ></textarea>
    </div>
  )
}
