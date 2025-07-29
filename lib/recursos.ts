import { supabase } from './supabase'
import { uploadFile } from './fileUpload'  // Reutilizar la función que ya funciona
import type { Recurso, RecursoFormData } from '@/types/database'

// Obtener todos los recursos
export async function getRecursos(): Promise<Recurso[]> {
  try {
    console.log('Obteniendo recursos...')
    const { data, error } = await supabase
      .from('recursos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching recursos:', error)
      throw new Error(`Error al cargar los recursos: ${error.message}`)
    }

    console.log(`Recursos obtenidos: ${data?.length || 0}`)
    return data || []
  } catch (error) {
    console.error('Error in getRecursos:', error)
    throw error
  }
}

// Obtener un recurso por ID
export async function getRecursoById(id: string): Promise<Recurso | null> {
  try {
    console.log('Obteniendo recurso por ID:', id)
    const { data, error } = await supabase
      .from('recursos')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Recurso no encontrado:', id)
        return null // No encontrado
      }
      console.error('Error fetching recurso:', error)
      throw new Error(`Error al cargar el recurso: ${error.message}`)
    }

    console.log('Recurso encontrado:', data?.resource_id)
    return data
  } catch (error) {
    console.error('Error in getRecursoById:', error)
    throw error
  }
}

// Actualizar un recurso
export async function updateRecurso(
  id: string, 
  data: Partial<RecursoFormData>,
  wordFile?: File,
  pdfFile?: File
): Promise<Recurso> {
  try {
    console.log('Actualizando recurso:', id)
    
    // Obtener el recurso actual para preservar datos existentes
    const currentRecurso = await getRecursoById(id)
    if (!currentRecurso) {
      throw new Error('Recurso no encontrado')
    }

    // Mantener las URLs existentes por defecto
    let word_public_url = currentRecurso.word_public_url
    let pdf_public_url = currentRecurso.pdf_public_url
    let word_file_name = currentRecurso.word_file_name
    let pdf_file_name = currentRecurso.pdf_file_name
    let file_size_word = currentRecurso.file_size_word
    let file_size_pdf = currentRecurso.file_size_pdf
    let word_storage_path = currentRecurso.word_storage_path || null
    let pdf_storage_path = currentRecurso.pdf_storage_path || null

    // Subir nuevo archivo Word si se proporciona
    if (wordFile) {
      console.log('Subiendo nuevo archivo Word...')
      word_file_name = wordFile.name
      file_size_word = wordFile.size
      
      const fileName = `${data.resource_id || currentRecurso.resource_id}.docx`
      const wordPath = await uploadFile(wordFile, 'recursos-word', fileName)
      word_storage_path = wordPath.filePath
      
      const { data: wordUrl } = supabase.storage
        .from('recursos-word')
        .getPublicUrl(word_storage_path)
      
      word_public_url = wordUrl.publicUrl
      console.log('Archivo Word subido:', word_public_url)
    }

    // Subir nuevo archivo PDF si se proporciona
    if (pdfFile) {
      console.log('Subiendo nuevo archivo PDF...')
      pdf_file_name = pdfFile.name
      file_size_pdf = pdfFile.size
      
      const fileName = `${data.resource_id || currentRecurso.resource_id}.pdf`
      const pdfPath = await uploadFile(pdfFile, 'recursos-pdf', fileName)
      pdf_storage_path = pdfPath.filePath
      
      const { data: pdfUrl } = supabase.storage
        .from('recursos-pdf')
        .getPublicUrl(pdf_storage_path)
      
      pdf_public_url = pdfUrl.publicUrl
      console.log('Archivo PDF subido:', pdf_public_url)
    }

    // Preparar datos de actualización con nombres correctos según el esquema
    const updateData = {
      ...(data.resource_id && { resource_id: data.resource_id }),
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.categoria && { categoria: data.categoria }),
      ...(data.resource_type && { resource_type: data.resource_type }),
      ...(data.age_ranges && { age_ranges: data.age_ranges }),
      ...(data.difficulty !== undefined && { difficulty: data.difficulty }), // Mapear difficulty -> difficulty
      ...(data.tags !== undefined && { tags: data.tags }),
      ...(data.estimated_reading_time !== undefined && { estimated_reading_time: data.estimated_reading_time }),
      ...(data.is_premium !== undefined && { is_premium: data.is_premium }),
      
      // URLs y archivos
      word_public_url,
      pdf_public_url,
      word_file_name,
      pdf_file_name,
      word_storage_path,
      pdf_storage_path,
      file_size_word,
      file_size_pdf,
      
      // Timestamp de actualización
      updated_at: new Date().toISOString()
    }

    console.log('Datos de actualización:', updateData)

    // Actualizar el recurso en la base de datos
    const { data: updatedRecurso, error } = await supabase
      .from('recursos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating recurso:', error)
      throw new Error(`Error al actualizar el recurso: ${error.message}`)
    }

    console.log('Recurso actualizado exitosamente:', updatedRecurso.resource_id)
    return updatedRecurso
  } catch (error) {
    console.error('Error in updateRecurso:', error)
    throw error
  }
}

