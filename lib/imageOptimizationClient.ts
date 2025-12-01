// Optimización del lado del cliente (sin Sharp)
// Compatible con cualquier plataforma de deployment

export interface ClientImageOptimizationOptions {
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}

export interface OptimizedImageResult {
  file: File
  originalSize: number
  optimizedSize: number
  compressionRatio: number
}

/**
 * Optimiza una imagen en el navegador usando Canvas API
 * Compatible con cualquier entorno de deployment (Netlify, Vercel, etc.)
 */
export async function optimizeImageInBrowser(
  file: File,
  options: ClientImageOptimizationOptions = {}
): Promise<OptimizedImageResult> {
  const {
    maxWidth = 1200,
    maxHeight = 800,
    quality = 0.85,
    format = 'webp'
  } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const originalSize = file.size

    img.onload = () => {
      try {
        // Calcular nuevas dimensiones manteniendo aspect ratio
        let { width, height } = img
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        // Usar técnica de downscaling progresivo para mejor calidad
        // (Técnica Hermite: reducir en pasos de 50% es más suave)
        let currentWidth = img.width
        let currentHeight = img.height
        
        // Crear canvas temporal para downscaling progresivo si la reducción es grande
        const needsProgressive = currentWidth > width * 2 || currentHeight > height * 2
        
        let canvas: HTMLCanvasElement
        let ctx: CanvasRenderingContext2D
        
        if (needsProgressive) {
          // Downscaling progresivo para mejor calidad
          const tempCanvas = document.createElement('canvas')
          const tempCtx = tempCanvas.getContext('2d')!
          
          tempCanvas.width = currentWidth
          tempCanvas.height = currentHeight
          tempCtx.drawImage(img, 0, 0)
          
          // Reducir por pasos hasta llegar al tamaño objetivo
          while (currentWidth > width * 2 || currentHeight > height * 2) {
            currentWidth = Math.floor(currentWidth / 2)
            currentHeight = Math.floor(currentHeight / 2)
            
            const intermediateCanvas = document.createElement('canvas')
            intermediateCanvas.width = currentWidth
            intermediateCanvas.height = currentHeight
            const intermediateCtx = intermediateCanvas.getContext('2d')!
            
            intermediateCtx.imageSmoothingEnabled = true
            intermediateCtx.imageSmoothingQuality = 'high'
            intermediateCtx.drawImage(tempCanvas, 0, 0, currentWidth, currentHeight)
            
            tempCanvas.width = currentWidth
            tempCanvas.height = currentHeight
            tempCtx.clearRect(0, 0, currentWidth, currentHeight)
            tempCtx.drawImage(intermediateCanvas, 0, 0)
          }
          
          // Paso final al tamaño objetivo
          canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          ctx = canvas.getContext('2d')!
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(tempCanvas, 0, 0, width, height)
        } else {
          // Reducción simple si no es muy grande la diferencia
          canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height
          ctx = canvas.getContext('2d')!
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)
        }

        // Convertir a Blob con el formato y calidad especificados
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al crear el blob de la imagen'))
              return
            }

            const mimeType = `image/${format}`
            const optimizedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, `.${format}`),
              { type: mimeType }
            )

            const compressionRatio = ((originalSize - blob.size) / originalSize) * 100

            resolve({
              file: optimizedFile,
              originalSize,
              optimizedSize: blob.size,
              compressionRatio
            })
          },
          `image/${format}`,
          quality
        )
      } catch (error) {
        reject(error)
      } finally {
        URL.revokeObjectURL(img.src)
      }
    }

    img.onerror = () => {
      URL.revokeObjectURL(img.src)
      reject(new Error('Error al cargar la imagen'))
    }

    img.src = URL.createObjectURL(file)
  })
}
