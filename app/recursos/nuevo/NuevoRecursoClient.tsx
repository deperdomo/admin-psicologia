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
      // 1. Verificar duplicados de resource_id
      const exists = await checkResourceIdExists(data.resource_id)
      if (exists) {
        throw new Error('Ya existe un recurso con este Resource ID')
      }

      // 2. Subir archivos si existen
      let wordFileUrl: string | undefined
      let pdfFileUrl: string | undefined

      if (wordFile) {
        const wordPath = await uploadFile(wordFile, 'recursos-word', `${data.resource_id}.docx`)
        const { data: { publicUrl } } = supabase.storage
          .from('recursos-word')
          .getPublicUrl(wordPath.filePath)
        wordFileUrl = publicUrl
      }

      if (pdfFile) {
        const pdfPath = await uploadFile(pdfFile, 'recursos-pdf', `${data.resource_id}.pdf`)
        const { data: { publicUrl } } = supabase.storage
          .from('recursos-pdf')
          .getPublicUrl(pdfPath.filePath)
        pdfFileUrl = publicUrl
      }

      // 3. Preparar datos del recurso
      const resourceData = {
        resource_id: data.resource_id,
        title: data.title,
        description: data.description || null,
        categoria: data.categoria,
        resource_type: data.resource_type,
        age_ranges: data.age_ranges,
        difficulty_level: data.difficulty_level || null,
        tags: data.tags?.length ? data.tags : null,
        estimated_duration: data.estimated_duration || null,
        is_premium: data.is_premium || false,
        requires_supervision: data.requires_supervision || false,
        word_file_url: wordFileUrl,
        pdf_file_url: pdfFileUrl,
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