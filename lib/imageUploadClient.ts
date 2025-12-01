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
 * Detecta si el servidor soporta optimización con Sharp
 */
async function serverSupportsSharp(): Promise<boolean> {
  try {
    const response = await fetch('/api/upload-image/capabilities', {
      method: 'GET'
    })
    if (response.ok) {
      const data = await response.json()
      return data.sharpAvailable === true
    }
  } catch {
    // Si falla, asumimos que no está disponible
  }
  return false
}

/**
 * Sube una imagen con estrategia híbrida:
 * 1. Intenta usar Sharp en el servidor (mejor calidad)
 * 2. Si falla o no está disponible, usa Canvas API en el cliente (compatibilidad)
 */
export async function uploadOptimizedImage(
  file: File, 
  slug: string,
  forceClientOptimization = false // Forzar cliente para testing
): Promise<UploadImageResult> {
  try {
    let fileToUpload = file
    let stats = undefined
    let optimizationMethod = 'none'

    // Estrategia 1: Intentar con Sharp en el servidor (si no está forzado el cliente)
    if (!forceClientOptimization) {
      console.log('Intentando optimización con Sharp en el servidor...')
      
      const formData = new FormData()
      formData.append('file', file)
      formData.append('slug', slug)

      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: formData
      })

      // Si el servidor responde correctamente, usar ese resultado
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Optimización con Sharp completada')
        return {
          ...result,
          optimizationMethod: 'sharp-server'
        }
      }

      // Si hay error 500 o relacionado con Sharp, intentar con Canvas
      if (response.status === 500) {
        const errorData = await response.json()
        console.warn('⚠️ Sharp no disponible, usando Canvas API:', errorData.error)
      }
    }

    // Estrategia 2: Usar Canvas API en el cliente (fallback o forzado)
    console.log('Optimizando imagen con Canvas API en el navegador...')
    const optimized = await optimizeImageInBrowser(file, {
      maxWidth: 1200,
      maxHeight: 800,
      quality: 0.85,
      format: 'webp'
    })

    fileToUpload = optimized.file
    stats = {
      originalSize: optimized.originalSize,
      optimizedSize: optimized.optimizedSize,
      compressionRatio: optimized.compressionRatio,
      originalFilename: file.name,
      optimizedFilename: optimized.file.name
    }
    optimizationMethod = 'canvas-client'

    console.log('✅ Imagen optimizada con Canvas:', {
      originalSize: `${(optimized.originalSize / 1024).toFixed(2)} KB`,
      optimizedSize: `${(optimized.optimizedSize / 1024).toFixed(2)} KB`,
      compressionRatio: `${optimized.compressionRatio.toFixed(2)}%`
    })

    // Subir la imagen optimizada por el cliente
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
      optimizationMethod
    }
  } catch (error) {
    console.error('Error al subir imagen:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}