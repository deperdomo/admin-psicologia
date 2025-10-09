'use client'

import React from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { getTimeSlotLabel, isSaturday, WEEKDAY_TIME_SLOTS, SATURDAY_TIME_SLOTS } from '@/lib/timeSlots'

interface MultipleTimeSlotSelectorProps {
  date: string
  selectedTimes: string[]
  blockedTimes: string[]
  onSelectionChange: (times: string[]) => void
  className?: string
}

export default function MultipleTimeSlotSelector({
  date,
  selectedTimes,
  blockedTimes,
  onSelectionChange,
  className = ''
}: MultipleTimeSlotSelectorProps) {
  // Determinar qué horarios mostrar según el día
  const timeSlots = isSaturday(date) ? SATURDAY_TIME_SLOTS : WEEKDAY_TIME_SLOTS
  const dayType = isSaturday(date) ? 'Sábado' : 'Lunes a Viernes'

  const handleToggle = (time: string) => {
    if (blockedTimes.includes(time)) {
      // No permitir seleccionar horarios ya bloqueados
      return
    }

    if (selectedTimes.includes(time)) {
      // Deseleccionar
      onSelectionChange(selectedTimes.filter(t => t !== time))
    } else {
      // Seleccionar
      onSelectionChange([...selectedTimes, time])
    }
  }

  return (
    <div className={className}>
      <p className="text-sm text-gray-600 mb-3">
        Horarios disponibles para <strong>{dayType}</strong>:
      </p>
      <div className="space-y-2 max-h-64 overflow-y-auto border rounded-md p-3">
        {timeSlots.map((time) => {
          const isBlocked = blockedTimes.includes(time)
          const isSelected = selectedTimes.includes(time)
          const label = getTimeSlotLabel(time)

          return (
            <div key={time} className="flex items-center space-x-2">
              <Checkbox
                id={`time-${time}`}
                checked={isSelected || isBlocked}
                disabled={isBlocked}
                onCheckedChange={() => handleToggle(time)}
                className={isBlocked ? 'opacity-50' : ''}
              />
              <Label
                htmlFor={`time-${time}`}
                className={`flex-1 cursor-pointer ${
                  isBlocked 
                    ? 'text-gray-400 line-through' 
                    : isSelected 
                    ? 'text-blue-600 font-medium' 
                    : 'text-gray-700'
                }`}
              >
                {label}
                {isBlocked && (
                  <span className="ml-2 text-xs text-red-500">(Ya bloqueado)</span>
                )}
              </Label>
            </div>
          )
        })}
      </div>
      {selectedTimes.length > 0 && (
        <p className="text-sm text-blue-600 mt-2">
          {selectedTimes.length} horario{selectedTimes.length > 1 ? 's' : ''} seleccionado{selectedTimes.length > 1 ? 's' : ''}
        </p>
      )}
    </div>
  )
}
