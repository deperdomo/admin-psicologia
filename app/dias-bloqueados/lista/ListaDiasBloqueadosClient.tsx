'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useBlockedSlots } from '@/lib/hooks/useAdminCitas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Calendar, Clock, Trash2, AlertCircle, CalendarOff, Pencil } from 'lucide-react'
import DeleteConfirmModal from '@/components/shared/DeleteConfirmModal'
import type { BlockedSlot } from '@/types/database'

export default function ListaDiasBloqueadosClient() {
  const router = useRouter()
  const { blockedSlots, loading, error, loadBlockedSlots, deleteExistingBlockedSlot } = useBlockedSlots()
  
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    slot: BlockedSlot | null
    loading: boolean
    error: string | null
  }>({
    isOpen: false,
    slot: null,
    loading: false,
    error: null
  })

  const [deleteDayModal, setDeleteDayModal] = useState<{
    isOpen: boolean
    date: string | null
    slots: BlockedSlot[]
    loading: boolean
    error: string | null
  }>({
    isOpen: false,
    date: null,
    slots: [],
    loading: false,
    error: null
  })

  const loadBlockedSlotsCallback = useCallback(() => {
    loadBlockedSlots()
  }, [loadBlockedSlots])

  useEffect(() => {
    loadBlockedSlotsCallback()
  }, [loadBlockedSlotsCallback])

  // Formatear fecha
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Formatear hora
  const formatTime = (time: string | null) => {
    if (!time) return 'Todo el día'
    return time.substring(0, 5) // HH:MM
  }

  // Abrir modal de confirmación de eliminación
  const handleDeleteClick = (slot: BlockedSlot) => {
    setDeleteModal({
      isOpen: true,
      slot,
      loading: false,
      error: null
    })
  }

  // Navegar a editar (abrir formulario con fecha preseleccionada)
  const handleEditClick = (date: string) => {
    router.push(`/dias-bloqueados/nuevo?fecha=${date}`)
  }

  // Abrir modal para eliminar todos los bloqueos de un día
  const handleDeleteDayClick = (date: string, slots: BlockedSlot[]) => {
    setDeleteDayModal({
      isOpen: true,
      date,
      slots,
      loading: false,
      error: null
    })
  }

  // Confirmar eliminación de todos los bloqueos de un día
  const handleConfirmDeleteDay = async () => {
    if (!deleteDayModal.date || deleteDayModal.slots.length === 0) return

    try {
      setDeleteDayModal(prev => ({ ...prev, loading: true, error: null }))
      
      // Eliminar cada slot del día
      for (const slot of deleteDayModal.slots) {
        await deleteExistingBlockedSlot(slot.id)
      }
      
      // Cerrar modal
      setDeleteDayModal({
        isOpen: false,
        date: null,
        slots: [],
        loading: false,
        error: null
      })
    } catch (err) {
      setDeleteDayModal(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Error al eliminar bloqueos'
      }))
    }
  }

  // Confirmar eliminación
  const handleConfirmDelete = async () => {
    if (!deleteModal.slot) return

    try {
      setDeleteModal(prev => ({ ...prev, loading: true, error: null }))
      await deleteExistingBlockedSlot(deleteModal.slot.id)
      
      // Cerrar modal
      setDeleteModal({
        isOpen: false,
        slot: null,
        loading: false,
        error: null
      })
    } catch (err) {
      setDeleteModal(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Error al eliminar'
      }))
    }
  }

  // Agrupar slots por fecha
  const slotsByDate = blockedSlots.reduce((acc, slot) => {
    const date = slot.blocked_date
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(slot)
    return acc
  }, {} as Record<string, BlockedSlot[]>)

  // Ordenar fechas descendente
  const sortedDates = Object.keys(slotsByDate).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime()
  })

  if (loading && blockedSlots.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando días bloqueados...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Días Bloqueados
          </h1>
          <p className="text-gray-600">
            Gestiona los días y horarios en los que no puedes atender pacientes
          </p>
        </div>
        <Button
          onClick={() => router.push('/dias-bloqueados/nuevo')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus size={20} />
          Bloquear Día
        </Button>
      </div>

      {/* Error global */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-red-800 font-medium">Error al cargar días bloqueados</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de días bloqueados */}
      {sortedDates.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <div className="text-center">
              <CalendarOff className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No hay días bloqueados
              </h3>
              <p className="text-gray-600 mb-6">
                Comienza bloqueando días en los que no puedes atender pacientes
              </p>
              <Button
                onClick={() => router.push('/dias-bloqueados/nuevo')}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Plus size={20} />
                Bloquear Primer Día
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <Card key={date}>
              <CardHeader className="bg-purple-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Calendar className="text-purple-600" size={20} />
                      {formatDate(date)}
                    </CardTitle>
                    <CardDescription>
                      {slotsByDate[date].length} {slotsByDate[date].length === 1 ? 'bloqueo' : 'bloqueos'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(date)}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Pencil size={16} />
                      Editar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteDayClick(date, slotsByDate[date])}
                      className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 cursor-pointer"
                    >
                      <Trash2 size={16} />
                      Eliminar día
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y">
                  {slotsByDate[date].map(slot => (
                    <div
                      key={slot.id}
                      className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2 text-gray-900">
                            <Clock size={16} className="text-purple-600" />
                            <span className="font-medium">{formatTime(slot.blocked_time ?? null)}</span>
                          </div>
                          {slot.blocked_time === null && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              Día completo
                            </span>
                          )}
                        </div>
                        {slot.reason && (
                          <p className="text-sm text-gray-600 ml-5">{slot.reason}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(slot)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, slot: null, loading: false, error: null })}
        onConfirm={handleConfirmDelete}
        title="¿Eliminar día bloqueado?"
        description={
          deleteModal.slot
            ? `¿Estás segura de que deseas eliminar el bloqueo del ${formatDate(deleteModal.slot.blocked_date)} a las ${formatTime(deleteModal.slot.blocked_time ?? null)}?`
            : ''
        }
        loading={deleteModal.loading}
        error={deleteModal.error || undefined}
      />

      {/* Modal de confirmación de eliminación de día completo */}
      <DeleteConfirmModal
        isOpen={deleteDayModal.isOpen}
        onClose={() => setDeleteDayModal({ isOpen: false, date: null, slots: [], loading: false, error: null })}
        onConfirm={handleConfirmDeleteDay}
        title="¿Eliminar todos los bloqueos del día?"
        description={
          deleteDayModal.date
            ? `¿Estás segura de que deseas eliminar TODOS los ${deleteDayModal.slots.length} bloqueo(s) del ${formatDate(deleteDayModal.date)}? Esta acción no se puede deshacer.`
            : ''
        }
        loading={deleteDayModal.loading}
        error={deleteDayModal.error || undefined}
      />
    </div>
  )
}
