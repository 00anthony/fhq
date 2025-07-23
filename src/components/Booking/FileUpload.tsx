type FileUploadProps = {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string | null
}

export function FileUpload({ onChange, error }: FileUploadProps) {
  return (
    <div className="flex flex-col">
      <label className="text-sm font-medium mb-1">Upload Style Reference (optional)</label>
      <input
        type="file"
        accept="image/*"
        onChange={onChange}
        className="border border-gray-300 p-2 rounded file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-100 file:text-red-700 hover:file:bg-red-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-red-500 transition"
      />
      {error && <p className="text-red-600 text-sm mt-1">{error}</p>}
    </div>
  )
}
