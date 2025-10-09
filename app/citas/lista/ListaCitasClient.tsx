"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, Calendar, X, CheckCircle, XCircle, Filter } from 'lucide-react'
import { useRequireAuth } from '@/lib/hooks/useRequireAuth'
import { useAdminCitas } from '@/lib/hooks/useAdminCitas'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { Appointment, AdminAppointmentFilters } from '@/types/database'

export default function ListaCitasClient() {
  const { user, loading: authLoading } = useRequireAuth()
  const router = useRouter()
  const { citas, loading, error: hookError, loadCitas, cancelExistingCita } = useAdminCitas()
  
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AdminAppointmentFilters>({
    status: 'ALL',
    searchTerm: '',
    dateFrom: '',
    dateTo: ''
  })
  
  // Estado para modal de cancelación
  const [cancelModal, setCancelModal] = useState<{
    isOpen: boolean
    cita: Appointment | null
    loading: boolean
    error: string | null
    reason: string
    notifyPatient: boolean
  }>({
    isOpen: false,
    cita: null,
    loading: false,
    error: null,
    reason: '',
    notifyPatient: true
  })

  // Cargar citas al iniciar
  useEffect(() => {
    if (!user) return
    loadCitas(filters)
  }, [user])

  // Aplicar filtros
  const handleApplyFilters = () => {
    loadCitas(filters)
  }

  // Limpiar filtros
  const handleClearFilters = () => {
    const clearedFilters: AdminAppointmentFilters = {
      status: 'ALL',
      searchTerm: '',
      dateFrom: '',
      dateTo: ''
    }
    setFilters(clearedFilters)
    loadCitas(clearedFilters)
  }

  // Abrir modal de cancelación
  const handleCancelClick = (cita: Appointment) => {
    if (cita.status === 'CANCELADA') {
      setError('Esta cita ya está cancelada')
      return
    }
    
    setCancelModal({
      isOpen: true,
      cita,
      loading: false,
      error: null,
      reason: '',
      notifyPatient: true
    })
  }

  // Confirmar cancelación
  const confirmCancel = async () => {
    if (!cancelModal.cita) return
    
    if (!cancelModal.reason.trim()) {
      setCancelModal(prev => ({
        ...prev,
        error: 'Debes proporcionar un motivo de cancelación'
      }))
      return
    }

    try {
      setCancelModal(prev => ({ ...prev, loading: true, error: null }))
      
      await cancelExistingCita({
        appointmentId: cancelModal.cita.id,
        reason: cancelModal.reason,
        notify_patient: cancelModal.notifyPatient,
        admin_notes: `Cancelada por administrador: ${cancelModal.reason}`
      })
      
      // Recargar citas
      await loadCitas(filters)
      
      // Cerrar modal
      setCancelModal({
        isOpen: false,
        cita: null,
        loading: false,
        error: null,
        reason: '',
        notifyPatient: true
      })
      
      setError(null)
    } catch (err) {
      console.error('❌ Error cancelando cita:', err)
      setCancelModal(prev => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Error al cancelar cita'
      }))
    }
  }

  // Ver detalles de cita
  const handleViewDetails = (id: string) => {
    router.push(`/citas/detalle/${id}`)
  }

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00')
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date)
  }

  // Formatear hora
  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5) // HH:mm
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
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Citas</h1>
          <p className="text-gray-600 mt-2">
            Administra las citas de tus pacientes ({citas.length} citas)
          </p>
        </div>
        <Button 
          onClick={() => router.push('/citas/nuevo')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Nueva Cita
        </Button>
      </div>

      {/* Error Alert */}
      {(error || hookError) && (
        <Alert variant="destructive">
          <AlertDescription>
            {error || hookError}
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-2"
              onClick={() => setError(null)}
            >
              Cerrar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
        <div className="flex items-center gap-2 text-gray-700 font-medium">
          <Filter className="h-4 w-4" />
          <span>Filtros</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Búsqueda */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Buscar paciente
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Nombre, email o teléfono..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="pl-10"
              />
            </div>
          </div>

          {/* Estado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as 'ALL' | 'CONFIRMADA' | 'CANCELADA' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Todas</option>
              <option value="CONFIRMADA">Confirmadas</option>
              <option value="CANCELADA">Canceladas</option>
            </select>
          </div>

          {/* Botones de acción */}
          <div className="flex items-end gap-2">
            <Button 
              onClick={handleApplyFilters}
              className="flex-1"
              disabled={loading}
            >
              Aplicar
            </Button>
            <Button 
              onClick={handleClearFilters}
              variant="outline"
              disabled={loading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Filtros de fecha */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha desde
            </label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fecha hasta
            </label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>
      </div>

      {/* Lista de citas */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando citas...</span>
        </div>
      ) : citas.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay citas</h3>
          <p className="text-gray-600 mb-4">
            No se encontraron citas con los filtros aplicados.
          </p>
          <Button onClick={() => router.push('/citas/nuevo')}>
            <Plus className="h-4 w-4 mr-2" />
            Crear primera cita
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paciente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modalidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {citas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {cita.patient_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cita.patient_email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {cita.patient_phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(cita.appointment_date)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatTime(cita.appointment_time)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className="text-xs">
                        {cita.consultation_type === 'primera_consulta' 
                          ? 'Primera Consulta' 
                          : 'Seguimiento'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          cita.modalidad === 'online' 
                            ? 'border-blue-300 text-blue-700' 
                            : 'border-green-300 text-green-700'
                        }`}
                      >
                        {cita.modalidad === 'online' ? 'Online' : 'Presencial'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {cita.status === 'CONFIRMADA' ? (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Confirmada
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
                          <XCircle className="h-3 w-3 mr-1" />
                          Cancelada
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(cita.id)}
                        >
                          Ver
                        </Button>
                        {cita.status === 'CONFIRMADA' && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleCancelClick(cita)}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de cancelación personalizado */}
      {cancelModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cancelar Cita
            </h3>
            
            {cancelModal.cita && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <p className="text-sm text-gray-600">
                  <strong>Paciente:</strong> {cancelModal.cita.patient_name}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Fecha:</strong> {formatDate(cancelModal.cita.appointment_date)} - {formatTime(cancelModal.cita.appointment_time)}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de cancelación *
                </label>
                <textarea
                  value={cancelModal.reason}
                  onChange={(e) => setCancelModal({ ...cancelModal, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Ej: Paciente solicitó reagendar, emergencia personal, etc."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="notifyPatient"
                  checked={cancelModal.notifyPatient}
                  onChange={(e) => setCancelModal({ ...cancelModal, notifyPatient: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="notifyPatient" className="ml-2 text-sm text-gray-700">
                  Notificar al paciente por email
                </label>
              </div>
            </div>
            
            {cancelModal.error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{cancelModal.error}</AlertDescription>
              </Alert>
            )}
            
            <div className="flex gap-3 mt-6">
              <Button
                onClick={() => setCancelModal({ ...cancelModal, isOpen: false })}
                variant="outline"
                className="flex-1"
                disabled={cancelModal.loading}
              >
                Cancelar
              </Button>
              <Button
                onClick={confirmCancel}
                variant="destructive"
                className="flex-1"
                disabled={cancelModal.loading}
              >
                {cancelModal.loading ? 'Cancelando...' : 'Confirmar Cancelación'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
