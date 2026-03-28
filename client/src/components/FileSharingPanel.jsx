import { useState, useEffect, useRef } from 'react'
import { Upload, FileText, Image, Film, File, Trash2 } from 'lucide-react'
import api from '../lib/api'
import { Button } from './ui/Button'

function getFileIcon(mimetype) {
  if (!mimetype) return File
  if (mimetype.startsWith('image/')) return Image
  if (mimetype.startsWith('video/')) return Film
  return FileText
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'

export default function FileSharingPanel({ noteId, socketRef, currentUserId, highlightId }) {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await api.get(`/notes/${noteId}/files`)
        setFiles(res.data)
      } catch (err) {
        console.error('Failed to fetch files:', err)
      }
    }
    fetchFiles()
  }, [noteId])

  useEffect(() => {
    const socket = socketRef?.current
    if (!socket) return
    const handler = (file) => {
      setFiles((prev) => {
        if (prev.find((f) => f.id === file.id)) return prev
        return [file, ...prev]
      })
    }
    socket.on('file-uploaded', handler)
    return () => socket.off('file-uploaded', handler)
  }, [socketRef])

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await api.post(`/notes/${noteId}/files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setFiles((prev) => {
        if (prev.find((f) => f.id === res.data.id)) return prev
        return [res.data, ...prev]
      })
    } catch (err) {
      console.error('Upload failed:', err)
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const handleDelete = async (fid) => {
    try {
      await api.delete(`/notes/${noteId}/files/${fid}`)
      setFiles((prev) => prev.filter((f) => f.id !== fid))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  return (
    <div className="flex flex-col overflow-hidden h-full">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="font-semibold font-serif text-content-primary">File Sharing</h3>
      </div>

      <div className="px-4 pb-3">
        <Button
          variant="primary"
          size="sm"
          icon={<Upload className="w-4 h-4" />}
          onClick={() => inputRef.current?.click()}
          loading={uploading}
          className="w-full"
        >
          Upload Files
        </Button>
        <input
          ref={inputRef}
          type="file"
          onChange={handleUpload}
          className="hidden"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {files.map((file) => {
          const Icon = getFileIcon(file.mimetype)
          return (
            <div
              key={file.id}
              data-file-id={file.id}
              className={`flex items-center gap-3 p-2 rounded-card bg-surface-secondary hover:bg-primary-light/50 transition-colors group ${highlightId === file.id ? 'animate-highlight-flash' : ''}`}
              ref={highlightId === file.id ? (el) => el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }) : undefined}
            >
              <Icon className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <a
                  href={`${API_BASE}/uploads/files/${file.filename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-body text-content-primary hover:text-primary truncate block"
                >
                  {file.original_name}
                </a>
                <span className="text-caption text-content-secondary">
                  {formatSize(file.size)}
                </span>
              </div>
              {file.user_id === currentUserId && (
                <button
                  onClick={() => handleDelete(file.id)}
                  className="opacity-0 group-hover:opacity-100 text-content-secondary hover:text-danger transition-all"
                  aria-label="Delete file"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )
        })}

        {files.length === 0 && (
          <p className="text-caption text-content-secondary text-center py-4">
            No files uploaded yet
          </p>
        )}
      </div>
    </div>
  )
}
