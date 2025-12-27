"use client"

import { CheckCircle2, Circle } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { UseFormWatch } from 'react-hook-form'
import type { BlogArticleFormData } from '@/types/database'

// Definición de campos obligatorios con sus paths y labels
const REQUIRED_FIELDS = [
  { path: 'title', label: 'Título' },
  { path: 'slug', label: 'Slug URL' },
  { path: 'introduction', label: 'Introducción' },
  { path: 'psychological_analysis.title', label: 'Título análisis psicológico' },
  { path: 'psychological_analysis.content', label: 'Contenido análisis psicológico' },
  { path: 'practical_recommendations.title', label: 'Título recomendaciones' },
  { path: 'practical_recommendations.content', label: 'Contenido recomendaciones' },
  { path: 'author_name', label: 'Autor' },
] as const

interface FormProgressProps {
  watch: UseFormWatch<BlogArticleFormData>
}

// Función para obtener valor de un path anidado
function getNestedValue(obj: unknown, path: string): unknown {
  return path.split('.').reduce((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

export function FormProgress({ watch }: FormProgressProps) {
  // Observar todos los valores del formulario
  const formValues = watch()

  // Calcular cuántos campos están completos
  const completedFields = REQUIRED_FIELDS.filter(field => {
    const value = getNestedValue(formValues, field.path)
    return typeof value === 'string' && value.trim().length > 0
  })

  const completedCount = completedFields.length
  const totalCount = REQUIRED_FIELDS.length
  const progressPercentage = Math.round((completedCount / totalCount) * 100)

  // Determinar color basado en progreso
  const getProgressColor = () => {
    if (progressPercentage === 100) return 'text-green-600'
    if (progressPercentage >= 75) return 'text-blue-600'
    if (progressPercentage >= 50) return 'text-yellow-600'
    return 'text-orange-600'
  }

  return (
    <div className="bg-card border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-muted-foreground">
          Progreso del formulario
        </h3>
        <span className={`text-sm font-semibold ${getProgressColor()}`}>
          {completedCount} de {totalCount} campos obligatorios
        </span>
      </div>

      <Progress value={progressPercentage} className="h-2 mb-4" />

      {/* Lista de campos obligatorios con estado */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {REQUIRED_FIELDS.map((field) => {
          const value = getNestedValue(formValues, field.path)
          const isComplete = typeof value === 'string' && value.trim().length > 0

          return (
            <div
              key={field.path}
              className={`flex items-center gap-1.5 text-xs ${
                isComplete ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              {isComplete ? (
                <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0" />
              ) : (
                <Circle className="h-3.5 w-3.5 flex-shrink-0" />
              )}
              <span className="truncate" title={field.label}>
                {field.label}
              </span>
            </div>
          )
        })}
      </div>

      {progressPercentage === 100 && (
        <p className="text-xs text-green-600 mt-3 flex items-center gap-1">
          <CheckCircle2 className="h-4 w-4" />
          ¡Todos los campos obligatorios están completos!
        </p>
      )}
    </div>
  )
}
