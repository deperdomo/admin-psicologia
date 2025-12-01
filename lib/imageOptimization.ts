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
    console.log('Iniciando optimización de imagen:', {
      filename: file.name,
      size: file.size,
      type: file.type
    })

    // Convertir File a Buffer
    const arrayBuffer = await file.arrayBuffer()
    const inputBuffer = Buffer.from(arrayBuffer)
    const originalSize = inputBuffer.length

    console.log('Buffer creado:', {
      bufferSize: inputBuffer.length,
      originalSize
    })

    // Procesar la imagen con Sharp
    let sharpInstance = sharp(inputBuffer)

    // Obtener metadatos para decidir si redimensionar
    console.log('Obteniendo metadatos de la imagen...')
    const metadata = await sharpInstance.metadata()
    const { width = 0, height = 0 } = metadata
    
    console.log('Metadatos obtenidos:', {
      width,
      height,
      format: metadata.format,
      space: metadata.space
    })

    // Redimensionar solo si la imagen es más grande que los límites
    if (width > maxWidth || height > maxHeight) {
      console.log('Redimensionando imagen...')
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
        kernel: 'lanczos3' // Mejor algoritmo de interpolación
      })
    }

    // Convertir al formato deseado con calidad optimizada
    console.log('Convirtiendo a formato:', format)
    let outputBuffer: Buffer

    try {
      switch (format) {
        case 'webp':
          outputBuffer = await sharpInstance
            .webp({ 
              quality, 
              effort: 6, // Balance entre calidad y velocidad (0-6, default 4)
              smartSubsample: true, // Mejor calidad de color
              nearLossless: false, // Usar lossy para mejor compresión
              preset: 'photo' // Optimizado para fotografías
            })
            .toBuffer()
          break
        case 'jpeg':
          outputBuffer = await sharpInstance
            .jpeg({ 
              quality, 
              progressive: true,
              optimizeScans: true, // Optimización adicional
              chromaSubsampling: '4:4:4' // Mejor calidad de color
            })
            .toBuffer()
          break
        case 'png':
          outputBuffer = await sharpInstance
            .png({ 
              compressionLevel: 9, 
              progressive: true,
              palette: true, // Intentar reducir a paleta cuando sea posible
              effort: 10 // Máximo esfuerzo de compresión
            })
            .toBuffer()
          break
        default:
          throw new Error(`Formato no soportado: ${format}`)
      }
      
      console.log('Conversión completada:', {
        outputSize: outputBuffer.length
      })
    } catch (conversionError) {
      console.error('Error en conversión de imagen:', conversionError)
      throw new Error(`Error al convertir imagen a ${format}: ${conversionError instanceof Error ? conversionError.message : 'Error desconocido'}`)
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