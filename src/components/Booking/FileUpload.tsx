import { useState } from 'react'

type FileUploadProps = {
  onChange: (file: File | null) => boolean
  error?: string | null
}

export function FileUpload({ onChange, error }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

 const handleFile = (file: File | null) => {
    const accepted = onChange(file)
    if (accepted && file) {
      setFileName(file.name)
    } else {
      setFileName(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = () => setDragActive(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleRemove = () => {
    setFileName(null)
    onChange(null)
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium">Upload Style Reference (optional)</label>
      <div
        className={`relative border-2 rounded-xl p-6 flex flex-col items-center justify-center text-neutral-200 text-center transition 
        ${dragActive ? 'border-neutral-600 bg-neutral-700' : 'border-dashed border-neutral-700 bg-[#1f2020]'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <svg
          viewBox="0 0 35 35"
          xmlns="http://www.w3.org/2000/svg"
          className="w-20 h-20"
          fill="currentColor"
        >
          <path d="M29.426 15.535s0.649-8.743-7.361-9.74c-6.865-0.701-8.955 5.679-8.955 5.679s-2.067-1.988-4.872-0.364c-2.511 1.55-2.067 4.388-2.067 4.388s-5.576 1.084-5.576 6.768c0.124 5.677 6.054 5.734 6.054 5.734h9.351v-6h-3l5-5 5 5h-3v6h8.467s5.52 0.006 6.295-5.395c0.369-5.906-5.336-7.070-5.336-7.070z" />
        </svg>
        <p className="text-sm text-gray-400 mb-2">Drag and drop an image, or</p>
        
        <label className="inline-block bg-red-900 text-neutral-300 font-medium py-2 px-4 rounded cursor-pointer hover:text-white transition">
          Browse Files
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>

        {fileName && (
          <div className="flex items-center gap-2 mt-3">
            <p className="text-xs text-green-600 truncate max-w-xs">Uploaded: {fileName}</p>
            <button
              type="button"
              onClick={handleRemove}
              className="text-red-500 hover:text-red-700 text-xs"
              aria-label="Remove uploaded file"
            >
              ✕
            </button>
          </div>
        )}

        {!fileName && !error && (
          <p className="text-xs text-gray-500 mt-3">Accepted: JPG, PNG, GIF • Max 5MB</p>
        )}

        {error && (
          <p className="text-red-600 text-sm mt-2">{error}</p>
        )}
      </div>
    </div>
  )
}
