'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { RecursoForm } from '@/components/forms/RecursoForm'
import { type RecursoFormSchema } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/fileUpload'
import { generateFileName } from '@/lib/utils'
import { SuccessModal } from '@/components/shared/SuccessModal'

export function NuevoRecursoClient() {
  const router = useRouter()
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [createdResourceId, setCreatedResourceId] = useState<string>('')

  const handleSubmit = async (data: RecursoFormSchema & { word_file?: File; pdf_file?: File }) => {
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
      const resourceData: {
        resource_id: string;
        title: string;
        description: string | null;
        categoria: string;
        resource_type: string;
        age_ranges: string[];
        difficulty: string;
        tags: string[] | null;
        estimated_reading_time: number | null;
        is_premium: boolean;
        is_active: boolean;
        word_file_name?: string;
        word_storage_path?: string;
        word_public_url?: string;
        file_size_word?: number;
        pdf_file_name?: string;
        pdf_storage_path?: string;
        pdf_public_url?: string;
        file_size_pdf?: number;
      } = {
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

      // 3. Subir archivos si existen
      if (data.word_file) {
        const wordFileName = generateFileName(data.resource_id, data.word_file.name)
        const wordPath = `word-files/${wordFileName}`
        
        const { publicUrl: wordPublicUrl, filePath: wordStoragePath } = await uploadFile(
          data.word_file,
          'word-files',
          wordPath
        )

        resourceData.word_file_name = data.word_file.name
        resourceData.word_storage_path = wordStoragePath
        resourceData.word_public_url = wordPublicUrl
        resourceData.file_size_word = data.word_file.size
      }

      if (data.pdf_file) {
        const pdfFileName = generateFileName(data.resource_id, data.pdf_file.name)
        const pdfPath = `pdf-files/${pdfFileName}`
        
        const { publicUrl: pdfPublicUrl, filePath: pdfStoragePath } = await uploadFile(
          data.pdf_file,
          'pdf-files',
          pdfPath
        )

        resourceData.pdf_file_name = data.pdf_file.name
        resourceData.pdf_storage_path = pdfStoragePath
        resourceData.pdf_public_url = pdfPublicUrl
        resourceData.file_size_pdf = data.pdf_file.size
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