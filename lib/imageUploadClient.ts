// Versión del lado del cliente con optimización en el navegador
// Compatible con Netlify Edge Functions y cualquier entorno serverless

import { optimizeImageInBrowser } from './imageOptimizationClient'

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
 * Sube una imagen con optimización en el cliente usando Canvas API
 * Esta versión es 100% compatible con Netlify y cualquier plataforma
 */
export async function uploadOptimizedImage(
  file: File, 
  slug: string
): Promise<UploadImageResult> {
  try {
    // SIEMPRE optimizar en el cliente (compatibilidad garantizada)
    console.log('Optimizando imagen con Canvas API en el navegador...')
    const optimized = await optimizeImageInBrowser(file, {
      maxWidth: 1200,
      maxHeight: 800,
      quality: 0.85,
      format: 'webp'
    })

    const fileToUpload = optimized.file
    const stats = {
      originalSize: optimized.originalSize,
      optimizedSize: optimized.optimizedSize,
      compressionRatio: optimized.compressionRatio,
      originalFilename: file.name,
      optimizedFilename: optimized.file.name
    }

    console.log('✅ Imagen optimizada con Canvas:', {
      originalSize: `${(optimized.originalSize / 1024).toFixed(2)} KB`,
      optimizedSize: `${(optimized.optimizedSize / 1024).toFixed(2)} KB`,
      compressionRatio: `${optimized.compressionRatio.toFixed(2)}%`
    })

    // Subir la imagen ya optimizada
    const formData = new FormData()
    formData.append('file', fileToUpload)
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

    // Incluir las estadísticas de optimización
    return {
      ...result,
      optimizationStats: stats,
      optimizationMethod: 'canvas-client'
    }
  } catch (error) {
    console.error('Error al subir imagen:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}