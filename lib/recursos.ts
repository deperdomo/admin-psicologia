import { supabase } from './supabase'
import type { Recurso, RecursoFormData } from '@/types/database'

// Obtener todos los recursos
export async function getRecursos(): Promise<Recurso[]> {
  const { data, error } = await supabase
    .from('recursos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching recursos:', error)
    throw new Error('Error al cargar los recursos')
  }

  return data || []
}

// Obtener un recurso por ID
export async function getRecursoById(id: string): Promise<Recurso | null> {
  const { data, error } = await supabase
    .from('recursos')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // No encontrado
    }
    console.error('Error fetching recurso:', error)
    throw new Error('Error al cargar el recurso')
  }

  return data
}

// Actualizar un recurso
export async function updateRecurso(
  id: string, 
  data: Partial<RecursoFormData>,
  wordFile?: File,
  pdfFile?: File
): Promise<Recurso> {
  try {
    // Subir archivos si se proporcionan
    let wordFileUrl = data.word_file_url
    let pdfFileUrl = data.pdf_file_url

    if (wordFile) {
      const wordFileName = `${data.resource_id || id}_word_${Date.now()}.docx`
      const { data: wordUpload, error: wordError } = await supabase.storage
        .from('recursos')
        .upload(`word/${wordFileName}`, wordFile)

      if (wordError) throw wordError
      
      const { data: wordUrl } = supabase.storage
        .from('recursos')
        .getPublicUrl(wordUpload.path)
      
      wordFileUrl = wordUrl.publicUrl
    }

    if (pdfFile) {
      const pdfFileName = `${data.resource_id || id}_pdf_${Date.now()}.pdf`
      const { data: pdfUpload, error: pdfError } = await supabase.storage
        .from('recursos')
        .upload(`pdf/${pdfFileName}`, pdfFile)

      if (pdfError) throw pdfError
      
      const { data: pdfUrl } = supabase.storage
        .from('recursos')
        .getPublicUrl(pdfUpload.path)
      
      pdfFileUrl = pdfUrl.publicUrl
    }

    // Actualizar el recurso en la base de datos
    const updateData = {
      ...data,
      word_file_url: wordFileUrl,
      pdf_file_url: pdfFileUrl,
      updated_at: new Date().toISOString()
    }

    const { data: updatedRecurso, error } = await supabase
      .from('recursos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating recurso:', error)
      throw new Error('Error al actualizar el recurso')
    }

    return updatedRecurso
  } catch (error) {
    console.error('Error in updateRecurso:', error)
    throw error
  }
}

// Eliminar un recurso
export async function deleteRecurso(id: string): Promise<void> {
  try {
    // Primero obtener el recurso para eliminar archivos
    const recurso = await getRecursoById(id)
    
    if (recurso) {
      // Eliminar archivos del storage
      const filesToDelete: string[] = []
      
      if (recurso.word_file_url) {
        const wordPath = recurso.word_file_url.split('/').pop()
        if (wordPath) filesToDelete.push(`word/${wordPath}`)
      }
      
      if (recurso.pdf_file_url) {
        const pdfPath = recurso.pdf_file_url.split('/').pop()
        if (pdfPath) filesToDelete.push(`pdf/${pdfPath}`)
      }

      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('recursos')
          .remove(filesToDelete)
        
        if (storageError) {
          console.warn('Error deleting files from storage:', storageError)
          // No lanzamos error aquí para no bloquear la eliminación del registro
        }
      }
    }

    // Eliminar el registro de la base de datos
    const { error } = await supabase
      .from('recursos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting recurso:', error)
      throw new Error('Error al eliminar el recurso')
    }
  } catch (error) {
    console.error('Error in deleteRecurso:', error)
    throw error
  }
}

// Descargar archivo
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('Error al descargar el archivo')
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(downloadUrl)
  } catch (error) {
    console.error('Error downloading file:', error)
    throw new Error('Error al descargar el archivo')
  }
}

// Verificar si un resource_id ya existe (excluyendo el ID actual para edición)
export async function checkResourceIdExists(resourceId: string, excludeId?: string): Promise<boolean> {
  let query = supabase
    .from('recursos')
    .select('id')
    .eq('resource_id', resourceId)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error checking resource_id:', error)
    return false
  }

  return (data?.length || 0) > 0
}