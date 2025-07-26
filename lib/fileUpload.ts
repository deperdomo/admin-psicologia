import { supabase } from './supabase'

export interface UploadResult {
  publicUrl: string
  filePath: string
  fileSize: number
  fileName: string
}

export async function uploadFile(
  file: File, 
  bucket: string, 
  path: string
): Promise<UploadResult> {
  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('El archivo excede el tamaño máximo de 5MB')
  }

  // Validar tipo de archivo
  const allowedTypes = {
    'recursos-word': ['.doc', '.docx', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    'recursos-pdf': ['.pdf', 'application/pdf']
  }

  const bucketAllowedTypes = allowedTypes[bucket as keyof typeof allowedTypes]
  if (bucketAllowedTypes) {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    const isValidType = bucketAllowedTypes.some(type => 
      type.startsWith('.') ? type === fileExtension : type === file.type
    )
    
    if (!isValidType) {
      throw new Error(`Tipo de archivo no válido para ${bucket}`)
    }
  }

  try {
    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      })
      
    if (error) {
      console.error('Error uploading file:', error)
      throw new Error(`Error al subir archivo: ${error.message}`)
    }
    
    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path)
      
    return {
      publicUrl,
      filePath: data.path,
      fileSize: file.size,
      fileName: file.name
    }
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from(bucket)
      .remove([path])
      
    if (error) {
      console.error('Error deleting file:', error)
      throw new Error(`Error al eliminar archivo: ${error.message}`)
    }
  } catch (error) {
    console.error('Delete error:', error)
    throw error
  }
}

export async function getFileMetadata(bucket: string, path: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/'), {
        search: path.split('/').pop()
      })

    if (error) throw error

    return data?.[0] || null
  } catch (error) {
    console.error('Error getting file metadata:', error)
    return null
  }
}

// Función para convertir Word a PDF (placeholder para futura implementación)
export async function convertWordToPdf(wordFile: File): Promise<File> {
  // TODO: Implementar conversión Word a PDF
  // Por ahora, retornamos el archivo original
  console.log('Conversión Word a PDF no implementada aún')
  throw new Error('Conversión Word a PDF no disponible')
}

// Función para validar archivos antes de subir
export function validateFile(file: File, maxSize: number = 5 * 1024 * 1024): string | null {
  if (file.size > maxSize) {
    return `El archivo excede el tamaño máximo de ${(maxSize / 1024 / 1024).toFixed(1)}MB`
  }

  // Validar nombre de archivo
  if (file.name.length > 255) {
    return 'El nombre del archivo es demasiado largo'
  }

  // Validar caracteres especiales en el nombre
  const invalidChars = /[<>:"/\\|?*]/
  if (invalidChars.test(file.name)) {
    return 'El nombre del archivo contiene caracteres no válidos'
  }

  return null
}