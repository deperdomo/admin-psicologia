"use client"

import { useEffect } from 'react'

/**
 * Hook que muestra una advertencia al usuario si intenta
 * abandonar la página con cambios sin guardar.
 * 
 * @param isDirty - Indica si hay cambios sin guardar en el formulario
 * @param enabled - Permite desactivar el hook temporalmente (ej: después de guardar)
 */
export function useUnsavedChanges(isDirty: boolean, enabled: boolean = true) {
  useEffect(() => {
    // Si no está habilitado o no hay cambios, no hacer nada
    if (!enabled || !isDirty) {
      return
    }

    // Handler para el evento beforeunload
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // El mensaje personalizado ya no se muestra en navegadores modernos por seguridad,
      // pero necesitamos prevenir el cierre de todas formas
      event.preventDefault()
      // Para compatibilidad con navegadores antiguos
      event.returnValue = ''
      return ''
    }

    // Añadir el listener
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Limpiar al desmontar o cuando cambie isDirty/enabled
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty, enabled])
}