// Eliminar un recurso
// Eliminar un recurso con DEBUG detallado del Storage
export async function deleteRecurso(id: string): Promise<void> {
  try {
    console.log('🗑️ [DEBUG] Iniciando eliminación del recurso:', id)
    
    // Primero obtener el recurso para eliminar archivos
    const recurso = await getRecursoById(id)
    
    if (recurso) {
      console.log('🗑️ [DEBUG] Recurso encontrado:', recurso.resource_id)
      console.log('🗑️ [DEBUG] Eliminando archivos del storage...')
      
      // Eliminar archivos del storage usando las rutas correctas
      const filesToDelete: { bucket: string; paths: string[] }[] = []
      
      // Preparar archivos Word para eliminar
      if (recurso.word_storage_path) {
        filesToDelete.push({
          bucket: 'recursos-word',
          paths: [recurso.word_storage_path]
        })
        console.log('🗑️ [DEBUG] Word file a eliminar:', recurso.word_storage_path)
      }
      
      // Preparar archivos PDF para eliminar
      if (recurso.pdf_storage_path) {
        filesToDelete.push({
          bucket: 'recursos-pdf', 
          paths: [recurso.pdf_storage_path]
        })
        console.log('🗑️ [DEBUG] PDF file a eliminar:', recurso.pdf_storage_path)
      }

      // 🔍 Eliminar archivos por bucket con DEBUG detallado
      for (const { bucket, paths } of filesToDelete) {
        if (paths.length > 0) {
          console.log(`🗑️ [DEBUG] Eliminando archivos del bucket ${bucket}:`, paths)
          
          // 🔍 PASO 1: Verificar si el archivo existe antes de eliminar
          console.log(`🔍 [DEBUG] Verificando existencia de archivos en bucket ${bucket}...`)
          const { data: listData, error: listError } = await supabase.storage
            .from(bucket)
            .list('', { limit: 1000, sortBy: { column: 'name', order: 'asc' } })
          
          if (listError) {
            console.error(`❌ [DEBUG] Error listando archivos en bucket ${bucket}:`, listError)
            console.error(`❌ [DEBUG] List error details:`, {
              message: listError.message,
            })
          } else {
            console.log(`📋 [DEBUG] Total archivos en bucket ${bucket}:`, listData?.length || 0)
            console.log(`📋 [DEBUG] Primeros archivos en bucket ${bucket}:`, listData?.slice(0, 10).map(f => f.name))
            
            // Verificar si nuestro archivo específico está en la lista
            const targetFile = paths[0]
            const fileExists = listData?.some(file => file.name === targetFile)
            console.log(`🔍 [DEBUG] ¿Archivo "${targetFile}" existe en bucket ${bucket}?`, fileExists)
            
            if (!fileExists) {
              console.warn(`⚠️ [DEBUG] Archivo "${targetFile}" NO encontrado en bucket ${bucket}. Archivos disponibles:`, 
                listData?.map(f => f.name).filter(name => name.includes('recurso-prueba-mas')))
            }
          }
          
          // 🔍 PASO 2: Intentar eliminar el archivo
          console.log(`🗑️ [DEBUG] Intentando eliminar archivo: "${paths[0]}" del bucket ${bucket}`)
          const { data: deleteData, error: storageError } = await supabase.storage
            .from(bucket)
            .remove(paths)
          
          if (storageError) {
            console.error(`❌ [DEBUG] Error eliminando archivos del bucket ${bucket}:`, storageError)
            console.error(`❌ [DEBUG] Storage error details:`, {
              message: storageError.message,

            })
            // No lanzamos error aquí para no bloquear la eliminación del registro
          } else {
            console.log(`📤 [DEBUG] Respuesta de eliminación del bucket ${bucket}:`, deleteData)
            console.log(`📤 [DEBUG] Datos de eliminación:`, {
              bucket,
              paths,
              responseData: deleteData
            })
            
            // 🔍 PASO 3: Verificar si realmente se eliminó
            console.log(`🔍 [DEBUG] Verificando si el archivo se eliminó realmente...`)
            const { data: verifyData, error: verifyError } = await supabase.storage
              .from(bucket)
              .list('', { limit: 1000 })
            
            if (verifyError) {
              console.error(`❌ [DEBUG] Error verificando eliminación:`, verifyError)
            } else {
              const targetFile = paths[0]
              const stillExists = verifyData?.some(file => file.name === targetFile)
              console.log(`🔍 [DEBUG] ¿Archivo "${targetFile}" aún existe después de eliminar?`, stillExists)
              
              if (stillExists) {
                console.error(`❌ [DEBUG] ¡PROBLEMA! El archivo "${targetFile}" NO se eliminó del bucket ${bucket}`)
                console.error(`❌ [DEBUG] El archivo sigue en el storage. Verificar permisos RLS del bucket.`)
              } else {
                console.log(`✅ [DEBUG] ¡ÉXITO! El archivo "${targetFile}" se eliminó correctamente del bucket ${bucket}`)
              }
            }
          }
        }
      }
    } else {
      console.log('⚠️ [DEBUG] Recurso no encontrado, procediendo con eliminación del registro')
    }

    // Eliminar el registro de la base de datos  
    console.log('🗑️ [DEBUG] Eliminando registro de la base de datos...')
    const { error, data } = await supabase
      .from('recursos')
      .delete()
      .eq('id', id)
      .select() // Agregar select para ver qué se eliminó

    if (error) {
      console.error('❌ [DEBUG] Error deleting recurso from database:', error)
      console.error('❌ [DEBUG] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw new Error(`Error al eliminar el recurso: ${error.message}`)
    }

    console.log('✅ [DEBUG] Registro eliminado de la BD. Registros afectados:', data?.length || 0)
    console.log('✅ [DEBUG] Datos eliminados:', data)
    console.log('✅ [DEBUG] Recurso eliminado exitosamente')
  } catch (error) {
    console.error('❌ [DEBUG] Error in deleteRecurso:', error)
    throw error
  }
}

// Descargar archivo
export async function downloadFile(url: string, filename: string): Promise<void> {
  try {
    console.log('Descargando archivo:', url)
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Error al descargar el archivo: ${response.status} ${response.statusText}`)
    }
    
    const blob = await response.blob()
    const downloadUrl = window.URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    window.URL.revokeObjectURL(downloadUrl)
    console.log('Archivo descargado exitosamente:', filename)
  } catch (error) {
    console.error('Error downloading file:', error)
    throw new Error('Error al descargar el archivo')
  }
}

// Verificar si un resource_id ya existe (excluyendo el ID actual para edición)
export async function checkResourceIdExists(resourceId: string, excludeId?: string): Promise<boolean> {
  try {
    console.log('Verificando si resource_id existe:', resourceId, 'excluyendo:', excludeId)
    
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
    const exists = (data?.length || 0) > 0
    console.log(`Resource ID ${resourceId} existe:`, exists)
    return exists
  } catch (error) {
    console.error('Error in checkResourceIdExists:', error)
    return false
  }
}