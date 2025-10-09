import { supabase } from './supabase'
import type { 
  Appointment, 
  CancelAppointmentData,
  AdminAppointmentFilters,
  AdminStats,
  BlockedSlot,
  CreateBlockedSlotData
} from '@/types/database'

// ===== GESTIÓN DE CITAS =====

// Obtener todas las citas con filtros
export async function getCitas(filters?: AdminAppointmentFilters): Promise<Appointment[]> {
  try {
    console.log('Obteniendo citas con filtros:', filters)
    
    let query = supabase
      .from('appointments')
      .select('*')
    
    // Aplicar filtros
    if (filters?.dateFrom) {
      query = query.gte('appointment_date', filters.dateFrom)
    }
    
    if (filters?.dateTo) {
      query = query.lte('appointment_date', filters.dateTo)
    }
    
    if (filters?.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status)
    }
    
    // Búsqueda por término (nombre, email o teléfono)
    if (filters?.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase()
      query = query.or(`patient_name.ilike.%${searchTerm}%,patient_email.ilike.%${searchTerm}%,patient_phone.ilike.%${searchTerm}%`)
    }
    
    // Ordenar por fecha y hora (más recientes primero)
    query = query.order('appointment_date', { ascending: false })
    query = query.order('appointment_time', { ascending: false })
    
    // Paginación
    if (filters?.page && filters?.limit) {
      const from = (filters.page - 1) * filters.limit
      const to = from + filters.limit - 1
      query = query.range(from, to)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching citas:', error)
      throw new Error(`Error al cargar las citas: ${error.message}`)
    }

    console.log(`Citas obtenidas: ${data?.length || 0}`)
    return data || []
  } catch (error) {
    console.error('Error in getCitas:', error)
    throw error
  }
}

// Obtener una cita por ID
export async function getCitaById(id: string): Promise<Appointment | null> {
  try {
    console.log('Obteniendo cita por ID:', id)
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Cita no encontrada:', id)
        return null
      }
      console.error('Error fetching cita:', error)
      throw new Error(`Error al cargar la cita: ${error.message}`)
    }
    
    console.log('Cita encontrada:', data?.patient_name)
    return data
  } catch (error) {
    console.error('Error in getCitaById:', error)
    throw error
  }
}

