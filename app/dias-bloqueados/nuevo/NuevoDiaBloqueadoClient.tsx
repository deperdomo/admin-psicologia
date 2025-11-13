'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useBlockedSlots } from '@/lib/hooks/useAdminCitas'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, CalendarOff, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { SuccessModal } from '@/components/shared/SuccessModal'
import { TimeSlotSelector } from '@/components/shared/TimeSlotSelector'
import MultipleTimeSlotSelector from '@/components/shared/MultipleTimeSlotSelector'
import { getTimeSlotLabel, analyzeDateRange } from '@/lib/timeSlots'
import { useEffect, useMemo } from 'react'
import { getBlockedTimesForDate } from '@/lib/citas'

export default function NuevoDiaBloqueadoClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { createNewBlockedSlot } = useBlockedSlots()
  
  // Obtener fecha de la URL si existe
  const fechaParam = searchParams.get('fecha')

  const [formData, setFormData] = useState({
    dateFrom: fechaParam || '',
    dateTo: '',
    blockFullDay: true,
    specificTime: [] as string[], // Para un solo día - ahora es array
    specificTimeSaturday: '', // Para sábados cuando hay rango mixto
    reason: ''
  })
  
  const [blockedTimesForDate, setBlockedTimesForDate] = useState<string[]>([])

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [createdSlotsCount, setCreatedSlotsCount] = useState(0)

  // Analizar el rango de fechas seleccionado
  const dateRangeAnalysis = useMemo(() => {
    if (!formData.dateFrom) return null
    
    const dateTo = formData.dateTo || formData.dateFrom
    return analyzeDateRange(formData.dateFrom, dateTo)
  }, [formData.dateFrom, formData.dateTo])

  // Obtener horarios bloqueados cuando se selecciona un solo día
  useEffect(() => {
    const isSingleDay = !formData.dateTo || formData.dateTo === formData.dateFrom
    
    if (isSingleDay && formData.dateFrom) {
      // Cargar horarios ya bloqueados para este día
      getBlockedTimesForDate(formData.dateFrom)
        .then(blockedTimes => {
          setBlockedTimesForDate(blockedTimes)
        })
        .catch(err => {
          console.error('Error cargando horarios bloqueados:', err)
          setBlockedTimesForDate([])
        })
    } else {
      setBlockedTimesForDate([])
    }
  }, [formData.dateFrom, formData.dateTo])

  // Limpiar horarios cuando se marca "día completo"
  useEffect(() => {
    if (formData.blockFullDay) {
      setFormData(prev => ({
        ...prev,
        specificTime: [],
        specificTimeSaturday: ''
      }))
    }
  }, [formData.blockFullDay])

  // Validar formulario
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.dateFrom) {
      newErrors.dateFrom = 'La fecha de inicio es requerida'
    }

    if (formData.dateTo && formData.dateFrom && formData.dateTo < formData.dateFrom) {
      newErrors.dateTo = 'La fecha final debe ser posterior a la fecha inicial'
    }

    if (!formData.blockFullDay) {
      const isSingleDay = !formData.dateTo || formData.dateTo === formData.dateFrom
      
      if (isSingleDay) {
        // Para un solo día, debe haber al menos un horario seleccionado
        if (!formData.specificTime || formData.specificTime.length === 0) {
          newErrors.specificTime = 'Debes seleccionar al menos un horario si no bloqueas el día completo'
        }
      } else {
        // Para rangos: validar según los tipos de días
        // Si hay días de lunes a viernes y no hay horario especificado
        if (dateRangeAnalysis?.hasWeekdays && (!formData.specificTime || formData.specificTime.length === 0)) {
          newErrors.specificTime = 'Debes especificar un horario para los días de lunes a viernes'
        }
        
        // Si hay sábados y no hay horario especificado
        if (dateRangeAnalysis?.hasSaturdays && !formData.specificTimeSaturday) {
          newErrors.specificTimeSaturday = 'Debes especificar un horario para los sábados'
        }
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    try {
      setLoading(true)
      setErrors({})

      const isSingleDay = !formData.dateTo || formData.dateTo === formData.dateFrom

      // Si es un solo día con múltiples horarios
      if (isSingleDay) {
        const allSlots: unknown[] = []
        
        if (formData.blockFullDay) {
          // Día completo
          const slots = await createNewBlockedSlot({
            blocked_date: formData.dateFrom,
            blocked_time: null,
            reason: formData.reason || undefined
          })
          allSlots.push(...slots)
        } else {
          // Múltiples horarios específicos
          for (const time of formData.specificTime) {
            const slots = await createNewBlockedSlot({
              blocked_date: formData.dateFrom,
              blocked_time: time,
              reason: formData.reason || undefined
            })
            allSlots.push(...slots)
          }
        }
        
        setCreatedSlotsCount(allSlots.length)
      } else {
        // Rango de fechas (lógica existente)
        const dateFrom = new Date(formData.dateFrom)
        const dateTo = new Date(formData.dateTo)
        const daysDiff = Math.ceil((dateTo.getTime() - dateFrom.getTime()) / (1000 * 60 * 60 * 24)) + 1
        
        const allSlots: unknown[] = []
        
        // Crear un slot por cada día en el rango
        for (let i = 0; i < daysDiff; i++) {
          const currentDate = new Date(dateFrom)
          currentDate.setDate(dateFrom.getDate() + i)
          const currentDateStr = currentDate.toISOString().split('T')[0]
          const dayOfWeek = currentDate.getDay()
          
          // Omitir domingos
          if (dayOfWeek === 0) continue
          
          // Determinar el horario según el tipo de día
          let timeToUse: string | null = null // Por defecto día completo
          
          if (!formData.blockFullDay) {
            if (dayOfWeek === 6) {
              // Es sábado - usar horario de sábado
              timeToUse = formData.specificTimeSaturday || null
            } else {
              // Es lunes a viernes - usar primer horario del array (para rangos usamos el primero)
              timeToUse = (formData.specificTime && formData.specificTime.length > 0) 
                ? formData.specificTime[0] 
                : null
            }
          }
          
          const slots = await createNewBlockedSlot({
            blocked_date: currentDateStr,
            blocked_time: timeToUse,
            reason: formData.reason || undefined
          })
          
          allSlots.push(...slots)
        }
        
        setCreatedSlotsCount(allSlots.length)
      }

      setShowSuccess(true)
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Error al bloquear día(s)'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSuccessClose = () => {
    setShowSuccess(false)
    router.push('/dias-bloqueados/lista')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => router.push('/dias-bloqueados/lista')}
          className="mb-4 -ml-2 cursor-pointer"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a la lista
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <CalendarOff className="text-purple-600" size={24} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">
            {fechaParam ? 'Editar Bloqueos del Día' : 'Bloquear Día(s)'}
          </h1>
        </div>
        <p className="text-gray-600">
          {fechaParam 
            ? `Gestiona los bloqueos de horarios para ${new Date(fechaParam).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`
            : 'Define los días y horarios en los que no podrás atender pacientes'
          }
        </p>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Bloqueo</CardTitle>
            <CardDescription>
              Completa los campos para bloquear uno o más días
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Error general */}
            {errors.submit && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="text-red-800 font-medium">Error al crear bloqueo</p>
                  <p className="text-red-600 text-sm">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Rango de fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateFrom">
                  Fecha de inicio <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={formData.dateFrom}
                  onChange={(e) => setFormData({ ...formData, dateFrom: e.target.value })}
                  className={errors.dateFrom ? 'border-red-500' : ''}
                  min={new Date().toISOString().split('T')[0]}
                  disabled={!!fechaParam}
                />
                {errors.dateFrom && (
                  <p className="text-sm text-red-600">{errors.dateFrom}</p>
                )}
                {fechaParam && (
                  <p className="text-xs text-gray-500">
                    Editando bloqueos para este día específico
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">
                  Fecha final (opcional)
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={formData.dateTo}
                  onChange={(e) => setFormData({ ...formData, dateTo: e.target.value })}
                  className={errors.dateTo ? 'border-red-500' : ''}
                  min={formData.dateFrom || new Date().toISOString().split('T')[0]}
                  disabled={!!fechaParam}
                />
                {errors.dateTo && (
                  <p className="text-sm text-red-600">{errors.dateTo}</p>
                )}
                <p className="text-xs text-gray-500">
                  Deja vacío para bloquear solo un día
                </p>
              </div>
            </div>

            {/* Tipo de bloqueo */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="blockFullDay"
                  checked={formData.blockFullDay}
                  onCheckedChange={(checked) => 
                    setFormData({ 
                      ...formData, 
                      blockFullDay: checked as boolean,
                      specificTime: checked ? [] : formData.specificTime
                    })
                  }
                />
                <Label htmlFor="blockFullDay" className="cursor-pointer">
                  Bloquear día(s) completo(s)
                </Label>
              </div>

              {!formData.blockFullDay && (
                <div className="space-y-4 ml-6">
                  {/* Verificar si es un solo día o un rango */}
                  {(() => {
                    const isSingleDay = !formData.dateTo || formData.dateTo === formData.dateFrom
                    
                    // CASO 1: Un solo día - Usar selector múltiple
                    if (isSingleDay) {
                      return (
                        <div className="space-y-2">
                          <Label>
                            Horarios específicos <span className="text-red-500">*</span>
                          </Label>
                          <MultipleTimeSlotSelector
                            date={formData.dateFrom}
                            selectedTimes={formData.specificTime}
                            blockedTimes={blockedTimesForDate}
                            onSelectionChange={(times) => setFormData({ ...formData, specificTime: times })}
                          />
                          {errors.specificTime && (
                            <p className="text-sm text-red-600">{errors.specificTime}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            Selecciona uno o más horarios para bloquear. Los horarios ya bloqueados aparecen marcados.
                          </p>
                        </div>
                      )
                    }
                    
                    // CASO 2: Rango de fechas - Usar selectores simples diferenciados
                    return (
                      <>
                        {/* Información del rango de fechas */}
                        {dateRangeAnalysis && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                            <p className="font-medium text-blue-900 mb-1">📊 Análisis del rango:</p>
                            <ul className="text-blue-800 space-y-1">
                              {dateRangeAnalysis.hasWeekdays && (
                                <li>• {dateRangeAnalysis.weekdayCount} día(s) de lunes a viernes</li>
                              )}
                              {dateRangeAnalysis.hasSaturdays && (
                                <li>• {dateRangeAnalysis.saturdayCount} sábado(s)</li>
                              )}
                              {dateRangeAnalysis.hasSundays && (
                                <li className="text-yellow-700">⚠️ {dateRangeAnalysis.sundayCount} domingo(s) serán omitidos</li>
                              )}
                            </ul>
                          </div>
                        )}

                        {/* Selector para días de lunes a viernes */}
                        {dateRangeAnalysis?.hasWeekdays && (
                          <div className="space-y-2">
                            <TimeSlotSelector
                              selectedDate={formData.dateFrom}
                              selectedTime={formData.specificTime[0] || ''} // Para rangos, usar string
                              onTimeChange={(time) => setFormData({ ...formData, specificTime: [time] })} // Guardar como array de 1 elemento
                              label="Horario para Lunes a Viernes"
                              required={true}
                              error={errors.specificTime}
                            />
                            {dateRangeAnalysis.hasSaturdays && (
                              <p className="text-xs text-gray-500">
                                Este horario se aplicará solo a los días de lunes a viernes
                              </p>
                            )}
                          </div>
                        )}

                        {/* Selector para sábados (solo si hay sábados en el rango) */}
                        {dateRangeAnalysis?.hasSaturdays && (
                          <div className="space-y-2">
                            <TimeSlotSelector
                              selectedDate={
                                // Encontrar el primer sábado en el rango
                                (() => {
                                  const start = new Date(formData.dateFrom)
                                  const end = new Date(formData.dateTo || formData.dateFrom)
                                  const current = new Date(start)
                                  
                                  while (current <= end) {
                                    if (current.getDay() === 6) {
                                      return current.toISOString().split('T')[0]
                                    }
                                    current.setDate(current.getDate() + 1)
                                  }
                                  return null
                                })()
                              }
                              selectedTime={formData.specificTimeSaturday}
                              onTimeChange={(time) => setFormData({ ...formData, specificTimeSaturday: time })}
                              label="Horario para Sábados"
                              required={true}
                              error={errors.specificTimeSaturday}
                            />
                            <p className="text-xs text-gray-500">
                              Este horario se aplicará solo a los sábados
                            </p>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>
              )}
            </div>

            {/* Razón */}
            <div className="space-y-2">
              <Label htmlFor="reason">
                Razón (opcional)
              </Label>
              <Textarea
                id="reason"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Ej: Vacaciones, Conferencia, Día personal..."
                rows={3}
              />
              <p className="text-xs text-gray-500">
                Ayuda a recordar por qué bloqueaste este día
              </p>
            </div>

            {/* Resumen */}
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                <CheckCircle2 size={16} />
                Resumen del bloqueo
              </h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>
                  • <strong>Fecha(s):</strong>{' '}
                  {formData.dateFrom ? (
                    formData.dateTo && formData.dateTo !== formData.dateFrom
                      ? `Del ${new Date(formData.dateFrom).toLocaleDateString('es-ES')} al ${new Date(formData.dateTo).toLocaleDateString('es-ES')}`
                      : new Date(formData.dateFrom).toLocaleDateString('es-ES')
                  ) : (
                    'No especificada'
                  )}
                </li>
                <li>
                  • <strong>Tipo:</strong>{' '}
                  {formData.blockFullDay 
                    ? 'Día(s) completo(s)' 
                    : dateRangeAnalysis && (dateRangeAnalysis.hasWeekdays || dateRangeAnalysis.hasSaturdays)
                      ? (() => {
                          const parts = []
                          if (dateRangeAnalysis.hasWeekdays && formData.specificTime && formData.specificTime.length > 0) {
                            parts.push(`Lunes-Viernes: ${getTimeSlotLabel(formData.specificTime[0])}`)
                          }
                          if (dateRangeAnalysis.hasSaturdays && formData.specificTimeSaturday) {
                            parts.push(`Sábados: ${getTimeSlotLabel(formData.specificTimeSaturday)}`)
                          }
                          return parts.length > 0 ? parts.join(' | ') : 'No especificado'
                        })()
                      : formData.specificTime && formData.specificTime.length > 0
                        ? formData.specificTime.length === 1
                          ? `Horario específico (${getTimeSlotLabel(formData.specificTime[0])})`
                          : `${formData.specificTime.length} horarios específicos (${formData.specificTime.map(t => getTimeSlotLabel(t).split(' - ')[0]).join(', ')})`
                        : 'No especificado'
                  }
                </li>
                {formData.reason && (
                  <li>
                    • <strong>Razón:</strong> {formData.reason}
                  </li>
                )}
              </ul>
            </div>

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/dias-bloqueados/lista')}
                disabled={loading}
                className="flex-1 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 cursor-pointer"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Bloqueando...
                  </>
                ) : (
                  'Bloquear Día(s)'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Modal de éxito */}
      <SuccessModal
        isOpen={showSuccess}
        onClose={handleSuccessClose}
        title="¡Día(s) bloqueado(s) exitosamente!"
        message={`Se ${createdSlotsCount === 1 ? 'ha bloqueado 1 día' : `han bloqueado ${createdSlotsCount} días`} correctamente.`}
      />
    </div>
  )
}
