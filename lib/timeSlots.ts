// Constantes para horarios de citas

/**
 * HORARIOS DE ATENCIÓN:
 * 
 * LUNES A VIERNES:
 * - Primer turno: 09:30 - 10:30
 * - Segundo turno: 10:40 - 11:40
 * - Tercer turno: 11:50 - 12:50
 * - Cuarto turno: 13:00 - 14:00
 * 
 * SÁBADOS:
 * - Primer turno: 09:00 - 10:00
 * - Segundo turno: 10:10 - 11:10
 * - Tercer turno: 11:20 - 12:20
 * - Cuarto turno: 12:30 - 13:30
 * 
 * Duración por turno: 60 minutos
 * Descanso entre turnos: 10 minutos
 */

export const WEEKDAY_TIME_SLOTS = [
  '09:30',
  '10:40',
  '11:50',
  '13:00'
] as const

export const SATURDAY_TIME_SLOTS = [
  '09:00',
  '10:10',
  '11:20',
  '12:30'
] as const

export const ALL_TIME_SLOTS = [
  ...WEEKDAY_TIME_SLOTS,
  ...SATURDAY_TIME_SLOTS
] as const

export type WeekdayTimeSlot = typeof WEEKDAY_TIME_SLOTS[number]
export type SaturdayTimeSlot = typeof SATURDAY_TIME_SLOTS[number]
export type TimeSlot = WeekdayTimeSlot | SaturdayTimeSlot

/**
 * Determina si una fecha es sábado
 */
export function isSaturday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getDay() === 6
}

/**
 * Determina si una fecha es domingo
 */
export function isSunday(date: string | Date): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.getDay() === 0
}

/**
 * Obtiene los horarios disponibles para una fecha específica
 */
export function getAvailableTimeSlotsForDate(date: string | Date): readonly string[] {
  // Si es domingo, no hay horarios disponibles
  if (isSunday(date)) {
    return []
  }
  
  // Si es sábado, retornar horarios de sábado
  if (isSaturday(date)) {
    return SATURDAY_TIME_SLOTS
  }
  
  // Lunes a viernes
  return WEEKDAY_TIME_SLOTS
}

/**
 * Valida si un horario es válido para una fecha específica
 */
export function isValidTimeSlotForDate(date: string | Date, time: string): boolean {
  const availableSlots = getAvailableTimeSlotsForDate(date)
  return availableSlots.includes(time)
}

/**
 * Obtiene el label descriptivo de un horario
 */
export function getTimeSlotLabel(time: string): string {
  const endTime = calculateEndTime(time)
  return `${time} - ${endTime}`
}

/**
 * Calcula la hora de finalización de un turno (1 hora después)
 */
export function calculateEndTime(startTime: string): string {
  const [hours, minutes] = startTime.split(':').map(Number)
  const endHours = hours + 1
  return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

/**
 * Obtiene el nombre del día de la semana en español
 */
export function getDayName(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
  return days[d.getDay()]
}

/**
 * Analiza un rango de fechas y determina qué tipos de días contiene
 */
export function analyzeDateRange(dateFrom: string, dateTo: string): {
  hasWeekdays: boolean
  hasSaturdays: boolean
  hasSundays: boolean
  weekdayCount: number
  saturdayCount: number
  sundayCount: number
} {
  const start = new Date(dateFrom)
  const end = new Date(dateTo)
  
  let hasWeekdays = false
  let hasSaturdays = false
  let hasSundays = false
  let weekdayCount = 0
  let saturdayCount = 0
  let sundayCount = 0
  
  // Iterar sobre cada día en el rango
  const currentDate = new Date(start)
  while (currentDate <= end) {
    const dayOfWeek = currentDate.getDay()
    
    if (dayOfWeek === 0) {
      // Domingo
      hasSundays = true
      sundayCount++
    } else if (dayOfWeek === 6) {
      // Sábado
      hasSaturdays = true
      saturdayCount++
    } else {
      // Lunes a Viernes
      hasWeekdays = true
      weekdayCount++
    }
    
    // Avanzar al siguiente día
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return {
    hasWeekdays,
    hasSaturdays,
    hasSundays,
    weekdayCount,
    saturdayCount,
    sundayCount
  }
}
