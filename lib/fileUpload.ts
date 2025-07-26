import { supabase } from './supabase'

export async function uploadFile(
  file: File, 
  bucket: string, 
  path: string
): Promise<{ publicUrl: string; filePath: string }> {
  // Validar tamaño (5MB máximo)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('El archivo excede el tamaño máximo de 5MB')
  }
  
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
    filePath: data.path
  }
}

export async function deleteFile(bucket: string, path: string): Promise<void> {
  const { error } = await supabase.storage
    .from(bucket)
    .remove([path])
    
  if (error) {
    console.error('Error deleting file:', error)
    throw new Error(`Error al eliminar archivo: ${error.message}`)
  }
}