'use client'


import { useCallback, useState } from 'react'
import { useDropzone, FileRejection } from 'react-dropzone'
import { Upload, File, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatFileSize } from '@/lib/utils'

interface FileUploadProps {
  accept: string
  maxSize: number
  onFileSelect: (file: File | undefined) => void
  currentFile?: File
  placeholder?: string
}

export function FileUpload({ 
  accept, 
  maxSize, 
  onFileSelect, 
  currentFile, 
  placeholder = "Arrastra un archivo aquí o haz clic para seleccionar" 
}: FileUploadProps) {
  const [error, setError] = useState<string>('')

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
    setError('')
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`El archivo excede el tamaño máximo de ${formatFileSize(maxSize)}`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Tipo de archivo no válido')
      } else {
        setError('Error al cargar el archivo')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0])
    }
  }, [maxSize, onFileSelect])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: accept.split(',').reduce((acc, type) => {
      acc[type.trim()] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: false
  })

  const removeFile = () => {
    onFileSelect(undefined)
    setError('')
  }

  return (
    <div className="space-y-2">
      {!currentFile ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
            ${isDragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-gray-300 hover:border-gray-400'
            }
            ${error ? 'border-red-300 bg-red-50' : ''}
          `}
        >
          <input {...getInputProps()} />
          <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm text-gray-600 mb-1">
            {isDragActive ? 'Suelta el archivo aquí...' : placeholder}
          </p>
          <p className="text-xs text-gray-500">
            Tamaño máximo: {formatFileSize(maxSize)}
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2">
            <File className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {currentFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(currentFile.size)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="text-gray-500 hover:text-red-500"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}