'use client'

import { useRouter } from 'next/navigation'
import { useRequireAuth } from '@/lib/hooks/useRequireAuth'
import { useState } from 'react'
import RecursoForm from '@/components/forms/RecursoForm'
import { type RecursoFormData } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { checkResourceIdExists } from '@/lib/recursos'
import { uploadFile } from '@/lib/fileUpload'
import { SuccessModal } from '@/components/shared/SuccessModal'

export function NuevoRecursoClient() {
  const { user, loading } = useRequireAuth();
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdResourceId, setCreatedResourceId] = useState<string>('')

  if (loading) return <div>Cargando...</div>;
  if (!user) return null;

  const handleSubmit = async (data: RecursoFormData, wordFile?: File, pdfFile?: File) => {
    setIsSubmitting(true)
    try {
      
      // Verificar sesión actual
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No hay sesión activa')
      }

      // 1. Verificar duplicados de resource_id
      const exists = await checkResourceIdExists(data.resource_id)
      if (exists) {
        throw new Error('Ya existe un recurso con este Resource ID')
      }

      // Validar campos requeridos
      if (!data.resource_id || !data.title || !data.categoria || !data.resource_type || !data.age_ranges || !Array.isArray(data.age_ranges) || data.age_ranges.length === 0) {
        throw new Error('Faltan campos requeridos')
      }

      // Validar que al menos un archivo esté presente
      if (!wordFile && !pdfFile) {
        throw new Error('Al menos un archivo (Word o PDF) es requerido')
      }

      // 2. Subir archivos si existen y recolectar metadatos
      let word_public_url: string | undefined
      let pdf_public_url: string | undefined
      let word_file_name: string | null = null
      let pdf_file_name: string | null = null
      let file_size_word: number | null = null
      let file_size_pdf: number | null = null
      let word_storage_path: string | null = null
      let pdf_storage_path: string | null = null

      if (wordFile) {
        word_file_name = wordFile.name
        file_size_word = wordFile.size
        try {
          const fileName = `${data.resource_id}.docx`
          const wordPath = await uploadFile(wordFile, 'recursos-word', fileName)
          word_storage_path = wordPath.filePath
          
          const { data: { publicUrl } } = supabase.storage
            .from('recursos-word')
            .getPublicUrl(word_storage_path)
          word_public_url = publicUrl
          console.log('Word file subido exitosamente:', word_public_url)
        } catch (uploadError) {
          console.error('Error específico al subir Word:', uploadError)
          throw uploadError
        }
      }

      if (pdfFile) {
        pdf_file_name = pdfFile.name
        file_size_pdf = pdfFile.size
        try {
          const fileName = `${data.resource_id}.pdf`
          const pdfPath = await uploadFile(pdfFile, 'recursos-pdf', fileName)
          pdf_storage_path = pdfPath.filePath
          
          const { data: { publicUrl } } = supabase.storage
            .from('recursos-pdf')
            .getPublicUrl(pdf_storage_path)
          pdf_public_url = publicUrl
          console.log('PDF file subido exitosamente:', pdf_public_url)
        } catch (uploadError) {
          console.error('Error específico al subir PDF:', uploadError)
          throw uploadError
        }
      }

      // 3. Preparar datos del recurso con nombres de columnas correctos según el esquema
      const resourceData = {
        resource_id: data.resource_id,
        title: data.title,
        description: data.description || null,
        categoria: data.categoria,
        resource_type: data.resource_type,
        age_ranges: data.age_ranges,
        // CORREGIDO: usar 'difficulty' en lugar de 'difficulty'
        difficulty: data.difficulty || null,
        tags: data.tags?.length ? data.tags : null,
        estimated_reading_time: data.estimated_reading_time || null,
        is_premium: data.is_premium || false,
        // NOTA: 'requires_supervision' no existe en tu esquema, lo removemos
        // requires_supervision: data.requires_supervision || false,
        
        // URLs públicas
        word_public_url,
        pdf_public_url,
        
        // Nombres de archivos originales
        word_file_name,
        pdf_file_name,
        
        // Rutas de almacenamiento
        word_storage_path,
        pdf_storage_path,
        
        // Tamaños de archivos
        file_size_word,
        file_size_pdf,
      }

      console.log('Datos a insertar:', resourceData)

      // 4. Insertar en la base de datos
      const { data: insertedResource, error } = await supabase
        .from('recursos')
        .insert(resourceData)
        .select()
        .single()

      if (error) {
        console.error('Error detallado de Supabase:', error)
        throw new Error(`Error al crear el recurso: ${error.message}`)
      }

      console.log('Recurso creado exitosamente:', insertedResource)

      // 5. Mostrar modal de éxito
      setCreatedResourceId(insertedResource.resource_id)
      setShowSuccessModal(true)

    } catch (error) {
      console.error('Error creating resource:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    router.push('/recursos/lista')
  }

  return (
    <>
      <RecursoForm
        onSubmit={handleSubmit}
        submitLabel="Crear Recurso"
        disabled={isSubmitting}
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="¡Recurso creado exitosamente!"
        message={`El recurso "${createdResourceId}" ha sido creado y guardado correctamente.`}
      />
    </>
  )
}