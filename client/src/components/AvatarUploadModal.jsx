import { useState, useRef, useEffect } from 'react'
import { X, Camera } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { IconButton } from './ui/Button'
import { Button } from './ui/Button'
import { Avatar } from './ui/Avatar'

export default function AvatarUploadModal({ onClose }) {
  const { user, updateAvatar } = useAuth()
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleFileChange = (e) => {
    const selected = e.target.files[0]
    if (!selected) return
    if (selected.size > 5 * 1024 * 1024) {
      setError('File must be under 5MB')
      return
    }
    setFile(selected)
    setError('')
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(selected)
  }

  const handleUpload = async () => {
    if (!file) return
    setUploading(true)
    setError('')
    try {
      await updateAvatar(file)
      onClose()
    } catch {
      setError('Upload failed. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const avatarSrc = preview || (user?.avatar_url?.startsWith('http') ? user.avatar_url : user?.avatar_url ? `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}${user.avatar_url}` : null)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 animate-fade-in" onClick={onClose} role="dialog" aria-modal="true" aria-label="Update avatar">
      <div
        className="bg-white rounded-card-xl shadow-auth-card p-6 w-full max-w-sm mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-body font-bold text-content-primary">Update Avatar</h3>
          <IconButton icon={<X />} size="sm" onClick={onClose} aria-label="Close" />
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            {avatarSrc ? (
              <img
                src={avatarSrc}
                alt={user?.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-content-border"
              />
            ) : (
              <Avatar name={user?.name || '?'} size="lg" className="w-24 h-24 text-2xl" />
            )}
            <button
              onClick={() => inputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {error && <p className="text-caption text-danger">{error}</p>}

          <div className="flex gap-2 w-full">
            <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleUpload}
              disabled={!file || uploading}
              loading={uploading}
              className="flex-1"
            >
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
