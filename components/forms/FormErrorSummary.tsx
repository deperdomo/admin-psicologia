"use client"

import { AlertCircle, X } from 'lucide-react'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import type { FieldErrors } from 'react-hook-form'

// Mapeo de nombres de campos a labels legibles en español
const FIELD_LABELS: Record<string, string> = {
  title: 'Título del artículo',
  slug: 'Slug URL',
  introduction: 'Introducción',
  'psychological_analysis.title': 'Título del análisis psicológico',
  'psychological_analysis.content': 'Contenido del análisis psicológico',
  'practical_recommendations.title': 'Título de recomendaciones prácticas',
  'practical_recommendations.content': 'Contenido de recomendaciones prácticas',
  author_name: 'Nombre del autor',
  // Campos opcionales pero que pueden tener errores de formato
  author_email: 'Email del autor',
  canonical_url: 'URL canónica',
  'current_data_research.title': 'Título de datos actuales',
  'current_data_research.content': 'Contenido de datos actuales',
  'anonymous_case.title': 'Título del caso anónimo',
  'anonymous_case.content': 'Contenido del caso anónimo',
  'empathetic_closing.title': 'Título del cierre empático',
  'empathetic_closing.content': 'Contenido del cierre empático',
}

interface FormErrorSummaryProps {
  errors: FieldErrors
  apiError?: string | null
  onClearErrors?: () => void
  onClearApiError?: () => void
}

interface FlattenedError {
  path: string
  message: string
  fieldId: string
}

// Función para aplanar errores anidados de react-hook-form
function flattenErrors(errors: FieldErrors, parentPath = ''): FlattenedError[] {
  const result: FlattenedError[] = []

  for (const [key, value] of Object.entries(errors)) {
    const currentPath = parentPath ? `${parentPath}.${key}` : key
    
    if (value && typeof value === 'object') {
      // Si tiene message, es un error de campo
      if ('message' in value && typeof value.message === 'string') {
        result.push({
          path: currentPath,
          message: value.message,
          fieldId: `field-${currentPath.replace(/\./g, '-')}`
        })
      }
      // Si es un objeto anidado (como psychological_analysis), buscar errores dentro
      if ('title' in value || 'content' in value) {
        result.push(...flattenErrors(value as FieldErrors, currentPath))
      }
    }
  }

  return result
}

export function FormErrorSummary({
  errors,
  apiError,
  onClearErrors,
  onClearApiError
}: FormErrorSummaryProps) {
  const flatErrors = flattenErrors(errors)
  const hasFormErrors = flatErrors.length > 0
  const hasApiError = !!apiError

  if (!hasFormErrors && !hasApiError) {
    return null
  }

  const handleScrollToField = (fieldId: string) => {
    const element = document.getElementById(fieldId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // Intentar enfocar el campo si es un input
      const input = element.querySelector('input, textarea, select')
      if (input instanceof HTMLElement) {
        setTimeout(() => input.focus(), 500)
      }
    }
  }

  const handleClearAll = () => {
    onClearErrors?.()
    onClearApiError?.()
  }

  return (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>
          {hasApiError && !hasFormErrors
            ? 'Error del servidor'
            : hasFormErrors && !hasApiError
            ? `${flatErrors.length} campo${flatErrors.length > 1 ? 's' : ''} con errores`
            : 'Errores en el formulario'}
        </span>
        {(onClearErrors || onClearApiError) && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={handleClearAll}
          >
            <X className="h-4 w-4 mr-1" />
            Limpiar
          </Button>
        )}
      </AlertTitle>
      <AlertDescription>
        <div className="mt-2 space-y-2">
          {/* Error de API */}
          {hasApiError && (
            <div className="p-2 bg-destructive/5 rounded border border-destructive/20">
              <p className="text-sm font-medium text-destructive">
                ⚠️ {apiError}
              </p>
            </div>
          )}

          {/* Errores de validación del formulario */}
          {hasFormErrors && (
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground mb-2">
                Corrige los siguientes campos para continuar:
              </p>
              <ul className="space-y-1">
                {flatErrors.map((error, index) => (
                  <li key={index}>
                    <button
                      type="button"
                      onClick={() => handleScrollToField(error.fieldId)}
                      className="text-sm text-destructive hover:underline cursor-pointer text-left w-full flex items-center gap-2"
                    >
                      <span className="font-medium">
                        {FIELD_LABELS[error.path] || error.path}:
                      </span>
                      <span className="text-destructive/80">{error.message}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </AlertDescription>
    </Alert>
  )
}
