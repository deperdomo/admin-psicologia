'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { RecursoForm, FileUploadResult } from '@/components/forms/RecursoForm'
import { type RecursoFormSchema } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { SuccessModal } from '@/components/shared/SuccessModal'

export function NuevoRecursoClient() {
  const router = useRouter()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdResourceId, setCreatedResourceId] = useState<string>('')

  const handleSubmit = async (data: RecursoFormSchema & { 
    word_file?: File; 
    pdf_file?: File;
    word_upload_result?: FileUploadResult;
    pdf_upload_result?: FileUploadResult;
  }) => {
    try {
      // 1. Verificar duplicados de resource_id
      const { data: existingResource } = await supabase
        .from('recursos')
        .select('resource_id')
        .eq('resource_id', data.resource_id)
        .single()

      if (existingResource) {
        throw new Error('Ya existe un recurso con este Resource ID')
      }

      // 2. Preparar datos del recurso
      const resourceData: Record<string, unknown> = {
        resource_id: data.resource_id,
        title: data.title,
        description: data.description || null,
        categoria: data.categoria,
        resource_type: data.resource_type,
        age_ranges: data.age_ranges,
        difficulty: data.difficulty,
        tags: data.tags?.length ? data.tags : null,
        estimated_reading_time: data.estimated_reading_time || null,
        is_premium: data.is_premium,
        is_active: data.is_active,
      }

      // 3. Agregar información de archivos si existen
      if (data.word_upload_result) {
        resourceData.word_file_name = data.word_upload_result.fileName
        resourceData.word_storage_path = data.word_upload_result.filePath
        resourceData.word_public_url = data.word_upload_result.publicUrl
        resourceData.file_size_word = data.word_upload_result.fileSize
      }

      if (data.pdf_upload_result) {
        resourceData.pdf_file_name = data.pdf_upload_result.fileName
        resourceData.pdf_storage_path = data.pdf_upload_result.filePath
        resourceData.pdf_public_url = data.pdf_upload_result.publicUrl
        resourceData.file_size_pdf = data.pdf_upload_result.fileSize
      }

      // 4. Insertar en la base de datos
      const { data: insertedResource, error } = await supabase
        .from('recursos')
        .insert(resourceData)
        .select()
        .single()

      if (error) {
        throw new Error(`Error al crear el recurso: ${error.message}`)
      }

      // 5. Mostrar modal de éxito
      setCreatedResourceId(insertedResource.resource_id)
      setShowSuccessModal(true)

    } catch (error) {
      console.error('Error creating resource:', error)
      throw error
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    router.push('/recursos/lista')
  }

  const handleCancel = () => {
    router.push('/recursos/lista')
  }

  return (
    <>
      <RecursoForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
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