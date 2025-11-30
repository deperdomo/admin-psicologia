import { supabase } from './supabase'
import { generateStoragePath } from './blogImageUtils'
import { optimizeImageForUpload } from './imageOptimization'

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
 * Verifica si existe el bucket blog-images y lo crea si es necesario
 */
async function ensureBlogImagesBucketExists(): Promise<boolean> {
  try {
    // Intentar listar buckets para ver si blog-images existe
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error al listar buckets:', listError)
      return false
    }

    // Verificar si el bucket blog-images existe
    const blogImagesBucket = buckets?.find(bucket => bucket.name === 'blog-images')
    
    if (blogImagesBucket) {
      return true // El bucket ya existe
    }

    // Solo crear el bucket si definitivamente no existe
    console.log('Bucket blog-images no encontrado, intentando crear...')
    const { error: createError } = await supabase.storage.createBucket('blog-images', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
      fileSizeLimit: 8388608 // 8MB
    })

    if (createError) {
      console.error('Error al crear bucket blog-images:', createError)
      // Si falla la creación, probablemente ya existe y las políticas están causando problemas
      // Intentemos hacer una verificación simple subiendo un archivo de prueba
      try {
        const testData = new Uint8Array([1, 2, 3, 4]) // datos mínimos
        const testBlob = new Blob([testData], { type: 'application/octet-stream' })
        const testFile = new File([testBlob], 'test-connection.tmp')
        
        const { error: testUploadError } = await supabase.storage
          .from('blog-images')
          .upload('test-connection.tmp', testFile, { upsert: true })
        
        if (!testUploadError) {
          // Si podemos subir, el bucket existe y funciona
          await supabase.storage.from('blog-images').remove(['test-connection.tmp'])
          return true
        }
      } catch {
        // Ignorar errores de prueba
      }
      
      return false
    }

    console.log('Bucket blog-images creado exitosamente')
    return true

  } catch (error) {
    console.error('Error en ensureBlogImagesBucketExists:', error)
    return false
  }
}

/**
 * Sube una imagen al bucket de blog-images en Supabase Storage
 * La imagen se optimiza automáticamente a WebP antes de la subida
 */
export async function uploadBlogImage(
  file: File, 
  slug: string
): Promise<UploadImageResult> {
  try {
    // Validar el archivo
    if (!file.type.startsWith('image/')) {
      return {
        success: false,
        error: 'El archivo debe ser una imagen'
      }
    }

    // Validar el tamaño (máximo 8MB para el archivo original)
    const maxSize = 8 * 1024 * 1024 // 8MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'La imagen no puede superar los 8MB'
      }
    }

    // Optimizar la imagen a WebP
    console.log('Optimizando imagen...', { 
      originalName: file.name, 
      originalSize: file.size 
    })
    
    const { optimizedFile, stats } = await optimizeImageForUpload(file, {
      quality: 85, // Calidad alta pero optimizada
      maxWidth: 1200, // Ancho máximo para artículos de blog
      maxHeight: 800, // Alto máximo
      format: 'webp'
    })

    console.log('Imagen optimizada:', {
      originalSize: stats.originalSize,
      optimizedSize: stats.optimizedSize,
      compressionRatio: stats.compressionRatio.toFixed(2) + '%',
      originalFilename: stats.originalFilename,
      optimizedFilename: stats.optimizedFilename
    })

    // Generar el path de almacenamiento usando la extensión WebP
    const storagePath = generateStoragePath(slug, 'webp')

    // Intentar subir directamente la imagen optimizada, ya que el bucket debería existir
    console.log('Subiendo imagen optimizada a:', storagePath)
    
    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(storagePath, optimizedFile, {
        cacheControl: '3600',
        upsert: true // Sobrescribir si existe
      })

    if (uploadError) {
      console.error('Error al subir imagen:', uploadError)
      
      // Si el error es que el bucket no existe, intentar asegurar que existe
      if (uploadError.message.includes('Bucket not found') || 
          uploadError.message.includes('bucket does not exist')) {
        
        console.log('Bucket no encontrado, intentando crear...')
        const bucketExists = await ensureBlogImagesBucketExists()
        
        if (!bucketExists) {
          return {
            success: false,
            error: 'Error al acceder al almacenamiento de imágenes'
          }
        }

        // Reintentar la subida con la imagen optimizada
        const { error: retryError } = await supabase.storage
          .from('blog-images')
          .upload(storagePath, optimizedFile, {
            cacheControl: '3600',
            upsert: true
          })

        if (retryError) {
          return {
            success: false,
            error: `Error al subir la imagen: ${retryError.message}`
          }
        }

        // Obtener la URL pública del retry
        const { data: publicUrlData } = supabase.storage
          .from('blog-images')
          .getPublicUrl(storagePath)

        return {
          success: true,
          publicUrl: publicUrlData.publicUrl,
          path: storagePath,
          optimizationStats: stats
        }
      }

      return {
        success: false,
        error: `Error al subir la imagen: ${uploadError.message}`
      }
    }

    // Obtener la URL pública
    const { data: publicUrlData } = supabase.storage
      .from('blog-images')
      .getPublicUrl(storagePath)

    return {
      success: true,
      publicUrl: publicUrlData.publicUrl,
      path: storagePath,
      optimizationStats: stats
    }

  } catch (error) {
    console.error('Error en uploadBlogImage:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }
  }
}

/**
 * Elimina una imagen del bucket de blog-images
 */
export async function deleteBlogImage(imagePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('blog-images')
      .remove([imagePath])

    if (error) {
      console.error('Error al eliminar imagen:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error en deleteBlogImage:', error)
    return false
  }
}

/**
 * Verifica si existe una imagen en el path especificado
 */
export async function checkImageExists(imagePath: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from('blog-images')
      .list(imagePath.substring(0, imagePath.lastIndexOf('/')), {
        limit: 1,
        search: imagePath.substring(imagePath.lastIndexOf('/') + 1)
      })

    if (error) {
      return false
    }

    return data && data.length > 0
  } catch {
    return false
  }
}
