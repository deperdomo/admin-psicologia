import { useState } from 'react'
import { 
  getCitas, 
  getCitaById,
  cancelCita, 
  getAdminStats,
  getBlockedSlots,
  createBlockedSlot,
  deleteBlockedSlot
} from '@/lib/citas'
import type { 
  Appointment, 
  CancelAppointmentData,
  AdminAppointmentFilters,
  AdminStats,
  BlockedSlot,
  CreateBlockedSlotData
} from '@/types/database'

interface UseAdminCitasReturn {
  // Estado
  citas: Appointment[]
  loading: boolean
  error: string | null
  stats: AdminStats | null
  
  // Acciones de citas
  loadCitas: (filters?: AdminAppointmentFilters) => Promise<void>
  getCita: (id: string) => Promise<Appointment | null>
  cancelExistingCita: (cancelData: CancelAppointmentData) => Promise<Appointment>
  
  // Estadísticas
  loadStats: () => Promise<void>
  
  // Utilidades
  refreshData: () => Promise<void>
}

export function useAdminCitas(): UseAdminCitasReturn {
  const [citas, setCitas] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AdminStats | null>(null)

  // Cargar citas con filtros
  const loadCitas = async (filters?: AdminAppointmentFilters) => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Cargando citas...', filters)
      
      const data = await getCitas(filters)
      console.log('✅ Citas cargadas:', data.length)
      setCitas(data)
    } catch (err) {
      console.error('❌ Error cargando citas:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar citas')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Obtener una cita por ID
  const getCita = async (id: string): Promise<Appointment | null> => {
    try {
      setError(null)
      console.log('🔄 Obteniendo cita:', id)
      
      const cita = await getCitaById(id)
      console.log('✅ Cita obtenida:', cita?.patient_name)
      return cita
    } catch (err) {
      console.error('❌ Error obteniendo cita:', err)
      setError(err instanceof Error ? err.message : 'Error al obtener cita')
      throw err
    }
  }

  // Cancelar cita existente
  const cancelExistingCita = async (cancelData: CancelAppointmentData): Promise<Appointment> => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Cancelando cita...')
      
      const cancelledCita = await cancelCita(cancelData)
      console.log('✅ Cita cancelada exitosamente:', cancelledCita.id)
      
      // Actualizar lista de citas
      setCitas(prev => 
        prev.map(cita => 
          cita.id === cancelledCita.id ? cancelledCita : cita
        )
      )
      
      return cancelledCita
    } catch (err) {
      console.error('❌ Error cancelando cita:', err)
      setError(err instanceof Error ? err.message : 'Error al cancelar cita')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Cargar estadísticas
  const loadStats = async () => {
    try {
      console.log('🔄 Cargando estadísticas...')
      const data = await getAdminStats()
      console.log('✅ Estadísticas cargadas:', data)
      setStats(data)
    } catch (err) {
      console.error('❌ Error cargando estadísticas:', err)
      // No lanzar error para estadísticas, solo registrar
    }
  }

  // Refrescar todos los datos
  const refreshData = async () => {
    await Promise.all([
      loadCitas(),
      loadStats()
    ])
  }

  return {
    // Estado
    citas,
    loading,
    error,
    stats,
    
    // Acciones
    loadCitas,
    getCita,
    cancelExistingCita,
    loadStats,
    refreshData
  }
}

// Hook separado para gestión de slots bloqueados
interface UseBlockedSlotsReturn {
  blockedSlots: BlockedSlot[]
  loading: boolean
  error: string | null
  
  loadBlockedSlots: (dateFrom?: string, dateTo?: string) => Promise<void>
  createNewBlockedSlot: (slotData: CreateBlockedSlotData) => Promise<BlockedSlot[]>
  deleteExistingBlockedSlot: (id: string) => Promise<void>
  refreshBlockedSlots: () => Promise<void>
}

export function useBlockedSlots(): UseBlockedSlotsReturn {
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar slots bloqueados
  const loadBlockedSlots = async (dateFrom?: string, dateTo?: string) => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Cargando slots bloqueados...')
      
      const data = await getBlockedSlots(dateFrom, dateTo)
      console.log('✅ Slots bloqueados cargados:', data.length)
      setBlockedSlots(data)
    } catch (err) {
      console.error('❌ Error cargando slots bloqueados:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar slots bloqueados')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Crear nuevo slot bloqueado
  const createNewBlockedSlot = async (slotData: CreateBlockedSlotData): Promise<BlockedSlot[]> => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Creando slot bloqueado...')
      
      const newSlots = await createBlockedSlot(slotData)
      console.log('✅ Slots bloqueados creados:', newSlots.length)
      
      // Actualizar lista de slots bloqueados
      setBlockedSlots(prev => [...newSlots, ...prev])
      
      return newSlots
    } catch (err) {
      console.error('❌ Error creando slot bloqueado:', err)
      setError(err instanceof Error ? err.message : 'Error al crear slot bloqueado')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Eliminar slot bloqueado
  const deleteExistingBlockedSlot = async (id: string): Promise<void> => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Eliminando slot bloqueado...')
      
      await deleteBlockedSlot(id)
      console.log('✅ Slot bloqueado eliminado')
      
      // Actualizar lista de slots bloqueados
      setBlockedSlots(prev => prev.filter(slot => slot.id !== id))
    } catch (err) {
      console.error('❌ Error eliminando slot bloqueado:', err)
      setError(err instanceof Error ? err.message : 'Error al eliminar slot bloqueado')
      throw err
    } finally {
      setLoading(false)
    }
  }

  // Refrescar slots bloqueados
  const refreshBlockedSlots = async () => {
    await loadBlockedSlots()
  }

  return {
    blockedSlots,
    loading,
    error,
    loadBlockedSlots,
    createNewBlockedSlot,
    deleteExistingBlockedSlot,
    refreshBlockedSlots
  }
}
