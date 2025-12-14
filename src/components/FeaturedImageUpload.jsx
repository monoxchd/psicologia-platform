import React, { useState, useRef } from 'react'
import { Button } from './ui/button'

const FeaturedImageUpload = ({
  currentImage,
  onUpload,
  onDelete,
  disabled = false,
  maxSizeMB = 5
}) => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  const handleFileSelect = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setError(null)

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Tipo de arquivo inválido. Use JPEG, PNG, GIF ou WebP.')
      return
    }

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Arquivo muito grande. Máximo ${maxSizeMB}MB.`)
      return
    }

    // Show preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target.result)
    reader.readAsDataURL(file)

    // Upload
    setUploading(true)
    try {
      await onUpload(file)
      setPreview(null) // Clear preview after successful upload
    } catch (err) {
      setError(err.message || 'Erro ao fazer upload da imagem')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!currentImage) return

    setUploading(true)
    setError(null)
    try {
      await onDelete()
    } catch (err) {
      setError(err.message || 'Erro ao remover imagem')
    } finally {
      setUploading(false)
    }
  }

  // Get the display URL - prefer preview_large variant if available
  const getDisplayUrl = () => {
    if (preview) return preview
    if (!currentImage) return null

    // If currentImage is an object with variants
    if (typeof currentImage === 'object' && currentImage.preview_large) {
      return currentImage.preview_large
    }
    // If currentImage is a string URL (legacy)
    if (typeof currentImage === 'string') {
      return currentImage
    }
    return null
  }

  const displayImage = getDisplayUrl()

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium">Imagem de Destaque</label>

      {displayImage ? (
        <div className="relative">
          <img
            src={displayImage}
            alt="Featured"
            className="w-full h-48 object-cover rounded-lg border"
          />
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2"
            onClick={handleDelete}
            disabled={disabled || uploading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </Button>
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
              <div className="text-white">Processando...</div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => !disabled && !uploading && fileInputRef.current?.click()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="8.5" cy="8.5" r="1.5"></circle>
            <polyline points="21 15 16 10 5 21"></polyline>
          </svg>
          <p className="text-gray-600">Clique para selecionar uma imagem</p>
          <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF ou WebP (máx. {maxSizeMB}MB)</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {!displayImage && (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="w-full"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="17 8 12 3 7 8"></polyline>
            <line x1="12" y1="3" x2="12" y2="15"></line>
          </svg>
          {uploading ? 'Enviando...' : 'Selecionar Imagem'}
        </Button>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}

export default FeaturedImageUpload
