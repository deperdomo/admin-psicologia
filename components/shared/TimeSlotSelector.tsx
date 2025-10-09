'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { getAvailableTimeSlotsForDate, getTimeSlotLabel, getDayName, isSunday } from '@/lib/timeSlots'
import { AlertCircle } from 'lucide-react'

interface TimeSlotSelectorProps {
  selectedDate: string | null
  selectedTime: string
  onTimeChange: (time: string) => void
  label?: string
  required?: boolean
  error?: string
  disabled?: boolean
}

export function TimeSlotSelector({
  selectedDate,
  selectedTime,
  onTimeChange,
  label = 'Horario',
  required = false,
  error,
  disabled = false
}: TimeSlotSelectorProps) {
  // Si no hay fecha seleccionada, mostrar mensaje
  if (!selectedDate) {
    return (
      <div className="space-y-2">
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 flex items-center gap-2">
          <AlertCircle size={16} className="text-gray-400" />
          Primero selecciona una fecha
        </div>
      </div>
    )
  }

  // Si es domingo, no hay horarios disponibles
  if (isSunday(selectedDate)) {
    return (
      <div className="space-y-2">
        <Label>
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 flex items-center gap-2">
          <AlertCircle size={16} className="text-yellow-600" />
          No hay horarios disponibles los domingos
        </div>
      </div>
    )
  }

  const availableSlots = getAvailableTimeSlotsForDate(selectedDate)
  const dayName = getDayName(selectedDate)

  return (
    <div className="space-y-2">
      <Label htmlFor="time-slot">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      {/* Indicador del día */}
      <div className="text-xs text-gray-600 mb-1">
        📅 {dayName} - {availableSlots.length} horarios disponibles
      </div>

      <Select
        value={selectedTime}
        onValueChange={onTimeChange}
        disabled={disabled || availableSlots.length === 0}
      >
        <SelectTrigger className={error ? 'border-red-500' : ''}>
          <SelectValue placeholder="Selecciona un horario" />
        </SelectTrigger>
        <SelectContent>
          {availableSlots.map((timeSlot) => (
            <SelectItem key={timeSlot} value={timeSlot}>
              {getTimeSlotLabel(timeSlot)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}

      {/* Información adicional */}
      <p className="text-xs text-gray-500">
        {dayName === 'Sábado' 
          ? '⏰ Horarios de sábado: 09:00 - 13:30'
          : '⏰ Horarios de lunes a viernes: 09:30 - 14:00'
        }
      </p>
    </div>
  )
}
