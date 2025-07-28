"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save } from 'lucide-react'
import { useRequireAuth } from '@/lib/hooks/useRequireAuth'
import { getRecursoById, updateRecurso, checkResourceIdExists } from '@/lib/recursos'
import RecursoForm from '@/components/forms/RecursoForm'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { RecursoFormData, Recurso } from '@/types/database'

interface EditarRecursoClientProps {
  id: string
}

export function EditarRecursoClient({ id }: EditarRecursoClientProps) {
  const { user, loading: authLoading } = useRequireAuth()
  const router = useRouter()
  
  const [recurso, setRecurso] = useState<Recurso | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Cargar recurso
  useEffect(() => {
    if (!user) return

    const loadRecurso = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getRecursoById(id)
        
        if (!data) {
          setError('Recurso no encontrado')
          return
        }
        
        setRecurso(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar recurso')
      } finally {
        setLoading(false)
      }
    }

    loadRecurso()
  }, [user, id])

  // Manejar envío del formulario
  const handleSubmit = async (
    data: RecursoFormData,
    wordFile?: File,
    pdfFile?: File
  ) => {
    if (!recurso) return

    try {
      setSaving(true)
      setError(null)

      // Verificar si el resource_id ya existe (excluyendo el actual)
      if (data.resource_id !== recurso.resource_id) {
        const exists = await checkResourceIdExists(data.resource_id, recurso.id)
        if (exists) {
          throw new Error(`El ID de recurso "${data.resource_id}" ya está en uso`)
        }
      }

      await updateRecurso(recurso.id, data, wordFile, pdfFile)
      
      setSuccess(true)
      
      // Redirigir después de un breve delay
      setTimeout(() => {
        router.push('/admin/recursos/lista')
      }, 2000)
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar recurso')
    } finally {
      setSaving(false)
    }
  }

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

  if (error && !recurso) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/admin/recursos/lista')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la Lista
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!recurso) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push('/recursos/lista')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a la Lista
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Recurso</h1>
            <p className="text-gray-600 mt-1">
              Modificar información del recurso: {recurso.title}
            </p>
          </div>
        </div>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">
            ✅ Recurso actualizado exitosamente. Redirigiendo...
          </AlertDescription>
        </Alert>
      )}

      {/* Formulario */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Información del Recurso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RecursoForm
            initialData={{
              resource_id: recurso.resource_id,
              title: recurso.title,
              description: recurso.description || '',
              categoria: recurso.categoria,
              resource_type: recurso.resource_type,
              age_ranges: recurso.age_ranges || [],
              tags: recurso.tags || [],
              is_premium: recurso.is_premium || false,
              requires_supervision: recurso.requires_supervision || false,
              estimated_reading_time: recurso.estimated_reading_time || undefined,
              difficulty_level: recurso.difficulty_level || undefined,
              word_public_url : recurso.word_public_url  || undefined,
              pdf_public_url: recurso.pdf_public_url || undefined
            }}
            onSubmit={handleSubmit}
            submitLabel={saving ? 'Guardando...' : 'Guardar Cambios'}
            disabled={saving || success}
            isEditing={true}
          />
        </CardContent>
      </Card>
    </div>
  )
}
