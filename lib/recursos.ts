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
    console.log('🔄 Actualizando recurso:', id)
    
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

    // CORRECCIÓN: Subir nuevo archivo Word si se proporciona
    if (wordFile) {
      console.log('📄 Subiendo nuevo archivo Word...')
      word_file_name = wordFile.name
      file_size_word = wordFile.size
      
      const fileName = `${data.resource_id || currentRecurso.resource_id}.docx`
      console.log('📁 Word fileName:', fileName)
      
      // Llamar a uploadFile y obtener el resultado completo
      const wordUploadResult = await uploadFile(wordFile, 'recursos-word', fileName)
      console.log('📋 Word upload result:', wordUploadResult)
      
      // Usar los valores del resultado del upload
      word_storage_path = wordUploadResult.filePath
      word_public_url = wordUploadResult.publicUrl
      
      console.log('✅ Word file uploaded:')
      console.log('  - Storage path:', word_storage_path)
      console.log('  - Public URL:', word_public_url)
      
      // VERIFICACIÓN ADICIONAL: Confirmar que la URL no es null/undefined
      if (!word_public_url || word_public_url.trim() === '') {
        throw new Error('Failed to generate Word public URL')
      }
    }

    // CORRECCIÓN: Subir nuevo archivo PDF si se proporciona
    if (pdfFile) {
      console.log('📄 Subiendo nuevo archivo PDF...')
      pdf_file_name = pdfFile.name
      file_size_pdf = pdfFile.size
      
      const fileName = `${data.resource_id || currentRecurso.resource_id}.pdf`
      console.log('📁 PDF fileName:', fileName)
      
      // Llamar a uploadFile y obtener el resultado completo
      const pdfUploadResult = await uploadFile(pdfFile, 'recursos-pdf', fileName)
      console.log('📋 PDF upload result:', pdfUploadResult)
      
      // Usar los valores del resultado del upload
      pdf_storage_path = pdfUploadResult.filePath
      pdf_public_url = pdfUploadResult.publicUrl
      
      console.log('✅ PDF file uploaded:')
      console.log('  - Storage path:', pdf_storage_path)
      console.log('  - Public URL:', pdf_public_url)
      
      // VERIFICACIÓN ADICIONAL: Confirmar que la URL no es null/undefined
      if (!pdf_public_url || pdf_public_url.trim() === '') {
        throw new Error('Failed to generate PDF public URL')
      }
    }

    // Preparar datos de actualización
    const updateData: Partial<Recurso> & { updated_at: string } = {
      updated_at: new Date().toISOString()
    }

    // Solo agregar campos que están presentes en data
    if (data.resource_id !== undefined) updateData.resource_id = data.resource_id
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.categoria !== undefined) updateData.categoria = data.categoria
    if (data.resource_type !== undefined) updateData.resource_type = data.resource_type
    if (data.age_ranges !== undefined) updateData.age_ranges = data.age_ranges
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty
    if (data.tags !== undefined) updateData.tags = data.tags
    if (data.estimated_reading_time !== undefined) updateData.estimated_reading_time = data.estimated_reading_time
    if (data.is_premium !== undefined) updateData.is_premium = data.is_premium

    // CORRECCIÓN: Siempre actualizar datos de archivos con verificación
    updateData.word_public_url = word_public_url
    updateData.pdf_public_url = pdf_public_url
    updateData.word_file_name = word_file_name
    updateData.pdf_file_name = pdf_file_name
    updateData.word_storage_path = word_storage_path
    updateData.pdf_storage_path = pdf_storage_path
    updateData.file_size_word = file_size_word
    updateData.file_size_pdf = file_size_pdf

    // DEBUGGING MEJORADO: Mostrar URLs antes del UPDATE
    console.log('🔍 URLs antes del UPDATE:')
    console.log('  - word_public_url:', word_public_url)
    console.log('  - pdf_public_url:', pdf_public_url)
    console.log('  - word_storage_path:', word_storage_path)
    console.log('  - pdf_storage_path:', pdf_storage_path)

    console.log('📊 Datos de actualización completos:', updateData)

    // Verificar que el recurso existe
    const { data: existingResource, error: checkError } = await supabase
      .from('recursos')
      .select('id')
      .eq('id', id)
      .single()

    if (checkError || !existingResource) {
      throw new Error(`Error al verificar el recurso: ${checkError?.message || 'Recurso no encontrado'}`)
    }

    // Actualizar el recurso en la base de datos
    console.log('🔄 Ejecutando UPDATE con ID:', id)

    const { data: updateResult, error: updateError } = await supabase
      .from('recursos')
      .update(updateData)
      .eq('id', id)
      .select('*')

    console.log('📊 Resultado del UPDATE:')
    console.log('  - Error:', updateError)
    console.log('  - Data length:', updateResult?.length)
    
    if (updateResult && updateResult.length > 0) {
      console.log('🔍 URLs después del UPDATE:')
      console.log('  - word_public_url:', updateResult[0].word_public_url)
      console.log('  - pdf_public_url:', updateResult[0].pdf_public_url)
    }

    if (updateError) {
      console.error('❌ Error updating recurso:', updateError)
      throw new Error(`Error al actualizar el recurso: ${updateError.message}`)
    }

    if (!updateResult || updateResult.length === 0) {
      console.error('❌ UPDATE no retornó datos - posible problema de permisos o RLS')
      throw new Error('La actualización no afectó ninguna fila. Posible problema de permisos.')
    }

    const updatedRecurso = updateResult[0]
    console.log('✅ Recurso actualizado exitosamente:', updatedRecurso.resource_id)
    
    // VERIFICACIÓN FINAL: Confirmar que las URLs se guardaron correctamente
    if (wordFile && !updatedRecurso.word_public_url) {
      console.error('❌ ALERTA: word_public_url es NULL después del UPDATE!')
      console.error('  - URL que se intentó guardar:', word_public_url)
    }
    
    if (pdfFile && !updatedRecurso.pdf_public_url) {
      console.error('❌ ALERTA: pdf_public_url es NULL después del UPDATE!')
      console.error('  - URL que se intentó guardar:', pdf_public_url)
    }
    
    return updatedRecurso

  } catch (error) {
    console.error('❌ Error in updateRecurso:', error)
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

// Verificar si un resource_id ya existe (excluyendo un ID específico para ediciones)
export async function checkResourceIdExists(
  resourceId: string, 
  excludeId?: string
): Promise<boolean> {
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
      throw new Error(`Error al verificar resource_id: ${error.message}`)
    }

    const exists = data && data.length > 0
    console.log(`Resource ID ${resourceId} existe:`, exists)
    return exists
  } catch (error) {
    console.error('Error in checkResourceIdExists:', error)
    throw error
  }
}


