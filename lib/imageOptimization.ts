import sharp from 'sharp'

export interface ImageOptimizationOptions {
  quality?: number // 1-100, default 80
  maxWidth?: number // default 1200
  maxHeight?: number // default 800
  format?: 'webp' | 'jpeg' | 'png' // default 'webp'
}

export interface OptimizedImageResult {
  buffer: Buffer
  filename: string
  size: number
  originalSize: number
  compressionRatio: number
}

/**
 * Optimiza una imagen convirtiéndola a WebP y aplicando compresión
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    quality = 80,
    maxWidth = 1200,
    maxHeight = 800,
    format = 'webp'
  } = options

  try {
    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)
    const originalSize = inputBuffer.length

    // Procesar la imagen con Sharp
    let sharpInstance = sharp(inputBuffer)

    // Obtener metadatos para decidir si redimensionar
    const metadata = await sharpInstance.metadata()
    const { width = 0, height = 0 } = metadata

    // Redimensionar solo si la imagen es más grande que los límites
    if (width > maxWidth || height > maxHeight) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true
      })
    }

    // Convertir al formato deseado con calidad optimizada
    let outputBuffer: Buffer

    switch (format) {
      case 'webp':
        outputBuffer = await sharpInstance
          .webp({ quality, effort: 6 }) // effort 6 es un buen balance entre calidad y velocidad
          .toBuffer()
        break
      case 'jpeg':
        outputBuffer = await sharpInstance
          .jpeg({ quality, progressive: true })
          .toBuffer()
        break
      case 'png':
        outputBuffer = await sharpInstance
          .png({ compressionLevel: 9, progressive: true })
          .toBuffer()
        break
      default:
        throw new Error(`Formato no soportado: ${format}`)
    }

    // Generar nuevo nombre de archivo con extensión correcta
    const originalName = file.name.replace(/\.[^/.]+$/, '') // quitar extensión original
    const newFilename = `${originalName}.${format}`

    const compressionRatio = ((originalSize - outputBuffer.length) / originalSize) * 100

    return {
      buffer: outputBuffer,
      filename: newFilename,
      size: outputBuffer.length,
      originalSize,
      compressionRatio
    }

  } catch (error) {
    throw new Error(`Error al optimizar imagen: ${error instanceof Error ? error.message : 'Error desconocido'}`)
  }
}

/**
 * Convierte un Buffer optimizado de vuelta a un objeto File
 */
export function bufferToFile(buffer: Buffer, filename: string, mimeType: string): File {
  const uint8Array = new Uint8Array(buffer)
  const blob = new Blob([uint8Array], { type: mimeType })
  return new File([blob], filename, { type: mimeType })
}

/**
 * Obtiene el tipo MIME correcto para el formato especificado
 */
export function getMimeType(format: string): string {
  switch (format) {
    case 'webp':
      return 'image/webp'
    case 'jpeg':
    case 'jpg':
      return 'image/jpeg'
    case 'png':
      return 'image/png'
    default:
      return 'image/webp' // default a WebP
  }
}

/**
 * Función de conveniencia que optimiza una imagen y retorna un File listo para upload
 */
export async function optimizeImageForUpload(
  file: File,
  options: ImageOptimizationOptions = {}
): Promise<{
  optimizedFile: File
  stats: {
    originalSize: number
    optimizedSize: number
    compressionRatio: number
    originalFilename: string
    optimizedFilename: string
  }
}> {
  const result = await optimizeImage(file, options)
  const format = options.format || 'webp'
  const mimeType = getMimeType(format)
  
  const optimizedFile = bufferToFile(result.buffer, result.filename, mimeType)
  
  return {
    optimizedFile,
    stats: {
      originalSize: result.originalSize,
      optimizedSize: result.size,
      compressionRatio: result.compressionRatio,
      originalFilename: file.name,
      optimizedFilename: result.filename
    }
  }
}