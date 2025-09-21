// Versión del lado del cliente que usa la API para optimización de imágenes

export interface UploadImageResult {
  success: boolean
  publicUrl?: string
  error?: string
  path?: string
  optimizationStats?: {
    originalSize: number
    optimizedSize: number
    compressionRatio: number
    originalFilename: string
    optimizedFilename: string
  }
}

/**
 * Sube una imagen utilizando la API de optimización del servidor
 */
export async function uploadOptimizedImage(
  file: File, 
  slug: string
): Promise<UploadImageResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('slug', slug)

    const response = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    })

    const result = await response.json()

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'Error al subir la imagen'
      }
    }

    return result
  } catch (error) {
    console.error('Error al subir imagen:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}