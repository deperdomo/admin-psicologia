import { supabase } from './supabase'
import { generateStoragePath, getFileExtension } from './blogImageUtils'

export interface UploadImageResult {
  success: boolean
  publicUrl?: string
  error?: string
  path?: string
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
      fileSizeLimit: 5242880 // 5MB
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

    // Validar el tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'La imagen no puede superar los 5MB'
      }
    }

    // Generar el path de almacenamiento
    const fileExtension = getFileExtension(file.name)
    const storagePath = generateStoragePath(slug, fileExtension)

    // Intentar subir directamente, ya que el bucket debería existir
    console.log('Subiendo imagen a:', storagePath)
    
    const { error: uploadError } = await supabase.storage
      .from('blog-images')
      .upload(storagePath, file, {
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

        // Reintentar la subida
        const { error: retryError } = await supabase.storage
          .from('blog-images')
          .upload(storagePath, file, {
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
          path: storagePath
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
      path: storagePath
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
