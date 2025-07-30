'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRequireAuth } from '@/lib/hooks/useRequireAuth'
import { getRecursoById, updateRecurso, checkResourceIdExists } from '@/lib/recursos'
import RecursoForm from '@/components/forms/RecursoForm'
import { SuccessModal } from '@/components/shared/SuccessModal'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent } from '@/components/ui/card'
import type { Recurso, RecursoFormData } from '@/types/database'

export default function EditarRecursoClient() {
  const { user, loading: authLoading } = useRequireAuth()
  const router = useRouter()
  const params = useParams()
  const resourceId = params.id as string

  const [recurso, setRecurso] = useState<Recurso | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  // Cargar el recurso
  useEffect(() => {
    const loadRecurso = async () => {
      if (!resourceId || !user) return

      try {
        setLoading(true)
        setError(null)
        console.log('Cargando recurso para editar:', resourceId)
        
        const data = await getRecursoById(resourceId)
        if (!data) {
          setError('Recurso no encontrado')
          return
        }
        
        console.log('Recurso cargado:', data)
        setRecurso(data)
      } catch (err) {
        console.error('Error al cargar recurso:', err)
        setError(err instanceof Error ? err.message : 'Error al cargar el recurso')
      } finally {
        setLoading(false)
      }
    }

    loadRecurso()
  }, [resourceId, user])

  const handleSubmit = async (data: RecursoFormData, wordFile?: File, pdfFile?: File) => {
    if (!recurso) return

    setIsSubmitting(true)
    try {
      console.log('Actualizando recurso:', recurso.id, 'con datos:', data)

      // Verificar si el resource_id cambió y si ya existe
      if (data.resource_id !== recurso.resource_id) {
        const exists = await checkResourceIdExists(data.resource_id, recurso.id)
        if (exists) {
          throw new Error('Ya existe un recurso con este Resource ID')
        }
      }

      // Validar campos requeridos
      if (!data.resource_id || !data.title || !data.categoria || !data.resource_type || !data.age_ranges || !Array.isArray(data.age_ranges) || data.age_ranges.length === 0) {
        throw new Error('Faltan campos requeridos')
      }

      // Actualizar el recurso
      const updatedRecurso = await updateRecurso(recurso.id, data, wordFile, pdfFile)
      console.log('Recurso actualizado:', updatedRecurso)

      // Actualizar el estado local
      setRecurso(updatedRecurso)
      setShowSuccessModal(true)

    } catch (error) {
      console.error('Error updating resource:', error)
      throw error
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    router.push('/recursos/lista')
  }

  // Loading states
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">
          {authLoading ? 'Verificando autenticación...' : 'Cargando recurso...'}
        </span>
      </div>
    )
  }

  if (!user) return null

  if (error) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Error al Cargar Recurso</h1>
        </div>
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <button
            onClick={() => router.push('/recursos/lista')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Volver a la Lista
          </button>
        </div>
      </div>
    )
  }

  if (!recurso) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-3xl font-bold text-gray-900">Recurso No Encontrado</h1>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600 mb-4">El recurso solicitado no existe o ha sido eliminado.</p>
            <button
              onClick={() => router.push('/recursos/lista')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Volver a la Lista
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Convertir el recurso para el formulario (mapear difficulty -> difficulty)
  const initialFormData: Partial<RecursoFormData> = {
    resource_id: recurso.resource_id,
    title: recurso.title,
    description: recurso.description || '',
    categoria: recurso.categoria,
    resource_type: recurso.resource_type,
    age_ranges: recurso.age_ranges,
    difficulty: recurso.difficulty ?? undefined,
    tags: recurso.tags || [],
    estimated_reading_time: recurso.estimated_reading_time || undefined,
    is_premium: recurso.is_premium || false,
    word_public_url: recurso.word_public_url || undefined,
    pdf_public_url: recurso.pdf_public_url || undefined,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-3xl font-bold text-gray-900">Editar Recurso</h1>
        <p className="text-gray-600 mt-2">
          Modificando: <span className="font-medium">{recurso.resource_id} - {recurso.title}</span>
        </p>
      </div>

      {/* Formulario */}
      <RecursoForm
        initialData={initialFormData}
        onSubmit={handleSubmit}
        submitLabel="Actualizar Recurso"
        disabled={isSubmitting}
        isEditing={true}
      />

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="¡Recurso actualizado exitosamente!"
        message={`El recurso "${recurso.resource_id}" ha sido actualizado correctamente.`}
      />
    </div>
  )
}