// Función temporal de diagnóstico - agregar al archivo recursos.ts
export async function debugResourcePermissions(id: string) {
  try {
    console.log('🔍 === DIAGNÓSTICO DE PERMISOS ===')
    
    // 1. Verificar usuario actual
    const { data: { user } } = await supabase.auth.getUser()
    console.log('👤 Usuario actual:', {
      id: user?.id,
      email: user?.email,
      role: user?.role,
      aud: user?.aud
    })

    // 2. Intentar SELECT simple
    const { data: selectData, error: selectError } = await supabase
      .from('recursos')
      .select('*')
      .eq('id', id)
      .single()
    
    console.log('📖 SELECT result:', {
      error: selectError,
      hasData: !!selectData,
      resourceId: selectData?.resource_id
    })

    // 3. Intentar UPDATE simple (sin cambios reales)
    const { data: updateData, error: updateError, count } = await supabase
      .from('recursos')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')

    console.log('✏️ UPDATE test result:', {
      error: updateError,
      count: count,
      hasData: !!updateData,
      dataLength: updateData?.length
    })

    // 4. Verificar políticas RLS si hay error
    if (updateError) {
      console.log('🚨 Posibles causas del error:')
      console.log('   - RLS (Row Level Security) bloqueando UPDATE')
      console.log('   - Usuario sin permisos de escritura')
      console.log('   - Política específica para el campo que estás actualizando')
      console.log('   - Error en la estructura de la consulta')
    }

  } catch (error) {
    console.error('❌ Error en diagnóstico:', error)
  }
}