// Cancelar cita desde admin
export async function cancelCita(cancelData: CancelAppointmentData): Promise<Appointment> {
  try {
    console.log('🔄 Cancelando cita:', cancelData.appointmentId)
    
    // Llamar a la API route que maneja toda la lógica de cancelación
    const response = await fetch(`/api/citas/${cancelData.appointmentId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reason: cancelData.reason,
        notify_patient: cancelData.notify_patient,
        admin_notes: cancelData.admin_notes
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Error al cancelar la cita')
    }

    const result = await response.json()
    console.log('✅ Cita cancelada exitosamente:', result.appointment.id)
    
    return result.appointment
  } catch (error) {
    console.error('❌ Error in cancelCita:', error)
    throw error
  }
}

// Verificar disponibilidad de un slot (usado por la web pública)
export async function checkSlotAvailability(
  date: string, 
  time: string, 
  excludeAppointmentId?: string
): Promise<boolean> {
  try {
    // 1. Verificar si hay una cita confirmada en ese horario
    let appointmentQuery = supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', date)
      .eq('appointment_time', time)
      .eq('status', 'CONFIRMADA')
    
    if (excludeAppointmentId) {
      appointmentQuery = appointmentQuery.neq('id', excludeAppointmentId)
    }
    
    const { data: existingAppointments, error: appointmentError } = await appointmentQuery
    
    if (appointmentError) {
      console.error('Error checking appointments:', appointmentError)
      throw appointmentError
    }
    
    if (existingAppointments && existingAppointments.length > 0) {
      console.log('❌ Slot no disponible: Ya existe una cita')
      return false
    }
    
    // 2. Verificar si el slot está bloqueado
    const { data: blockedSlots, error: blockedError } = await supabase
      .from('blocked_slots')
      .select('id, blocked_time')
      .eq('blocked_date', date)
    
    if (blockedError) {
      console.error('Error checking blocked slots:', blockedError)
      throw blockedError
    }
    
    if (blockedSlots && blockedSlots.length > 0) {
      // Si hay un bloqueo de todo el día (blocked_time = null)
      const fullDayBlock = blockedSlots.find(slot => slot.blocked_time === null)
      if (fullDayBlock) {
        console.log('❌ Slot no disponible: Día completo bloqueado')
        return false
      }
      
      // Si hay un bloqueo específico para ese horario
      const specificBlock = blockedSlots.find(slot => slot.blocked_time === time)
      if (specificBlock) {
        console.log('❌ Slot no disponible: Horario específico bloqueado')
        return false
      }
    }
    
    console.log('✅ Slot disponible')
    return true
  } catch (error) {
    console.error('Error in checkSlotAvailability:', error)
    throw error
  }
}

// Obtener estadísticas para el admin
export async function getAdminStats(): Promise<AdminStats> {
  try {
    console.log('Obteniendo estadísticas admin...')
    
    const today = new Date().toISOString().split('T')[0]
    const firstDayOfWeek = getFirstDayOfWeek()
    const firstDayOfMonth = getFirstDayOfMonth()
    
    // Total de citas
    const { count: totalCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
    
    // Citas de hoy
    const { count: todayCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .eq('appointment_date', today)
      .eq('status', 'CONFIRMADA')
    
    // Citas de esta semana
    const { count: weekCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('appointment_date', firstDayOfWeek)
      .eq('status', 'CONFIRMADA')
    
    // Citas de este mes
    const { count: monthCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('appointment_date', firstDayOfMonth)
      .eq('status', 'CONFIRMADA')
    
    // Canceladas este mes
    const { count: cancelledCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('appointment_date', firstDayOfMonth)
      .eq('status', 'CANCELADA')
    
    // Confirmadas este mes
    const { count: confirmedCount } = await supabase
      .from('appointments')
      .select('*', { count: 'exact', head: true })
      .gte('appointment_date', firstDayOfMonth)
      .eq('status', 'CONFIRMADA')
    
    // TODO: Calcular ingresos basados en tipo de consulta
    // Esto requeriría una tabla de precios o campo en appointments
    
    const stats: AdminStats = {
      totalAppointments: totalCount || 0,
      todayAppointments: todayCount || 0,
      thisWeekAppointments: weekCount || 0,
      thisMonthAppointments: monthCount || 0,
      cancelledThisMonth: cancelledCount || 0,
      confirmedThisMonth: confirmedCount || 0,
      revenue: {
        today: 0, // TODO: Implementar cálculo de ingresos
        thisWeek: 0,
        thisMonth: 0
      }
    }
    
    console.log('✅ Estadísticas obtenidas:', stats)
    return stats
  } catch (error) {
    console.error('Error in getAdminStats:', error)
    throw error
  }
}

// ===== GESTIÓN DE SLOTS BLOQUEADOS =====

// Obtener slots bloqueados
export async function getBlockedSlots(dateFrom?: string, dateTo?: string): Promise<BlockedSlot[]> {
  try {
    console.log('Obteniendo slots bloqueados...')
    
    let query = supabase
      .from('blocked_slots')
      .select('*')
      .order('blocked_date', { ascending: true })
      .order('blocked_time', { ascending: true })
    
    if (dateFrom) {
      query = query.gte('blocked_date', dateFrom)
    }
    
    if (dateTo) {
      query = query.lte('blocked_date', dateTo)
    }
    
    const { data, error } = await query
    
    if (error) {
      console.error('Error fetching blocked slots:', error)
      throw new Error(`Error al cargar slots bloqueados: ${error.message}`)
    }
    
    console.log(`✅ Slots bloqueados obtenidos: ${data?.length || 0}`)
    return data || []
  } catch (error) {
    console.error('Error in getBlockedSlots:', error)
    throw error
  }
}

// Obtener horarios bloqueados para una fecha específica
export async function getBlockedTimesForDate(date: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('blocked_slots')
      .select('blocked_time')
      .eq('blocked_date', date)
      .not('blocked_time', 'is', null) // Solo horarios específicos, no días completos
    
    if (error) {
      console.error('Error fetching blocked times:', error)
      throw new Error(`Error al cargar horarios bloqueados: ${error.message}`)
    }
    
    // Normalizar formato: eliminar segundos si existen (10:40:00 -> 10:40)
    const blockedTimes = data?.map(slot => {
      const time = slot.blocked_time
      if (!time) return null
      // Si el formato incluye segundos (HH:MM:SS), eliminarlos
      return time.length > 5 ? time.substring(0, 5) : time
    }).filter(Boolean) || []
    
    return blockedTimes as string[]
  } catch (error) {
    console.error('Error in getBlockedTimesForDate:', error)
    throw error
  }
}

// Crear slot bloqueado
export async function createBlockedSlot(slotData: CreateBlockedSlotData): Promise<BlockedSlot[]> {
  try {
    console.log('Creando slot bloqueado:', slotData)
    
    const slotsToCreate: Array<Omit<BlockedSlot, 'id' | 'created_at'>> = []
    
    // Si es recurrente, generar múltiples slots
    if (slotData.recurring) {
      const { type, count } = slotData.recurring
      const baseDate = new Date(slotData.blocked_date)
      
      for (let i = 0; i < count; i++) {
        const newDate = new Date(baseDate)
        
        if (type === 'weekly') {
          newDate.setDate(baseDate.getDate() + (i * 7))
        } else if (type === 'monthly') {
          newDate.setMonth(baseDate.getMonth() + i)
        }
        
        slotsToCreate.push({
          blocked_date: newDate.toISOString().split('T')[0],
          blocked_time: slotData.blocked_time || null,
          reason: slotData.reason || null
        })
      }
    } else {
      // Slot único
      slotsToCreate.push({
        blocked_date: slotData.blocked_date,
        blocked_time: slotData.blocked_time || null,
        reason: slotData.reason || null
      })
    }
    
    const { data, error } = await supabase
      .from('blocked_slots')
      .insert(slotsToCreate)
      .select()
    
    if (error) {
      console.error('Error creating blocked slot:', error)
      throw new Error(`Error al crear slot bloqueado: ${error.message}`)
    }
    
    console.log(`✅ Slots bloqueados creados: ${data?.length || 0}`)
    return data || []
  } catch (error) {
    console.error('Error in createBlockedSlot:', error)
    throw error
  }
}

// Eliminar slot bloqueado
export async function deleteBlockedSlot(id: string): Promise<void> {
  try {
    console.log('Eliminando slot bloqueado:', id)
    
    const { error } = await supabase
      .from('blocked_slots')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting blocked slot:', error)
      throw new Error(`Error al eliminar slot bloqueado: ${error.message}`)
    }
    
    console.log('✅ Slot bloqueado eliminado exitosamente')
  } catch (error) {
    console.error('Error in deleteBlockedSlot:', error)
    throw error
  }
}

// ===== UTILIDADES =====

function getFirstDayOfWeek(): string {
  const now = new Date()
  const dayOfWeek = now.getDay()
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1) // Lunes como primer día
  const firstDay = new Date(now.setDate(diff))
  return firstDay.toISOString().split('T')[0]
}

function getFirstDayOfMonth(): string {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
}
