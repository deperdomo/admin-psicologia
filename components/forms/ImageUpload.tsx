"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { X, Image as ImageIcon, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

interface ImageUploadProps {
  onImageSelect: (file: File | null) => void
  currentImage?: File | null
  currentImageUrl?: string // URL de la imagen actual (cuando se está editando)
  disabled?: boolean
  maxSize?: number // en bytes, default 5MB
  accept?: string
  placeholder?: string
}

export function ImageUpload({ 
  onImageSelect, 
  currentImage,
  currentImageUrl,
  disabled = false,
  maxSize = 5 * 1024 * 1024, // 5MB por defecto
  accept = "image/*",
}: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Establecer la imagen inicial solo en el cliente para evitar problemas de hidratación
  useEffect(() => {
    if (currentImageUrl && !previewUrl) {
      setPreviewUrl(currentImageUrl)
    }
  }, [currentImageUrl, previewUrl])

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return

    const file = files[0]
    
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido')
      return
    }

    // Validar tamaño
    if (file.size > maxSize) {
      const maxSizeMB = maxSize / (1024 * 1024)
      alert(`El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`)
      return
    }

    // Crear preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    onImageSelect(file)
  }, [maxSize, onImageSelect])

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (disabled) return
    
    handleFiles(e.dataTransfer.files)
  }, [disabled, handleFiles])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()
    if (disabled) return
    
    handleFiles(e.target.files)
  }

  const removeImage = () => {
    setPreviewUrl(null)
    onImageSelect(null as File | null) // Resetear la selección
  }

  const openFileExplorer = () => {
    console.log('openFileExplorer called, disabled:', disabled, 'inputRef.current:', inputRef.current)
    if (!disabled && inputRef.current) {
      console.log('Clicking input...')
      inputRef.current.click()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  return (
    <div className="w-full">
      {/* Input oculto siempre presente para poder hacer click desde cualquier parte */}
      <Input
        ref={inputRef}
        id="image-upload"
        type="file"
        className="hidden"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled}
      />
      
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'}
          ${previewUrl ? 'border-green-300 bg-green-50' : ''}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="space-y-3">
            <div className="relative inline-block group">
              <button
                type="button"
                className="relative cursor-pointer border-0 bg-transparent p-0"
                onClick={openFileExplorer}
                disabled={disabled}
              >
                <Image
                  src={previewUrl}
                  alt="Preview"
                  width={300}
                  height={200}
                  className="max-h-48 max-w-full rounded-lg shadow-sm object-cover transition-opacity group-hover:opacity-75"
                />
                {!disabled && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-black/50 rounded-lg px-4 py-2 flex items-center gap-2 text-white">
                      <Upload className="h-4 w-4" />
                      <span className="text-sm font-medium">Cambiar imagen</span>
                    </div>
                  </div>
                )}
              </button>
              {!disabled && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage()
                  }}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            {currentImage ? (
              <div className="text-sm text-gray-600">
                <p className="font-medium">{currentImage.name}</p>
                <p>{formatFileSize(currentImage.size)}</p>
              </div>
            ) : currentImageUrl ? (
              <div className="text-sm text-gray-600">
                <p className="font-medium">Imagen actual</p>
                <p className="text-xs text-muted-foreground">Haz clic en la imagen para cambiarla</p>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="space-y-2">
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <span className="text-blue-600 hover:text-blue-500 font-medium">
                  Haz clic para subir
                </span>
                <span className="text-gray-500"> o arrastra y suelta</span>
              </Label>
            </div>
            <p className="text-xs text-gray-500">
              PNG, JPG, WEBP hasta {formatFileSize(maxSize)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
