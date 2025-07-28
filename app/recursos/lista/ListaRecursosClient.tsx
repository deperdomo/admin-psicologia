"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { useRequireAuth } from '@/lib/hooks/useRequireAuth'
import { getRecursos, deleteRecurso, downloadFile } from '@/lib/recursos'
import RecursosTable from '@/components/shared/RecursosTable'
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import type { Recurso } from '@/types/database'

export default function ListaRecursosClient() {
  const { user, loading: authLoading } = useRequireAuth()
  const router = useRouter()
  
  const [recursos, setRecursos] = useState<Recurso[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Estado para modal de eliminación
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    recurso: Recurso | null
    loading: boolean
    error: string | null
  }>({
    isOpen: false,
    recurso: null,
    loading: false,
    error: null
  })

  // Cargar recursos
  const loadRecursos = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getRecursos()
      setRecursos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar recursos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    loadRecursos()
  }, [user])

  // Manejar edición
  const handleEdit = (id: string) => {
    router.push(`/recursos/editar/${id}`)
  }

  // Manejar eliminación
  const handleDelete = (id: string) => {
    const recurso = recursos.find(r => r.id === id)
    if (recurso) {
      setDeleteModal({
        isOpen: true,
        recurso,
        loading: false,
        error: null
      })
    }
  }

  const confirmDelete = async () => {
    if (!deleteModal.recurso) return

    try {
      setDeleteModal(prev => ({ ...prev, loading: true, error: null }))
      
      await deleteRecurso(deleteModal.recurso.id)
      
      // Actualizar la lista
      setRecursos(prev => prev.filter(r => r.id !== deleteModal.recurso!.id))
      
      // Cerrar modal
      setDeleteModal({
        isOpen: false,
        recurso: null,
        loading: false,
        error: null
      })
    } catch (err) {
      setDeleteModal(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Error al eliminar recurso'
      }))
    }
  }

  // Manejar descarga
  const handleDownload = async (recurso: Recurso) => {
    try {
      if (recurso.word_public_url ) {
        await downloadFile(
          recurso.word_public_url , 
          `${recurso.resource_id}_documento.docx`
        )
      }
      
      if (recurso.pdf_public_url) {
        await downloadFile(
          recurso.pdf_public_url, 
          `${recurso.resource_id}_documento.pdf`
        )
      }
      
      if (!recurso.word_public_url  && !recurso.pdf_public_url) {
        setError('No hay archivos disponibles para descargar')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar archivo')
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando...</span>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-gray-200 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Lista de Recursos</h1>
          <p className="text-gray-600 mt-2">
            Gestiona y visualiza todos los recursos existentes ({recursos.length} recursos)
          </p>
        </div>
        <Button 
  onClick={() => router.push('/recursos/nuevo')}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Recurso
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabla de recursos */}
      <RecursosTable
        recursos={recursos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onDownload={handleDownload}
        loading={loading}
      />

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmDelete}
        title={deleteModal.recurso?.title || ''}
        description="Se eliminarán también todos los archivos asociados."
        loading={deleteModal.loading}
        error={deleteModal.error || undefined}
      />
    </div>
  )
}
